import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CameraAuthScreen from '../screens/CameraAuthScreen';
import ResultScreen from '../screens/ResultScreen';
import LogsScreen from '../screens/LogsScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CameraAuth: { employeeId: string };
  Result: { success: boolean };
  Logs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home Dashboard' }} />
        <Stack.Screen name="CameraAuth" component={CameraAuthScreen} options={{ title: 'Face Authentication', headerShown: false }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Logs" component={LogsScreen} options={{ title: 'Sync Logs' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
