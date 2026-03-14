import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Loader2, Trash2 } from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateWorkEntry,
  useDeleteWorkEntry,
  useGetAllWorkEntries,
} from "../hooks/useQueries";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

function minutesToTimeStr(mins: bigint): string {
  const m = Number(mins);
  const h = Math.floor(m / 60)
    .toString()
    .padStart(2, "0");
  const min = (m % 60).toString().padStart(2, "0");
  return `${h}:${min}`;
}

export default function DailyWork() {
  const { data: entries, isLoading } = useGetAllWorkEntries();
  const createEntry = useCreateWorkEntry();
  const deleteEntry = useDeleteWorkEntry();

  const [workerName, setWorkerName] = useState("");
  const [date, setDate] = useState(todayStr());
  const [workType, setWorkType] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [dailyPayment, setDailyPayment] = useState("");
  const [notes, setNotes] = useState("");

  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const hoursWorked = endMins > startMins ? (endMins - startMins) / 60 : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workerName.trim() || !date || !workType.trim()) {
      toast.error("Please fill in Worker Name, Date, and Work Type.");
      return;
    }
    if (endMins <= startMins) {
      toast.error("End Time must be after Start Time.");
      return;
    }
    try {
      await createEntry.mutateAsync({
        workerName: workerName.trim(),
        date,
        workType: workType.trim(),
        startTime: BigInt(startMins),
        endTime: BigInt(endMins),
        hoursWorked,
        dailyPayment: Number(dailyPayment) || 0,
        notes: notes.trim(),
      });
      toast.success("Work entry saved!");
      setWorkerName("");
      setDate(todayStr());
      setWorkType("");
      setStartTime("09:00");
      setEndTime("17:00");
      setDailyPayment("");
      setNotes("");
    } catch {
      toast.error("Failed to save entry.");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteEntry.mutateAsync(id);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Failed to delete entry.");
    }
  }

  const sortedEntries = [...(entries ?? [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div data-ocid="dailywork.section" className="p-6 md:p-8 max-w-5xl mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={item}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-700 text-foreground">
              Daily Work
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Record and track daily work entries for your team.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div variants={item}>
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display font-600 text-foreground text-lg mb-5">
              New Work Entry
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Worker Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="workerName">Worker Name</Label>
                  <Input
                    id="workerName"
                    data-ocid="dailywork.input"
                    placeholder="e.g. Ramesh"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    data-ocid="dailywork.date.input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Work Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="workType">Work Type</Label>
                  <Input
                    id="workType"
                    data-ocid="dailywork.worktype.input"
                    placeholder="e.g. Painting, Plumbing"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                  />
                </div>

                {/* Daily Payment */}
                <div className="space-y-1.5">
                  <Label htmlFor="dailyPayment">Daily Payment (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-600">
                      ₹
                    </span>
                    <Input
                      id="dailyPayment"
                      type="number"
                      min="0"
                      data-ocid="dailywork.payment.input"
                      placeholder="800"
                      className="pl-7"
                      value={dailyPayment}
                      onChange={(e) => setDailyPayment(e.target.value)}
                    />
                  </div>
                </div>

                {/* Start Time */}
                <div className="space-y-1.5">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    data-ocid="dailywork.starttime.input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                {/* End Time */}
                <div className="space-y-1.5">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    data-ocid="dailywork.endtime.input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>

                {/* Hours Worked (auto) */}
                <div className="space-y-1.5">
                  <Label>Hours Worked (auto-calculated)</Label>
                  <div
                    data-ocid="dailywork.hours.panel"
                    className="flex items-center h-9 px-3 rounded-md border border-input bg-muted/40 text-foreground font-600"
                  >
                    {hoursWorked.toFixed(2)} hrs
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  data-ocid="dailywork.textarea"
                  placeholder="Any additional details..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                data-ocid="dailywork.submit_button"
                disabled={createEntry.isPending}
                className="w-full md:w-auto"
              >
                {createEntry.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {createEntry.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Entries Table */}
        <motion.div variants={item}>
          <h2 className="font-display font-600 text-foreground text-lg mb-3">
            Recent Entries
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            {isLoading ? (
              <div
                data-ocid="dailywork.loading_state"
                className="p-6 space-y-3"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : sortedEntries.length === 0 ? (
              <div
                data-ocid="dailywork.empty_state"
                className="p-10 text-center text-muted-foreground"
              >
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-600">No entries yet</p>
                <p className="text-sm mt-1">
                  Save your first work entry above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="dailywork.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Worker</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Work Type</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEntries.map((entry, idx) => (
                      <TableRow
                        key={entry.id.toString()}
                        data-ocid={`dailywork.item.${idx + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-600">
                          {entry.workerName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDateDisplay(entry.date)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-600 bg-primary/10 text-primary border border-primary/20">
                            {entry.workType}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {minutesToTimeStr(entry.startTime)} –{" "}
                          {minutesToTimeStr(entry.endTime)}
                        </TableCell>
                        <TableCell className="font-600">
                          {entry.hoursWorked.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-600 text-primary">
                          ₹{entry.dailyPayment.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                          {entry.notes || "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-ocid={`dailywork.delete_button.${idx + 1}`}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleteEntry.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
