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
  Calendar,
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
    { href: '/cash-flow', label: 'Fluxo de Caixa', icon: Landmark },
    { href: '/expenses', label: 'Despesas', icon: DollarSign, isSubPath:true },
    { href: '/revenue', label: 'Receitas', icon: DollarSign, isSubPath:true },
    { href: '/finished-products', label: 'Produtos', icon: Box },
    { href: '/inventory', label: 'Matérias-Primas', icon: Package },
    { href: '/purchases', label: 'Compras', icon: ShoppingCart, isSubPath:true },
    { href: '/reports', label: 'Relatórios', icon: FileText },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ];

export function Nav() {
  const pathname = usePathname();
  
  const isSubPathActive = (href: string) => {
    if (href === '/cash-flow') {
      return pathname === href || pathname === '/expenses' || pathname === '/revenue';
    }
    return false;
  };
  
  const cashFlowRelatedPaths = ['/expenses', '/revenue'];


  return (
    <SidebarMenu>
      {allNavItems.filter(item => !item.isSubPath).map(item => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) || isSubPathActive(item.href)}
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
