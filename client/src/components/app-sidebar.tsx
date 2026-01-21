import { 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Wallet, 
  ShoppingCart,
  Zap,
  ChevronUp
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useLocation } from "wouter";

export function AppSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (location === "/auth" || location === "/") {
    return null;
  }

  const menuItems = [
    { title: "Console", icon: LayoutDashboard, url: "/console" },
    { title: "Wallet", icon: Wallet, url: "/wallet" },
    { title: "Cart", icon: ShoppingCart, url: "/cart" },
    { title: "Plans", icon: Zap, url: "/" },
  ];

  return (
    <Sidebar className="border-r border-primary/20 bg-black/95">
      <SidebarHeader className="p-4 border-b border-primary/10">
        <div className="flex items-center gap-2 text-primary">
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="font-display tracking-widest text-sm">ALKULOUS_SYS</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 text-[10px] tracking-widest uppercase px-4 py-2">System_Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-primary/10 text-white/80 hover:text-primary transition-colors px-4 py-2">
                    <Link href={item.url}>
                      <a className="flex items-center gap-3 w-full">
                        <item.icon className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">{item.title}</span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-primary/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full h-12 hover:bg-primary/10 transition-colors px-2">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8 border border-primary/30">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-[10px] text-white font-bold truncate w-full uppercase tracking-tighter">
                        {user?.email?.split('@')[0]}
                      </span>
                      <span className="text-[8px] text-primary/60 uppercase">Architect</span>
                    </div>
                    <ChevronUp className="ml-auto w-4 h-4 text-white/40" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] bg-black border border-primary/20 text-white"
              >
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer py-2">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer py-2">
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-primary/10 cursor-pointer py-2 text-primary"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="text-xs uppercase">Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
