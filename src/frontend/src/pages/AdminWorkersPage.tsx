import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ShieldCheck, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { WorkerStatus } from "../backend.d";
import {
  useGetAllWorkers,
  useSetWorkerStatus,
  useUpdateWorkerStatus,
} from "../hooks/useWorkerQueries";

export default function AdminWorkersPage() {
  const { data: workers = [], isLoading } = useGetAllWorkers();
  const setStatus = useSetWorkerStatus();
  const updateStatus = useUpdateWorkerStatus();

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
          Manage worker availability and access
        </p>
      </div>

      <div className="px-5">
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
