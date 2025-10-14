"use client";
import {
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader, Box } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/firebase";
import { handleSignOut } from "@/firebase/auth/service";
import { useFirebase } from "@/firebase/provider";

const Logo = () => (
    <Link href="/" className="flex items-center gap-2">
        <Box className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-primary">GestorPro</h1>
    </Link>
)

export function Header() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { auth } = useFirebase();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      {isMobile && <SidebarTrigger />}
      {!isMobile && <Logo />}
      <div className="flex w-full items-center gap-4">
        <div className="flex-1" />
        {isUserLoading && <Loader className="h-6 w-6 animate-spin" />}
      </div>
    </header>
  );
}
