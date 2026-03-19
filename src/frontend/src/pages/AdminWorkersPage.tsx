import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { WorkerStatus } from "../backend.d";
import {
  useGetAllWorkers,
  useSetWorkerStatus,
} from "../hooks/useWorkerQueries";

export default function AdminWorkersPage() {
  const { data: workers = [], isLoading } = useGetAllWorkers();
  const setStatus = useSetWorkerStatus();

  const handleSetStatus = async (workerId: bigint, status: WorkerStatus) => {
    try {
      await setStatus.mutateAsync({ workerId, status });
      const label =
        status === WorkerStatus.active
          ? "Active"
          : status === WorkerStatus.inactive
            ? "Inactive"
            : "Blocked";
      toast.success(`Worker set to ${label}`);
    } catch {
      toast.error("Failed to update status");
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
                <div className="flex items-start justify-between gap-3 mb-3">
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

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid={`admin_workers.set_active.button.${idx + 1}`}
                    disabled={
                      worker.status === WorkerStatus.active ||
                      setStatus.isPending
                    }
                    onClick={() =>
                      handleSetStatus(worker.id, WorkerStatus.active)
                    }
                    className="text-xs h-7 rounded-lg border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-40"
                  >
                    Set Active
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid={`admin_workers.set_inactive.button.${idx + 1}`}
                    disabled={
                      worker.status === WorkerStatus.inactive ||
                      setStatus.isPending
                    }
                    onClick={() =>
                      handleSetStatus(worker.id, WorkerStatus.inactive)
                    }
                    className="text-xs h-7 rounded-lg border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Set Inactive
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid={`admin_workers.block.button.${idx + 1}`}
                    disabled={
                      worker.status === WorkerStatus.blocked ||
                      setStatus.isPending
                    }
                    onClick={() =>
                      handleSetStatus(worker.id, WorkerStatus.blocked)
                    }
                    className="text-xs h-7 rounded-lg border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-40"
                  >
                    Block
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
