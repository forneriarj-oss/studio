
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
import { cn } from "@/lib/utils";
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

  const permittedNavItems = allNavItems.filter(item => {
    // Se não há usuário, não mostra nada
    if (!user) {
      return false;
    }

    // Caso especial para o painel, visível para qualquer usuário logado
    if (item.permission === 'dashboard') {
      return true;
    }

    // Se o usuário é anônimo, ele só pode ver o painel (já tratado acima)
    if (user.isAnonymous) {
      return false;
    }

    // Se o usuário não é anônimo, ele deve ter um e-mail.
    // Buscamos o usuário e seu papel nos dados mockados.
    const appUser = user.email ? getUserByEmail(user.email) : null;
    const userRole = appUser ? getRoleById(appUser.roleId) : null;

    // Se não encontramos um papel para o usuário, ele não tem permissões especiais.
    if (!userRole) {
      return false;
    }
    
    // Admin tem todas as permissões.
    if (userRole.permissions.includes('*')) {
      return true;
    }
    
    // Verifica se o papel do usuário inclui a permissão necessária para o item.
    return userRole.permissions.includes(item.permission);
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
