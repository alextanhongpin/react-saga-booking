import type ReservationStatus from 'interfaces/reservation-status'

export default interface Seat {
  id: number;
  name: string;
  status: ReservationStatus
}
