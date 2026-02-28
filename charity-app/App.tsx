import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, Platform } from 'react-native';
import { AppProvider } from './src/store/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';

// Enable RTL support for Arabic
I18nManager.allowRTL(true);

function AppContent() {
  useEffect(() => {
    // Request notification permissions on app start
    notificationService.requestPermissions();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
