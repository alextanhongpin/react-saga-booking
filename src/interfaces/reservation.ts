import type ReservationStatus from 'interfaces/reservation-status'

export default interface Reservation {
  id: string
  name: string
  email: string
  price: string
  status: ReservationStatus,
  reason: string
  created_at: string
  updated_at: string
}
