import type { Role, User } from './types';

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

// All other data functions have been removed as they are now handled by Firestore.
