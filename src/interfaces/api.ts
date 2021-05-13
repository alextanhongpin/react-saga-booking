export interface PostReservationInput {
  name: string;
  email: string;
  seats: number[];
}

export interface PostPaymentInput {
  reservationId: string;
}

export interface DeletePaymentInput {
  reservationId: string;
  reason: string;
}
