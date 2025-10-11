
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

  // Define as permissões com base no tipo de usuário
  let userPermissions: string[] = [];

  if (user.isAnonymous) {
    // Permissão para visitante anônimo
    userPermissions = ['dashboard'];
  } else if (user.email) {
    // Lógica para usuário autenticado com e-mail
    const appUser = getUserByEmail(user.email);
    const userRole = appUser ? getRoleById(appUser.roleId) : null;
    
    if (userRole) {
      if (userRole.permissions.includes('*')) {
        // Administrador tem todas as permissões
        userPermissions = allNavItems.map(item => item.permission);
      } else {
        // Outros papéis têm permissões específicas
        userPermissions = userRole.permissions;
      }
    } else {
        // Fallback para usuário logado sem um papel definido: só vê o painel
        userPermissions = ['dashboard'];
    }
  }

  // Filtra os itens de navegação com base nas permissões do usuário
  const permittedNavItems = allNavItems.filter(item => userPermissions.includes(item.permission));

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
