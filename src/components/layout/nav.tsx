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
  Warehouse,
  BarChart3
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const allNavItems = [
    { href: '/', label: 'Painel', icon: LayoutDashboard },
    { href: '/calendar', label: 'Agenda', icon: Calendar },
    { href: '/sales', label: 'Vendas', icon: ShoppingCart },
    { href: '/cash-flow', label: 'Caixa', icon: Landmark },
    { href: '/revenue', label: 'Receitas', icon: DollarSign },
    { href: '/expenses', label: 'Despesas', icon: DollarSign },
    { href: '/finished-products', label: 'Produtos', icon: Component },
    { href: '/inventory', label: 'Matérias-Primas', icon: Warehouse },
    { href: '/purchases', label: 'Compras', icon: Package },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {allNavItems.map(item => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href === '/finished-products' && pathname.startsWith('/finished-products')) || (item.href === '/settings' && pathname.startsWith('/settings'))}
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
