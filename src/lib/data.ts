

import type { Expense, Revenue, Appointment, RawMaterial, Sale, Purchase, StockMovement, ExpenseCategory, PaymentMethod, Role, User, FinishedProduct } from './types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

let expenses: Expense[] = [];

let appointments: Appointment[] = [
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
    description: 'Entrevista técnica para la vaga de Desenvolvedor Sênior.'
  }
];

let purchases: Purchase[] = [
];

let stockMovements: StockMovement[] = []

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

export function getExpenses() {
  return expenses.map(e => ({
    ...e,
    category: e.category === 'Sales' ? 'Vendas' : e.category === 'Team' ? 'Equipe' : e.category === 'Other' ? 'Outros' : e.category
  })) as (Omit<Expense, 'category'> & {category: ExpenseCategory, paymentMethod?: PaymentMethod})[];
}

export function getAppointments() {
  return appointments;
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

export function resetAllData() {
    expenses = [];
    purchases = [];
    stockMovements = [];
}
