import * as FileSystem from 'expo-file-system';

const BASE_DIR = `${FileSystem.documentDirectory}gonext/`;

/**
 * Директория для фотографий места.
 */
export function getPlacePhotosDir(placeId: number): string {
  return `${BASE_DIR}places/${placeId}/`;
}

/**
 * Директория для фотографий посещения (TripPlace).
 */
export function getTripPlacePhotosDir(tripPlaceId: number): string {
  return `${BASE_DIR}trip_places/${tripPlaceId}/`;
}

/**
 * Копирует файл по URI в директорию приложения и возвращает путь для сохранения в БД.
 * Создаёт директорию при необходимости.
 */
export async function savePhotoFile(
  sourceUri: string,
  targetDir: string,
  fileName?: string
): Promise<string> {
  const ensureDir = await FileSystem.getInfoAsync(targetDir);
  if (!ensureDir.exists) {
    await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
  }
  const name = fileName ?? `photo_${Date.now()}.jpg`;
  const targetPath = `${targetDir}${name}`;
  await FileSystem.copyAsync({ from: sourceUri, to: targetPath });
  return targetPath;
}

/**
 * Удаляет файл по пути (например при удалении фото из места).
 */
export async function deletePhotoFile(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path);
  }
}
