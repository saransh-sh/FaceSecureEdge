import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { lookupEmployee } from '../services/MockMLService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

export default function DashboardScreen({ navigation }: Props) {
  const [empId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartAuth = async () => {
    if (!empId) {
      Alert.alert('Error', 'Please enter an Employee ID (e.g., EMP001)');
      return;
    }

    setLoading(true);
    const exists = await lookupEmployee(empId);
    setLoading(false);

    if (exists) {
      navigation.navigate('CameraAuth', { employeeId: empId });
    } else {
      Alert.alert('Not Found', 'Employee ID not found in local database.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      
      <TextInput 
        style={styles.input}
        placeholder="Enter Employee ID (e.g. EMP001)"
        value={empId}
        onChangeText={setEmpId}
        autoCapitalize="characters"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Authenticate Face" onPress={handleStartAuth} />
      )}
      
      <View style={styles.spacer} />
      <Button title="View Logs" onPress={() => navigation.navigate('Logs')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff'
  },
  spacer: {
    height: 20
  }
});
