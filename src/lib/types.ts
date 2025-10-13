

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

// Renamed from Product to RawMaterial
export type RawMaterial = {
  id?: string; // Optional for new documents
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
  flavorId?: string; // ID of the flavor for FinishedProduct
  quantity: number;
  unitPrice: number;
  date: string;
  paymentMethod?: PaymentMethod;
  commission?: number; // Commission percentage
  location?: string;
};

export type Purchase = {
  id: string;
  productId: string; // Should be RawMaterial
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
  source: 'purchase' | 'sale' | 'initial' | 'production';
};

export type Role = {
  id: 'admin' | 'caixa' | 'estoque' | 'vendedor';
  name: string;
  permissions: string[];
}

export type User = {
  id: string;
  email: string;
  roleId: Role['id'];
}

// New types for Finished Products
export type RecipeItem = {
  rawMaterialId: string;
  quantity: number;
};

export type Flavor = {
  id: string;
  name: string;
  stock: number;
};

export type FinishedProduct = {
  id?: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  recipe: RecipeItem[];
  finalCost: number;
  salePrice: number;
  flavors: Flavor[];
};
