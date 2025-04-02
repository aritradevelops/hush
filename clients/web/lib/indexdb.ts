import { UUID } from "crypto";

export class IndexDb {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;
  private PRIVATE_KEY_IDENTIFIER = "hush_encryption_key"
  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /** Store a value by key */
  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.put(value, key); // Store value with key

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /** Retrieve a value by key */
  async get<T>(key: string): Promise<T | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  /** Delete a specific key */
  async delete(key: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /** Clear all data */
  async clear(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // async getPrivateKey() {
  //   return await this.get<string>(this.PRIVATE_KEY_IDENTIFIER)
  // }
  // async setPrivateKey(key: string) {
  //   await this.set(this.PRIVATE_KEY_IDENTIFIER, key)
  // }

  // async getSharedSecret(channelId: UUID) {
  //   return await this.get<string>(`shared_secret_${channelId}`)
  // }
  // async setSharedSecret(channelId: UUID, secret: string) {
  //   await this.set(`shared_secret_${channelId}`, secret)
  // }

  /** Close the database connection */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}