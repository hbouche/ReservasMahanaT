export type ReservationStatus = 'Consulta' | 'Pagado' | 'Reservado' | 'Cerrado';

export interface Reservation {
  id: string;
  clientName: string;
  date: string; // ISO Date string YYYY-MM-DD
  time: string; // HH:mm string
  responsible: string; // Name of the instructor/guide
  seller: string; // Sales channel (Mahana, Playa Caracol, Other)
  activity: string;
  price: number;
  cost: number; // Operational cost/instructor pay
  commission: number; // Commission percentage (0-100)
  status: ReservationStatus; // Current status of the reservation
  notes?: string;
  managedBy?: string; // Who entered/managed the reservation
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface ActivityStats {
  name: string;
  count: number;
  revenue: number;
}
