import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, LayoutDashboard, PlusCircle, Settings, Shield, History } from "lucide-react";
import { motion } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/add", label: "Add Monitor", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border/50 flex-shrink-0 z-10 hidden md:flex md:flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="w-6 h-6" />
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              DriftGuard <span className="text-primary">AI</span>
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? "bg-primary/10 text-primary font-medium shadow-sm" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border/50">
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-foreground">Agent Status</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Autonomous monitoring is active and running checks continuously.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-card border-b border-border/50 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-6 h-6" />
          <span className="font-display font-bold text-lg text-foreground">DriftGuard</span>
        </div>
        <div className="flex gap-2">
           {navItems.map((item) => (
             <Link key={item.href} href={item.href} className="p-2 text-muted-foreground hover:text-primary transition-colors">
               <item.icon className="w-5 h-5" />
             </Link>
           ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
        
        <div className="flex-1 overflow-auto p-4 md:p-8 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
