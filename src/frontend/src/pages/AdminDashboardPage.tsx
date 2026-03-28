import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserAccount } from "../backend.d";
import { useActor } from "../hooks/useActor";
import type { JobVacancy, RentalWithOwner } from "../hooks/useVacancyQueries";
import type { UserSession } from "../hooks/useWorkerQueries";

interface AdminDashboardPageProps {
  session: UserSession | null;
  onBack: () => void;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="worker-card p-4 flex flex-col gap-1">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-foreground">{String(value)}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function AdminDashboardPage({
  session,
  onBack,
}: AdminDashboardPageProps) {
  const { actor, isFetching } = useActor();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [rentals, setRentals] = useState<RentalWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteJobTarget, setDeleteJobTarget] = useState<JobVacancy | null>(
    null,
  );
  const [deleteRentalTarget, setDeleteRentalTarget] =
    useState<RentalWithOwner | null>(null);
  const [blockTarget, setBlockTarget] = useState<{
    user: UserAccount;
    action: "block" | "unblock";
  } | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [mutating, setMutating] = useState<string | null>(null);

  const isAdmin = session?.role === "admin";

  const loadData = useCallback(async () => {
    if (!actor || isFetching) return;
    setLoading(true);
    try {
      const [usersData, jobsData, rentalsData] = await Promise.all([
        actor.getAllUsers(),
        (actor as any).getAllJobVacancies
          ? actor.getAllJobVacancies()
          : actor.getOpenJobVacancies(),
        (actor as any).getAvailableRentals ? actor.getAvailableRentals() : [],
      ]);
      setUsers(usersData as UserAccount[]);
      setJobs(jobsData as JobVacancy[]);
      setRentals(rentalsData as RentalWithOwner[]);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    if (actor && !isFetching) {
      loadData();
    }
  }, [actor, isFetching, loadData]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5">
        <ShieldCheck className="w-16 h-16 text-destructive mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground">
          Access Denied
        </h2>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          You need admin privileges to access this page.
        </p>
        <Button
          variant="outline"
          className="mt-4 rounded-full"
          onClick={onBack}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const handleDeleteJob = async () => {
    if (!deleteJobTarget || !actor) return;
    setMutating(`job-${deleteJobTarget.id}`);
    try {
      await actor.deleteJobVacancy(
        deleteJobTarget.id,
        deleteJobTarget.postedByUserId,
      );
      setJobs((prev) => prev.filter((j) => j.id !== deleteJobTarget.id));
      toast.success("Job deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete job");
    } finally {
      setMutating(null);
      setDeleteJobTarget(null);
    }
  };

  const handleDeleteRental = async () => {
    if (!deleteRentalTarget || !actor) return;
    setMutating(`rental-${deleteRentalTarget.id}`);
    try {
      await (actor as any).deleteRentalProperty(
        deleteRentalTarget.id,
        deleteRentalTarget.postedByUserId,
      );
      setRentals((prev) => prev.filter((r) => r.id !== deleteRentalTarget.id));
      toast.success("Rental deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete rental");
    } finally {
      setMutating(null);
      setDeleteRentalTarget(null);
    }
  };

  const handleBlockToggle = async () => {
    if (!blockTarget || !actor) return;
    const { user, action } = blockTarget;
    setMutating(`user-${user.id}`);
    try {
      if (action === "block") {
        await (actor as any).blockUser(user.id);
        setBlockedUserIds((prev) => new Set([...prev, String(user.id)]));
        toast.success(`${user.name} has been blocked`);
      } else {
        await (actor as any).unblockUser(user.id);
        setBlockedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(String(user.id));
          return next;
        });
        toast.success(`${user.name} has been unblocked`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${action} user`);
    } finally {
      setMutating(null);
      setBlockTarget(null);
    }
  };

  const handleApproveJob = async (job: JobVacancy) => {
    if (!actor) return;
    setMutating(`approve-job-${job.id}`);
    try {
      await (actor as any).approveJobVacancy(job.id);
      toast.success("Job approved");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve job");
    } finally {
      setMutating(null);
    }
  };

  const handleRejectJob = async (job: JobVacancy) => {
    if (!actor) return;
    setMutating(`reject-job-${job.id}`);
    try {
      await (actor as any).rejectJobVacancy(job.id);
      toast.success("Job rejected");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject job");
    } finally {
      setMutating(null);
    }
  };

  const nonAdminUsers = users.filter((u) => u.role !== ("admin" as any));

  return (
    <div className="flex flex-col min-h-full pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-5 py-3 flex items-center gap-3">
        <button
          type="button"
          data-ocid="admin.back.button"
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <h1 className="font-display text-lg font-bold text-foreground">
            Admin Dashboard
          </h1>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={Users}
            label="Total Users"
            value={loading ? "..." : nonAdminUsers.length}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={Briefcase}
            label="Job Posts"
            value={loading ? "..." : jobs.length}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={Building2}
            label="Rentals"
            value={loading ? "..." : rentals.length}
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList
            className="grid grid-cols-4 w-full rounded-full mb-3"
            data-ocid="admin.tabs.panel"
          >
            <TabsTrigger
              value="users"
              className="rounded-full text-xs"
              data-ocid="admin.users.tab"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="rounded-full text-xs"
              data-ocid="admin.jobs.tab"
            >
              Jobs
            </TabsTrigger>
            <TabsTrigger
              value="rentals"
              className="rounded-full text-xs"
              data-ocid="admin.rentals.tab"
            >
              Rentals
            </TabsTrigger>
            <TabsTrigger
              value="approvals"
              className="rounded-full text-xs"
              data-ocid="admin.approvals.tab"
            >
              Approve
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-2">
            {loading ? (
              <div className="space-y-2" data-ocid="admin.users.loading_state">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="worker-card p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : nonAdminUsers.length === 0 ? (
              <div
                className="text-center py-10"
                data-ocid="admin.users.empty_state"
              >
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No users yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {nonAdminUsers.map((user, i) => {
                  const isBlocked = blockedUserIds.has(String(user.id));
                  const isBusy = mutating === `user-${user.id}`;
                  return (
                    <motion.div
                      key={String(user.id)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="worker-card p-4 flex items-center justify-between gap-3"
                      data-ocid={`admin.users.item.${i + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.emailOrPhone}
                        </p>
                        <div className="flex gap-1.5 mt-1">
                          <Badge className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700 border-0">
                            {String(user.role)}
                          </Badge>
                          {isBlocked && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-700 border-0">
                              Blocked
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isBlocked ? "outline" : "destructive"}
                        className="rounded-full text-xs shrink-0"
                        disabled={isBusy}
                        data-ocid={`admin.users.block_button.${i + 1}`}
                        onClick={() =>
                          setBlockTarget({
                            user,
                            action: isBlocked ? "unblock" : "block",
                          })
                        }
                      >
                        {isBusy ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isBlocked ? (
                          "Unblock"
                        ) : (
                          "Block"
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-2">
            {loading ? (
              <div className="space-y-2" data-ocid="admin.jobs.loading_state">
                {[1, 2].map((i) => (
                  <div key={i} className="worker-card p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div
                className="text-center py-10"
                data-ocid="admin.jobs.empty_state"
              >
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No job posts yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job, i) => (
                  <motion.div
                    key={String(job.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="worker-card p-4 flex items-start justify-between gap-3"
                    data-ocid={`admin.jobs.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.companyName}
                      </p>
                      <div className="flex gap-1.5 mt-1">
                        <Badge className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-700 border-0">
                          {job.category}
                        </Badge>
                        <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-0">
                          {String(job.status)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-full text-xs shrink-0"
                      disabled={mutating === `job-${job.id}`}
                      data-ocid={`admin.jobs.delete_button.${i + 1}`}
                      onClick={() => setDeleteJobTarget(job)}
                    >
                      {mutating === `job-${job.id}` ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals" className="space-y-2">
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="admin.rentals.loading_state"
              >
                {[1, 2].map((i) => (
                  <div key={i} className="worker-card p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : rentals.length === 0 ? (
              <div
                className="text-center py-10"
                data-ocid="admin.rentals.empty_state"
              >
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No rental posts yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {rentals.map((rental, i) => (
                  <motion.div
                    key={String(rental.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="worker-card p-4 flex items-start justify-between gap-3"
                    data-ocid={`admin.rentals.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {rental.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rental.location}
                      </p>
                      <p className="text-xs text-primary font-semibold">
                        ₹{rental.pricePerMonth.toLocaleString("en-IN")}/mo
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-full text-xs shrink-0"
                      disabled={mutating === `rental-${rental.id}`}
                      data-ocid={`admin.rentals.delete_button.${i + 1}`}
                      onClick={() => setDeleteRentalTarget(rental)}
                    >
                      {mutating === `rental-${rental.id}` ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Job Posts
              </p>
              {jobs.length === 0 ? (
                <div
                  className="text-center py-6"
                  data-ocid="admin.approvals.empty_state"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    All caught up!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.map((job, i) => (
                    <motion.div
                      key={String(job.id)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="worker-card p-4"
                      data-ocid={`admin.approvals.job.item.${i + 1}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {job.companyName} · {job.location}
                          </p>
                        </div>
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 rounded-full text-xs bg-green-600 hover:bg-green-700"
                          disabled={!!mutating}
                          data-ocid={`admin.approvals.approve_button.${i + 1}`}
                          onClick={() => handleApproveJob(job)}
                        >
                          {mutating === `approve-job-${job.id}` ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 rounded-full text-xs"
                          disabled={!!mutating}
                          data-ocid={`admin.approvals.reject_button.${i + 1}`}
                          onClick={() => handleRejectJob(job)}
                        >
                          {mutating === `reject-job-${job.id}` ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Job Dialog */}
      <AlertDialog
        open={!!deleteJobTarget}
        onOpenChange={(o) => !o && setDeleteJobTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.delete_job.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Post?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete "{deleteJobTarget?.title ?? ""}"? This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.delete_job.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete_job.confirm_button"
              onClick={handleDeleteJob}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Rental Dialog */}
      <AlertDialog
        open={!!deleteRentalTarget}
        onOpenChange={(o) => !o && setDeleteRentalTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.delete_rental.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rental?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete "{deleteRentalTarget?.title ?? ""}"? This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.delete_rental.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete_rental.confirm_button"
              onClick={handleDeleteRental}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block/Unblock Dialog */}
      <AlertDialog
        open={!!blockTarget}
        onOpenChange={(o) => !o && setBlockTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.block_user.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockTarget?.action === "block" ? "Block" : "Unblock"} User?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget?.action === "block"
                ? `Block ${blockTarget?.user.name}? They will lose access to the platform.`
                : `Unblock ${blockTarget?.user.name}? They will regain access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.block_user.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.block_user.confirm_button"
              onClick={handleBlockToggle}
              className={
                blockTarget?.action === "block"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {blockTarget?.action === "block" ? "Block" : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
