export type Revenue = {
  id: string;
  amount: number;
  source: string;
  date: string;
};

export type ExpenseCategory = 'Marketing' | 'Sales' | 'Software' | 'Team' | 'Other';

export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
};

export type Transaction = (Revenue & { type: 'revenue'; description: string }) | (Expense & { type: 'expense' });

export type Appointment = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  attendees: string[];
  description: string;
};
