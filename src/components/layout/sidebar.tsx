'use client';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Nav } from "./nav";
import { useRouter } from "next/navigation";
import { Box } from 'lucide-react';
import Link from 'next/link';

const Logo = () => (
    <Link href="/" className="flex items-center gap-2 px-4 py-2">
        <Box className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">GestorPro</h1>
    </Link>
)

export function AppSidebar() {
  const router = useRouter();

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <Nav />
      </SidebarContent>
      <SidebarFooter>
          {/* Footer content can go here */}
      </SidebarFooter>
    </>
  );
}
