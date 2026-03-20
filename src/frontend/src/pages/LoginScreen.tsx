import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Shield,
  User,
} from "lucide-react";
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

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  onGoToRegister: () => void;
  loginMode?: "admin" | "user";
  onBack?: () => void;
  onForgotPassword?: () => void;
}

export default function LoginScreen({
  onLoginSuccess,
  onGoToRegister,
  loginMode = "user",
  onBack,
  onForgotPassword,
}: LoginScreenProps) {
  const { actor } = useActor();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrPhone?: string;
    password?: string;
  }>({});

  const isAdmin = loginMode === "admin";

  const validate = () => {
    const errs: { emailOrPhone?: string; password?: string } = {};
    if (!emailOrPhone.trim()) errs.emailOrPhone = "Email or phone is required";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    if (!actor) {
      toast.error("Connecting to server, please try again");
      return;
    }
    setIsLoading(true);
    try {
      const hashed = await hashPassword(password);
      const result = await actor.login(emailOrPhone.trim(), hashed);
      if (result.__kind__ === "ok") {
        const { userId, role } = result.ok;
        let roleStr: "admin" | "user" | "worker" = "user";
        if (role === UserRole.admin) roleStr = "admin";
        else if (role === UserRole.worker) roleStr = "worker";

        let name = emailOrPhone.trim();
        try {
          const userAccount = await actor.getUserById(userId);
          if (userAccount) name = userAccount.name;
        } catch {
          // fallback
        }

        const session: UserSession = {
          userId,
          role: roleStr,
          name,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
        saveSession(session);
        toast.success(`Welcome back, ${name}!`);
        onLoginSuccess(session);
      } else {
        toast.error(result.err || "Invalid credentials");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      toast.info("Please contact support to reset your password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8">
      {/* Back Button */}
      {onBack && (
        <div className="w-full max-w-sm mb-4">
          <button
            type="button"
            data-ocid="login.back.button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${
              isAdmin ? "bg-orange-100" : "bg-primary/10"
            }`}
          >
            {isAdmin ? (
              <Shield className="w-8 h-8 text-orange-600" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isAdmin ? "Admin Login" : "User Login"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? "Access admin dashboard" : "Sign in to your account"}
          </p>
        </div>

        {/* Form */}
        <div className="worker-card p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email or Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="login-email"
                data-ocid="login.input"
                type="text"
                placeholder="email@example.com or 9876543210"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="pl-10 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {errors.emailOrPhone && (
              <p
                data-ocid="login.error_state"
                className="text-xs text-destructive"
              >
                {errors.emailOrPhone}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="login-password"
                data-ocid="login.input"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                data-ocid="login.error_state"
                className="text-xs text-destructive"
              >
                {errors.password}
              </p>
            )}
          </div>

          <div className="text-right">
            <button
              type="button"
              data-ocid="login.forgot_password.button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            data-ocid="login.submit_button"
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full rounded-xl h-11 ${
              isAdmin ? "bg-orange-600 hover:bg-orange-700 text-white" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </div>

        {!isAdmin && (
          <p className="text-center text-sm text-muted-foreground mt-5">
            Don't have an account?{" "}
            <button
              type="button"
              data-ocid="login.register.link"
              onClick={onGoToRegister}
              className="text-primary font-semibold hover:underline"
            >
              Sign Up
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}
