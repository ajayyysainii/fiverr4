import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Shield, Cpu, Activity, Database, ArrowRight, ShoppingCart, Menu, X } from "lucide-react";
import { CyberButton } from "@/components/CyberButton";
import { useAuth } from "@/hooks/use-auth";
import landingBg from "@assets/generated_images/cyberpunk_lab_background_without_people.png";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: async (plan: any) => {
      if (!isAuthenticated) {
        window.location.href = "/api/login";
        return;
      }

      if (plan.price === 0) {
        // Free plan goes straight to console
        setLocation('/console');
        return;
      }
      const res = await apiRequest("POST", "/api/cart", {
        planName: plan.title,
        price: plan.price,
        isYearly: isYearly,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({ title: "Added to cart", description: "Proceed to checkout to activate." });
        setLocation('/cart');
      }
    },
  });

  const { data: cartItems } = useQuery<any[]>({
    queryKey: ["/api/cart"],
  });

  const plans = [
    {
      name: "FREE PLAN",
      title: "Explorer",
      price: 0,
      credits: 100,
      color: "border-white/20",
      textColor: "text-white/60",
      features: [
        "Basic Alkulous intelligence",
        "Limited questions",
        "Text-only interaction",
        "No memory retention",
        "No Elite 20 agents"
      ],
      purpose: "Test Alkulous, not rely on it"
    },
    {
      name: "GOLD PLAN",
      title: "Professional",
      price: isYearly ? 14 : 20,
      credits: 2500,
      color: "border-yellow-500/50",
      textColor: "text-yellow-500",
      features: [
        "Full Alkulous core intelligence",
        "Faster responses",
        "Basic memory context",
        "Limited Elite 20 agent access"
      ],
      bestFor: "Freelancers, solo founders, consultants"
    },
    {
      name: "PLATINUM PLAN",
      title: "Advanced Intelligence",
      price: isYearly ? 28 : 40,
      credits: 6000,
      color: "border-blue-500/50",
      textColor: "text-blue-500",
      features: [
        "Priority Alkulous processing",
        "Advanced reasoning mode",
        "Full Elite 20 agent access",
        "Context retention across sessions",
        "Higher voice interaction limits"
      ],
      bestFor: "Business owners, teams, creators"
    },
    {
      name: "TITANIUM PLAN",
      title: "Executive / Power User",
      price: isYearly ? 105 : 150,
      credits: 25000,
      color: "border-primary/50",
      textColor: "text-primary",
      features: [
        "Maximum Alkulous intelligence depth",
        "Executive reasoning mode",
        "Unlimited Elite 20 agents",
        "Long-session memory",
        "Priority compute access",
        "Early access to new features"
      ],
      bestFor: "Executives, investors, enterprises, family offices"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono relative">
      <div
        className="fixed inset-0 bg-cover bg-center opacity-40 grayscale"
        style={{ backgroundImage: `url(${landingBg})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 scanline" />

      {/* Header */}
      <header className="fixed top-0 w-full px-4 py-4 md:px-6 md:py-6 flex justify-between items-center z-50 border-b border-primary/20 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-2 md:gap-3">
          <Zap className="text-primary animate-pulse w-5 h-5 md:w-6 md:h-6" />
          <h1 className="text-sm md:text-xl tracking-[0.3em] md:tracking-[0.5em]">
            ALKULOUS <span className="text-primary text-[8px] md:text-xs hidden sm:inline">SYS.AI.01</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/cart" asChild>
            <a className="relative text-xs hover:text-primary transition-colors flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              CART
              {cartItems && cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </a>
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-primary/60 uppercase tracking-widest">
                ARCHITECT: {user?.email?.split('@')[0]}
              </span>
              <CyberButton variant="outline" size="sm" onClick={() => window.location.href = '/api/logout'}>
                LOGOUT
              </CyberButton>
            </div>
          ) : (
            <CyberButton variant="outline" size="sm" onClick={() => window.location.href = '/api/login'}>
              LOGIN
            </CyberButton>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/cart" asChild>
            <a className="relative text-xs hover:text-primary transition-colors flex items-center">
              <ShoppingCart className="w-5 h-5" />
              {cartItems && cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </a>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-primary transition-colors p-1"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 bg-black/95 border-l border-primary/20 z-50 md:hidden backdrop-blur-md"
            >
              <div className="flex flex-col h-full pt-20 px-6">
                {/* Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-white hover:text-primary transition-colors p-2"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* User Info */}
                {isAuthenticated && (
                  <div className="mb-6 pb-6 border-b border-primary/20">
                    <span className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">
                      ARCHITECT
                    </span>
                    <span className="text-sm text-white">
                      {user?.email?.split('@')[0]}
                    </span>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex flex-col gap-4 flex-1">
                  <Link href="/cart" asChild>
                    <a
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors py-3 border-b border-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      CART
                      {cartItems && cartItems.length > 0 && (
                        <span className="bg-primary text-black text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">
                          {cartItems.length}
                        </span>
                      )}
                    </a>
                  </Link>

                  {isAuthenticated && (
                    <Link href="/console" asChild>
                      <a
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors py-3 border-b border-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Cpu className="w-5 h-5" />
                        CONSOLE
                      </a>
                    </Link>
                  )}
                </nav>

                {/* Auth Button */}
                <div className="py-6 border-t border-primary/20">
                  {isAuthenticated ? (
                    <CyberButton
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = '/api/logout';
                      }}
                    >
                      LOGOUT
                    </CyberButton>
                  ) : (
                    <CyberButton
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = '/api/login';
                      }}
                    >
                      LOGIN
                    </CyberButton>
                  )}
                </div>

                {/* System Info */}
                <div className="py-4 text-center">
                  <span className="text-[8px] text-primary/40 tracking-widest">
                    SYS.AI.01 // MOBILE INTERFACE
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-display mb-6 tracking-tighter"
          >
            MASTER <span className="text-primary">INTELLIGENCE</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-primary/60 max-w-2xl mx-auto text-lg tracking-widest uppercase mb-12"
          >
            Professional intelligence system powered by compute-based credits.
          </motion.p>

          <div className="flex items-center justify-center gap-4 mb-20">
            <span className={!isYearly ? "text-white" : "text-white/40"}>MONTHLY</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 bg-primary/20 border border-primary/40 rounded-full relative p-1"
            >
              <motion.div
                animate={{ x: isYearly ? 24 : 0 }}
                className="w-4 h-4 bg-primary rounded-full"
              />
            </button>
            <span className={isYearly ? "text-white" : "text-white/40"}>YEARLY (SAVE 30%)</span>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-black/60 border-2 ${plan.color} p-6 flex flex-col relative group hover:bg-black/80 transition-all backdrop-blur-md`}
              >
                <div className="absolute -top-3 left-6 px-2 bg-black text-[10px] tracking-widest text-primary/80">
                  {plan.name}
                </div>

                <h3 className={`text-2xl mb-2 ${plan.textColor}`}>{plan.title}</h3>
                <div className="text-4xl mb-4">
                  ${plan.price}<span className="text-sm opacity-40">/mo</span>
                </div>

                <div className="mb-6 py-2 border-y border-white/5">
                  <div className="text-primary text-xs mb-1">ALLOCATION:</div>
                  <div className="text-xl">{plan.credits.toLocaleString()} <span className="text-[10px] opacity-40">CREDITS</span></div>
                </div>

                <ul className="flex-1 space-y-3 mb-8 text-left">
                  {plan.features.map(f => (
                    <li key={f} className="text-xs flex gap-2 items-start text-white/60">
                      <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="text-[9px] text-white/40 mb-6 uppercase leading-tight">
                  BEST FOR: {plan.bestFor || plan.purpose}
                </div>

                <CyberButton
                  variant={plan.title === "Advanced Intelligence" ? "primary" : "outline"}
                  className="w-full"
                  onClick={() => addToCartMutation.mutate(plan)}
                >
                  {addToCartMutation.isPending ? "INITIALIZING..." : `INITIALIZE ${plan.title.split(' ')[0]}`}
                </CyberButton>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <section className="container mx-auto max-w-4xl py-20 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
            <div>
              <h3 className="text-primary text-xl mb-4">HOW CREDITS WORK</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Alkulous operates on a compute-based credit system. More advanced reasoning and agent-based tasks require more computational power.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs">SIMPLE QUESTION</span>
                  <span className="text-primary text-xs">5-10 CREDITS</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs">BUSINESS ANALYSIS</span>
                  <span className="text-primary text-xs">25-50 CREDITS</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs">ELITE 20 AGENT TASK</span>
                  <span className="text-primary text-xs">50-150 CREDITS</span>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 p-8 border border-primary/20 relative ">
              <div className="relative z-10">
                <h3 className="text-white text-xl mb-4">SYSTEM PHILOSOPHY</h3>
                <p className="text-primary/80 italic text-sm mb-6">
                  "Alkulous is not unlimited chat — it is a professional intelligence system powered by compute-based credits."
                </p>
                <div className="flex items-center gap-4 text-white/40 text-[10px]">
                  <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> SECURITY</div>
                  <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /> COMPUTE</div>
                  <div className="flex items-center gap-1"><Activity className="w-3 h-3" /> UPTIME</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 bg-black/40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] text-white/40 tracking-widest">
            © 2026 REED GLOBAL ARCHITECT | ALKULOUS SYS.AI.01
          </div>
          <div className="flex gap-8 text-[10px] text-white/60">
            <a href="#" className="hover:text-primary transition-colors">PROTOCOLS</a>
            <a href="#" className="hover:text-primary transition-colors">SECURITY</a>
            <a href="#" className="hover:text-primary transition-colors">VAA NETWORK</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
