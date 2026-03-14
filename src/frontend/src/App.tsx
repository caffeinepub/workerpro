import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ListTodo,
  Menu,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import NotificationBell from "./components/NotificationBell";
import { requestNotificationPermission } from "./lib/browserNotifications";
import DailyWork from "./pages/DailyWork";
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import Notes from "./pages/Notes";
import NotificationsPage from "./pages/Notifications";
import Reports from "./pages/Reports";
import Schedule from "./pages/Schedule";
import Tasks from "./pages/Tasks";
import WorkersPage from "./pages/Workers";

const queryClient = new QueryClient();

type Page =
  | "dashboard"
  | "tasks"
  | "schedule"
  | "notes"
  | "dailywork"
  | "reports"
  | "jobboard"
  | "workers"
  | "notifications";

const NAV_ITEMS: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "dailywork", label: "Daily Work", icon: ClipboardList },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "jobboard", label: "Job Board", icon: Briefcase },
  { id: "workers", label: "Workers", icon: UserCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
];

function AppLayout() {
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const navigate = (p: Page) => {
    setPage(p);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-60 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-6 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-700 text-foreground text-lg tracking-tight">
            WorkerPro
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-ocid={
                  item.id === "workers"
                    ? "nav.workers.link"
                    : `nav.${item.id}.link`
                }
                onClick={() => navigate(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-500 transition-colors ${
                  active
                    ? "sidebar-active text-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : ""}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with &#9829; using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-display font-700 text-foreground">
              WorkerPro
            </span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell onOpenCenter={() => navigate("notifications")} />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-background">
          <span className="text-sm font-medium text-muted-foreground capitalize">
            {page}
          </span>
          <NotificationBell onOpenCenter={() => navigate("notifications")} />
        </div>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {page === "dashboard" && <Dashboard />}
              {page === "tasks" && <Tasks />}
              {page === "schedule" && <Schedule />}
              {page === "notes" && <Notes />}
              {page === "dailywork" && <DailyWork />}
              {page === "reports" && <Reports />}
              {page === "jobboard" && <JobBoard />}
              {page === "workers" && <WorkersPage />}
              {page === "notifications" && <NotificationsPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  );
}
