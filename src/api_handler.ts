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

type OnLogLinesCallback = (logs: string[][]) => void;
type UnsubscribeCallback = () => void;

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

    private readonly on_new_log_line_callbacks: OnLogLinesCallback[] = [];
    private websocket: WebSocket | null = null;
    private log_lines: string[][] = [];

    constructor(public readonly service: Service, public readonly access_key: string | null = null,) {
        this.refresh_websocket();
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
        this.log_lines = await this.get_logs();
        for (const callback of this.on_new_log_line_callbacks) {
            callback(this.log_lines);
        }
        this.websocket.onmessage = (event) => {
            this.log_lines.push(JSON.parse(event.data));
            for (const callback of this.on_new_log_line_callbacks) {
                callback(this.log_lines);
            }
        };
    }

    /**
     * Fetches the logs of the service.
     */
    public async get_logs(): Promise<string[][]> {
        const response = await fetch(this.build_url('logs'));
        return  await response.json();
    }

    public on_log_lines(callback: OnLogLinesCallback, include_old = true): UnsubscribeCallback {
        if (include_old) {
            callback(this.log_lines)
        }
        this.on_new_log_line_callbacks.push(callback);
        return () => {
            const index = this.on_new_log_line_callbacks.indexOf(callback);
            if (index > -1) {
                this.on_new_log_line_callbacks.splice(index, 1);
            }
        };
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
