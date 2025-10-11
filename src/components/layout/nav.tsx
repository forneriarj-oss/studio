
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

  const appUser = user?.email ? getUserByEmail(user.email) : null;
  const userRole = appUser ? getRoleById(appUser.roleId) : null;

  const hasPermission = (permission: string) => {
    if (!userRole) return false;
    if (userRole.permissions.includes('*')) return true;
    return userRole.permissions.includes(permission);
  };
  
  // Always show dashboard for any logged-in user
  const permittedNavItems = allNavItems.filter(item => item.permission === 'dashboard' || hasPermission(item.permission));

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
