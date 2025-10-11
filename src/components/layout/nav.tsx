"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
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
  { href: "/calendar", label: "Agenda", icon: Calendar },
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
