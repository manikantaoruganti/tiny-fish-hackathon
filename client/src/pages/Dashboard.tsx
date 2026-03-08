import { useState } from "react";
import { Link } from "wouter";
import { useSites, useRunCheck, useDeleteSite } from "@/hooks/use-monitor";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, Activity, AlertCircle, Clock, Trash2, 
  RefreshCw, ChevronRight, CheckCircle2, ShieldAlert, PlusCircle, History as HistoryIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: sites = [], isLoading } = useSites();
  const { mutate: runCheck, isPending: isChecking } = useRunCheck();
  const { mutate: deleteSite } = useDeleteSite();
  const { toast } = useToast();
  
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleRunCheck = () => {
    runCheck(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Check Complete",
          description: data.message,
        });
      },
      onError: (err) => {
        toast({
          title: "Check Failed",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  const handleDelete = (id: number, url: string) => {
    if (confirm(`Stop monitoring ${url}?`)) {
      setDeletingId(id);
      deleteSite(id, {
        onSuccess: () => {
          toast({ title: "Site removed from monitoring" });
          setDeletingId(null);
        },
        onError: () => {
          toast({ title: "Failed to remove site", variant: "destructive" });
          setDeletingId(null);
        }
      });
    }
  };

  // Calculate stats
  const activeCount = sites.filter(s => s.status === 'active' || s.status === 'updated').length;
  const errorCount = sites.filter(s => s.status === 'error').length;

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { color: string, icon: any, label: string }> = {
      active: { color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: CheckCircle2, label: "Active" },
      monitoring: { color: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: Activity, label: "Monitoring" },
      updated: { color: "bg-purple-500/15 text-purple-600 border-purple-500/30", icon: RefreshCw, label: "Updated" },
      error: { color: "bg-red-500/15 text-red-600 border-red-500/30", icon: AlertCircle, label: "Error" },
    };
    
    const c = config[status] || config.active;
    const Icon = c.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {c.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Activity className="w-8 h-8 animate-spin text-primary" />
          <p>Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your autonomous monitoring targets.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRunCheck}
            disabled={isChecking || sites.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold hover:bg-secondary hover:border-primary/50 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin text-primary" : ""}`} />
            {isChecking ? "Agent Running..." : "Run Global Check"}
          </button>
          <Link href="/add">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all cursor-pointer shadow-md">
              <PlusCircle className="w-4 h-4" />
              Add Target
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-6 hover-lift">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Targets</p>
              <h3 className="text-3xl font-display font-bold mt-1">{sites.length}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Globe className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-6 hover-lift border-b-4 border-b-emerald-500/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Healthy</p>
              <h3 className="text-3xl font-display font-bold mt-1">{activeCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 hover-lift border-b-4 border-b-red-500/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Errors</p>
              <h3 className="text-3xl font-display font-bold mt-1">{errorCount}</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Sites Table */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-secondary/30">
          <h2 className="text-lg font-bold font-display">Monitored Websites</h2>
        </div>
        
        {sites.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No targets yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Add your first website URL to start autonomous monitoring and change detection.
            </p>
            <Link href="/add">
              <div className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:shadow-md cursor-pointer inline-flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Website Target
              </div>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/20 text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Target URL</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 hidden md:table-cell">Last Checked</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3 text-foreground">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <a href={site.url} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline truncate max-w-[200px] sm:max-w-xs block">
                          {site.url}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={site.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {site.lastCheckedAt ? formatDistanceToNow(new Date(site.lastCheckedAt), { addSuffix: true }) : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/history/${site.id}`}>
                          <div className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer" title="View History">
                            <HistoryIcon className="w-4 h-4" />
                          </div>
                        </Link>
                        <button 
                          onClick={() => handleDelete(site.id, site.url)}
                          disabled={deletingId === site.id}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Target"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
