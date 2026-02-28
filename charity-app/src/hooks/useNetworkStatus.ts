import { useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { offlineStorage } from '../services/offlineStorage';

/**
 * Hook to monitor network connectivity and sync offline data.
 * Uses expo-network when available, falls back to online assumption.
 */
export const useNetworkStatus = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      try {
        const Network = require('expo-network');
        const status = await Network.getNetworkStateAsync();
        dispatch({ type: 'SET_ONLINE', payload: status.isConnected ?? true });

        // Poll network status every 30 seconds
        const interval = setInterval(async () => {
          try {
            const currentStatus = await Network.getNetworkStateAsync();
            const isOnline = currentStatus.isConnected ?? true;
            dispatch({ type: 'SET_ONLINE', payload: isOnline });

            // Sync offline data when back online
            if (isOnline) {
              const pending = await offlineStorage.getPendingActions();
              if (pending.length > 0) {
                await offlineStorage.syncAll(async () => {
                  // In production, this would call the actual API
                  return true;
                });
              }
            }
          } catch {
            // Ignore polling errors
          }
        }, 30000);

        unsubscribe = () => clearInterval(interval);
      } catch {
        // expo-network not available, assume online
        dispatch({ type: 'SET_ONLINE', payload: true });
      }
    };

    setup();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return { isOnline: state.isOnline };
};
