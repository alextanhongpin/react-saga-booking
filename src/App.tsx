import React, { useState, useMemo, useEffect } from "react";
import styles from "./App.module.css";

// Interfaces.
import type Seat from "interfaces/seat";
import type Reservation from "interfaces/reservation";

// Components.
import SeatItem from "components/Seat";
import Timer from "components/Timer";

// Hooks.
import { useSeats, useReservation, usePayment } from "hooks/api";

type Screen = "booking" | "payment";

const initScreens = (screen: Screen = "booking"): Record<Screen, boolean> => {
  const screens = {
    booking: false,
    payment: false,
  };
  screens[screen] = true;
  return screens;
};

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [screens, setScreens] = useState<Record<Screen, boolean>>(initScreens);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [seats, setSeats] = useSeats();
  const {
    reservation,
    setReservation,
    createReservation,
    setError: setReservationError,
    error: reservationError,
  } = useReservation();
  const {
    error: paymentError,
    confirmPayment,
    cancelPayment,
    created,
    setReservationId,
  } = usePayment();

  useEffect(() => {
    window
      .fetch("http://127.0.0.1:8080/health")
      .then((body) => body.json())
      .then(console.log)
      .catch(console.error);
    // Reservations endpoint
    const eventSource = new window.EventSource("//127.0.0.1:8080/events", {
      withCredentials: false,
    });
    eventSource.addEventListener("update", (event) => {
      try {
        const seats = JSON.parse((event as any).data);
        setSeats(seats);
      } catch (error) {
        console.error("serverSentEventsError:", error);
      }
    });
    eventSource.onerror = (error) => {
      console.error(error);
    };
    return () => {
      eventSource.close();
    };
  }, [setSeats]);

  useEffect(() => {
    if (reservation) {
      setReservationId(reservation.id);
    }
  }, [setReservationId, reservation]);

  const handleSelectSeat = (evt: React.SyntheticEvent, seat: Seat) => {
    setSelected((selected) => ({
      ...selected,
      [seat.id]: !selected[seat.id],
    }));
  };

  const selectedSeats = useMemo(() => {
    const seats = [];
    for (let seatId in selected) {
      if (selected[seatId]) {
        seats.push(Number(seatId));
      }
    }
    return seats;
  }, [selected]);

  const handleSubmit = () => {
    if (reservation) {
      setScreens(initScreens("payment"));
      return;
    }

    if (!name) {
      setReservationError("name is required");
      return;
    }
    if (!email) {
      setReservationError("email is required");
      return;
    }
    if (!selectedSeats.length) {
      setReservationError("seats is required");
      return;
    }
    createReservation({ name, email, seats: selectedSeats });
    setScreens(initScreens("payment"));
  };

  const handleConfirmPayment = async () => {
    const success = await confirmPayment({ reservationId: reservation.id });
    if (success) {
      window.alert("Payment completed! Redirecting to home");
      window.location.reload();
    }
  };

  const handleCancelPayment = async () => {
    const success = await cancelPayment({
      reservationId: reservation.id,
      reason: "user cancelled payment",
    });
    if (success) {
      setReservation(null);
      setScreens(initScreens("booking"));
    }
  };

  const handleCompleted = () => {
    window.location.reload();
  };

  const elapsed = useMemo(() => {
    const now = Date.now();
    if (reservation) {
      const createdAt = new Date(reservation.createdAt).getTime();
      if (now < createdAt + 60000) {
        return Math.floor((createdAt + 60000 - now) / 1000);
      } else {
        return 0;
      }
    }
    return 60;
  }, [reservation]);

  if (screens.payment) {
    if (!created) {
      return <div>Processing reservation...</div>;
    }

    return (
      <div>
        <h1>Payment</h1>
        <div className={styles.error}>{paymentError}</div>

        <Timer seconds={elapsed} onCompleted={handleCompleted} />
        <h4>Booking Details</h4>
        <p>Name: {name}</p>
        <p>Email: {email}</p>
        <p>Seats: {selectedSeats.join(", ")}</p>

        <button onClick={handleConfirmPayment}>Confirm</button>
        <button onClick={handleCancelPayment}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Book Seats</h1>

      <div className={styles.body}>
        <main>
          <div className={styles.seats}>
            {seats.map((seat: Seat) => (
              <SeatItem
                key={seat.id}
                seat={seat}
                selected={selected[seat.id]}
                onClick={handleSelectSeat}
              />
            ))}
          </div>
        </main>

        {reservation ? (
          <aside>
            You have one unpaid reservation{" "}
            <button onClick={handleSubmit}>Continue to Payment</button>
          </aside>
        ) : (
          <aside>
            <div className={styles.error}>{reservationError}</div>
            <div>
              <label>Name &nbsp;</label>
              <input
                type="text"
                placeholder="Enter name"
                onChange={(evt) => setName(evt.currentTarget.value)}
                value={name}
              />
            </div>
            <br />

            <div>
              <label>Email &nbsp;</label>
              <input
                type="text"
                placeholder="Enter email"
                onChange={(evt) => setEmail(evt.currentTarget.value)}
                value={email}
              />
            </div>
            <br />

            <button onClick={handleSubmit}>Continue to Payment</button>
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
