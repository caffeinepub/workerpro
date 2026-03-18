import {
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  ClipboardList,
  Settings,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

type ProfileNav =
  | "jobboard"
  | "workers"
  | "dailywork"
  | "reports"
  | "notifications";

interface ProfilePageProps {
  onNavigate: (page: ProfileNav) => void;
}

const MENU_ITEMS: {
  id: ProfileNav | "settings";
  label: string;
  subtitle: string;
  icon: typeof Briefcase;
  color: string;
}[] = [
  {
    id: "jobboard",
    label: "My Posted Jobs",
    subtitle: "View and manage job listings",
    icon: Briefcase,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "workers",
    label: "My Workers",
    subtitle: "Register and manage workers",
    icon: Users,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "dailywork",
    label: "Daily Work Log",
    subtitle: "Track daily work entries",
    icon: ClipboardList,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "reports",
    label: "Reports",
    subtitle: "View analytics and summaries",
    icon: BarChart3,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "notifications",
    label: "Notifications",
    subtitle: "Job alerts and updates",
    icon: Bell,
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "settings",
    label: "Settings",
    subtitle: "App preferences",
    icon: Settings,
    color: "bg-gray-100 text-gray-600",
  },
];

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Profile Card */}
      <div className="px-5 pt-6 pb-5">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center py-6 px-4 worker-card"
          data-ocid="profile.card"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
            <span className="text-3xl font-bold text-primary">G</span>
          </div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Guest User
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Worker Pro Member
          </p>
          <div className="mt-4 flex gap-6 text-center">
            <div>
              <p className="font-semibold text-foreground text-lg">0</p>
              <p className="text-xs text-muted-foreground">Jobs Posted</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="font-semibold text-foreground text-lg">0</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="font-semibold text-foreground text-lg">4.5</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Menu Items */}
      <div className="px-5 space-y-2">
        {MENU_ITEMS.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            data-ocid={`profile.${item.id}.button`}
            onClick={() => {
              if (item.id !== "settings") {
                onNavigate(item.id as ProfileNav);
              }
            }}
            className="w-full flex items-center gap-4 p-4 worker-card hover:shadow-md transition-shadow text-left"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.subtitle}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      <div className="px-5 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
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
    </div>
  );
}
