import { Switch } from "@/components/ui/switch";
import {
  BarChart3,
  Bell,
  Briefcase,
  Camera,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { WorkerStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { UserSession } from "../hooks/useWorkerQueries";
import {
  useGetWorkerByUserId,
  useUpdateWorkerStatus,
} from "../hooks/useWorkerQueries";
import { uploadImageFile } from "../utils/imageUpload";

type ProfileNav =
  | "jobboard"
  | "workers"
  | "dailywork"
  | "reports"
  | "notifications"
  | "adminworkers"
  | "admindashboard"
  | "settings"
  | "nearby";

interface ProfilePageProps {
  onNavigate: (page: ProfileNav) => void;
  session: UserSession | null;
  onLogout: () => void;
}

const MENU_ITEMS: {
  id: ProfileNav | string;
  label: string;
  subtitle: string;
  icon: typeof Briefcase;
  color: string;
  adminOnly?: boolean;
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
    id: "nearby",
    label: "Nearby Workers",
    subtitle: "Find workers near your location",
    icon: MapPin,
    color: "bg-cyan-100 text-cyan-600",
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
    id: "adminworkers",
    label: "Admin: Manage Workers",
    subtitle: "Set worker status and block accounts",
    icon: ShieldCheck,
    color: "bg-red-100 text-red-600",
    adminOnly: true,
  },
  {
    id: "admindashboard",
    label: "Admin Dashboard",
    subtitle: "Users, posts, approvals and stats",
    icon: LayoutDashboard,
    color: "bg-rose-100 text-rose-600",
    adminOnly: true,
  },
  {
    id: "settings",
    label: "Settings",
    subtitle: "Profile, password, and preferences",
    icon: Settings,
    color: "bg-gray-100 text-gray-600",
  },
];

function WorkerStatusCard({ userId }: { userId: bigint }) {
  const { data: workerProfile, isLoading } = useGetWorkerByUserId(userId);
  const updateStatus = useUpdateWorkerStatus();
  if (isLoading || !workerProfile) return null;
  const isActive = workerProfile.status === WorkerStatus.active;
  const handleToggle = async (checked: boolean) => {
    try {
      await updateStatus.mutateAsync({
        workerId: workerProfile.id,
        active: checked,
      });
      toast.success(
        checked
          ? "You are now Active and visible in search"
          : "You are now Inactive and hidden from search",
      );
    } catch {
      toast.error("Failed to update status");
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mb-4 worker-card p-4"
      data-ocid="profile.worker_status.card"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-semibold text-foreground text-sm">
            Your Availability
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isActive
              ? "Active: you appear in search results"
              : "Inactive: you're hidden from search"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Switch
            data-ocid="profile.worker_status.toggle"
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={updateStatus.isPending}
            className={isActive ? "data-[state=checked]:bg-green-500" : ""}
          />
          <span
            className={`text-[10px] font-semibold ${isActive ? "text-green-600" : "text-gray-400"}`}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProfilePage({
  onNavigate,
  session,
  onLogout,
}: ProfilePageProps) {
  const { actor } = useActor();
  const isAdmin = session?.role === "admin";
  const isWorker = session?.role === "worker";
  const displayName = session?.name ?? "Guest User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const visibleMenuItems = MENU_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  const storageKey = `profile_img_${session?.userId ?? "0"}`;
  const [profileImageUrl, setProfileImageUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) ?? "";
    } catch {
      return "";
    }
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImageFile(file, (pct) => {
        console.log(`Upload progress: ${pct}%`);
      });
      setProfileImageUrl(url);
      try {
        localStorage.setItem(storageKey, url);
      } catch {
        // storage full - ignore
      }
      // Try to update via backend if function exists
      if (actor && session) {
        try {
          await (actor as any).updateUserProfileData(
            session.userId,
            displayName,
            url,
          );
        } catch {
          // backend function may not exist yet
        }
      }
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      <div className="px-5 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center py-6 px-4 worker-card"
          data-ocid="profile.card"
        >
          {/* Avatar with upload */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {initials}
                </span>
              )}
            </div>
            <button
              type="button"
              data-ocid="profile.upload_button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
            >
              {uploading ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              data-ocid="profile.image.input"
              onChange={handleImageSelect}
            />
          </div>

          <h2 className="font-display text-lg font-semibold text-foreground">
            {displayName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin ? "Administrator" : isWorker ? "Worker" : "User"}
          </p>
          {session && (
            <div className="mt-1">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isAdmin
                    ? "bg-red-100 text-red-600"
                    : isWorker
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-600"
                }`}
              >
                {isAdmin ? "Admin" : isWorker ? "Worker" : "User"}
              </span>
            </div>
          )}
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

      {isWorker && session && <WorkerStatusCard userId={session.userId} />}

      <div className="px-5 space-y-2">
        {visibleMenuItems.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            data-ocid={`profile.${item.id}.button`}
            onClick={() => onNavigate(item.id as ProfileNav)}
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

      {session && (
        <div className="px-5 pt-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            data-ocid="profile.logout.button"
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Logout</p>
              <p className="text-xs text-destructive/70 mt-0.5">
                Sign out of your account
              </p>
            </div>
          </motion.button>
        </div>
      )}

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
