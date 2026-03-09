/**
 * Место в поездке — связь поездки с местом + факт посещения.
 */
export interface TripPlace {
  id: number;
  tripId: number;
  placeId: number;
  /** Порядок в маршруте (1-based) */
  order: number;
  visited: boolean;
  visitDate: string | null; // ISO date string
  notes: string;
  /** Пути к файлам фотографий, сделанных при посещении */
  photos: string[];
}

export type TripPlaceInsert = Omit<TripPlace, 'id'> & { id?: number };
export type TripPlaceUpdate = Partial<Omit<TripPlace, 'id' | 'tripId' | 'placeId'>>;
