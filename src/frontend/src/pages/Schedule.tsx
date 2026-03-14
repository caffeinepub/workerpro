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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DayOfWeek,
  useCreateScheduleEntry,
  useDeleteScheduleEntry,
  useGetAllScheduleEntries,
} from "../hooks/useQueries";

const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.monday,
  DayOfWeek.tuesday,
  DayOfWeek.wednesday,
  DayOfWeek.thursday,
  DayOfWeek.friday,
  DayOfWeek.saturday,
  DayOfWeek.sunday,
];

const DAY_NAMES: Record<DayOfWeek, string> = {
  [DayOfWeek.monday]: "Monday",
  [DayOfWeek.tuesday]: "Tuesday",
  [DayOfWeek.wednesday]: "Wednesday",
  [DayOfWeek.thursday]: "Thursday",
  [DayOfWeek.friday]: "Friday",
  [DayOfWeek.saturday]: "Saturday",
  [DayOfWeek.sunday]: "Sunday",
};

function timeToMinutes(time: string): bigint {
  const [h, m] = time.split(":").map(Number);
  return BigInt(h * 60 + m);
}

function minutesToDisplay(minutes: bigint): string {
  const m = Number(minutes);
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const dh = h % 12 || 12;
  return `${dh}:${min.toString().padStart(2, "0")} ${ampm}`;
}

export default function Schedule() {
  const { data: entries, isLoading } = useGetAllScheduleEntries();
  const createEntry = useCreateScheduleEntry();
  const deleteEntry = useDeleteScheduleEntry();

  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDay, setFormDay] = useState<DayOfWeek>(DayOfWeek.monday);
  const [formStart, setFormStart] = useState("09:00");
  const [formEnd, setFormEnd] = useState("17:00");
  const [formNotes, setFormNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    await createEntry.mutateAsync({
      title: formTitle.trim(),
      dayOfWeek: formDay,
      startTime: timeToMinutes(formStart),
      endTime: timeToMinutes(formEnd),
      notes: formNotes.trim(),
    });
    toast.success("Schedule entry added");
    setFormTitle("");
    setFormNotes("");
    setShowForm(false);
  };

  const handleDelete = async (id: bigint) => {
    await deleteEntry.mutateAsync(id);
    toast.success("Entry removed");
  };

  const entriesByDay = DAY_ORDER.reduce(
    (acc, day) => {
      acc[day] = (entries ?? []).filter((e) => e.dayOfWeek === day);
      return acc;
    },
    {} as Record<DayOfWeek, NonNullable<typeof entries>>,
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-700">Schedule</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Weekly work schedule planner
          </p>
        </div>
        <Button
          data-ocid="schedule.add_button"
          onClick={() => setShowForm((v) => !v)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Shift
        </Button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form
              onSubmit={handleSubmit}
              className="glass-card rounded-xl p-5 space-y-4"
            >
              <h2 className="font-display font-600 text-sm uppercase tracking-wider text-muted-foreground">
                New Shift
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Shift title (e.g. Morning Shift)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  autoFocus
                  className="bg-background/60"
                />
                <Select
                  value={formDay}
                  onValueChange={(v) => setFormDay(v as DayOfWeek)}
                >
                  <SelectTrigger className="bg-background/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_ORDER.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DAY_NAMES[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="start-time"
                    className="text-xs text-muted-foreground"
                  >
                    Start Time
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="bg-background/60"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="end-time"
                    className="text-xs text-muted-foreground"
                  >
                    End Time
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="bg-background/60"
                  />
                </div>
              </div>
              <Textarea
                placeholder="Notes (optional)"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="bg-background/60 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="schedule.submit_button"
                  type="submit"
                  disabled={createEntry.isPending || !formTitle.trim()}
                >
                  {createEntry.isPending ? "Saving..." : "Add Shift"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {DAY_ORDER.map((day) => {
            const dayEntries = entriesByDay[day] ?? [];
            const isToday =
              day ===
              ([
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
              ][new Date().getDay()] as DayOfWeek);
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card rounded-xl overflow-hidden ${
                  isToday ? "border border-primary/30" : ""
                }`}
              >
                <div
                  className={`px-5 py-3 flex items-center justify-between ${
                    isToday ? "bg-primary/10" : "bg-card/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-display font-600 ${isToday ? "text-primary" : "text-foreground"}`}
                    >
                      {DAY_NAMES[day]}
                    </h3>
                    {isToday && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-600">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {dayEntries.length} shift
                    {dayEntries.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {dayEntries.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-muted-foreground">
                    No shifts scheduled
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id.toString()}
                        className="px-5 py-3 flex items-center gap-4 group"
                      >
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground w-36 flex-shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-primary font-600">
                            {minutesToDisplay(entry.startTime)}
                          </span>
                          <span>–</span>
                          <span>{minutesToDisplay(entry.endTime)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-600 text-foreground truncate">
                            {entry.title}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground truncate">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                          onClick={() => handleDelete(entry.id)}
                          aria-label="Delete shift"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
