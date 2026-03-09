/**
 * Схема БД для GoNext.
 * Таблицы: places, trips, trip_places, place_photos, trip_place_photos.
 */

export const SQL_CREATE_TABLES = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  visitlater INTEGER NOT NULL DEFAULT 1,
  liked INTEGER NOT NULL DEFAULT 0,
  latitude REAL,
  longitude REAL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  current INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trip_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  placeId INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  \`order\` INTEGER NOT NULL DEFAULT 1,
  visited INTEGER NOT NULL DEFAULT 0,
  visitDate TEXT,
  notes TEXT NOT NULL DEFAULT '',
  UNIQUE(tripId, placeId)
);

CREATE TABLE IF NOT EXISTS place_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  placeId INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trip_place_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripPlaceId INTEGER NOT NULL REFERENCES trip_places(id) ON DELETE CASCADE,
  path TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trip_places_tripId ON trip_places(tripId);
CREATE INDEX IF NOT EXISTS idx_trip_places_placeId ON trip_places(placeId);
CREATE INDEX IF NOT EXISTS idx_place_photos_placeId ON place_photos(placeId);
CREATE INDEX IF NOT EXISTS idx_trip_place_photos_tripPlaceId ON trip_place_photos(tripPlaceId);
`;
