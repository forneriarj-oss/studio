

import type { Expense, Revenue, Appointment, RawMaterial, Sale, Purchase, StockMovement, ExpenseCategory, PaymentMethod, Role, User, FinishedProduct } from './types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

let revenues: Revenue[] = [
  { id: 'rev-1', amount: 2450.00, source: 'Projeto Cliente Alpha', date: today.toISOString().split('T')[0], paymentMethod: 'PIX' },
  { id: 'rev-2', amount: 1800.50, source: 'Assinatura SaaS', date: yesterday.toISOString().split('T')[0], paymentMethod: 'Cartão' },
  { id: 'rev-3', amount: 320.00, source: 'Chamada de Consultoria', date: yesterday.toISOString().split('T')[0], paymentMethod: 'PIX' },
  { id: 'rev-4', amount: 5000.00, source: 'Projeto Cliente Beta', date: twoDaysAgo.toISOString().split('T')[0], paymentMethod: 'Dinheiro' },
  { id: 'rev-5', amount: 75.00, source: 'Venda de E-book', date: twoDaysAgo.toISOString().split('T')[0], paymentMethod: 'Cartão' },
  { id: 'rev-6', amount: 1200, source: 'Projeto Cliente Gamma', date: '2024-06-15', paymentMethod: 'PIX' },
  { id: 'rev-7', amount: 300, source: 'Receita de Anúncios', date: '2024-06-10', paymentMethod: 'Cartão' },
  { id: 'rev-8', amount: 2100, source: 'Assinatura SaaS', date: '2024-06-05', paymentMethod: 'Cartão' },
];

let expenses: Expense[] = [
  { id: 'exp-1', amount: 350.00, category: 'Software', description: 'Assinatura Figma', date: today.toISOString().split('T')[0], paymentMethod: 'Cartão' },
  { id: 'exp-2', amount: 120.00, category: 'Marketing', description: 'Google Ads', date: yesterday.toISOString().split('T')[0], paymentMethod: 'Cartão' },
  { id: 'exp-3', amount: 2500.00, category: 'Team', description: 'Pagamento de Freelancer', date: twoDaysAgo.toISOString().split('T')[0], paymentMethod: 'PIX' },
  { id: 'exp-4', amount: 45.00, category: 'Other', description: 'Material de Escritório', date: twoDaysAgo.toISOString().split('T')[0], paymentMethod: 'Dinheiro' },
  { id: 'exp-5', amount: 800.00, category: 'Software', description: 'Custos de Servidor', date: '2024-06-18', paymentMethod: 'Cartão' },
  { id: 'exp-6', amount: 1500, category: 'Marketing', description: 'Campanha de Mídia Social', date: '2024-06-12', paymentMethod: 'PIX' },
  { id: 'exp-7', amount: 3000, category: 'Team', description: 'John Doe - Salário', date: '2024-06-01', paymentMethod: 'PIX' },
];

const appointments: Appointment[] = [
  { 
    id: 'app-1', 
    title: 'Reunião Diária', 
    date: today.toISOString().split('T')[0], 
    time: '09:00', 
    attendees: ['Equipe Dev'], 
    description: 'Sincronização rápida sobre o progresso do projeto e bloqueios.' 
  },
  { 
    id: 'app-2', 
    title: 'Reunião com Cliente: Projeto Alpha', 
    date: today.toISOString().split('T')[0], 
    time: '11:00', 
    attendees: ['Jane Smith', 'Cliente Co.'], 
    description: 'Revisar as entregas do marco 2 e planejar o próximo sprint.' 
  },
  { 
    id: 'app-3', 
    title: 'Sessão de Estratégia de Marketing', 
    date: today.toISOString().split('T')[0], 
    time: '14:30', 
    attendees: ['Equipe de Marketing'], 
    description: 'Brainstorm para a campanha do terceiro trimestre.' 
  },
  { 
    id: 'app-4', 
    title: 'Revisão de Design: Novo Recurso', 
    date: tomorrow.toISOString().split('T')[0], 
    time: '10:00', 
    attendees: ['Equipe UI/UX', 'Gerente de Produto'], 
    description: 'Revisão final dos mockups de design do novo painel.' 
  },
  {
    id: 'app-5',
    title: 'Entrevista com Candidato',
    date: tomorrow.toISOString().split('T')[0],
    time: '16:00',
    attendees: ['Gerente de Contratação', 'Candidato X'],
    description: 'Entrevista técnica para a vaga de Desenvolvedor Sênior.'
  }
];

let rawMaterials: RawMaterial[] = [
    { id: 'prod-1', code: 'NTB-001', description: 'Notebook Pro 15"', unit: 'pç', cost: 7500, supplier: 'Fornecedor A', quantity: 15, minStock: 5 },
    { id: 'prod-2', code: 'MOU-002', description: 'Mouse sem Fio Ergonômico', unit: 'pç', cost: 120, supplier: 'Fornecedor B', quantity: 8, minStock: 10 },
    { id: 'prod-3', code: 'TEC-003', description: 'Teclado Mecânico RGB', unit: 'pç', cost: 350, supplier: 'Fornecedor A', quantity: 25, minStock: 10 },
    { id: 'prod-4', code: 'MON-004', description: 'Monitor Ultrawide 34"', unit: 'pç', cost: 2800, supplier: 'Fornecedor C', quantity: 3, minStock: 5 },
    { id: 'prod-5', code: 'SSD-005', description: 'SSD NVMe 1TB', unit: 'pç', cost: 600, supplier: 'Fornecedor B', quantity: 30, minStock: 15 },
];

let finishedProducts: FinishedProduct[] = [
  { 
    id: 'fp-1', 
    sku: 'PA-BRIG-01', 
    name: 'Bolo de Brigadeiro', 
    recipe: [], 
    finalCost: 25.50, 
    salePrice: 50.00,
    flavors: [
      { id: 'flav-1', name: 'Tradicional', stock: 10 },
      { id: 'flav-2', name: 'Branco', stock: 5 },
    ]
  },
  { 
    id: 'fp-2', 
    sku: 'PA-CEN-01', 
    name: 'Bolo de Cenoura com Chocolate', 
    recipe: [], 
    finalCost: 22.00, 
    salePrice: 45.00,
    flavors: [
      { id: 'flav-3', name: 'Com Cobertura', stock: 8 },
      { id: 'flav-4', name: 'Sem Cobertura', stock: 4 },
      { id: 'flav-5', name: 'Vulcão', stock: 3 },
    ]
  }
];

let sales: Sale[] = [
    { id: 'sale-1', productId: 'fp-1', flavorId: 'flav-1', quantity: 1, unitPrice: 50, date: today.toISOString().split('T')[0], paymentMethod: 'PIX' },
    { id: 'sale-2', productId: 'fp-2', flavorId: 'flav-3', quantity: 2, unitPrice: 45, date: yesterday.toISOString().split('T')[0], paymentMethod: 'Cartão' },
];

let purchases: Purchase[] = [
    { id: 'purch-1', productId: 'prod-2', quantity: 10, unitCost: 110, date: twoDaysAgo.toISOString().split('T')[0] },
    { id: 'purch-2', productId: 'prod-4', quantity: 5, unitCost: 2700, date: twoDaysAgo.toISOString().split('T')[0] },
];

let stockMovements: StockMovement[] = [
    ...rawMaterials.map(p => ({ id: `sm-init-${p.id}`, productId: p.id, type: 'in' as const, quantity: p.quantity, date: '2024-01-01', source: 'initial' as const })),
    { id: 'sm-1', productId: 'prod-1', type: 'out', quantity: 1, date: today.toISOString().split('T')[0], source: 'sale' },
    { id: 'sm-2', productId: 'prod-3', type: 'out', quantity: 2, date: yesterday.toISOString().split('T')[0], source: 'sale' },
    { id: 'sm-3', productId: 'prod-2', type: 'in', quantity: 10, date: twoDaysAgo.toISOString().split('T')[0], source: 'purchase' },
    { id: 'sm-4', productId: 'prod-4', type: 'in', quantity: 5, date: twoDaysAgo.toISOString().split('T')[0], source: 'purchase' },
]

const roles: Role[] = [
  { id: 'admin', name: 'Administrador', permissions: ['*'] },
  { id: 'caixa', name: 'Caixa', permissions: ['cash-flow', 'revenue', 'expenses', 'sales'] },
  { id: 'estoque', name: 'Estoque', permissions: ['inventory', 'purchases', 'reports'] },
  { id: 'vendedor', name: 'Vendedor', permissions: ['sales', 'calendar'] },
]

const users: User[] = [
  { id: 'admin@test.com', email: 'admin@test.com', roleId: 'admin' },
  { id: 'caixa@test.com', email: 'caixa@test.com', roleId: 'caixa' },
  { id: 'estoque@test.com', email: 'estoque@test.com', roleId: 'estoque' },
  { id: 'vendedor@test.com', email: 'vendedor@test.com', roleId: 'vendedor' },
]

export function getRevenue() {
  return revenues;
}

export function getExpenses() {
  return expenses.map(e => ({
    ...e,
    category: e.category === 'Sales' ? 'Vendas' : e.category === 'Team' ? 'Equipe' : e.category === 'Other' ? 'Outros' : e.category
  })) as (Omit<Expense, 'category'> & {category: ExpenseCategory, paymentMethod?: PaymentMethod})[];
}

export function getAppointments() {
  return appointments;
}

export function getRawMaterials() {
    return rawMaterials;
}

export function getFinishedProducts() {
  return finishedProducts;
}

export function getSales() {
    return sales;
}

export function getPurchases() {
    return purchases;
}

export function getStockMovements() {
    return stockMovements;
}

export function getRoles() {
    return roles;
}

export function getRoleById(roleId: Role['id']): Role | undefined {
    return roles.find(r => r.id === roleId);
}

export function getUsers() {
    return users;
}

export function getUserByEmail(email: string): User | undefined {
    return users.find(u => u.email === email);
}

// This is a mock function. In a real app, this would update a database.
export function updateStock(productId: string, quantity: number, type: 'in' | 'out', flavorId?: string): boolean {
    const rawMaterialIndex = rawMaterials.findIndex(p => p.id === productId);
    const finishedProductIndex = finishedProducts.findIndex(p => p.id === productId);

    if (rawMaterialIndex === -1 && finishedProductIndex === -1) {
        return false;
    }
    
    const newStockMovement: StockMovement = {
        id: `sm-${Date.now()}`,
        productId,
        quantity,
        type,
        date: new Date().toISOString().split('T')[0],
        source: type === 'in' ? 'purchase' : 'sale'
    };
    stockMovements.push(newStockMovement);

    if (rawMaterialIndex !== -1) { // It's a raw material
        if (type === 'in') {
            rawMaterials[rawMaterialIndex].quantity += quantity;
        } else {
            if (rawMaterials[rawMaterialIndex].quantity < quantity) return false;
            rawMaterials[rawMaterialIndex].quantity -= quantity;
        }
    } else { // It's a finished product
        const product = finishedProducts[finishedProductIndex];
        const flavorIndex = product.flavors.findIndex(f => f.id === flavorId);
        
        if (flavorIndex === -1) return false; // Flavor not found
        
        if (type === 'in') {
             product.flavors[flavorIndex].stock += quantity;
        } else {
            if (product.flavors[flavorIndex].stock < quantity) return false;
            product.flavors[flavorIndex].stock -= quantity;
        }
    }


    return true;
}

export function getProducts() {
    return rawMaterials;
}
