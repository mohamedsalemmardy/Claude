import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineAction } from '../types';

const OFFLINE_QUEUE_KEY = '@charity_offline_queue';

export const offlineStorage = {
  async addToQueue(action: Omit<OfflineAction, 'id' | 'createdAt' | 'synced'>): Promise<void> {
    const queue = await this.getQueue();
    const newAction: OfflineAction = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      ...action,
      createdAt: new Date().toISOString(),
      synced: false,
    };
    queue.push(newAction);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  },

  async getQueue(): Promise<OfflineAction[]> {
    const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getPendingActions(): Promise<OfflineAction[]> {
    const queue = await this.getQueue();
    return queue.filter((a) => !a.synced);
  },

  async markAsSynced(id: string): Promise<void> {
    const queue = await this.getQueue();
    const updated = queue.map((a) => (a.id === id ? { ...a, synced: true } : a));
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  },

  async clearSynced(): Promise<void> {
    const queue = await this.getQueue();
    const pending = queue.filter((a) => !a.synced);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(pending));
  },

  async syncAll(syncFn: (action: OfflineAction) => Promise<boolean>): Promise<number> {
    const pending = await this.getPendingActions();
    let synced = 0;
    for (const action of pending) {
      const success = await syncFn(action);
      if (success) {
        await this.markAsSynced(action.id);
        synced++;
      }
    }
    await this.clearSynced();
    return synced;
  },
};
