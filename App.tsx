import React, { useEffect, useState } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { initDB } from './src/database/db';

// Import screens directly for the web simulator router
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CameraAuthScreen from './src/screens/CameraAuthScreen';
import ResultScreen from './src/screens/ResultScreen';
import LogsScreen from './src/screens/LogsScreen';

const safeAreaMetrics = Platform.OS === 'web' ? {
  frame: { x: 0, y: 0, width: 800, height: 600 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
} : initialWindowMetrics;

// Simple state router for web demo simulation
function WebAppSimulator() {
  const [currentScreen, setCurrentScreen] = useState<'Login' | 'Dashboard' | 'CameraAuth' | 'Result' | 'Logs'>('Login');
  const [params, setParams] = useState<any>({});

  const navigation: any = {
    navigate: (screen: any, screenParams?: any) => {
      setCurrentScreen(screen);
      if (screenParams) setParams(screenParams);
    },
    replace: (screen: any, screenParams?: any) => {
      setCurrentScreen(screen);
      if (screenParams) setParams(screenParams);
    },
    goBack: () => {
      if (currentScreen === 'Logs' || currentScreen === 'CameraAuth') {
        setCurrentScreen('Dashboard');
      } else if (currentScreen === 'Dashboard') {
        setCurrentScreen('Login');
      } else {
        setCurrentScreen('Dashboard');
      }
    }
  };

  const route: any = { params };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {currentScreen !== 'Login' && currentScreen !== 'Dashboard' && (
        <View style={{ padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
          <Button title="← Back to Dashboard" onPress={() => navigation.goBack()} color="#0088ff" />
        </View>
      )}
      {currentScreen === 'Login' && <LoginScreen navigation={navigation} />}
      {currentScreen === 'Dashboard' && <DashboardScreen navigation={navigation} />}
      {currentScreen === 'CameraAuth' && <CameraAuthScreen navigation={navigation} route={route} />}
      {currentScreen === 'Result' && <ResultScreen navigation={navigation} route={route} />}
      {currentScreen === 'Logs' && <LogsScreen />}
    </View>
  );
}

export default function App() {
  useEffect(() => {
    try {
      initDB();
    } catch (e) {
      console.error('Failed to initialize database', e);
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <WebAppSimulator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaProvider initialMetrics={safeAreaMetrics} style={{ flex: 1 }}>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: {
        minHeight: '100vh',
      },
    }),
  },
});





