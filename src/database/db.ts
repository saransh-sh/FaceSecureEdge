import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

class MockSQLiteDatabase {
  execSync(sql: string) {
    console.log('Web Mock DB execSync:', sql);
    if (sql.includes('CREATE TABLE IF NOT EXISTS logs')) {
      if (!localStorage.getItem('logs')) {
        localStorage.setItem('logs', JSON.stringify([]));
      }
    }
    if (sql.includes('CREATE TABLE IF NOT EXISTS employees')) {
      if (!localStorage.getItem('employees')) {
        localStorage.setItem('employees', JSON.stringify([]));
      }
    }
    if (sql.includes('UPDATE logs SET synced = 1 WHERE synced = 0')) {
      const logs = JSON.parse(localStorage.getItem('logs') || '[]');
      const updated = logs.map((l: any) => ({ ...l, synced: 1 }));
      localStorage.setItem('logs', JSON.stringify(updated));
    }
  }

  getFirstSync<T>(sql: string, params: any[] = []): T | null {
    console.log('Web Mock DB getFirstSync:', sql, params);
    if (sql.includes('SELECT COUNT(*) as count FROM employees')) {
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      return { count: employees.length } as unknown as T;
    }
    if (sql.includes('SELECT id, embedding FROM employees WHERE id = ?') || sql.includes('SELECT id FROM employees WHERE id = ?')) {
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const emp = employees.find((e: any) => e.id === params[0]);
      return emp || null;
    }
    return null;
  }

  getAllSync<T>(sql: string): T[] {
    console.log('Web Mock DB getAllSync:', sql);
    if (sql.includes('SELECT * FROM logs')) {
      const logs = JSON.parse(localStorage.getItem('logs') || '[]');
      return logs as unknown as T[];
    }
    return [];
  }

  prepareSync(sql: string) {
    console.log('Web Mock DB prepareSync:', sql);
    return {
      executeSync: (params: any[]) => {
        if (sql.includes('INSERT INTO employees')) {
          const employees = JSON.parse(localStorage.getItem('employees') || '[]');
          employees.push({
            id: params[0],
            name: params[1],
            embedding: params[2]
          });
          localStorage.setItem('employees', JSON.stringify(employees));
        } else if (sql.includes('INSERT INTO logs')) {
          const logs = JSON.parse(localStorage.getItem('logs') || '[]');
          logs.push({
            id: Date.now(),
            emp_id: params[0],
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            success: params[1],
            synced: 0
          });
          localStorage.setItem('logs', JSON.stringify(logs));
        }
      }
    };
  }
}

let db: any = null;

export const getDB = () => {
  if (!db) {
    if (Platform.OS === 'web') {
      db = new MockSQLiteDatabase();
    } else {
      db = SQLite.openDatabaseSync('faceauth.db');
    }
  }
  return db;
};

export const initDB = () => {
  const database = getDB();
  
  // Create tables
  database.execSync(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      embedding TEXT
    );
    
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      success INTEGER NOT NULL,
      synced INTEGER DEFAULT 0
    );
  `);
  
  // Seed dummy employee if table is empty
  const result = database.getFirstSync('SELECT COUNT(*) as count FROM employees') as { count: number } | null;
  if (result && result.count === 0) {
    const stmt = database.prepareSync('INSERT INTO employees (id, name, embedding) VALUES (?, ?, ?)');
    stmt.executeSync(['EMP001', 'John Doe', JSON.stringify(Array(192).fill(0.1))]);
    stmt.executeSync(['EMP002', 'Jane Smith', JSON.stringify(Array(192).fill(0.2))]);
    stmt.executeSync(['EMP003', 'Alice Johnson', JSON.stringify(Array(192).fill(0.3))]);
    console.log('Database seeded with dummy employees.');
  }
};

