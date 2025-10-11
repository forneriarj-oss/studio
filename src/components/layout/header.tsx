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
import { Search } from "lucide-react";
import Image from 'next/image';
import { getImageById } from "@/lib/placeholder-images";

export function Header() {
  const { isMobile } = useSidebar();
  const userAvatar = getImageById('user-avatar');

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      {isMobile && <SidebarTrigger />}
      <div className="flex w-full items-center gap-4">
        {/* The search can be enabled later */}
        {/* <form className="hidden flex-1 sm:flex-initial sm:hidden md:flex">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
            />
          </div>
        </form> */}
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {userAvatar && (
                  <Image
                    src={userAvatar.imageUrl}
                    alt={userAvatar.description}
                    width={32}
                    height={32}
                    data-ai-hint={userAvatar.imageHint}
                  />
                )}
                <AvatarFallback>BV</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem>Suporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
