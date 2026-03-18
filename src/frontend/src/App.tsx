import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Briefcase,
  Building2,
  CalendarDays,
  Home,
  MapPin,
  User,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import NotificationBell from "./components/NotificationBell";
import { requestNotificationPermission } from "./lib/browserNotifications";
import AddWorkPage from "./pages/AddWorkPage";
import BookingsPage from "./pages/BookingsPage";
import DailyWork from "./pages/DailyWork";
import HomePage from "./pages/Home";
import JobBoard from "./pages/JobBoard";
import JobsPage from "./pages/JobsPage";
import NotificationsPage from "./pages/Notifications";
import ProfilePage from "./pages/ProfilePage";
import RentalsPage from "./pages/RentalsPage";
import Reports from "./pages/Reports";
import WorkersPage from "./pages/Workers";

const queryClient = new QueryClient();

type BottomTab = "home" | "jobs" | "rentals" | "bookings" | "profile";
type DeepPage =
  | "jobboard"
  | "workers"
  | "dailywork"
  | "reports"
  | "notifications"
  | "addwork"
  | "messages";
type Page = BottomTab | DeepPage;

const BOTTOM_TABS: {
  id: BottomTab;
  label: string;
  icon: typeof Home;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "rentals", label: "Rentals", icon: Building2 },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: User },
];

const BOTTOM_TAB_IDS: BottomTab[] = [
  "home",
  "jobs",
  "rentals",
  "bookings",
  "profile",
];

function AppLayout() {
  const [page, setPage] = useState<Page>("home");
  const [prefillCategory, setPrefillCategory] = useState("");

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const navigate = (p: Page) => setPage(p);

  const activeTab: BottomTab = BOTTOM_TAB_IDS.includes(page as BottomTab)
    ? (page as BottomTab)
    : "home";

  const handleBookWorker = (skill: string) => {
    setPrefillCategory(skill);
    setPage("addwork");
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden max-w-lg mx-auto relative">
      {/* Top Header */}
      <header className="flex items-center justify-between px-5 py-3.5 bg-card border-b border-border z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-foreground text-base">
            Worker Pro
          </span>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium"
        >
          <MapPin className="w-3 h-3" />
          Nearby
        </button>

        <div className="flex items-center gap-1">
          <NotificationBell onOpenCenter={() => navigate("notifications")} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="min-h-full"
          >
            {page === "home" && <HomePage onBookWorker={handleBookWorker} />}
            {page === "jobs" && <JobsPage />}
            {page === "rentals" && <RentalsPage />}
            {page === "bookings" && <BookingsPage />}
            {page === "profile" && (
              <ProfilePage onNavigate={(p) => navigate(p)} />
            )}
            {page === "addwork" && (
              <AddWorkPage prefillCategory={prefillCategory} />
            )}
            {page === "jobboard" && <JobBoard />}
            {page === "workers" && <WorkersPage />}
            {page === "dailywork" && <DailyWork />}
            {page === "reports" && <Reports />}
            {page === "notifications" && <NotificationsPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="flex-shrink-0 flex items-center justify-around bg-card border-t border-border px-2"
        style={{ height: "64px" }}
        data-ocid="nav.bottom_nav.panel"
      >
        {BOTTOM_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-ocid={`nav.${tab.id}.link`}
              onClick={() => navigate(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                isActive ? "bottom-nav-active" : "bottom-nav-inactive"
              }`}
            >
              <tab.icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <Toaster richColors position="top-center" />
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
