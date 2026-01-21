import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";

import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Landing from "@/pages/Landing";
import Cart from "@/pages/Cart";
import Wallet from "@/pages/Wallet";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-primary animate-pulse font-mono tracking-widest uppercase text-xs">
          Loading_System_Resources...
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      {!user ? (
        <Route>
          {() => {
            window.location.href = "/auth";
            return null;
          }}
        </Route>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/console" component={Home} />
          <Route path="/admin" component={Admin} />
          <Route path="/cart" component={Cart} />
          <Route path="/wallet" component={Wallet} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full bg-black">
            <AppSidebar />
            <div className="flex flex-col flex-1 relative">
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
