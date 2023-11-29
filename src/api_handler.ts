const API_ENPOINT = import.meta.env.VITE_REMOTE_COMPOSE_MANAGER_ENPOINT;

type OnNewLogLineCallback = (line: string) => void;
type UnsubscribeCallback = () => void;

export class ServiceApiEndpoint{
    private readonly on_new_log_line_callbacks: OnNewLogLineCallback[] = [];
    private websocket: WebSocket | null = null;
    constructor(
        public readonly service: string,
        public readonly access_key: string | null = null,
    ) {
        this.refresh_websocket();
    }

    private build_url(endpoint: string): string {
        let url = `https://${API_ENPOINT}/${endpoint}/${this.service}`;
        if (this.access_key) {
            url += `?access_key=${this.access_key}`;
        }
        return url;
    }

    private build_ws_url(endpoint: string): string {
        let url = `wss://${API_ENPOINT}/ws/${endpoint}/${this.service}`;
        if (this.access_key) {
            url += `?access_key=${this.access_key}`;
        }
        return url;
    }

    public refresh_websocket(): void {
        this.websocket && this.websocket.close();
        this.websocket = new WebSocket(this.build_ws_url('logs'));
        this.websocket.onmessage = (event) => {
            for (const callback of this.on_new_log_line_callbacks) {
                callback(event.data);
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

    public on_new_log_line(callback: OnNewLogLineCallback): UnsubscribeCallback {
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
