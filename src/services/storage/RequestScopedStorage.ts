import { injectable } from "inversify";

@injectable()
export class RequestScopedStorage {
    private data: Record<string, any> = {};

    /**
     * Stores a value for the current request.
     * @param key - The key to associate with the value.
     * @param value - The value to store.
     */
    set(key: string, value: any): void {
        console.log('asdfasdf')
        this.data[key] = value;
    }

    /**
     * Retrieves a value by its key for the current request.
     * @param key - The key of the value to retrieve.
     * @returns The value associated with the key, or undefined if it doesn't exist.
     */
    get<T>(key: string): T | undefined {
        return this.data[key];
    }
}