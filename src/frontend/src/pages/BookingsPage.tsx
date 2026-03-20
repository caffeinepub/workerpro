import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { BookingStatus } from "../backend.d";
import {
  useAcceptBooking,
  useGetBookingsForUser,
  useGetBookingsForWorker,
  useRejectBooking,
} from "../hooks/useBookingQueries";
import type { JobPosting } from "../hooks/useJobQueries";
import {
  JobStatus,
  useGetAllJobPostings,
  useGetAssignedJobPostings,
} from "../hooks/useJobQueries";
import { useGetWorkerByUserId } from "../hooks/useWorkerQueries";
import type { UserSession } from "../hooks/useWorkerQueries";
import { getExtras } from "./JobBoard";

function minutesToTime(minutes: bigint): string {
  const m = Number(minutes);
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${min.toString().padStart(2, "0")} ${ampm}`;
}

function JobBookingCard({
  job,
  index,
  isCompleted,
}: { job: JobPosting; index: number; isCompleted: boolean }) {
  const extras = getExtras();
  const extra = extras[job.id.toString()] || {};
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="worker-card p-4 space-y-3"
      data-ocid={`bookings.item.${index + 1}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate">
            {job.title}
          </h3>
          {extra.category && (
            <span className="skill-badge inline-block mt-1">
              {extra.category}
            </span>
          )}
        </div>
        <Badge
          variant="outline"
          className={`ml-2 flex-shrink-0 text-xs rounded-full ${isCompleted ? "border-accent/40 text-accent bg-accent/10" : "border-primary/40 text-primary bg-primary/10"}`}
        >
          {isCompleted ? "Completed" : "Active"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{job.date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {minutesToTime(job.startTime)} – {minutesToTime(job.endTime)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>₹{job.paymentAmount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{job.address || "N/A"}</span>
        </div>
      </div>
      {job.assignedWorkerName && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs font-medium text-foreground">
            Worker: {job.assignedWorkerName}
          </p>
          {job.assignedWorkerPhone && (
            <a
              href={`tel:${job.assignedWorkerPhone}`}
              data-ocid={`bookings.call_worker.button.${index + 1}`}
              className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Worker
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

function statusBadgeClass(status: BookingStatus) {
  switch (status) {
    case BookingStatus.accepted:
      return "border-green-400 text-green-700 bg-green-50";
    case BookingStatus.rejected:
      return "border-red-400 text-red-700 bg-red-50";
    case BookingStatus.cancelled:
      return "border-gray-400 text-gray-700 bg-gray-50";
    default:
      return "border-yellow-400 text-yellow-700 bg-yellow-50";
  }
}

function UserBookingsTab({ userId }: { userId: bigint }) {
  const { data: bookings = [], isLoading } = useGetBookingsForUser(userId);
  if (isLoading)
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="worker-card p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  if (!bookings.length)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center py-16 text-center"
        data-ocid="bookings.user.empty_state"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">No bookings yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Book a worker from the Home tab
        </p>
      </motion.div>
    );
  return (
    <div className="space-y-3">
      {bookings.map((b, i) => (
        <motion.div
          key={b.id.toString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="worker-card p-4"
          data-ocid={`bookings.user.item.${i + 1}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-sm text-foreground">
                {b.workerName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {b.serviceType}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs rounded-full capitalize ${statusBadgeClass(b.status)}`}
            >
              {b.status}
            </Badge>
          </div>
          {b.note && (
            <p className="text-xs text-muted-foreground mt-1 bg-muted rounded-lg px-3 py-2">
              {b.note}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function WorkerBookingsTab({ workerId }: { workerId: bigint }) {
  const {
    data: bookings = [],
    isLoading,
    refetch,
  } = useGetBookingsForWorker(workerId);
  const acceptMutation = useAcceptBooking();
  const rejectMutation = useRejectBooking();

  const handleAccept = async (id: bigint) => {
    try {
      await acceptMutation.mutateAsync(id);
      toast.success("Booking accepted!");
      refetch();
    } catch {
      toast.error("Failed to accept booking");
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await rejectMutation.mutateAsync(id);
      toast.success("Booking rejected");
      refetch();
    } catch {
      toast.error("Failed to reject booking");
    }
  };

  if (isLoading)
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="worker-card p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  if (!bookings.length)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center py-16 text-center"
        data-ocid="bookings.worker.empty_state"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">No incoming bookings</p>
        <p className="text-sm text-muted-foreground mt-1">
          Booking requests from users will appear here
        </p>
      </motion.div>
    );
  return (
    <div className="space-y-3">
      {bookings.map((b, i) => (
        <motion.div
          key={b.id.toString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="worker-card p-4"
          data-ocid={`bookings.worker.item.${i + 1}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-sm text-foreground">
                {b.serviceType}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                From: User #{b.userId.toString()}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs rounded-full capitalize ${statusBadgeClass(b.status)}`}
            >
              {b.status}
            </Badge>
          </div>
          {b.note && (
            <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mb-3">
              {b.note}
            </p>
          )}
          {b.status === BookingStatus.pending && (
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid={`bookings.accept.button.${i + 1}`}
                onClick={() => handleAccept(b.id)}
                disabled={acceptMutation.isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" />
                Accept
              </button>
              <button
                type="button"
                data-ocid={`bookings.reject.button.${i + 1}`}
                onClick={() => handleReject(b.id)}
                disabled={rejectMutation.isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function WorkerBookingsView({ session }: { session: UserSession }) {
  const { data: workerProfile, isLoading } = useGetWorkerByUserId(
    session.userId,
  );
  if (isLoading)
    return (
      <div className="space-y-3 px-5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  if (!workerProfile)
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          No worker profile found. Ask your admin to set up your profile.
        </p>
      </div>
    );
  return (
    <div className="px-5">
      <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200">
        <p className="text-sm text-green-700 font-medium">
          👷 {workerProfile.profession}
        </p>
        <p className="text-xs text-green-600 mt-0.5">
          Manage your incoming booking requests below
        </p>
      </div>
      <WorkerBookingsTab workerId={workerProfile.id} />
    </div>
  );
}

export default function BookingsPage({
  session,
}: { session: UserSession | null }) {
  const { data: assigned, isLoading: assignedLoading } =
    useGetAssignedJobPostings();
  const { data: allJobs, isLoading: allLoading } = useGetAllJobPostings();

  const completedJobs = (allJobs || []).filter(
    (j) => j.status === JobStatus.completed,
  );

  // Worker role: show incoming bookings
  if (session?.role === "worker") {
    return (
      <div className="flex flex-col min-h-full pb-20">
        <div className="px-5 pt-5 pb-3">
          <h1 className="font-display text-xl font-semibold text-foreground">
            My Bookings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Incoming requests from users
          </p>
        </div>
        <WorkerBookingsView session={session} />
      </div>
    );
  }

  // User role: show their bookings
  if (session?.role === "user") {
    return (
      <div className="flex flex-col min-h-full pb-20">
        <div className="px-5 pt-5 pb-3">
          <h1 className="font-display text-xl font-semibold text-foreground">
            My Bookings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your service booking history
          </p>
        </div>
        <div className="px-5">
          <UserBookingsTab userId={session.userId} />
        </div>
      </div>
    );
  }

  // Admin / no session: show job postings
  return (
    <div className="flex flex-col min-h-full pb-20">
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-display text-xl font-semibold text-foreground">
          My Bookings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your active and completed jobs
        </p>
      </div>
      <div className="px-5 flex-1">
        <Tabs defaultValue="active">
          <TabsList
            className="w-full rounded-xl bg-muted p-1 mb-4"
            data-ocid="bookings.tab"
          >
            <TabsTrigger
              value="active"
              className="flex-1 rounded-lg text-sm"
              data-ocid="bookings.active.tab"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1 rounded-lg text-sm"
              data-ocid="bookings.completed.tab"
            >
              Completed
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-3">
            {assignedLoading ? (
              [1, 2].map((i) => (
                <div key={i} className="worker-card p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            ) : !assigned || assigned.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="bookings.empty_state"
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground">No bookings yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Book a worker from the Home tab to get started
                </p>
              </motion.div>
            ) : (
              assigned.map((job, i) => (
                <JobBookingCard
                  key={job.id.toString()}
                  job={job}
                  index={i}
                  isCompleted={false}
                />
              ))
            )}
          </TabsContent>
          <TabsContent value="completed" className="space-y-3">
            {allLoading ? (
              [1, 2].map((i) => (
                <div key={i} className="worker-card p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            ) : completedJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="bookings.completed.empty_state"
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground">
                  No completed jobs
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Completed jobs will appear here
                </p>
              </motion.div>
            ) : (
              completedJobs.map((job, i) => (
                <JobBookingCard
                  key={job.id.toString()}
                  job={job}
                  index={i}
                  isCompleted={true}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
