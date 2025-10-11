'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  Component,
  ShoppingCart,
  Package,
  Landmark,
  FileText,
  Settings,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useUser } from '@/firebase';

const allNavItems = [
  { href: '/', label: 'Painel', icon: LayoutDashboard },
  { href: '/inventory', label: 'Produtos', icon: Box },
  { href: '/#', label: 'Matérias-Primas', icon: Component }, // Placeholder link
  { href: '/sales', label: 'Vendas', icon: ShoppingCart },
  { href: '/purchases', label: 'Compras', icon: Package },
  { href: '/cash-flow', label: 'Caixa', icon: Landmark },
  { href: '/reports', label: 'Relatórios', icon: FileText },
  { href: '/#', label: 'Configurações', icon: Settings }, // Placeholder link
];

export function Nav() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) {
    return null; // Não mostra nada se não houver usuário
  }

  return (
    <SidebarMenu>
      {allNavItems.map(item => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
