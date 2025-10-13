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
import { Loader } from "lucide-react";
import Image from 'next/image';
import { useUser, useAuth } from "@/firebase";
import { handleSignOut } from "@/firebase/auth/service";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Header() {
  const { isMobile } = useSidebar();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const onSignOut = async () => {
    await handleSignOut(auth);
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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      {isMobile && <SidebarTrigger />}
      <div className="flex w-full items-center gap-4">
        <div className="flex-1" />
        {isUserLoading ? (
          <Loader className="h-6 w-6 animate-spin" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} />
                  ) : (
                     <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
           <Button onClick={() => router.push('/auth')}>Login</Button>
        )}
      </div>
    </header>
  );
}
