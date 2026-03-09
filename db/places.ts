import { getDatabase } from './database';
import type { Place, PlaceInsert, PlaceUpdate } from '../types';
import { getPhotosByPlaceId, setPhotosForPlace } from './photos';

function rowToPlace(row: Record<string, unknown>): Place {
  return {
    id: row.id as number,
    name: (row.name as string) ?? '',
    description: (row.description as string) ?? '',
    visitlater: (row.visitlater as number) === 1,
    liked: (row.liked as number) === 1,
    latitude: (row.latitude as number) ?? null,
    longitude: (row.longitude as number) ?? null,
    photos: [], // заполняется отдельно
    createdAt: row.createdAt as string,
  };
}

export async function createPlace(data: PlaceInsert): Promise<Place> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO places (name, description, visitlater, liked, latitude, longitude, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    data.name,
    data.description ?? '',
    data.visitlater ? 1 : 0,
    data.liked ? 1 : 0,
    data.latitude ?? null,
    data.longitude ?? null
  );
  const id = Number(result.lastInsertRowId);
  if (data.photos?.length) {
    await setPhotosForPlace(id, data.photos);
  }
  const place = await getPlaceById(id);
  if (!place) throw new Error('Place not found after insert');
  return place;
}

export async function getAllPlaces(): Promise<Place[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM places ORDER BY createdAt DESC'
  );
  const places = rows.map(rowToPlace);
  for (const p of places) {
    p.photos = await getPhotosByPlaceId(p.id);
  }
  return places;
}

export async function getPlaceById(id: number): Promise<Place | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM places WHERE id = ?',
    id
  );
  if (!row) return null;
  const place = rowToPlace(row);
  place.photos = await getPhotosByPlaceId(place.id);
  return place;
}

export async function updatePlace(id: number, data: PlaceUpdate): Promise<Place | null> {
  const db = await getDatabase();
  const current = await getPlaceById(id);
  if (!current) return null;

  await db.runAsync(
    `UPDATE places SET
      name = ?, description = ?, visitlater = ?, liked = ?,
      latitude = ?, longitude = ?
     WHERE id = ?`,
    data.name ?? current.name,
    data.description ?? current.description,
    data.visitlater !== undefined ? (data.visitlater ? 1 : 0) : (current.visitlater ? 1 : 0),
    data.liked !== undefined ? (data.liked ? 1 : 0) : (current.liked ? 1 : 0),
    data.latitude !== undefined ? data.latitude : current.latitude,
    data.longitude !== undefined ? data.longitude : current.longitude,
    id
  );
  if (data.photos !== undefined) {
    await setPhotosForPlace(id, data.photos);
  }
  return getPlaceById(id);
}

export async function deletePlace(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM places WHERE id = ?', id);
  return result.changes > 0;
}
