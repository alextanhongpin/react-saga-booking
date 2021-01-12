import React from 'react'
import type Seat from 'interfaces/seat'
import styles from './index.module.css'

interface Props {
  seat: Seat
  onClick: (evt: React.SyntheticEvent, seat: Seat) => void
  selected: boolean
}

export default function Component({ seat, onClick, selected }: Props) {
  const { status, name } = seat;

  const handleClick = (evt: React.SyntheticEvent) => {
    status === 'cancelled' && onClick?.(evt, seat);
  }

  return (
    <div
      className={[styles.seat, styles[status], selected && styles.selected].join(" ")}
      onClick={handleClick}
    >
      {name}
    </div>
  );
}
