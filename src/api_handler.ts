const API_ENDPOINT = import.meta.env.VITE_REMOTE_COMPOSE_MANAGER_ENPOINT;

type OnLogLinesCallback = (logs: string[]) => void;
type UnsubscribeCallback = () => void;

export enum AccessKeyScope {
    MANAGE = "manage", LOGS = "logs", STATUS = "status"
}

export interface Service {
    "name": string;
    "scopes": AccessKeyScope[];
}

export const get_available_services = async (access_key: string): Promise<Service[]> => {
    const response = await fetch(`https://${API_ENDPOINT}/services?access_key=${access_key}`);
    return await response.json();
}


export class ServiceApiEndpoint {

    private readonly on_new_log_line_callbacks: OnLogLinesCallback[] = [];
    private websocket: WebSocket | null = null;
    private log_lines: string[] = [];

    constructor(public readonly service: Service, public readonly access_key: string | null = null,) {
        this.refresh_websocket();
    }

    private build_url(endpoint: string): string {
        let url = `https://${API_ENDPOINT}/${endpoint}/${this.service.name}`;
        if (this.access_key) {
            url += `?access_key=${this.access_key}`;
        }
        return url;
    }

    private build_ws_url(endpoint: string): string {
        let url = `wss://${API_ENDPOINT}/ws/${endpoint}/${this.service.name}`;
        if (this.access_key) {
            url += `?access_key=${this.access_key}`;
        }
        return url;
    }

    public refresh_websocket(): void {
        this.websocket && this.websocket.close();
        this.websocket = new WebSocket(this.build_ws_url('logs'));
        this.websocket.onmessage = (event) => {
            this.log_lines.push(event.data);
            for (const callback of this.on_new_log_line_callbacks) {
                callback(this.log_lines);
            }
        };
    }

    /**
     * Fetches the logs of the service.
     */
    public async get_logs(): Promise<string[]> {
        const response = await fetch(this.build_url('logs'));
        const text = await response.text();
        return text.split('\n');
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
