import { Button } from "@/components/ui/button";
import { User, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface RoleSelectScreenProps {
  onSelectAdmin: () => void;
  onSelectUser: () => void;
  onGoToRegister?: () => void;
}

export default function RoleSelectScreen({
  onSelectAdmin,
  onSelectUser,
  onGoToRegister,
}: RoleSelectScreenProps) {
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const tapResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);

    if (tapResetTimer.current) clearTimeout(tapResetTimer.current);

    if (newCount >= 5) {
      setShowAdminLink(true);
      setLogoTapCount(0);
    } else {
      tapResetTimer.current = setTimeout(() => {
        setLogoTapCount(0);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (tapResetTimer.current) clearTimeout(tapResetTimer.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo — tap 5x to reveal admin */}
        <div className="flex flex-col items-center mb-10">
          <button
            type="button"
            onClick={handleLogoTap}
            data-ocid="role_select.logo.button"
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 select-none active:scale-95 transition-transform cursor-default"
            aria-label="App logo"
          >
            <Zap className="w-8 h-8 text-primary" />
          </button>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Worker Pro
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your local worker marketplace
          </p>
        </div>

        {/* Main Auth Buttons */}
        <div className="space-y-3">
          <Button
            data-ocid="role_select.user.button"
            onClick={onSelectUser}
            className="w-full rounded-xl h-12 text-base font-semibold"
          >
            <User className="w-5 h-5 mr-2" />
            Login
          </Button>

          <Button
            variant="outline"
            data-ocid="role_select.register.button"
            onClick={onGoToRegister}
            className="w-full rounded-xl h-12 text-base font-semibold"
          >
            Create Account
          </Button>
        </div>

        {/* Hidden Admin Link — revealed after 5 logo taps */}
        <AnimatePresence>
          {showAdminLink && (
            <motion.div
              key="admin-link"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3 }}
              className="mt-6 flex justify-center"
            >
              <button
                type="button"
                data-ocid="role_select.admin.button"
                onClick={onSelectAdmin}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2"
              >
                Admin Access
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-10">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
