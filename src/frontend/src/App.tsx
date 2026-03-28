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
import {
  type UserSession,
  clearSession,
  getSession,
} from "./hooks/useWorkerQueries";
import { requestNotificationPermission } from "./lib/browserNotifications";
import AddWorkPage from "./pages/AddWorkPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminWorkersPage from "./pages/AdminWorkersPage";
import BookingsPage from "./pages/BookingsPage";
import DailyWork from "./pages/DailyWork";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/Home";
import JobBoard from "./pages/JobBoard";
import JobsPage from "./pages/JobsPage";
import LoginScreen from "./pages/LoginScreen";
import NearbyPage from "./pages/NearbyPage";
import NotificationsPage from "./pages/Notifications";
import ProfilePage from "./pages/ProfilePage";
import RegisterScreen from "./pages/RegisterScreen";
import RentalsPage from "./pages/RentalsPage";
import Reports from "./pages/Reports";
import RoleSelectScreen from "./pages/RoleSelectScreen";
import SettingsPage from "./pages/SettingsPage";
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
  | "messages"
  | "adminworkers"
  | "admindashboard"
  | "settings"
  | "nearby";
type Page = BottomTab | DeepPage;
type AuthScreen = "roleselect" | "login" | "register" | "forgotpassword";

const BOTTOM_TABS: { id: BottomTab; label: string; icon: typeof Home }[] = [
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

const DEEP_PAGES: DeepPage[] = [
  "jobboard",
  "workers",
  "dailywork",
  "reports",
  "notifications",
  "addwork",
  "messages",
  "adminworkers",
  "admindashboard",
  "settings",
  "nearby",
];

function AppLayout() {
  const [session, setSession] = useState<UserSession | null>(() =>
    getSession(),
  );
  const [authScreen, setAuthScreen] = useState<AuthScreen>("roleselect");
  const [loginMode, setLoginMode] = useState<"admin" | "user">("user");
  const [page, setPage] = useState<Page>("home");
  const [prefillCategory, setPrefillCategory] = useState("");

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const navigate = (p: Page) => setPage(p);

  const handleLoginSuccess = (s: UserSession) => {
    setSession(s);
    if (s.role === "admin") setPage("profile");
    else setPage("home");
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setAuthScreen("roleselect");
    setPage("home");
  };

  const activeTab: BottomTab = BOTTOM_TAB_IDS.includes(page as BottomTab)
    ? (page as BottomTab)
    : "home";

  const isDeepPage = DEEP_PAGES.includes(page as DeepPage);

  const handleBookWorker = (skill: string) => {
    setPrefillCategory(skill);
    setPage("addwork");
  };

  if (!session) {
    return (
      <div className="max-w-lg mx-auto relative">
        <Toaster richColors position="top-center" />
        <AnimatePresence mode="wait">
          {authScreen === "roleselect" ? (
            <motion.div
              key="roleselect"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <RoleSelectScreen
                onSelectAdmin={() => {
                  setLoginMode("admin");
                  setAuthScreen("login");
                }}
                onSelectUser={() => {
                  setLoginMode("user");
                  setAuthScreen("login");
                }}
                onGoToRegister={() => setAuthScreen("register")}
              />
            </motion.div>
          ) : authScreen === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <LoginScreen
                onLoginSuccess={handleLoginSuccess}
                onGoToRegister={() => setAuthScreen("register")}
                loginMode={loginMode}
                onBack={() => setAuthScreen("roleselect")}
                onForgotPassword={() => setAuthScreen("forgotpassword")}
              />
            </motion.div>
          ) : authScreen === "forgotpassword" ? (
            <motion.div
              key="forgotpassword"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ForgotPasswordPage onBack={() => setAuthScreen("login")} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <RegisterScreen
                onRegisterSuccess={handleLoginSuccess}
                onGoToLogin={() => setAuthScreen("login")}
                onBack={() => setAuthScreen("roleselect")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden max-w-lg mx-auto relative">
      {/* Top Header - hide on deep pages that have own header */}
      {page !== "admindashboard" && (
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
            onClick={() => navigate("nearby")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            data-ocid="header.nearby.button"
          >
            <MapPin className="w-3 h-3" />
            Nearby
          </button>
          <div className="flex items-center gap-1">
            <NotificationBell
              onOpenCenter={() => navigate("notifications")}
              onNavigateToJobs={() => {
                navigate("notifications");
              }}
              session={session}
            />
          </div>
        </header>
      )}

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
            {page === "home" && (
              <HomePage
                onBookWorker={handleBookWorker}
                session={session}
                onNearby={() => navigate("nearby")}
              />
            )}
            {page === "jobs" && <JobsPage session={session} />}
            {page === "rentals" && <RentalsPage session={session} />}
            {page === "bookings" && <BookingsPage session={session} />}
            {page === "profile" && (
              <ProfilePage
                onNavigate={(p) => navigate(p as Page)}
                session={session}
                onLogout={handleLogout}
              />
            )}
            {page === "addwork" && (
              <AddWorkPage prefillCategory={prefillCategory} />
            )}
            {page === "jobboard" && <JobBoard />}
            {page === "workers" && <WorkersPage />}
            {page === "dailywork" && <DailyWork />}
            {page === "reports" && <Reports />}
            {page === "notifications" && (
              <NotificationsPage
                session={session}
                onNavigateToJobs={() => navigate("jobs")}
              />
            )}
            {page === "adminworkers" && <AdminWorkersPage />}
            {page === "admindashboard" && (
              <AdminDashboardPage
                session={session}
                onBack={() => navigate("profile")}
              />
            )}
            {page === "settings" && session && (
              <SettingsPage
                session={session}
                onBack={() => navigate("profile")}
                onLogout={handleLogout}
              />
            )}
            {page === "nearby" && (
              <NearbyPage onBack={() => navigate("home")} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - hide on deep pages */}
      {!isDeepPage && (
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
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive ? "bottom-nav-active" : "bottom-nav-inactive"}`}
              >
                <tab.icon
                  className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
                />
                <span
                  className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

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
