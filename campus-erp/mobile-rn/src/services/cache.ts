import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@cache:';

export const cacheService = {
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async put<T = any>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },

  async has(key: string): Promise<boolean> {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    return raw !== null;
  },

  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  },

  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  },
};
