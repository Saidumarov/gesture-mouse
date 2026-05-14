import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureScreen } from './app/index';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" hidden />
      <GestureScreen />
    </SafeAreaProvider>
  );
}
