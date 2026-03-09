import { getDatabase } from './database';
import type { Trip, TripInsert, TripUpdate } from '../types';

function rowToTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as number,
    title: (row.title as string) ?? '',
    description: (row.description as string) ?? '',
    startDate: row.startDate as string,
    endDate: row.endDate as string,
    createdAt: row.createdAt as string,
    current: (row.current as number) === 1,
  };
}

export async function createTrip(data: TripInsert): Promise<Trip> {
  const db = await getDatabase();
  if (data.current) {
    await db.runAsync('UPDATE trips SET current = 0');
  }
  const result = await db.runAsync(
    `INSERT INTO trips (title, description, startDate, endDate, createdAt, current)
     VALUES (?, ?, ?, ?, datetime('now'), ?)`,
    data.title,
    data.description ?? '',
    data.startDate,
    data.endDate,
    data.current ? 1 : 0
  );
  const id = Number(result.lastInsertRowId);
  const trip = await getTripById(id);
  if (!trip) throw new Error('Trip not found after insert');
  return trip;
}

export async function getAllTrips(): Promise<Trip[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM trips ORDER BY startDate DESC, id DESC'
  );
  return rows.map(rowToTrip);
}

export async function getTripById(id: number): Promise<Trip | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM trips WHERE id = ?',
    id
  );
  if (!row) return null;
  return rowToTrip(row);
}

export async function getCurrentTrip(): Promise<Trip | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM trips WHERE current = 1 LIMIT 1'
  );
  if (!row) return null;
  return rowToTrip(row);
}

export async function updateTrip(id: number, data: TripUpdate): Promise<Trip | null> {
  const db = await getDatabase();
  const current = await getTripById(id);
  if (!current) return null;
  if (data.current === true) {
    await db.runAsync('UPDATE trips SET current = 0');
  }
  await db.runAsync(
    `UPDATE trips SET
      title = ?, description = ?, startDate = ?, endDate = ?, current = ?
     WHERE id = ?`,
    data.title ?? current.title,
    data.description ?? current.description,
    data.startDate ?? current.startDate,
    data.endDate ?? current.endDate,
    data.current !== undefined ? (data.current ? 1 : 0) : (current.current ? 1 : 0),
    id
  );
  return getTripById(id);
}

export async function deleteTrip(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM trips WHERE id = ?', id);
  return result.changes > 0;
}
