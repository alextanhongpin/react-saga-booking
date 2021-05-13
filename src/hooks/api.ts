import { useState, useEffect } from "react";
import {
  getSeats,
  postReservation,
  postPayment,
  deletePayment,
  checkPayment,
} from "apis";
import type Reservation from "interfaces/reservation";
import type Payment from "interfaces/payment";
import type Seat from "interfaces/seat";

function delay(duration = 1000) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

export function useSeats() {
  const [state, setState] = useState<Seat[]>([]);

  useEffect(() => {
    async function fetch() {
      const seats = await getSeats();
      setState(seats);
    }
    fetch();
  }, []);

  return [state, setState] as const;
}

export function useReservation() {
  const [reservation, setReservation] = useState<Reservation>();
  const [error, setError] = useState("");

  async function createReservation({
    name,
    email,
    seats,
  }: {
    name: string;
    email: string;
    seats: number[];
  }) {
    try {
      const reservation = await postReservation({ name, email, seats });
      setReservation(reservation);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }

  return {
    reservation,
    setReservation,
    error,
    setError,
    createReservation,
  };
}

export function usePayment() {
  const [reservationId, setReservationId] = useState("");
  const [payment, setPayment] = useState<Payment>();
  const [error, setError] = useState("");

  // When a reservation id made, a payment is asynchronously created on the
  // server. If we try to confirm or cancel the payment before it was created,
  // it will result in an error.
  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (!reservationId) return;
    async function pool() {
      for (let i = 0; i < 10; i++) {
        await delay(i * 1000 + Math.random() * 500);
        try {
          const created = await checkPayment(reservationId);
          if (created) {
            setCreated(created);
            return;
          }
        } catch (error) {
          console.error(error, "retrying", i + 1, "times");
        }
      }
      setCreated(false);
      window.alert("TIMEOUT");
      window.location.reload();
    }

    pool();
  }, [reservationId]);

  async function confirmPayment({ reservationId }: { reservationId: string }) {
    try {
      const payment = await postPayment({ reservationId });
      setPayment(payment);
      setError("");
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  }

  async function cancelPayment({
    reservationId,
    reason,
  }: {
    reservationId: string;
    reason: string;
  }) {
    try {
      const payment = await deletePayment({ reservationId, reason });
      setPayment(payment);
      setError("");
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  }

  return {
    payment,
    setPayment,
    error,
    setError,
    confirmPayment,
    cancelPayment,
    created,
    reservationId,
    setReservationId,
  };
}
