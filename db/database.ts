import * as SQLite from 'expo-sqlite';
import { SQL_CREATE_TABLES } from './schema';

const DB_NAME = 'gonext.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Открывает БД и создаёт таблицы при первом запуске.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(SQL_CREATE_TABLES);
  return db;
}

/**
 * Закрыть соединение (для тестов или сброса).
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
