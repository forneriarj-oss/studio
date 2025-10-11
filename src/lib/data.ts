import type { Revenue, Expense, Appointment } from './types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const revenues: Revenue[] = [
  { id: 'rev-1', amount: 2450.00, source: 'Client Project Alpha', date: today.toISOString().split('T')[0] },
  { id: 'rev-2', amount: 1800.50, source: 'SaaS Subscription', date: yesterday.toISOString().split('T')[0] },
  { id: 'rev-3', amount: 320.00, source: 'Consulting Call', date: yesterday.toISOString().split('T')[0] },
  { id: 'rev-4', amount: 5000.00, source: 'Client Project Beta', date: twoDaysAgo.toISOString().split('T')[0] },
  { id: 'rev-5', amount: 75.00, source: 'E-book Sale', date: twoDaysAgo.toISOString().split('T')[0] },
  { id: 'rev-6', amount: 1200, source: 'Client Project Gamma', date: '2024-06-15' },
  { id: 'rev-7', amount: 300, source: 'Ad Revenue', date: '2024-06-10' },
  { id: 'rev-8', amount: 2100, source: 'SaaS Subscription', date: '2024-06-05' },
];

const expenses: Expense[] = [
  { id: 'exp-1', amount: 350.00, category: 'Software', description: 'Figma Subscription', date: today.toISOString().split('T')[0] },
  { id: 'exp-2', amount: 120.00, category: 'Marketing', description: 'Google Ads', date: yesterday.toISOString().split('T')[0] },
  { id: 'exp-3', amount: 2500.00, category: 'Team', description: 'Freelancer Payment', date: twoDaysAgo.toISOString().split('T')[0] },
  { id: 'exp-4', amount: 45.00, category: 'Other', description: 'Office Supplies', date: twoDaysAgo.toISOString().split('T')[0] },
  { id: 'exp-5', amount: 800.00, category: 'Software', description: 'Server Costs', date: '2024-06-18' },
  { id: 'exp-6', amount: 1500, category: 'Marketing', description: 'Social Media Campaign', date: '2024-06-12' },
  { id: 'exp-7', amount: 3000, category: 'Team', description: 'John Doe - Salary', date: '2024-06-01' },
];

const appointments: Appointment[] = [
  { 
    id: 'app-1', 
    title: 'Daily Stand-up', 
    date: today.toISOString().split('T')[0], 
    time: '09:00', 
    attendees: ['Dev Team'], 
    description: 'Quick sync on project progress and blockers.' 
  },
  { 
    id: 'app-2', 
    title: 'Client Meeting: Project Alpha', 
    date: today.toISOString().split('T')[0], 
    time: '11:00', 
    attendees: ['Jane Smith', 'Client Co.'], 
    description: 'Review milestone 2 deliverables and plan for the next sprint.' 
  },
  { 
    id: 'app-3', 
    title: 'Marketing Strategy Session', 
    date: today.toISOString().split('T')[0], 
    time: '14:30', 
    attendees: ['Marketing Team'], 
    description: 'Brainstorm for the Q3 campaign.' 
  },
  { 
    id: 'app-4', 
    title: 'Design Review: New Feature', 
    date: tomorrow.toISOString().split('T')[0], 
    time: '10:00', 
    attendees: ['UI/UX Team', 'Product Manager'], 
    description: 'Final review of the new dashboard design mockups.' 
  },
  {
    id: 'app-5',
    title: 'Interview with Candidate',
    date: tomorrow.toISOString().split('T')[0],
    time: '16:00',
    attendees: ['Hiring Manager', 'Candidate X'],
    description: 'Technical interview for the Senior Developer role.'
  }
];

export function getRevenue() {
  return revenues;
}

export function getExpenses() {
  return expenses;
}

export function getAppointments() {
  return appointments;
}
