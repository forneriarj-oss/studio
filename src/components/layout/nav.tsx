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
  Calendar,
  DollarSign,
  Users,
  Warehouse
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const allNavItems = [
    { href: '/', label: 'Painel', icon: LayoutDashboard },
    { href: '/calendar', label: 'Agenda', icon: Calendar },
    { href: '/sales', label: 'Vendas de Produtos Acabados', icon: ShoppingCart },
    { href: '/cash-flow', label: 'Caixa', icon: Landmark },
    { href: '/revenue', label: 'Receitas', icon: DollarSign },
    { href: '/expenses', label: 'Despesas', icon: DollarSign },
    { href: '/finished-products', label: 'Produtos Acabados', icon: Component },
    { href: '/inventory', label: 'Matérias-Primas', icon: Warehouse },
    { href: '/purchases', label: 'Compras', icon: Package },
    { href: '/reports', label: 'Relatórios', icon: FileText },
    { href: '/#', label: 'Configurações', icon: Settings }, // Placeholder link
  ];

export function Nav() {
  const pathname = usePathname();

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
