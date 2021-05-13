import type {
  PostReservationInput,
  PostPaymentInput,
  DeletePaymentInput,
} from "interfaces/api";
import type Seat from "interfaces/seat";
import type Reservation from "interfaces/reservation";
import type Payment from "interfaces/payment";

export async function getSeats(): Promise<Seat[]> {
  const body = await window.fetch("http://localhost:8080/seats");
  const json = await body.json();
  return json?.data || [];
}

export async function postReservation({
  name,
  email,
  seats,
}: PostReservationInput): Promise<Reservation> {
  const body = await window.fetch("http://localhost:8080/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      name,
      email,
      seats,
    }),
  });
  const json = await body.json();
  return json.data;
}

export async function postPayment({
  reservationId,
}: PostPaymentInput): Promise<Payment> {
  const body = await window.fetch("http://localhost:4040/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      reservationId: reservationId,
    }),
  });
  const json = await body.json();
  return json.data;
}

export async function deletePayment({
  reservationId,
  reason,
}: DeletePaymentInput): Promise<Payment> {
  const body = await window.fetch("http://localhost:4040/payments", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      reservationId: reservationId,
      reason,
    }),
  });
  const json = await body.json();
  return json.data;
}

export async function checkPayment(id: string): Promise<boolean> {
  const body = await window.fetch(
    `http://localhost:4040/payments?reservation_id=${id}`
  );
  const json = await body.json();
  return json.data;
}
