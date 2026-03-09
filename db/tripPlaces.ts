import { getDatabase } from './database';
import type { TripPlace, TripPlaceInsert, TripPlaceUpdate } from '../types';
import { getPhotosByTripPlaceId, setPhotosForTripPlace } from './photos';

function rowToTripPlace(row: Record<string, unknown>): TripPlace {
  return {
    id: row.id as number,
    tripId: row.tripId as number,
    placeId: row.placeId as number,
    order: (row.order as number) ?? 1,
    visited: (row.visited as number) === 1,
    visitDate: (row.visitDate as string) ?? null,
    notes: (row.notes as string) ?? '',
    photos: [], // заполняется отдельно
  };
}

export async function createTripPlace(data: TripPlaceInsert): Promise<TripPlace> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO trip_places (tripId, placeId, \`order\`, visited, visitDate, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.tripId,
    data.placeId,
    data.order ?? 1,
    data.visited ? 1 : 0,
    data.visitDate ?? null,
    data.notes ?? ''
  );
  const id = Number(result.lastInsertRowId);
  if (data.photos?.length) {
    await setPhotosForTripPlace(id, data.photos);
  }
  const tp = await getTripPlaceById(id);
  if (!tp) throw new Error('TripPlace not found after insert');
  return tp;
}

export async function getTripPlacesByTripId(tripId: number): Promise<TripPlace[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM trip_places WHERE tripId = ? ORDER BY `order` ASC, id ASC',
    tripId
  );
  const list = rows.map(rowToTripPlace);
  for (const tp of list) {
    tp.photos = await getPhotosByTripPlaceId(tp.id);
  }
  return list;
}

export async function getTripPlaceById(id: number): Promise<TripPlace | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM trip_places WHERE id = ?',
    id
  );
  if (!row) return null;
  const tp = rowToTripPlace(row);
  tp.photos = await getPhotosByTripPlaceId(tp.id);
  return tp;
}

export async function updateTripPlace(
  id: number,
  data: TripPlaceUpdate
): Promise<TripPlace | null> {
  const db = await getDatabase();
  const current = await getTripPlaceById(id);
  if (!current) return null;
  await db.runAsync(
    `UPDATE trip_places SET
      \`order\` = ?, visited = ?, visitDate = ?, notes = ?
     WHERE id = ?`,
    data.order ?? current.order,
    data.visited !== undefined ? (data.visited ? 1 : 0) : (current.visited ? 1 : 0),
    data.visitDate !== undefined ? data.visitDate : current.visitDate,
    data.notes ?? current.notes,
    id
  );
  if (data.photos !== undefined) {
    await setPhotosForTripPlace(id, data.photos);
  }
  return getTripPlaceById(id);
}

export async function deleteTripPlace(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM trip_places WHERE id = ?', id);
  return result.changes > 0;
}

export async function reorderTripPlaces(tripId: number, orderedIds: number[]): Promise<void> {
  const db = await getDatabase();
  for (let i = 0; i < orderedIds.length; i++) {
    await db.runAsync(
      'UPDATE trip_places SET `order` = ? WHERE id = ? AND tripId = ?',
      i + 1,
      orderedIds[i],
      tripId
    );
  }
}
