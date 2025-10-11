export type PaymentMethod = 'PIX' | 'Cartão' | 'Dinheiro';

export type Revenue = {
  id: string;
  amount: number;
  source: string;
  date: string;
  paymentMethod?: PaymentMethod;
};

export type ExpenseCategory = 'Marketing' | 'Vendas' | 'Software' | 'Equipe' | 'Outros';

export type Expense = {
  id: string;
  amount: number;
  category: 'Marketing' | 'Sales' | 'Software' | 'Team' | 'Other';
  description: string;
  date: string;
  paymentMethod?: PaymentMethod;
};

export type Transaction = (Revenue & { type: 'revenue'; description: string }) | (Omit<Expense, 'category'> & { type: 'expense', category: ExpenseCategory });

export type Appointment = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  attendees: string[];
  description: string;
};

export type Product = {
  id: string;
  code: string;
  description: string;
  unit: string;
  cost: number;
  supplier: string;
  quantity: number;
  minStock: number;
};

export type Sale = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  date: string;
};

export type Purchase = {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  date: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  source: 'purchase' | 'sale' | 'initial';
};
