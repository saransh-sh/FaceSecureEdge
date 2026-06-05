import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { getDB } from '../database/db';
import { useIsFocused } from '@react-navigation/native';

type Log = {
  id: number;
  emp_id: string;
  timestamp: string;
  success: number;
  synced: number;
};

export default function LogsScreen() {
  const [logs, setLogs] = useState<Log[]>([]);
  const isFocused = useIsFocused();

  const loadLogs = () => {
    try {
      const db = getDB();
      const results = db.getAllSync<Log>('SELECT * FROM logs ORDER BY timestamp DESC');
      setLogs(results);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadLogs();
    }
  }, [isFocused]);

  const handleSync = () => {
    try {
      const db = getDB();
      db.execSync('UPDATE logs SET synced = 1 WHERE synced = 0');
      loadLogs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Authentication Logs</Text>
        <Button title="Mock Sync to Datalake" onPress={handleSync} />
      </View>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text style={styles.logText}>Emp ID: {item.emp_id}</Text>
            <Text style={[styles.logText, { color: item.success ? 'green' : 'red' }]}>
              Status: {item.success ? 'SUCCESS' : 'FAILED'}
            </Text>
            <Text style={styles.logText}>Time: {item.timestamp}</Text>
            <Text style={[styles.logText, { color: item.synced ? 'blue' : 'gray' }]}>
              Synced: {item.synced ? 'YES' : 'NO'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>No logs yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  logItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  logText: { fontSize: 16, marginBottom: 4 }
});
