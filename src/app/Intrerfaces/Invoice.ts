export interface User {
  userID: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface TourBooking {
  tourID: string;
  tourName: string;
  bookingDate: string;
  price: number;
}

export interface Invoice {
  id: number; // Add the id property
  invoiceNumber: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  tourAmount: number;
  status: string;
}