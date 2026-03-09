/**
 * Место — сущность из режима «Места».
 * Хранилище мест для посещения или уже посещённых (не привязано к поездке).
 */
export interface Place {
  id: number;
  name: string;
  description: string;
  visitlater: boolean;
  liked: boolean;
  /** Широта (Decimal Degrees) */
  latitude: number | null;
  /** Долгота (Decimal Degrees) */
  longitude: number | null;
  /** Пути к файлам фотографий */
  photos: string[];
  createdAt: string; // ISO date string
}

export type PlaceInsert = Omit<Place, 'id' | 'createdAt'> & {
  id?: number;
  createdAt?: string;
};

export type PlaceUpdate = Partial<Omit<Place, 'id'>>;
