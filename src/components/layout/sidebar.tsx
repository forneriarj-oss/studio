import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Nav } from "./nav";

const Logo = () => (
    <div className="flex items-center gap-2 px-4 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M2 7v10"/><path d="M6 7v10"/><path d="M10 7v10"/><path d="M14 7v10"/><path d="M18 7v10"/><path d="m22 7-5 10-5-10"/></svg>
        <h1 className="text-xl font-bold text-primary">BizView</h1>
    </div>
)

export function AppSidebar() {
  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <Nav />
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <LogOut size={16} />
          <span>Sair</span>
        </Button>
      </SidebarFooter>
    </>
  );
}
