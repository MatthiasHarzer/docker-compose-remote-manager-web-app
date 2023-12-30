/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REMOTE_COMPOSE_MANAGER_ENDPOINT: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
