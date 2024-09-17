import {type Readable, writable, type Writable} from "svelte/store";

const get_http_ws_endpoints = (): [string, string] => {
    const host = import.meta.env.VITE_REMOTE_COMPOSE_MANAGER_ENDPOINT || window.location.origin;
    const [protocol, host_and_port] = host.split('://');

    if (protocol === 'https' || protocol === 'wss') {
        return [`https://${host_and_port}`, `wss://${host_and_port}`];
    } else if (protocol === 'http' || protocol === 'ws') {
        return [`http://${host_and_port}`, `ws://${host_and_port}`];
    }
    return [`https://${host}`, `wss://${host}`];
}
const [HTTP_ENDPOINT, WS_ENDPOINT] = get_http_ws_endpoints();

type LogLine = [string, string, string];

export enum AccessKeyScope {
    MANAGE = "manage", LOGS = "logs", STATUS = "status"
}

export interface Service {
    "name": string;
    "scopes": AccessKeyScope[];
}

export const get_available_services = async (access_key: string): Promise<Service[]> => {
    const response = await fetch(`${HTTP_ENDPOINT}/services?access_key=${access_key}`);
    return await response.json();
}


export class ServiceApiEndpoint {
    private websocket: WebSocket | null = null;
    private _log_lines: Writable<LogLine[]> = writable<LogLine[]>([]);
    public readonly log_lines: Readable<LogLine[]> = this._log_lines;

    constructor(public readonly service: Service, public readonly access_key: string | null = null,) {
        this.refresh_websocket();
    }

    public get available_micro_services(): Readable<string[]> {
        const store = writable<string[]>([]);

        this.log_lines.subscribe((log_lines) => {
            const micro_services = log_lines.map((log_line) => log_line[0]);
            store.set([...new Set(micro_services)]);
        })

        return store;
    }

    private build_url(endpoint: string): string {
        let url = `${HTTP_ENDPOINT}/${endpoint}/${this.service.name}`;
        if (this.access_key) {
            url += `?access_key=${this.access_key}`;
        }
        return url;
    }

    private build_ws_url(endpoint: string): string {
        let url = `${WS_ENDPOINT}/ws/${endpoint}/${this.service.name}`;
        if (this.access_key) {
            url += `?access_key=${this.access_key}`;
        }
        return url;
    }

    public async refresh_websocket(): Promise<void> {
        this.websocket && this.websocket.close();
        this.websocket = new WebSocket(this.build_ws_url('logs'));
        const log_lines = await this.get_logs();
        this._log_lines.set(log_lines);

        this.websocket.onmessage = (event) => {
            this._log_lines.update((log_lines) => {
                log_lines.push(JSON.parse(event.data));
                return log_lines;
            });
        };
    }

    /**
     * Fetches the logs of the service.
     */
    public async get_logs(): Promise<LogLine[]> {
        const response = await fetch(this.build_url('logs'));
        return  await response.json();
    }

    public async start(): Promise<void> {
        await fetch(this.build_url('start'), {method: 'POST'});
    }

    public async stop(): Promise<void> {
        await fetch(this.build_url('stop'), {method: 'POST'});
    }

    public async status(): Promise<boolean> {
        const response = await fetch(this.build_url('status'));
        const text = await response.text();
        return text === 'true';
    }

}
