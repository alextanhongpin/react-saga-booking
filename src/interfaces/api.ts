export interface PostReservationInput {
  name: string;
  email: string;
  seats: number[];
}

export interface PostPaymentInput {
  reservation_id: string;
}
