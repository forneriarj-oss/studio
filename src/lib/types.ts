export type PaymentMethod = 'PIX' | 'Cartão' | 'Dinheiro';

export type Revenue = {
  id?: string;
  amount: number;
  source: string;
  date: string; // ISO String
  paymentMethod?: PaymentMethod;
};

export type ExpenseCategory = 'Marketing' | 'Vendas' | 'Software' | 'Equipe' | 'Outros';

export type Expense = {
  id?: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // ISO String
  paymentMethod?: PaymentMethod;
};

export type Transaction = (Revenue & { type: 'revenue'; description: string }) | (Omit<Expense, 'category'> & { type: 'expense', category: ExpenseCategory });

export type Appointment = {
  id?: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  description: string;
  notes?: string;
};

export type RawMaterial = {
  id?: string;
  code: string;
  description: string;
  unit: string;
  cost: number;
  supplier: string;
  quantity: number;
  minStock: number;
};

export type Sale = {
  id?: string;
  productId: string;
  flavorId: string;
  quantity: number;
  unitPrice: number;
  date: string; // ISO String
  paymentMethod?: PaymentMethod;
  location?: string;
};

export type Purchase = {
  id?: string;
  productId: string; // Should be RawMaterial ID
  quantity: number;
  unitCost: number;
  date: string; // ISO String
};

export type StockMovement = {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  source: 'purchase' | 'sale' | 'initial' | 'production';
};

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

export type Settings = {
  productCategories: string[];
  taxes: {
    icms: number;
    iss: number;
    pis: number;
    cofins: number;
  };
  paymentRates: {
    credit: number;
    debit: number;
    pix: number;
    mercadoPago: number;
  };
  platformFees: {
    ifood: number;
    taNaMesa: number;
  },
  profitMargin: number;
}

export type UserProfile = {
  displayName: string;
  photoURL: string;
  email: string;
}
