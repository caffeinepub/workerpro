import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 pb-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        data-ocid="messages.empty_state"
      >
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-xs text-accent font-bold">0</span>
          </div>
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          No messages yet
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Messages from workers will appear here once you book a service
        </p>
        <div className="mt-6 flex flex-col gap-3 w-full max-w-xs mx-auto">
          {["Booking confirmations", "Worker updates", "Job status alerts"].map(
            (item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
}
