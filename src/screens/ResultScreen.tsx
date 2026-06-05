import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation, route }: Props) {
  const { success } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: success ? '#e6ffe6' : '#ffe6e6' }]}>
      <Text style={[styles.title, { color: success ? 'green' : 'red' }]}>
        {success ? 'Authentication Successful!' : 'Authentication Failed!'}
      </Text>
      <Button title="Back to Dashboard" onPress={() => navigation.popToTop()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  }
});
