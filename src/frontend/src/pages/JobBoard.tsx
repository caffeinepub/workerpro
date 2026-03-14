import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  PlusCircle,
  TrendingUp,
  User,
  UserCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  JobStatus,
  useAssignJobPosting,
  useCreateJobPosting,
  useGetAllJobPostings,
  useGetAvailableJobPostings,
} from "../hooks/useJobQueries";
import type { JobPosting } from "../hooks/useJobQueries";
import { useCreateNotification } from "../hooks/useNotificationQueries";
import { showBrowserNotification } from "../lib/browserNotifications";
import { getWorkers } from "./Workers";

function timeStringToMinutes(t: string): bigint {
  const [h, m] = t.split(":").map(Number);
  return BigInt((h || 0) * 60 + (m || 0));
}

function minutesToTime(minutes: bigint): string {
  const m = Number(minutes);
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${min.toString().padStart(2, "0")} ${ampm}`;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const EXTRAS_KEY = "workerpro_job_extras";

interface JobExtra {
  contactNumber: string;
  contactName: string;
  workerPhone: string;
  workerAddress: string;
  workerSkill: string;
  workerId: string;
  completionStatus: "assigned" | "completed";
}

export function getExtras(): Record<string, JobExtra> {
  try {
    const raw = localStorage.getItem(EXTRAS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveExtra(jobId: string, extra: Partial<JobExtra>) {
  const all = getExtras();
  all[jobId] = {
    ...{
      contactNumber: "",
      contactName: "",
      workerPhone: "",
      workerAddress: "",
      workerSkill: "",
      workerId: "",
      completionStatus: "assigned",
    },
    ...all[jobId],
    ...extra,
  };
  localStorage.setItem(EXTRAS_KEY, JSON.stringify(all));
}

// --- Post Work Tab ---
function PostWorkTab() {
  const create = useCreateJobPosting();
  const createNotif = useCreateNotification();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    paymentAmount: "",
    address: "",
    contactName: "",
    contactNumber: "",
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const setDate = (date: string) => setForm((prev) => ({ ...prev, date }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      !form.address
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const jobId = await create.mutateAsync({
        title: form.title,
        description: form.description,
        date: form.date,
        startTime: timeStringToMinutes(form.startTime),
        endTime: timeStringToMinutes(form.endTime),
        paymentAmount: Number.parseFloat(form.paymentAmount) || 0,
        address: form.address,
      });
      saveExtra(jobId.toString(), {
        contactNumber: form.contactNumber,
        contactName: form.contactName,
        workerPhone: "",
        workerAddress: "",
        workerSkill: "",
        workerId: "",
        completionStatus: "assigned",
      });
      toast.success("Job posted successfully!");
      createNotif.mutate({
        title: "New Job Available",
        message: `New Job Available: ${form.title} on ${form.date} at ${form.address}`,
        notificationType: "new_job",
        jobId: jobId,
      });
      showBrowserNotification(
        "New Job Available",
        `${form.title} on ${form.date} at ${form.address}`,
      );
      setForm({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        paymentAmount: "",
        address: "",
        contactName: "",
        contactNumber: "",
      });
    } catch {
      toast.error("Failed to post job");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Post a New Job
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-500">Work Title *</Label>
              <Input
                data-ocid="postwork.title.input"
                placeholder="e.g. Painting, Plumbing, Construction"
                value={form.title}
                onChange={set("title")}
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-500">Work Description</Label>
              <Textarea
                data-ocid="postwork.description.textarea"
                placeholder="Describe the work in detail..."
                value={form.description}
                onChange={set("description")}
                className="bg-input/50 min-h-[80px] resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-3">
                <Label className="text-sm font-500">Date *</Label>
                {/* Quick date buttons */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="postwork.date_today.button"
                    onClick={() => setDate(todayStr())}
                    className="text-xs h-7"
                  >
                    Today
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="postwork.date_tomorrow.button"
                    onClick={() => setDate(dateOffset(1))}
                    className="text-xs h-7"
                  >
                    Tomorrow
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="postwork.date_next3.button"
                    onClick={() => setDate(dateOffset(3))}
                    className="text-xs h-7"
                  >
                    Next 3 Days
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="postwork.date_nextweek.button"
                    onClick={() => setDate(dateOffset(7))}
                    className="text-xs h-7"
                  >
                    Next Week
                  </Button>
                </div>
                <Input
                  data-ocid="postwork.date.input"
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                  className="bg-input/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-500">Start Time *</Label>
                <Input
                  data-ocid="postwork.starttime.input"
                  type="time"
                  value={form.startTime}
                  onChange={set("startTime")}
                  className="bg-input/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-500">End Time *</Label>
                <Input
                  data-ocid="postwork.endtime.input"
                  type="time"
                  value={form.endTime}
                  onChange={set("endTime")}
                  className="bg-input/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-500">Payment Amount (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-ocid="postwork.payment.input"
                    type="number"
                    placeholder="0"
                    value={form.paymentAmount}
                    onChange={set("paymentAmount")}
                    className="bg-input/50 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-500">Contact Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-ocid="postwork.contact_name.input"
                    placeholder="Your name"
                    value={form.contactName}
                    onChange={set("contactName")}
                    className="bg-input/50 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm font-500">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-ocid="postwork.contact.input"
                    placeholder="9876543210"
                    value={form.contactNumber}
                    onChange={set("contactNumber")}
                    className="bg-input/50 pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-500">Address / Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="postwork.address.input"
                  placeholder="Full address or location"
                  value={form.address}
                  onChange={set("address")}
                  className="bg-input/50 pl-10"
                />
              </div>
            </div>
            <Button
              data-ocid="postwork.submit_button"
              type="submit"
              className="w-full"
              disabled={create.isPending}
            >
              {create.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4 mr-2" />
              )}
              {create.isPending ? "Posting..." : "Post Work"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

type AvailableFilter = "all" | "today" | "upcoming";

// --- Available Work Tab ---
function AvailableWorkTab() {
  const { data: jobs, isLoading } = useGetAvailableJobPostings();
  const assign = useAssignJobPosting();
  const createNotif = useCreateNotification();
  const [filter, setFilter] = useState<AvailableFilter>("all");
  const [selectedJob, setSelectedJob] = useState<{
    id: bigint;
    title: string;
  } | null>(null);
  const [viewJob, setViewJob] = useState<JobPosting | null>(null);
  const [workerName, setWorkerName] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [workerInput, setWorkerInput] = useState("");
  const workers = getWorkers();

  const today = todayStr();

  const filteredJobs = useMemo(() => {
    const sorted = [...(jobs || [])].sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
    );
    if (filter === "today") return sorted.filter((j) => j.date === today);
    if (filter === "upcoming") return sorted.filter((j) => j.date > today);
    return sorted;
  }, [jobs, filter, today]);

  const handleInterested = (job: JobPosting) => {
    setSelectedJob({ id: job.id, title: job.title });
    setWorkerName("");
    setSelectedWorkerId("");
    setWorkerInput("");
  };

  const selectedWorkerObj = workers.find((w) => w.id === selectedWorkerId);

  const handleConfirm = async () => {
    if (!selectedJob) return;
    const finalName = workerName || workerInput.trim();
    if (!finalName) {
      toast.error("Please enter or select a worker name");
      return;
    }
    try {
      await assign.mutateAsync({ id: selectedJob.id, workerName: finalName });
      saveExtra(selectedJob.id.toString(), {
        completionStatus: "assigned",
        workerPhone: selectedWorkerObj?.phone || "",
        workerAddress: selectedWorkerObj?.address || "",
        workerSkill: selectedWorkerObj?.skill || "",
        workerId: selectedWorkerId || "",
      });
      toast.success(`Job assigned to ${finalName}!`);
      createNotif.mutate({
        title: "Job Assigned",
        message: `You have been assigned a job: ${selectedJob.title}. Check your Assigned Work section.`,
        notificationType: "job_assigned",
        jobId: selectedJob.id,
      });
      createNotif.mutate({
        title: "Job Accepted",
        message: `A worker has accepted your job: ${selectedJob.title}`,
        notificationType: "job_accepted",
        jobId: selectedJob.id,
      });
      showBrowserNotification(
        "Job Assigned",
        `${finalName} accepted: ${selectedJob.title}`,
      );
      setSelectedJob(null);
    } catch {
      toast.error("Failed to assign job");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            data-ocid="available.loading_state"
            className="glass-card rounded-xl h-48 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          data-ocid="available.filter.all.tab"
          onClick={() => setFilter("all")}
        >
          All Jobs
        </Button>
        <Button
          variant={filter === "today" ? "default" : "outline"}
          size="sm"
          data-ocid="available.filter.today.tab"
          onClick={() => setFilter("today")}
        >
          Today
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          size="sm"
          data-ocid="available.filter.upcoming.tab"
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </Button>
      </div>

      {filteredJobs.length === 0 ? (
        <div
          data-ocid="available.empty_state"
          className="glass-card rounded-xl p-12 text-center"
        >
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-500">
            No jobs found for this filter
          </p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Try "All Jobs" or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job, idx) => (
            <motion.div
              key={job.id.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              data-ocid={`available.job.item.${idx + 1}`}
            >
              <Card className="glass-card border-border h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-display text-base leading-tight">
                      {job.title}
                    </CardTitle>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs shrink-0">
                      Available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  {job.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {job.description}
                    </p>
                  )}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      <span>{job.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {minutesToTime(job.startTime)} –{" "}
                        {minutesToTime(job.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-600">
                      <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        &#8377;{job.paymentAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{job.address}</span>
                    </div>
                    {/* Phone numbers intentionally hidden from public listings (security) */}
                  </div>
                  <div className="flex gap-2 mt-auto pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-ocid={`available.job.view_details.button.${idx + 1}`}
                      onClick={() => setViewJob(job)}
                      className="flex-1 text-xs"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      data-ocid={`available.job.interested.button.${idx + 1}`}
                      onClick={() => handleInterested(job)}
                      className="flex-1 text-xs"
                    >
                      I&#39;m Interested
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog
        open={!!viewJob}
        onOpenChange={(o) => {
          if (!o) setViewJob(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{viewJob?.title}</DialogTitle>
            <DialogDescription>Full job details</DialogDescription>
          </DialogHeader>
          {viewJob && (
            <div className="space-y-3 text-sm">
              {viewJob.description && (
                <p className="text-foreground">{viewJob.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card rounded-lg p-3">
                  <p className="text-muted-foreground text-xs mb-1">Date</p>
                  <p className="font-600">{viewJob.date}</p>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <p className="text-muted-foreground text-xs mb-1">Time</p>
                  <p className="font-600">
                    {minutesToTime(viewJob.startTime)} &#8211;{" "}
                    {minutesToTime(viewJob.endTime)}
                  </p>
                </div>
                <div className="glass-card rounded-lg p-3 col-span-2">
                  <p className="text-muted-foreground text-xs mb-1">Payment</p>
                  <p className="font-600 text-primary">
                    &#8377;{viewJob.paymentAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="glass-card rounded-lg p-3">
                <p className="text-muted-foreground text-xs mb-1">Address</p>
                <p className="font-600">{viewJob.address}</p>
              </div>
              {/* Contact details hidden from public view — shown only after assignment */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewJob(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewJob(null);
                if (viewJob) handleInterested(viewJob);
              }}
            >
              I&#39;m Interested
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!selectedJob}
        onOpenChange={(o) => {
          if (!o) setSelectedJob(null);
        }}
      >
        <DialogContent
          data-ocid="interested.confirm.dialog"
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Confirm Job Interest
            </DialogTitle>
            <DialogDescription>
              You are about to accept:{" "}
              <span className="font-600 text-foreground">
                {selectedJob?.title}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to take this work? This will assign the job
              to you and remove it from the available list.
            </p>
            <div className="space-y-2">
              <Label className="text-sm font-500">Your Name *</Label>
              {workers.length > 0 && (
                <Select
                  onValueChange={(v) => {
                    if (v === "__other__") {
                      setWorkerName("");
                      setSelectedWorkerId("");
                    } else {
                      const found = workers.find((w) => w.id === v);
                      setWorkerName(found?.name || "");
                      setSelectedWorkerId(v);
                      setWorkerInput("");
                    }
                  }}
                >
                  <SelectTrigger className="bg-input/50">
                    <SelectValue placeholder="Select a registered worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                        {w.skill ? ` – ${w.skill}` : ""}
                      </SelectItem>
                    ))}
                    <SelectItem value="__other__">
                      Other (type below)
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              {selectedWorkerObj && (
                <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedWorkerObj.phone}</span>
                  </div>
                  {selectedWorkerObj.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedWorkerObj.address}</span>
                    </div>
                  )}
                  {selectedWorkerObj.skill && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{selectedWorkerObj.skill}</span>
                    </div>
                  )}
                </div>
              )}
              {(workers.length === 0 || workerName === "") && (
                <Input
                  data-ocid="interested.worker_name.input"
                  placeholder="Enter your name"
                  value={workerInput}
                  onChange={(e) => setWorkerInput(e.target.value)}
                  className="bg-input/50"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="interested.cancel_button"
              onClick={() => setSelectedJob(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="interested.confirm_button"
              onClick={handleConfirm}
              disabled={assign.isPending}
            >
              {assign.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {assign.isPending ? "Assigning..." : "Yes, Take This Work"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type AssignedFilter = "all" | "today" | "upcoming" | "completed";

// --- Assigned Work Tab ---
function AssignedWorkTab() {
  const { data: jobs, isLoading } = useGetAllJobPostings();
  const createNotif = useCreateNotification();
  const [extras, setExtras] = useState<Record<string, JobExtra>>(() =>
    getExtras(),
  );
  const [filter, setFilter] = useState<AssignedFilter>("all");

  const today = todayStr();

  const assignedJobs = useMemo(
    () => (jobs || []).filter((j) => j.status === JobStatus.taken),
    [jobs],
  );

  const filteredAssigned = useMemo(() => {
    if (filter === "today")
      return assignedJobs.filter(
        (j) =>
          j.date === today &&
          extras[j.id.toString()]?.completionStatus !== "completed",
      );
    if (filter === "upcoming")
      return assignedJobs.filter(
        (j) =>
          j.date > today &&
          extras[j.id.toString()]?.completionStatus !== "completed",
      );
    if (filter === "completed")
      return assignedJobs.filter(
        (j) => extras[j.id.toString()]?.completionStatus === "completed",
      );
    return assignedJobs;
  }, [assignedJobs, filter, today, extras]);

  const handleComplete = (jobId: string) => {
    saveExtra(jobId, { completionStatus: "completed" });
    setExtras(getExtras());
    toast.success("Job marked as completed!");
    const job = jobs?.find((j) => j.id.toString() === jobId);
    createNotif.mutate({
      title: "Job Completed",
      message: `Job completed successfully: ${job?.title || "Job"}`,
      notificationType: "job_completed",
      jobId: BigInt(jobId),
    });
    showBrowserNotification(
      "Job Completed",
      `Completed: ${job?.title || "Job"}`,
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            data-ocid="assigned.loading_state"
            className="glass-card rounded-xl h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          data-ocid="assigned.filter.all.tab"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "today" ? "default" : "outline"}
          size="sm"
          data-ocid="assigned.filter.today.tab"
          onClick={() => setFilter("today")}
        >
          Today
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          size="sm"
          data-ocid="assigned.filter.upcoming.tab"
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          data-ocid="assigned.filter.completed.tab"
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
      </div>

      {filteredAssigned.length === 0 ? (
        <div
          data-ocid="assigned.empty_state"
          className="glass-card rounded-xl p-12 text-center"
        >
          <ClipboardCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-500">No jobs found</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            {filter === "all"
              ? "Jobs accepted by workers will appear here"
              : "No jobs match this filter"}
          </p>
        </div>
      ) : (
        filteredAssigned.map((job, idx) => {
          const extra = extras[job.id.toString()];
          const isCompleted = extra?.completionStatus === "completed";
          return (
            <motion.div
              key={job.id.toString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              data-ocid={`assigned.job.item.${idx + 1}`}
            >
              <Card className="glass-card border-border">
                <CardContent className="p-5 space-y-4">
                  {/* Header: title + status badge */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-600 text-foreground text-base leading-tight">
                      {job.title}
                    </h3>
                    <Badge
                      className={
                        isCompleted
                          ? "bg-green-500/20 text-green-400 border-green-500/30 shrink-0"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shrink-0"
                      }
                    >
                      {isCompleted ? "Completed" : "Assigned"}
                    </Badge>
                  </div>

                  {/* Worker Details (Contractor View) */}
                  {(job.assignedWorkerName || extra?.workerPhone) && (
                    <>
                      <Separator className="opacity-40" />
                      <div className="space-y-2">
                        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" />
                          Worker Details
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {job.assignedWorkerName && (
                            <div className="flex items-center gap-2 text-foreground">
                              <User className="w-3.5 h-3.5 shrink-0 text-primary" />
                              <span className="font-500">
                                {job.assignedWorkerName}
                              </span>
                            </div>
                          )}
                          {extra?.workerSkill && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Briefcase className="w-3.5 h-3.5 shrink-0" />
                              <span>{extra.workerSkill}</span>
                            </div>
                          )}
                          {extra?.workerPhone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{extra.workerPhone}</span>
                            </div>
                          )}
                          {extra?.workerAddress && (
                            <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{extra.workerAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Job Details */}
                  <Separator className="opacity-40" />
                  <div className="space-y-2">
                    <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      Job Details
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                        <span>{job.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {minutesToTime(job.startTime)} &#8211;{" "}
                          {minutesToTime(job.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-600">
                        <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          &#8377;{job.paymentAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground col-span-2 sm:col-span-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-muted-foreground/60 block">
                            Work Location
                          </span>
                          <span>{job.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employer Contact (Worker View) */}
                  {extra?.contactNumber && (
                    <>
                      <Separator className="opacity-40" />
                      <div className="space-y-2">
                        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          Employer Contact
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {extra.contactName && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="w-3.5 h-3.5 shrink-0" />
                              <span>{extra.contactName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{extra.contactNumber}</span>
                          </div>
                          <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs text-muted-foreground/60 block">
                                Work Address
                              </span>
                              <span>{job.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <Separator className="opacity-40" />
                  <div className="flex flex-wrap gap-2">
                    {extra?.workerPhone && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white border-0"
                        data-ocid={`assigned.job.call_worker.button.${idx + 1}`}
                        asChild
                      >
                        <a href={`tel:${extra.workerPhone}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call Worker
                        </a>
                      </Button>
                    )}
                    {extra?.contactNumber && (
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`assigned.job.call_employer.button.${idx + 1}`}
                        asChild
                      >
                        <a href={`tel:${extra.contactNumber}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call Employer
                        </a>
                      </Button>
                    )}
                    {!isCompleted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`assigned.job.complete.button.${idx + 1}`}
                        onClick={() => handleComplete(job.id.toString())}
                        className="border-green-500/40 text-green-400 hover:bg-green-500/10 ml-auto"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-400 text-sm ml-auto">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Done</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

// --- Dashboard Tab ---
function DashboardTab() {
  const { data: allJobs, isLoading } = useGetAllJobPostings();
  const extras = getExtras();

  const stats = useMemo(() => {
    const total = allJobs?.length ?? 0;
    const taken =
      allJobs?.filter((j) => j.status === JobStatus.taken).length ?? 0;
    const completed = Object.values(extras).filter(
      (e) => e.completionStatus === "completed",
    ).length;
    return { total, taken, completed };
  }, [allJobs, extras]);

  const statsConfig = [
    {
      label: "Total Jobs Posted",
      value: stats.total,
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Jobs Taken",
      value: stats.taken,
      icon: TrendingUp,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Completed Jobs",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsConfig.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="glass-card border-border stat-glow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}
                  >
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">
                      {s.label}
                    </p>
                    {isLoading ? (
                      <div className="h-7 w-12 bg-muted animate-pulse rounded" />
                    ) : (
                      <p
                        className={`font-display text-2xl font-700 ${s.color}`}
                      >
                        {s.value}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="font-display font-600 text-foreground mb-3">
          Recent Job Postings
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card rounded-xl h-14 animate-pulse"
              />
            ))}
          </div>
        ) : !allJobs || allJobs.length === 0 ? (
          <div
            data-ocid="dashboard.empty_state"
            className="glass-card rounded-xl p-8 text-center text-muted-foreground"
          >
            No jobs posted yet. Go to Post Work to create the first one.
          </div>
        ) : (
          <div className="space-y-2">
            {[...allJobs]
              .sort((a, b) => Number(b.createdAt - a.createdAt))
              .slice(0, 5)
              .map((job) => {
                const isCompleted =
                  extras[job.id.toString()]?.completionStatus === "completed";
                const statusClass =
                  job.status === "available"
                    ? "bg-primary/20 text-primary border-primary/30"
                    : isCompleted
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
                const statusLabel =
                  job.status === "available"
                    ? "Available"
                    : isCompleted
                      ? "Completed"
                      : "Taken";
                return (
                  <div
                    key={job.id.toString()}
                    className="glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-600 text-foreground truncate">
                        {job.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {job.date} &#183; {job.address}
                      </p>
                    </div>
                    <Badge className={statusClass}>{statusLabel}</Badge>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main JobBoard ---
export default function JobBoard() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-700 text-foreground">
            Job Booking System
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          Post jobs, browse available work, and track assignments
        </p>
      </motion.div>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger data-ocid="jobboard.dashboard.tab" value="dashboard">
            Dashboard
          </TabsTrigger>
          <TabsTrigger data-ocid="jobboard.postwork.tab" value="postwork">
            Post Work
          </TabsTrigger>
          <TabsTrigger data-ocid="jobboard.available.tab" value="available">
            Available
          </TabsTrigger>
          <TabsTrigger data-ocid="jobboard.assigned.tab" value="assigned">
            Assigned
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="postwork" className="mt-6">
          <PostWorkTab />
        </TabsContent>
        <TabsContent value="available" className="mt-6">
          <AvailableWorkTab />
        </TabsContent>
        <TabsContent value="assigned" className="mt-6">
          <AssignedWorkTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
