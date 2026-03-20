import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type UserSession, saveSession } from "../hooks/useWorkerQueries";

interface SettingsPageProps {
  session: UserSession;
  onBack: () => void;
  onLogout: () => void;
}

export default function SettingsPage({
  session,
  onBack,
  onLogout,
}: SettingsPageProps) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(session.name);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingName(true);
    try {
      // Update session name locally
      const updated: UserSession = { ...session, name: name.trim() };
      saveSession(updated);
      toast.success("Name updated successfully");
      setEditingName(false);
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.info("Password change is not yet available. Please contact support.");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors"
          data-ocid="settings.back.button"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-semibold text-foreground">
          Settings
        </h1>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="worker-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-foreground">Profile</h2>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                Phone / Email
              </Label>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {session.userId.toString()}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Display Name
              </Label>
              {editingName ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-10 text-sm flex-1"
                    data-ocid="settings.name.input"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="rounded-xl"
                    data-ocid="settings.save_name.button"
                  >
                    {savingName ? "..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingName(false);
                      setName(session.name);
                    }}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    className="text-xs text-primary font-medium hover:underline"
                    data-ocid="settings.edit_name.button"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Role</Label>
              <p className="text-sm font-medium text-foreground capitalize mt-0.5">
                {session.role}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="worker-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-semibold text-foreground">Security</h2>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="settings.new_password.input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 rounded-xl h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="settings.confirm_password.input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 rounded-xl h-11"
                />
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              variant="outline"
              className="w-full rounded-xl h-11"
              data-ocid="settings.change_password.button"
            >
              Change Password
            </Button>
          </div>
        </motion.div>

        {/* Logout Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            type="button"
            data-ocid="settings.logout.button"
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Logout</p>
              <p className="text-xs text-destructive/70 mt-0.5">
                Sign out of your account
              </p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
