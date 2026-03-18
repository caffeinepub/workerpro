import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  CalendarDays,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateJobPosting } from "../hooks/useJobQueries";
import { useCreateNotification } from "../hooks/useNotificationQueries";
import { showBrowserNotification } from "../lib/browserNotifications";
import { getExtras } from "./JobBoard";

function timeStringToMinutes(t: string): bigint {
  const [h, m] = t.split(":").map(Number);
  return BigInt((h || 0) * 60 + (m || 0));
}

const EXTRAS_KEY = "workerpro_job_extras";
function saveExtra(
  jobId: string,
  extra: { contactNumber: string; contactName: string; category: string },
) {
  const all = getExtras();
  const existing = all[jobId] || {
    contactNumber: "",
    contactName: "",
    workerPhone: "",
    workerAddress: "",
    workerSkill: "",
    workerId: "",
    completionStatus: "assigned" as const,
    category: "",
  };
  localStorage.setItem(
    EXTRAS_KEY,
    JSON.stringify({
      ...all,
      [jobId]: {
        ...existing,
        contactNumber: extra.contactNumber,
        contactName: extra.contactName,
        category: extra.category,
      },
    }),
  );
}

const CATEGORIES = [
  "Electrician",
  "Plumber",
  "Cleaner",
  "Carpenter",
  "Painter",
  "Other",
];

interface AddWorkPageProps {
  prefillCategory?: string;
}

export default function AddWorkPage({
  prefillCategory = "",
}: AddWorkPageProps) {
  const create = useCreateJobPosting();
  const createNotif = useCreateNotification();

  const [form, setForm] = useState({
    title: "",
    category: prefillCategory,
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

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

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
        category: form.category,
      });
      createNotif.mutate({
        title: "New Job Available",
        message: `New Job Available: ${form.title} on ${form.date} at ${form.address}`,
        notificationType: "new_job",
        jobId,
      });
      showBrowserNotification(
        "New Job Available",
        `${form.title} on ${form.date} at ${form.address}`,
      );
      toast.success("Job posted successfully!");
      setForm({
        title: "",
        category: "",
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
    <div className="flex flex-col min-h-full pb-20">
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-display text-xl font-semibold text-foreground">
          Post a Job
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Fill in the details to find the right worker
        </p>
      </div>

      <div className="px-5 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              <Briefcase className="w-3.5 h-3.5 inline mr-1.5" />
              Work Title *
            </Label>
            <Input
              data-ocid="addwork.title.input"
              placeholder="e.g. Fix electrical wiring"
              value={form.title}
              onChange={set("title")}
              className="rounded-xl border-border bg-card"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              <Tag className="w-3.5 h-3.5 inline mr-1.5" />
              Category
            </Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger
                data-ocid="addwork.category.select"
                className="rounded-xl border-border bg-card"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              data-ocid="addwork.description.textarea"
              placeholder="Describe the work in detail..."
              value={form.description}
              onChange={set("description")}
              className="rounded-xl border-border bg-card min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              <CalendarDays className="w-3.5 h-3.5 inline mr-1.5" />
              Date *
            </Label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setDate(today)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.date === today
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(tomorrow)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.date === tomorrow
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                Tomorrow
              </button>
            </div>
            <Input
              data-ocid="addwork.date.input"
              type="date"
              value={form.date}
              onChange={set("date")}
              className="rounded-xl border-border bg-card"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                Start Time *
              </Label>
              <Input
                data-ocid="addwork.start_time.input"
                type="time"
                value={form.startTime}
                onChange={set("startTime")}
                className="rounded-xl border-border bg-card"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                End Time *
              </Label>
              <Input
                data-ocid="addwork.end_time.input"
                type="time"
                value={form.endTime}
                onChange={set("endTime")}
                className="rounded-xl border-border bg-card"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              <IndianRupee className="w-3.5 h-3.5 inline mr-1.5" />
              Payment Amount (₹)
            </Label>
            <Input
              data-ocid="addwork.payment.input"
              type="number"
              placeholder="e.g. 500"
              value={form.paymentAmount}
              onChange={set("paymentAmount")}
              className="rounded-xl border-border bg-card"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
              Work Address *
            </Label>
            <Input
              data-ocid="addwork.address.input"
              placeholder="Enter work location"
              value={form.address}
              onChange={set("address")}
              className="rounded-xl border-border bg-card"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Contact Name</Label>
              <Input
                data-ocid="addwork.contact_name.input"
                placeholder="Your name"
                value={form.contactName}
                onChange={set("contactName")}
                className="rounded-xl border-border bg-card"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                Phone
              </Label>
              <Input
                data-ocid="addwork.phone.input"
                type="tel"
                placeholder="9876543210"
                value={form.contactNumber}
                onChange={set("contactNumber")}
                className="rounded-xl border-border bg-card"
              />
            </div>
          </div>

          <Button
            data-ocid="addwork.submit_button"
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-full py-3 bg-primary text-white font-semibold hover:bg-primary/90"
          >
            {create.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Job"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
