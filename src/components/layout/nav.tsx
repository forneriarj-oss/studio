
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Warehouse,
  ShoppingCart,
  Package,
  FileText,
  Landmark,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import { getUserByEmail, getRoleById } from "@/lib/data";

const allNavItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard, permission: "dashboard" },
  { href: "/cash-flow", label: "Caixa", icon: Landmark, permission: "cash-flow" },
  { href: "/revenue", label: "Receita", icon: TrendingUp, permission: "revenue" },
  { href: "/expenses", label: "Despesas", icon: TrendingDown, permission: "expenses" },
  { href: "/sales", label: "Vendas", icon: ShoppingCart, permission: "sales" },
  { href: "/purchases", label: "Compras", icon: Package, permission: "purchases" },
  { href: "/calendar", label: "Agenda", icon: Calendar, permission: "calendar" },
  { href: "/inventory", label: "Estoque", icon: Warehouse, permission: "inventory" },
  { href: "/reports", label: "Relatórios", icon: FileText, permission: "reports" },
];

export function Nav() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) {
    return null; // Não mostra nada se não houver usuário
  }

  const permittedNavItems = allNavItems.filter(item => {
    // Caso 1: Usuário é anônimo (visitante)
    if (user.isAnonymous) {
      // Visitantes só podem ver o painel
      return item.permission === 'dashboard';
    }

    // Caso 2: Usuário logado com e-mail
    if (user.email) {
      const appUser = getUserByEmail(user.email);
      const userRole = appUser ? getRoleById(appUser.roleId) : null;
      
      // Se não houver um papel definido para o e-mail, mostre apenas o painel.
      if (!userRole) {
        return item.permission === 'dashboard';
      }

      // Se o papel for admin (permissão '*'), mostre tudo.
      if (userRole.permissions.includes('*')) {
        return true;
      }
      
      // Se for outro papel, verifique se a permissão do item está na lista de permissões do papel.
      return userRole.permissions.includes(item.permission);
    }
    
    // Fallback para qualquer outro caso (não deveria acontecer)
    return false;
  });

  return (
    <SidebarMenu>
      {permittedNavItems.map((item) => (
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
