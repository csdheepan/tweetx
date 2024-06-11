import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class InMemoryCache {

    constructor() { }

     /**
   * Stores data in memory.
   * @param key The key under which the data will be stored.
   * @param value The data to be stored.
   */
    setItem(key: string, value: string) {
        sessionStorage.setItem(key, value);
    }

     /**
   * remove data from memory.
   * @param key The key under which the data was stored.
   * @returns The data removed from memory.
   */
    removeItem(key: string) {
        sessionStorage.removeItem(key);
    }

     /**
   * Retrieves data from memory.
   * @param key The key under which the data was stored.
   * @returns The data retrieved from memory.
   */
    getItem(key: string) : any {
        const data = sessionStorage.getItem(key);
        return data ? data : null; 
    }


         /**
   * clear data from memory.
   * @param key The key under which the data was stored.
   * @returns The data cleared from memory.
   */
    clear() {
        sessionStorage.clear();
    }
}
