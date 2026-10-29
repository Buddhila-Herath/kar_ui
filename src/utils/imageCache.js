class ImageCache {
  constructor() {
    this.dbName = "ImageCacheDB";
    this.storeName = "images";
    this.db = null;
    this.initPromise = this.initDB();
    this.MAX_CACHE_SIZE = 1.5 * 1024 * 1024 * 1024;
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "path",
          });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async set(path, imageData) {
    await this.initPromise;

    const newSize = new Blob([imageData]).size;
    let totalSize = await this.getTotalSize();

    if (totalSize + newSize > this.MAX_CACHE_SIZE) {
      await this.evictOldest(totalSize + newSize - this.MAX_CACHE_SIZE);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const item = {
        path: path,
        data: imageData,
        timestamp: Date.now(),
        size: newSize,
      };

      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTotalSize() {
    if (!this.db) await this.init();
    const tx = this.db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
  }

  async evictOldest(bytesNeeded) {
    await this.initPromise;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("timestamp");

      let freed = 0;
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && freed < bytesNeeded) {
          const size = cursor.value.size || 0;
          freed += size;
          cursor.delete(); // delete this entry
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async get(path) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(path);

      request.onsuccess = () => {
        if (request.result) {
          this.set(path, request.result.data);
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async has(path) {
    const data = await this.get(path);
    return data !== null;
  }

  async clear() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanup(maxAge = 3 * 24 * 60 * 60 * 1000) {
    await this.initPromise;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("timestamp");
      const cutoff = Date.now() - maxAge;
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff));

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getTotalSize() {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      let totalSize = 0;

      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          totalSize += cursor.value.size || 0;
          cursor.continue();
        } else {
          resolve(totalSize);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export const imageCache = new ImageCache();

setInterval(() => {
  imageCache.cleanup();
}, 24 * 60 * 60 * 1000);