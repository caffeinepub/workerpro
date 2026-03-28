import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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

type LoginTab = "password" | "otp";
type OtpStep = 1 | 2;

const OTP_EXPIRY_SECONDS = 60;

export default function LoginScreen({
  onLoginSuccess,
  onGoToRegister,
  loginMode = "user",
  onBack,
  onForgotPassword,
}: LoginScreenProps) {
  const { actor } = useActor();
  const isAdmin = loginMode === "admin";

  // --- Tab state ---
  const [activeTab, setActiveTab] = useState<LoginTab>("password");

  // --- Password login state ---
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrPhone?: string;
    password?: string;
  }>({});

  // --- OTP login state ---
  const [otpStep, setOtpStep] = useState<OtpStep>(1);
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpPhoneError, setOtpPhoneError] = useState("");
  const [otpCodeError, setOtpCodeError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [displayedLoginOtp, setDisplayedLoginOtp] = useState("");
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(OTP_EXPIRY_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetOtpState = () => {
    setOtpStep(1);
    setOtpPhone("");
    setOtpCode("");
    setOtpPhoneError("");
    setOtpCodeError("");
    setCountdown(0);
    setDisplayedLoginOtp("");
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const handleTabSwitch = (tab: LoginTab) => {
    setActiveTab(tab);
    if (tab === "otp") resetOtpState();
    if (tab === "password") {
      setOtpCode("");
      setOtpCodeError("");
    }
  };

  // --- Password login ---
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

  // --- OTP login ---
  const validatePhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required";
    if (!/^\+\d{8,15}$/.test(phone.trim()))
      return "Use international format: +91XXXXXXXXXX";
    return "";
  };

  const handleSendOtp = async () => {
    const phoneErr = validatePhone(otpPhone);
    if (phoneErr) {
      setOtpPhoneError(phoneErr);
      return;
    }
    if (!actor) {
      toast.error("Connecting to server, please try again");
      return;
    }
    setOtpPhoneError("");
    setIsSendingOtp(true);
    try {
      const result = (await (actor as any).sendLoginOtp(otpPhone.trim())) as
        | { __kind__: "ok"; ok: string }
        | { __kind__: "err"; err: string };
      if (result.__kind__ === "ok") {
        const otpCode = result.ok;
        setDisplayedLoginOtp(otpCode);
        setOtpCode(otpCode);
        toast.success("OTP generated for testing");
        setOtpStep(2);
        startCountdown();
      } else {
        toast.error(result.err || "Failed to send OTP");
      }
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtpCode("");
    setOtpCodeError("");
    setDisplayedLoginOtp("");
    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpCodeError("Enter the 6-digit OTP from your SMS");
      return;
    }
    if (!actor) {
      toast.error("Connecting to server, please try again");
      return;
    }
    setOtpCodeError("");
    setIsVerifyingOtp(true);
    try {
      const result = (await (actor as any).loginWithOtp(
        otpPhone.trim(),
        otpCode.trim(),
      )) as
        | {
            __kind__: "ok";
            ok: { userId: bigint; role: import("../backend.d").UserRole };
          }
        | { __kind__: "err"; err: string };
      if (result.__kind__ === "ok") {
        const { userId, role } = result.ok;
        let roleStr: "admin" | "user" | "worker" = "user";
        if (role === UserRole.admin) roleStr = "admin";
        else if (role === UserRole.worker) roleStr = "worker";

        let name = otpPhone.trim();
        try {
          const userAccount = await actor.getUserById(userId);
          if (userAccount) name = userAccount.name;
        } catch {
          // fallback to phone
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
        toast.error(result.err || "OTP verification failed");
      }
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
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

        {/* Form Card */}
        <div className="worker-card p-6">
          {/* Tab Switcher — only for non-admin */}
          {!isAdmin && (
            <div className="flex bg-muted rounded-xl p-1 mb-5">
              <button
                type="button"
                data-ocid="login.password.tab"
                onClick={() => handleTabSwitch("password")}
                className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${
                  activeTab === "password"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Password
              </button>
              <button
                type="button"
                data-ocid="login.otp.tab"
                onClick={() => handleTabSwitch("otp")}
                className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${
                  activeTab === "otp"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                OTP
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Password Tab ── */}
            {(activeTab === "password" || isAdmin) && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
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
                    isAdmin
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : ""
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
              </motion.div>
            )}

            {/* ── OTP Tab ── */}
            {activeTab === "otp" && !isAdmin && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
              >
                <AnimatePresence mode="wait">
                  {/* Step 1: Enter phone */}
                  {otpStep === 1 && (
                    <motion.div
                      key="otp-step-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="otp-phone">Mobile Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="otp-phone"
                            data-ocid="login.input"
                            type="tel"
                            placeholder="+91XXXXXXXXXX"
                            value={otpPhone}
                            onChange={(e) => {
                              setOtpPhone(e.target.value);
                              setOtpPhoneError("");
                            }}
                            className="pl-10 rounded-xl"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSendOtp()
                            }
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use international format: +91XXXXXXXXXX
                        </p>
                        {otpPhoneError && (
                          <p
                            data-ocid="login.error_state"
                            className="text-xs text-destructive"
                          >
                            {otpPhoneError}
                          </p>
                        )}
                      </div>

                      <Button
                        data-ocid="login.otp.send_button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="w-full rounded-xl h-11"
                      >
                        {isSendingOtp ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Sending OTP...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <KeyRound className="w-4 h-4" />
                            Send OTP
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 2: Enter OTP */}
                  {otpStep === 2 && (
                    <motion.div
                      key="otp-step-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-sm font-semibold text-foreground text-center">
                        Step 2: Verify OTP
                      </p>

                      {/* TEST MODE OTP display */}
                      {displayedLoginOtp && (
                        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 text-center my-3">
                          <p className="text-xs text-yellow-700 font-medium mb-1">
                            TEST MODE — Your OTP
                          </p>
                          <p className="text-3xl font-bold tracking-[0.3em] text-yellow-800">
                            {displayedLoginOtp}
                          </p>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label htmlFor="otp-code">Enter OTP</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="otp-code"
                            data-ocid="login.otp.input"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="6-digit code"
                            value={otpCode}
                            onChange={(e) => {
                              setOtpCode(
                                e.target.value.replace(/\D/g, "").slice(0, 6),
                              );
                              setOtpCodeError("");
                            }}
                            className="pl-10 rounded-xl tracking-widest text-center font-mono text-lg"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleVerifyOtp()
                            }
                          />
                        </div>
                        {otpCodeError && (
                          <p
                            data-ocid="login.error_state"
                            className="text-xs text-destructive"
                          >
                            {otpCodeError}
                          </p>
                        )}
                      </div>

                      {/* Countdown + Resend */}
                      <div className="flex items-center justify-between text-sm">
                        {countdown > 0 ? (
                          <span className="text-muted-foreground">
                            Resend in{" "}
                            <span className="font-semibold text-foreground tabular-nums">
                              {countdown}s
                            </span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            data-ocid="login.otp.resend_button"
                            onClick={handleResendOtp}
                            disabled={isSendingOtp}
                            className="text-primary hover:underline font-medium disabled:opacity-50"
                          >
                            {isSendingOtp ? "Sending..." : "Resend OTP"}
                          </button>
                        )}
                        <button
                          type="button"
                          data-ocid="login.otp.change_number.button"
                          onClick={() => {
                            setOtpStep(1);
                            setOtpCode("");
                            setOtpCodeError("");
                            setCountdown(0);
                            setDisplayedLoginOtp("");
                            if (countdownRef.current)
                              clearInterval(countdownRef.current);
                          }}
                          className="text-muted-foreground hover:text-foreground text-xs underline"
                        >
                          Change number
                        </button>
                      </div>

                      <Button
                        data-ocid="login.otp.verify_button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || otpCode.length !== 6}
                        className="w-full rounded-xl h-11"
                      >
                        {isVerifyingOtp ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          "Verify & Login"
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
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
