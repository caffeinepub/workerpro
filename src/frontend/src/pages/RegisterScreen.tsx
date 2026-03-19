import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Phone, User, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  type UserSession,
  hashPassword,
  saveSession,
} from "../hooks/useWorkerQueries";

interface RegisterScreenProps {
  onRegisterSuccess: (session: UserSession) => void;
  onGoToLogin: () => void;
}

export default function RegisterScreen({
  onRegisterSuccess,
  onGoToLogin,
}: RegisterScreenProps) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [role, setRole] = useState<"user" | "worker">("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!emailOrPhone.trim()) errs.emailOrPhone = "Email or phone is required";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    if (!actor) {
      toast.error("Connecting to server, please try again");
      return;
    }
    setIsLoading(true);
    try {
      const hashed = await hashPassword(password);
      const backendRole = role === "worker" ? UserRole.worker : UserRole.user;
      const result = await actor.register(
        name.trim(),
        emailOrPhone.trim(),
        hashed,
        backendRole,
      );
      if (result.__kind__ === "ok") {
        const userId = result.ok;
        const session: UserSession = { userId, role, name: name.trim() };
        saveSession(session);
        toast.success(`Account created! Welcome, ${name.trim()}!`);
        onRegisterSuccess(session);
      } else {
        toast.error(result.err || "Registration failed");
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Join Worker Pro today
          </p>
        </div>

        {/* Form */}
        <div className="worker-card p-6 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="reg-name"
                data-ocid="register.name.input"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            {errors.name && (
              <p
                data-ocid="register.name.error_state"
                className="text-xs text-destructive"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Email/Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Email or Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="reg-email"
                data-ocid="register.input"
                type="text"
                placeholder="email@example.com or phone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            {errors.emailOrPhone && (
              <p
                data-ocid="register.error_state"
                className="text-xs text-destructive"
              >
                {errors.emailOrPhone}
              </p>
            )}
          </div>

          {/* Role Selector */}
          <div className="space-y-1.5">
            <Label>I am a</Label>
            <div className="flex gap-3">
              {(["user", "worker"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  data-ocid={`register.${r}.radio`}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all capitalize ${
                    role === r
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {r === "user" ? "👤 User" : "🔧 Worker"}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="reg-password"
                data-ocid="register.input"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                data-ocid="register.error_state"
                className="text-xs text-destructive"
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="reg-confirm"
                data-ocid="register.input"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            {errors.confirmPassword && (
              <p
                data-ocid="register.error_state"
                className="text-xs text-destructive"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            data-ocid="register.submit_button"
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full rounded-xl h-11"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <button
            type="button"
            data-ocid="register.login.link"
            onClick={onGoToLogin}
            className="text-primary font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </motion.div>
    </div>
  );
}
