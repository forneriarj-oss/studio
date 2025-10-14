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
import Image from 'next/image';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

const Logo = () => (
    <Link href="/" className="flex items-center gap-2">
        <Box className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-primary">GestorPro</h1>
    </Link>
)

export function Header() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onSignOut = async () => {
    router.push('/auth');
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }
  
  const mockUser = {
      displayName: 'Usuário Demo',
      email: 'demo@example.com',
      photoURL: ''
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      {isMobile && <SidebarTrigger />}
      {!isMobile && <Logo />}
      <div className="flex w-full items-center gap-4">
        <div className="flex-1" />
        {!isClient ? (
          <Loader className="h-6 w-6 animate-spin" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {mockUser.photoURL ? (
                    <AvatarImage src={mockUser.photoURL} alt={mockUser.displayName || 'User Avatar'} />
                  ) : (
                     <AvatarFallback>{getInitials(mockUser.displayName || mockUser.email)}</AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{mockUser.displayName || mockUser.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
