import { useRoute, Link } from "wouter";
import { useSiteHistory, useSites } from "@/hooks/use-monitor";
import { format } from "date-fns";
import { ArrowLeft, Clock, FileCode2, History as HistoryIcon, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function History() {
  const [, params] = useRoute("/history/:id");
  const siteId = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: sites = [] } = useSites();
  const { data: history = [], isLoading } = useSiteHistory(siteId);
  
  const site = sites.find(s => s.id === siteId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-primary">
          <HistoryIcon className="w-8 h-8" />
        </div>
      </div>
    );
  }

  if (!site && !isLoading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Target not found</h2>
        <Link href="/">
          <span className="text-primary hover:underline cursor-pointer">Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Link href="/">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </div>
        </Link>
        <h1 className="text-3xl font-display font-bold text-foreground">Change History</h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          Tracking changes for: <a href={site?.url} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">{site?.url}</a>
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-6 md:p-8">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No history recorded yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              The agent hasn't completed enough checks or hasn't detected any content changes since monitoring began.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border/50 ml-3 md:ml-6 space-y-10">
            {history.map((record, index) => {
              const date = record.timestamp ? new Date(record.timestamp) : new Date();
              const isChange = record.changeDetected;
              
              return (
                <div key={record.id} className="relative pl-8 md:pl-10">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-card ${isChange ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isChange ? 'bg-purple-500/10 text-purple-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {isChange ? 'Change Detected' : 'No Changes'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-lg w-fit">
                      <Clock className="w-3.5 h-3.5" />
                      {format(date, "MMM d, yyyy • h:mm a")}
                    </div>
                  </div>

                  <div className="bg-background border border-border/50 rounded-xl p-4 mt-3">
                    {isChange ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
                          <FileCode2 className="w-4 h-4 text-primary" />
                          Content Snapshot Updated
                        </div>
                        {/* In a real app we might show diff, here we just show size diff or snippet */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Previous Signature</span>
                            <div className="font-mono text-xs text-muted-foreground truncate opacity-70">
                              {record.previousSnapshot ? `${record.previousSnapshot.substring(0, 40)}...` : 'None'}
                            </div>
                          </div>
                          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">New Signature</span>
                            <div className="font-mono text-xs text-foreground truncate">
                              {record.currentSnapshot ? `${record.currentSnapshot.substring(0, 40)}...` : 'None'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Target matched previous snapshot exactly.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
