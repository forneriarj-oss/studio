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
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/revenue", label: "Receita", icon: TrendingUp },
  { href: "/expenses", label: "Despesas", icon: TrendingDown },
  { href: "/sales", label: "Vendas", icon: ShoppingCart },
  { href: "/purchases", label: "Compras", icon: Package },
  { href: "/calendar", label: "Agenda", icon: Calendar },
  { href: "/inventory", label: "Estoque", icon: Warehouse },
  { href: "/reports", label: "Relatórios", icon: FileText },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
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
