import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Trash2, ShoppingCart, CreditCard, Wallet, ArrowLeft } from "lucide-react";
import { CyberButton } from "@/components/CyberButton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { toast } = useToast();
  const { data: cartItems, isLoading } = useQuery<any[]>({
    queryKey: ["/api/cart"],
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Item removed from cart" });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Checkout Successful", description: "Your credits have been initialized." });
    },
  });

  const total = cartItems?.reduce((sum, item) => sum + item.price, 0) || 0;

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono">LOADING_DATA...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/">
            <a className="text-primary hover:text-white transition-colors"><ArrowLeft /></a>
          </Link>
          <h1 className="text-4xl tracking-tighter">SECURE_<span className="text-primary">CART</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {cartItems?.length === 0 ? (
              <div className="p-12 border border-white/10 text-center text-white/40">
                CART_EMPTY_AWAITING_INPUT
              </div>
            ) : (
              cartItems?.map((item) => (
                <div key={item.id} className="bg-white/5 border border-primary/20 p-6 flex justify-between items-center backdrop-blur-md">
                  <div>
                    <div className="text-primary text-[10px] uppercase tracking-widest">{item.planName}</div>
                    <div className="text-xl uppercase">{item.isYearly ? "Yearly" : "Monthly"} Protocol</div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-2xl">${item.price}</div>
                    <button 
                      onClick={() => removeFromCartMutation.mutate(item.id)}
                      className="text-white/20 hover:text-primary transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/40 p-8 space-y-6">
              <h2 className="text-xl border-b border-primary/20 pb-4">SUMMARY</h2>
              <div className="flex justify-between text-white/60">
                <span>SUBTOTAL</span>
                <span>${total}</span>
              </div>
              <div className="flex justify-between text-2xl border-t border-primary/20 pt-4">
                <span>TOTAL</span>
                <span className="text-primary">${total}</span>
              </div>
              <CyberButton 
                variant="primary" 
                className="w-full"
                disabled={!cartItems?.length || checkoutMutation.isPending}
                onClick={() => checkoutMutation.mutate()}
              >
                {checkoutMutation.isPending ? "PROCESSING..." : "FINALIZE_PURCHASE"}
              </CyberButton>
            </div>

            <div className="bg-black border border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase">
                <Wallet className="w-3 h-3" /> Wallet_Status
              </div>
              <div className="text-sm">CRYPTO_BALANCE: <span className="text-primary">0.00 BTC</span></div>
              <div className="text-sm">GIFT_CARDS: <span className="text-primary">$0.00</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
