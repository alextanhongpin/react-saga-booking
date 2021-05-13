export default interface Payment {
  id: string;
  name: string;
  email: string;
  reservationId: string;
  status: string;
  reason: string;
  created_at: string;
  updated_at: string;
}
