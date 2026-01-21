import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, CreditCard, Coins, Gift, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useUpload } from "@/hooks/use-upload";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Wallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile, isUploading } = useUpload({
    onSuccess: async (response) => {
      try {
        await apiRequest("PATCH", "/api/user/profile", {
          profileImageUrl: response.objectPath
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: "Profile updated", description: "Your custom picture has been uploaded." });
      } catch (error) {
        toast({ variant: "destructive", title: "Update failed", description: "Could not sync profile picture." });
      }
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const balances = [
    { title: "System Credits", amount: (user as any)?.credits || 0, icon: Coins, color: "text-primary" },
    { title: "Fiat Balance", amount: `$${((user as any)?.walletBalance / 100 || 0).toFixed(2)}`, icon: CreditCard, color: "text-blue-400" },
    { title: "Crypto Assets", amount: `${(user as any)?.cryptoBalance?.BTC || "0.0000"} BTC`, icon: WalletIcon, color: "text-orange-400" },
    { title: "Gift Balance", amount: `$${((user as any)?.giftCardBalance / 100 || 0).toFixed(2)}`, icon: Gift, color: "text-purple-400" },
  ];

  const getProfileUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? path : `/objects${path}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-primary/20 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="h-16 w-16 border-2 border-primary/30 rounded-full overflow-hidden bg-primary/10 transition-all group-hover:border-primary">
                {user?.profileImageUrl ? (
                  <img src={getProfileUrl(user.profileImageUrl) || ''} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                <Upload className="w-5 h-5 text-white" />
                <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} accept="image/*" />
              </label>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-display tracking-tighter text-primary">WALLET_INTERFACE</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Authorized Access: {user?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-primary/60 uppercase">System Status</div>
            <div className="text-xs text-green-500 animate-pulse">ENCRYPTED_CONNECTED</div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {balances.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-black/40 border border-primary/20 hover:border-primary/50 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <item.icon className="w-12 h-12" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] uppercase tracking-widest text-white/60 flex items-center gap-2">
                    <item.icon className={`w-3 h-3 ${item.color}`} />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tighter text-white">
                    {item.amount}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-black/40 border border-primary/20">
            <CardHeader className="border-b border-primary/10 bg-primary/5">
              <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Transaction_History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center h-64 text-white/20 text-xs">
                <div className="w-8 h-8 border border-white/10 rounded-full flex items-center justify-center mb-4">
                  <History className="w-4 h-4" />
                </div>
                NO_RECENT_TRANSACTIONS_FOUND
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-primary/10 border border-primary/40">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest">Quick_Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-primary text-white text-xs uppercase tracking-widest hover:bg-primary/80 transition-all rounded-sm">
                  Deposit Funds <ArrowDownLeft className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 border border-primary text-primary text-xs uppercase tracking-widest hover:bg-primary/10 transition-all rounded-sm">
                  Withdrawal <ArrowUpRight className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>

            <div className="p-4 border border-white/10 rounded-sm bg-white/5">
              <div className="text-[10px] text-white/40 uppercase mb-2">Security_Protocol</div>
              <p className="text-[10px] text-white/60 leading-relaxed">
                All transactions are verified through the ALKULOUS neural net. Multi-signature encryption active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
