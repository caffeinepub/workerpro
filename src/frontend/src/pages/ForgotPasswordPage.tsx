import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Phone, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export default function ForgotPasswordPage({
  onBack,
}: ForgotPasswordPageProps) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!emailOrPhone.trim()) {
      setError("Email or phone number is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 py-8">
      {/* Back Button */}
      <div className="w-full max-w-sm mx-auto mb-4">
        <button
          type="button"
          data-ocid="forgot_password.back.button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    Reset Password
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1 text-center">
                    Enter your registered email or phone
                  </p>
                </div>

                {/* Form */}
                <div className="worker-card p-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-input">Email or Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="forgot-input"
                        data-ocid="forgot_password.input"
                        type="text"
                        placeholder="email@example.com or 9876543210"
                        value={emailOrPhone}
                        onChange={(e) => {
                          setEmailOrPhone(e.target.value);
                          if (error) setError("");
                        }}
                        className="pl-10 rounded-xl"
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      />
                    </div>
                    {error && (
                      <p
                        data-ocid="forgot_password.error_state"
                        className="text-xs text-destructive"
                      >
                        {error}
                      </p>
                    )}
                  </div>

                  <Button
                    data-ocid="forgot_password.submit_button"
                    onClick={handleSubmit}
                    className="w-full rounded-xl h-11"
                  >
                    Send Reset Request
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="worker-card p-8 flex flex-col items-center text-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Request Sent
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    If this account exists, please contact support or your
                    administrator to reset your password.
                  </p>
                </div>
                <Button
                  variant="outline"
                  data-ocid="forgot_password.back_to_login.button"
                  onClick={onBack}
                  className="rounded-xl w-full h-11 mt-2"
                >
                  Back to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
