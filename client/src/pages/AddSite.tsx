import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAddSite } from "@/hooks/use-monitor";
import { useToast } from "@/hooks/use-toast";
import { Shield, Globe, ArrowLeft, Loader2 } from "lucide-react";

export default function AddSite() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { mutate: addSite, isPending } = useAddSite();
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation to ensure it has http/https
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    addSite({ url: finalUrl }, {
      onSuccess: () => {
        toast({
          title: "Target Added",
          description: "Agent will begin monitoring this URL shortly.",
        });
        setLocation("/");
      },
      onError: (err) => {
        toast({
          title: "Failed to add target",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </div>
        </Link>
        <h1 className="text-3xl font-display font-bold text-foreground">Add Monitor Target</h1>
        <p className="text-muted-foreground mt-1">Configure a new public URL for the agent to track.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-secondary/30 flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Target Configuration</h3>
            <p className="text-xs text-muted-foreground">The agent operates in read-only public mode.</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium text-foreground block">
                Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="url"
                  id="url"
                  required
                  placeholder="https://example.com"
                  className="w-full pl-11 pr-4 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-sm md:text-base"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <p className="text-xs text-muted-foreground pl-1">
                Enter the full URL including https://
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm text-amber-700 dark:text-amber-400">
               <Shield className="w-5 h-5 shrink-0 mt-0.5" />
               <p>
                 <strong>Ethical Monitoring Notice:</strong> DriftGuard AI only accesses public data. 
                 It does not support logins or authenticated scraping. Please ensure the target permits automated monitoring.
               </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isPending || !url.trim()}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initializing Agent...
                  </>
                ) : (
                  "Start Monitoring"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
