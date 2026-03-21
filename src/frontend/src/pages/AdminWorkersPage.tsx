import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  Eye,
  Info,
  Loader2,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkerStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useGetAllWorkers,
  useSetWorkerStatus,
  useUpdateWorkerStatus,
} from "../hooks/useWorkerQueries";

function OtpLookupPanel() {
  const { actor } = useActor();
  const [lookupPhone, setLookupPhone] = useState("");
  const [otpResult, setOtpResult] = useState<string | null>(null);
  const [isLooking, setIsLooking] = useState(false);

  const handleLookup = async () => {
    const p = lookupPhone.trim();
    if (!p) {
      toast.error("Enter a phone number");
      return;
    }
    if (!actor) return;
    setIsLooking(true);
    setOtpResult(null);
    try {
      const result = await actor.getOtpForPhone(p);
      setOtpResult(result);
    } catch (err) {
      toast.error(
        `Failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsLooking(false);
    }
  };

  const isOtpCode = otpResult !== null && /^\d{6}$/.test(otpResult);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="worker-card p-4 mb-4"
      data-ocid="otp_lookup.panel"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Eye className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-sm">OTP Lookup</h2>
          <p className="text-xs text-muted-foreground">
            Manual OTP sharing when SMS is not configured
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 mb-3">
        <div className="flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Use this panel to retrieve a user's OTP when SMS is not yet
            configured. Look up their phone number and share the code with them
            directly. Once Twilio is configured above, OTPs are sent
            automatically via SMS and this panel is no longer needed.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            data-ocid="otp_lookup.phone_input"
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={lookupPhone}
            onChange={(e) => {
              setLookupPhone(e.target.value);
              setOtpResult(null);
            }}
            className="pl-8 h-9 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
        </div>
        <Button
          data-ocid="otp_lookup.lookup_button"
          size="sm"
          onClick={handleLookup}
          disabled={isLooking}
          className="h-9 px-4 text-sm"
        >
          {isLooking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Lookup"
          )}
        </Button>
      </div>

      {otpResult !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-3 rounded-lg p-3 text-center ${
            isOtpCode
              ? "bg-green-50 border border-green-200"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          {isOtpCode ? (
            <>
              <p className="text-xs text-green-700 font-medium mb-1">
                Current OTP for {lookupPhone}
              </p>
              <p className="text-3xl font-mono font-bold tracking-[0.2em] text-green-800">
                {otpResult}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Share this code with the user. Valid for 60 seconds from when it
                was requested.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{otpResult}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function SmsConfigPanel({
  onConfigured,
}: {
  onConfigured: (configured: boolean) => void;
}) {
  const { actor } = useActor();
  const [isSmsConfigured, setIsSmsConfigured] = useState<boolean | null>(null);
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [fromPhone, setFromPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const checkSmsStatus = async () => {
    try {
      const result = await actor!.isSmsConfigured();
      setIsSmsConfigured(result);
      onConfigured(result);
    } catch {
      setIsSmsConfigured(false);
      onConfigured(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: onConfigured is stable prop callback
  useEffect(() => {
    if (!actor) return;
    actor
      .isSmsConfigured()
      .then((v) => {
        setIsSmsConfigured(v);
        onConfigured(v);
      })
      .catch(() => {
        setIsSmsConfigured(false);
        onConfigured(false);
      });
  }, [actor]);

  const handleSave = async () => {
    if (!accountSid.trim() || !authToken.trim() || !fromPhone.trim()) {
      toast.error("All three fields are required");
      return;
    }
    setIsSaving(true);
    try {
      const base64Credential = btoa(`${accountSid.trim()}:${authToken.trim()}`);
      await actor!.setTwilioConfig(
        accountSid.trim(),
        base64Credential,
        fromPhone.trim(),
      );
      toast.success(
        "SMS configured successfully — OTPs will now be sent via SMS",
      );
      setAuthToken("");
      await checkSmsStatus();
    } catch (err) {
      toast.error(
        `Failed to save SMS config: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="worker-card p-4 mb-4"
      data-ocid="sms_config.panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">
              SMS Configuration
            </h2>
            <p className="text-xs text-muted-foreground">
              Twilio credentials for OTP delivery
            </p>
          </div>
        </div>
        {isSmsConfigured === null ? (
          <Badge className="bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Checking...
          </Badge>
        ) : isSmsConfigured ? (
          <Badge
            data-ocid="sms_config.success_state"
            className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
          </Badge>
        ) : (
          <Badge
            data-ocid="sms_config.error_state"
            className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
          >
            <XCircle className="w-3 h-3 mr-1" /> Not Configured
          </Badge>
        )}
      </div>

      {/* Setup guide toggle */}
      <button
        type="button"
        onClick={() => setShowSetupGuide(!showSetupGuide)}
        className="w-full text-left rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 mb-4"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-blue-800">
            How to get Twilio credentials
          </p>
          <span className="text-blue-500 text-xs">
            {showSetupGuide ? "Hide" : "Show"}
          </span>
        </div>
        {showSetupGuide && (
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li className="text-xs text-blue-700">
              Go to <span className="font-semibold">twilio.com</span> and create
              a free account
            </li>
            <li className="text-xs text-blue-700">
              From the Console Dashboard, copy your{" "}
              <span className="font-semibold">Account SID</span> and{" "}
              <span className="font-semibold">Auth Token</span>
            </li>
            <li className="text-xs text-blue-700">
              Get a free phone number from Twilio (Develop &rarr; Phone Numbers)
            </li>
            <li className="text-xs text-blue-700">
              Enter these 3 values below and click Save
            </li>
            <li className="text-xs text-blue-700">
              Test by registering a new user — OTP will arrive by SMS
            </li>
          </ol>
        )}
      </button>

      {/* Form */}
      <div className="space-y-3">
        <div>
          <Label
            htmlFor="twilio-sid"
            className="text-xs font-medium text-foreground mb-1 block"
          >
            Account SID
          </Label>
          <Input
            id="twilio-sid"
            data-ocid="sms_config.input"
            value={accountSid}
            onChange={(e) => setAccountSid(e.target.value)}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="h-9 text-sm"
          />
        </div>
        <div>
          <Label
            htmlFor="twilio-token"
            className="text-xs font-medium text-foreground mb-1 block"
          >
            Auth Token
          </Label>
          <Input
            id="twilio-token"
            data-ocid="sms_config.textarea"
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="Your Twilio Auth Token"
            className="h-9 text-sm"
          />
        </div>
        <div>
          <Label
            htmlFor="twilio-phone"
            className="text-xs font-medium text-foreground mb-1 block"
          >
            Twilio Phone Number
          </Label>
          <Input
            id="twilio-phone"
            data-ocid="sms_config.search_input"
            value={fromPhone}
            onChange={(e) => setFromPhone(e.target.value)}
            placeholder="+1XXXXXXXXXX"
            className="h-9 text-sm"
          />
        </div>
      </div>

      <Button
        data-ocid="sms_config.save_button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full mt-4 h-9 text-sm"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
          </>
        ) : (
          "Save & Activate SMS"
        )}
      </Button>
    </motion.div>
  );
}

export default function AdminWorkersPage() {
  const { data: workers = [], isLoading } = useGetAllWorkers();
  const setStatus = useSetWorkerStatus();
  const updateStatus = useUpdateWorkerStatus();
  const [smsConfigured, setSmsConfigured] = useState<boolean | null>(null);

  const handleToggle = async (workerId: bigint, active: boolean) => {
    try {
      await updateStatus.mutateAsync({ workerId, active });
      toast.success(`Worker set to ${active ? "Active" : "Inactive"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleBlock = async (workerId: bigint) => {
    try {
      await setStatus.mutateAsync({ workerId, status: WorkerStatus.blocked });
      toast.success("Worker blocked");
    } catch {
      toast.error("Failed to block worker");
    }
  };

  const handleUnblock = async (workerId: bigint) => {
    try {
      await setStatus.mutateAsync({ workerId, status: WorkerStatus.inactive });
      toast.success("Worker unblocked");
    } catch {
      toast.error("Failed to unblock worker");
    }
  };

  const getStatusBadge = (status: WorkerStatus) => {
    if (status === WorkerStatus.active)
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          Active
        </Badge>
      );
    if (status === WorkerStatus.blocked)
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          Blocked
        </Badge>
      );
    return (
      <Badge className="bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100">
        Inactive
      </Badge>
    );
  };

  const isPending = setStatus.isPending || updateStatus.isPending;

  return (
    <div className="flex flex-col min-h-full pb-20">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Admin — Workers
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          Manage worker availability and SMS configuration
        </p>
      </div>

      <div className="px-5">
        <SmsConfigPanel onConfigured={setSmsConfigured} />

        {/* Show OTP Lookup panel only when SMS is not configured */}
        {smsConfigured === false && <OtpLookupPanel />}

        {isLoading ? (
          <div
            data-ocid="admin_workers.loading_state"
            className="flex justify-center py-16"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : workers.length === 0 ? (
          <div
            data-ocid="admin_workers.empty_state"
            className="worker-card p-10 text-center"
          >
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No workers registered yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workers.map((worker, idx) => (
              <motion.div
                key={worker.id.toString()}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                data-ocid={`admin_workers.item.${idx + 1}`}
                className="worker-card p-4"
              >
                {/* Header row: avatar + name + status badge */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">
                        {worker.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {worker.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {worker.profession}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(worker.status)}
                </div>

                {/* Controls row */}
                {worker.status === WorkerStatus.blocked ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600 font-medium">
                      Worker is blocked
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`admin_workers.secondary_button.${idx + 1}`}
                      disabled={isPending}
                      onClick={() => handleUnblock(worker.id)}
                      className="text-xs h-7 rounded-lg border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Unblock
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Switch
                        id={`worker-toggle-${worker.id.toString()}`}
                        data-ocid={`admin_workers.toggle.${idx + 1}`}
                        checked={worker.status === WorkerStatus.active}
                        disabled={isPending}
                        onCheckedChange={(checked) =>
                          handleToggle(worker.id, checked)
                        }
                      />
                      <Label
                        htmlFor={`worker-toggle-${worker.id.toString()}`}
                        className={`text-sm font-medium cursor-pointer ${
                          worker.status === WorkerStatus.active
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {worker.status === WorkerStatus.active
                          ? "Active"
                          : "Inactive"}
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`admin_workers.delete_button.${idx + 1}`}
                      disabled={isPending}
                      onClick={() => handleBlock(worker.id)}
                      className="text-xs h-7 rounded-lg border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Block
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
