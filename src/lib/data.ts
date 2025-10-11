import type { Expense, Revenue, Appointment } from './types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const revenues: Revenue[] = [
  { id: 'rev-1', amount: 2450.00, source: 'Projeto Cliente Alpha', date: today.toISOString().split('T')[0] },
  { id: 'rev-2', amount: 1800.50, source: 'Assinatura SaaS', date: yesterday.toISOString().split('T')[0] },
  { id: 'rev-3', amount: 320.00, source: 'Chamada de Consultoria', date: yesterday.toISOString().split('T')[0] },
  { id: 'rev-4', amount: 5000.00, source: 'Projeto Cliente Beta', date: twoDaysAgo.toISOString().split('T')[0] },
  { id: 'rev-5', amount: 75.00, source: 'Venda de E-book', date: twoDaysAgo.toISOString().split('T')[0] },
  { id: 'rev-6', amount: 1200, source: 'Projeto Cliente Gamma', date: '2024-06-15' },
  { id: 'rev-7', amount: 300, source: 'Receita de Anúncios', date: '2024-06-10' },
  { id: 'rev-8', amount: 2100, source: 'Assinatura SaaS', date: '2024-06-05' },
];

const expenses: Expense[] = [
  { id: 'exp-1', amount: 350.00, category: 'Software', description: 'Assinatura Figma', date: today.toISOString().split('T')[0] },
  { id: 'exp-2', amount: 120.00, category: 'Marketing', description: 'Google Ads', date: yesterday.toISOString().split('T')[0] },
  { id: 'exp-3', amount: 2500.00, category: 'Team', description: 'Pagamento de Freelancer', date: twoDaysAgo.toISOString().split('T')[0] },
  { id: 'exp-4', amount: 45.00, category: 'Other', description: 'Material de Escritório', date: twoDaysAgo.toISOString().split('T')[0] },
  { id: 'exp-5', amount: 800.00, category: 'Software', description: 'Custos de Servidor', date: '2024-06-18' },
  { id: 'exp-6', amount: 1500, category: 'Marketing', description: 'Campanha de Mídia Social', date: '2024-06-12' },
  { id: 'exp-7', amount: 3000, category: 'Team', description: 'John Doe - Salário', date: '2024-06-01' },
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

export function getRevenue() {
  return revenues;
}

export function getExpenses() {
  return expenses.map(e => ({
    ...e,
    category: e.category === 'Sales' ? 'Vendas' : e.category === 'Team' ? 'Equipe' : e.category === 'Other' ? 'Outros' : e.category
  })) as (Omit<Expense, 'category'> & {category: ExpenseCategory})[];
}

export function getAppointments() {
  return appointments;
}
