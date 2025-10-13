'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  Package,
  ShoppingCart,
  DollarSign,
  Landmark,
  FileText,
  Settings,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const allNavItems = [
    { href: '/', label: 'Painel', icon: LayoutDashboard },
    { href: '/finished-products', label: 'Produtos', icon: Box },
    { href: '/inventory', label: 'Matérias-Primas', icon: Package },
    { href: '/sales', label: 'Vendas', icon: ShoppingCart },
    { href: '/purchases', label: 'Compras', icon: DollarSign },
    { href: '/cash-flow', label: 'Caixa', icon: Landmark },
    { href: '/reports', label: 'Relatórios', icon: FileText },
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
