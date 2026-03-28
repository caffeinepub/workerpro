import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  Phone,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
  onBack?: () => void;
}

type Step = 1 | 2 | 3;

export default function RegisterScreen({
  onRegisterSuccess,
  onGoToLogin,
  onBack,
}: RegisterScreenProps) {
  const { actor } = useActor();
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [phone, setPhone] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  // Step 2 — countdown timer
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [displayedOtp, setDisplayedOtp] = useState("");

  // Step 3
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "worker">("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Start or restart the 60-second countdown
  const startCountdown = () => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSendOtp = async () => {
    const p = phone.trim();
    if (!p.startsWith("+") || p.length < 10 || !/^\+\d{8,15}$/.test(p)) {
      setErrors({ phone: "Use international format: +91XXXXXXXXXX" });
      return;
    }
    if (!actor) {
      toast.error("Connecting to server, please try again");
      return;
    }
    setSendingOtp(true);
    try {
      const result = (await actor.generateOtp(p)) as
        | { ok: string }
        | { err: string };
      if ("ok" in result) {
        const otpCode = result.ok;
        setDisplayedOtp(otpCode);
        setOtpInput(otpCode);
        setStep(2);
        startCountdown();
        toast.success("OTP generated for testing");
      } else {
        toast.error(result.err || "Failed to generate OTP");
      }
    } catch {
      toast.error(
        "Failed to send OTP. Please check your number and try again.",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    if (!actor) return;
    setSendingOtp(true);
    try {
      const result = (await actor.generateOtp(phone.trim())) as
        | { ok: string }
        | { err: string };
      if ("ok" in result) {
        const otpCode = result.ok;
        setDisplayedOtp(otpCode);
        setOtpInput(otpCode);
        startCountdown();
        setErrors({});
        toast.success("OTP generated for testing");
      } else {
        toast.error(result.err || "Failed to resend OTP");
      }
    } catch {
      toast.error("Failed to resend OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpInput.length !== 6) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return;
    }
    if (!actor) {
      toast.error("Connecting to server, please try again");
      return;
    }
    setVerifying(true);
    try {
      const valid = await actor.verifyOtp(phone.trim(), otpInput.trim());
      if (valid) {
        toast.success("Phone verified!");
        setStep(3);
        setErrors({});
      } else {
        setErrors({ otp: "Invalid or expired OTP. Please try again." });
      }
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
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
        phone.trim(),
        hashed,
        backendRole,
      );
      if (result.__kind__ === "ok") {
        const userId = result.ok;
        const session: UserSession = {
          userId,
          role,
          name: name.trim(),
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
        saveSession(session);
        toast.success(`Account created! Welcome, ${name.trim()}`);
        onRegisterSuccess(session);
      } else if (result.__kind__ === "err") {
        toast.error(result.err || "Registration failed");
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = ["Phone", "Verify", "Details"];

  // Derived: is the current phone input valid?
  const isPhoneValid =
    phone.trim().startsWith("+") &&
    phone.trim().length >= 10 &&
    /^\+\d{8,15}$/.test(phone.trim());

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm">
        {/* Back */}
        <div className="mb-4">
          <button
            type="button"
            onClick={
              step === 1 ? onBack : () => setStep((s) => (s - 1) as Step)
            }
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign up with phone verification
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {stepLabels.map((label, i) => {
            const s = (i + 1) as Step;
            const done = step > s;
            const active = step === s;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done
                        ? "bg-green-500 text-white"
                        : active
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-8 h-0.5 mb-4 ${
                      step > s ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Phone */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Phone Number</Label>
              <p className="text-xs text-muted-foreground">
                Use international format, e.g. +91XXXXXXXXXX
              </p>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="register.phone.input"
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors({});
                  }}
                  className="pl-10 rounded-xl h-12"
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Phone preview — shown only when number looks valid */}
            {isPhoneValid && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20"
              >
                <MessageSquare className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <p className="text-xs text-primary">
                  OTP will be generated for:{" "}
                  <span className="font-semibold">{phone.trim()}</span>
                </p>
              </motion.div>
            )}

            <Button
              data-ocid="register.send_otp.button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="w-full rounded-xl h-12 text-base font-semibold"
            >
              {sendingOtp ? "Generating..." : "Send OTP"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-primary font-medium hover:underline"
              >
                Login
              </button>
            </p>
          </motion.div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <p className="text-sm font-semibold text-foreground text-center">
              Step 2: Verify OTP
            </p>

            {/* TEST MODE OTP display */}
            {displayedOtp && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 text-center my-3">
                <p className="text-xs text-yellow-700 font-medium mb-1">
                  TEST MODE — Your OTP
                </p>
                <p className="text-3xl font-bold tracking-[0.3em] text-yellow-800">
                  {displayedOtp}
                </p>
              </div>
            )}

            {/* Countdown */}
            {countdown > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span>
                  Code expires in{" "}
                  <span className="font-semibold text-foreground">
                    {countdown}s
                  </span>
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Enter OTP</Label>
              <Input
                data-ocid="register.otp.input"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otpInput}
                maxLength={6}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, ""));
                  setErrors({});
                }}
                className="rounded-xl h-12 text-center text-lg font-mono tracking-widest"
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />
              {errors.otp && (
                <p className="text-xs text-destructive">{errors.otp}</p>
              )}
            </div>

            <Button
              data-ocid="register.verify_otp.button"
              onClick={handleVerifyOtp}
              disabled={verifying}
              className="w-full rounded-xl h-12 text-base font-semibold"
            >
              {verifying ? "Verifying..." : "Verify OTP"}
            </Button>

            {/* Resend + change number */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpInput("");
                  setDisplayedOtp("");
                  setErrors({});
                  if (timerRef.current) clearInterval(timerRef.current);
                  setCountdown(0);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Change number
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || sendingOtp}
                className={`font-medium transition-colors ${
                  countdown > 0 || sendingOtp
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-primary hover:underline"
                }`}
              >
                {sendingOtp
                  ? "Sending..."
                  : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend OTP"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Account Details */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="register.name.input"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className="pl-10 rounded-xl h-12"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["user", "worker"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    data-ocid={`register.role_${r}.button`}
                    onClick={() => setRole(r)}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      role === r
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {r === "user" ? "👤 User" : "🔧 Worker"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="register.password.input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  className="pl-10 pr-10 rounded-xl h-12"
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
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="register.confirm_password.input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((p) => ({ ...p, confirmPassword: "" }));
                  }}
                  className="pl-10 rounded-xl h-12"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              data-ocid="register.submit.button"
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full rounded-xl h-12 text-base font-semibold"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
