export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  private memoryFallback = new MemoryStorageAdapter();

  private getStorage(): Storage | StorageAdapter {
    if (typeof window === 'undefined') {
      return this.memoryFallback;
    }
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch {
      return this.memoryFallback;
    }
  }

  getItem(key: string): string | null {
    try {
      return this.getStorage().getItem(key);
    } catch {
      return this.memoryFallback.getItem(key);
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.getStorage().setItem(key, value);
    } catch {
      this.memoryFallback.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    try {
      this.getStorage().removeItem?.(key);
    } catch {
      this.memoryFallback.removeItem(key);
    }
  }
}

export const defaultStorageAdapter = new LocalStorageAdapter();
