import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  ListTodo,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";
import {
  DayOfWeek,
  useGetAllNotes,
  useGetAllScheduleEntries,
  useGetAllTasks,
  useGetWorkEntriesByDate,
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

function minutesToTime(minutes: bigint): string {
  const m = Number(minutes);
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${min.toString().padStart(2, "0")} ${ampm}`;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const STATS = [
  {
    key: "total",
    label: "Total Tasks",
    icon: ListTodo,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    color: "text-[oklch(0.72_0.18_145)]",
    bg: "bg-[oklch(0.72_0.18_145/0.1)]",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    color: "text-[oklch(0.76_0.16_75)]",
    bg: "bg-[oklch(0.76_0.16_75/0.1)]",
  },
  {
    key: "shifts",
    label: "Today's Shifts",
    icon: CalendarDays,
    color: "text-primary",
    bg: "bg-primary/10",
  },
] as const;

export default function Dashboard() {
  const { data: tasks, isLoading: tasksLoading } = useGetAllTasks();
  const { data: schedule, isLoading: schedLoading } =
    useGetAllScheduleEntries();
  const { data: notes } = useGetAllNotes();

  const todayIso = new Date().toISOString().slice(0, 10);
  const { data: todayWorkEntries, isLoading: workLoading } =
    useGetWorkEntriesByDate(todayIso);

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((t) => t.completed).length ?? 0;
  const pendingTasks = totalTasks - completedTasks;
  const highPriority =
    tasks?.filter((t) => !t.completed && t.priority === "high").length ?? 0;

  const todayDow = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][new Date().getDay()] as DayOfWeek;
  const todayEntries = schedule?.filter((e) => e.dayOfWeek === todayDow) ?? [];

  const completionPct =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statValues: Record<string, number> = {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    shifts: todayEntries.length,
  };

  // Today's work stats
  const workEntries = todayWorkEntries ?? [];
  const totalWorkersToday = new Set(workEntries.map((e) => e.workerName)).size;
  const totalHoursToday = workEntries.reduce((s, e) => s + e.hoursWorked, 0);
  const totalPaymentToday = workEntries.reduce((s, e) => s + e.dailyPayment, 0);

  const WORK_STATS = [
    {
      label: "Total Workers Today",
      value: totalWorkersToday,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      display: String(totalWorkersToday),
    },
    {
      label: "Total Hours Today",
      value: totalHoursToday,
      icon: Clock,
      color: "text-[oklch(0.76_0.16_75)]",
      bg: "bg-[oklch(0.76_0.16_75/0.1)]",
      display: `${totalHoursToday.toFixed(1)} hrs`,
    },
    {
      label: "Total Payment Today",
      value: totalPaymentToday,
      icon: IndianRupee,
      color: "text-[oklch(0.72_0.18_145)]",
      bg: "bg-[oklch(0.72_0.18_145/0.1)]",
      display: `₹${totalPaymentToday.toLocaleString("en-IN")}`,
    },
  ] as const;

  return (
    <div data-ocid="dashboard.section" className="p-6 md:p-8 max-w-5xl mx-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={item}>
          <p className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-widest">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-3xl font-display font-700 text-foreground">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}{" "}
            👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your productivity overview for today.
          </p>
        </motion.div>

        {/* Today's Work Section */}
        <motion.div variants={item}>
          <h2 className="font-display font-600 text-foreground mb-3 flex items-center gap-2">
            Today's Work
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {WORK_STATS.map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-xl p-5 stat-glow flex flex-col gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}
                >
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                {workLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <span className={`text-2xl font-display font-700 ${s.color}`}>
                    {s.display}
                  </span>
                )}
                <span className="text-muted-foreground text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STATS.map((s) => (
            <div
              key={s.key}
              className="glass-card rounded-xl p-5 stat-glow flex flex-col gap-3"
            >
              <div
                className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}
              >
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              {tasksLoading || schedLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className={`text-3xl font-display font-700 ${s.color}`}>
                  {statValues[s.key]}
                </span>
              )}
              <span className="text-muted-foreground text-sm">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Progress + Alerts row */}
        <motion.div variants={item} className="grid md:grid-cols-2 gap-4">
          {/* Completion Progress */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-600 text-foreground">
                Task Completion
              </h2>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-display font-700 text-primary">
                {completionPct}%
              </span>
              <span className="text-muted-foreground text-sm mb-1">
                {completedTasks}/{totalTasks} tasks done
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* High Priority Alert */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-600 text-foreground">
                Attention Needed
              </h2>
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            {highPriority > 0 ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.64_0.22_25/0.15)] flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-[oklch(0.64_0.22_25)]" />
                </div>
                <div>
                  <p className="font-600 text-foreground">
                    {highPriority} high-priority task
                    {highPriority > 1 ? "s" : ""}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Require your immediate attention
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.72_0.18_145/0.15)] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[oklch(0.72_0.18_145)]" />
                </div>
                <div>
                  <p className="font-600 text-foreground">All clear!</p>
                  <p className="text-muted-foreground text-sm">
                    No urgent tasks pending
                  </p>
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-muted-foreground text-sm">
                {notes?.length ?? 0} notes saved
              </p>
            </div>
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div variants={item}>
          <h2 className="font-display font-600 text-foreground mb-3">
            Today's Schedule
            <span className="ml-2 text-muted-foreground font-normal font-body text-sm">
              {DAY_NAMES[todayDow]}
            </span>
          </h2>
          {schedLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : todayEntries.length === 0 ? (
            <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
              No shifts scheduled for today.
            </div>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry) => (
                <div
                  key={entry.id.toString()}
                  className="glass-card rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="flex flex-col items-center justify-center w-16 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">START</span>
                    <span className="font-display text-primary font-600 text-sm">
                      {minutesToTime(entry.startTime)}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex flex-col items-center justify-center w-16 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">END</span>
                    <span className="font-display text-foreground font-600 text-sm">
                      {minutesToTime(entry.endTime)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-foreground truncate">
                      {entry.title}
                    </p>
                    {entry.notes && (
                      <p className="text-muted-foreground text-sm truncate">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Week Overview */}
        <motion.div variants={item}>
          <h2 className="font-display font-600 text-foreground mb-3">
            Week at a Glance
          </h2>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_ORDER.map((day) => {
              const count =
                schedule?.filter((e) => e.dayOfWeek === day).length ?? 0;
              const isToday = day === todayDow;
              return (
                <div
                  key={day}
                  className={`rounded-lg p-2 text-center ${
                    isToday
                      ? "bg-primary/20 border border-primary/40"
                      : "glass-card"
                  }`}
                >
                  <p
                    className={`text-xs font-600 mb-1 ${isToday ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {DAY_NAMES[day].slice(0, 3).toUpperCase()}
                  </p>
                  <p
                    className={`text-lg font-display font-700 ${isToday ? "text-primary" : "text-foreground"}`}
                  >
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
