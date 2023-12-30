import {type Writable, writable} from 'svelte/store'

/**
 * A store that is persisted in the local storage.
 * @param key The key to use for the local storage.
 * @param default_value The default value to use if the key is not set in the local storage.
 */
export const local_storage_memo = (key: string, default_value: boolean = false): Writable<boolean> => {
    const value = localStorage.getItem(key) ?? default_value.toString();

    const store = writable<boolean>(value === 'true');

    store.subscribe((value) => {
        localStorage.setItem(key, value.toString());
    });

    return store;
}
