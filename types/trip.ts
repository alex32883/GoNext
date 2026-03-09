/**
 * Поездка — конкретный маршрут с датами и упорядоченным списком мест.
 */
export interface Trip {
  id: number;
  title: string;
  description: string;
  startDate: string; // ISO date string
  endDate: string;
  createdAt: string;
  /** Признак текущей (активной) поездки */
  current: boolean;
}

export type TripInsert = Omit<Trip, 'id' | 'createdAt'> & {
  id?: number;
  createdAt?: string;
};

export type TripUpdate = Partial<Omit<Trip, 'id'>>;
