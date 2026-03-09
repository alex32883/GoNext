import { getDatabase } from './database';

const TABLE_PLACE_PHOTOS = 'place_photos';
const TABLE_TRIP_PLACE_PHOTOS = 'trip_place_photos';

export async function getPhotosByPlaceId(placeId: number): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ path: string }>(
    'SELECT path FROM place_photos WHERE placeId = ? ORDER BY id',
    placeId
  );
  return rows.map((r) => r.path);
}

export async function setPhotosForPlace(placeId: number, paths: string[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM place_photos WHERE placeId = ?', placeId);
  for (const path of paths) {
    await db.runAsync('INSERT INTO place_photos (placeId, path) VALUES (?, ?)', placeId, path);
  }
}

export async function getPhotosByTripPlaceId(tripPlaceId: number): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ path: string }>(
    'SELECT path FROM trip_place_photos WHERE tripPlaceId = ? ORDER BY id',
    tripPlaceId
  );
  return rows.map((r) => r.path);
}

export async function setPhotosForTripPlace(
  tripPlaceId: number,
  paths: string[]
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM trip_place_photos WHERE tripPlaceId = ?', tripPlaceId);
  for (const path of paths) {
    await db.runAsync(
      'INSERT INTO trip_place_photos (tripPlaceId, path) VALUES (?, ?)',
      tripPlaceId,
      path
    );
  }
}
