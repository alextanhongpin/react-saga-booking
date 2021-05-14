import React, { useState, useEffect } from "react";

function padZero(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${padZero(minutes)}:${padZero(seconds % 60)}`;
}

interface Props {
  seconds?: number;
  onCompleted: (status: boolean) => void;
}

export default function View({ seconds = 60, onCompleted }: Props) {
  const [timer, setTimer] = useState(seconds);

  useEffect(() => {
    function loop() {
      setTimer((seconds) => {
        if (!seconds) {
          window.clearInterval(interval);
          onCompleted(true);
        }
        return Math.max(seconds - 1, 0);
      });
    }

    const interval = window.setInterval(loop, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [onCompleted]);

  return <div>{formatTime(timer)}</div>;
}
