import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, IndianRupee, Users } from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { WorkEntry } from "../hooks/useQueries";
import { useGetAllWorkEntries } from "../hooks/useQueries";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

function getWeekRange(offset = 0): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  };
}

function getCurrentMonthRange(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// ── Weekly Report ──────────────────────────────────────────────────────────

function WeeklyReport({ entries }: { entries: WorkEntry[] }) {
  const { from: defaultFrom, to: defaultTo } = getWeekRange(0);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => e.date >= from && e.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, from, to]);

  const totalHours = filtered.reduce((s, e) => s + e.hoursWorked, 0);
  const totalPayment = filtered.reduce((s, e) => s + e.dailyPayment, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="weekFrom">From</Label>
          <Input
            id="weekFrom"
            type="date"
            data-ocid="reports.weekly.from.input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weekTo">To</Label>
          <Input
            id="weekTo"
            type="date"
            data-ocid="reports.weekly.to.input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground pb-0.5">
          <span>
            <span className="font-600 text-foreground">{filtered.length}</span>{" "}
            entries
          </span>
          <span>
            <span className="font-600 text-foreground">
              {totalHours.toFixed(2)}
            </span>{" "}
            hrs
          </span>
          <span>
            ₹
            <span className="font-600 text-foreground">
              {totalPayment.toLocaleString("en-IN")}
            </span>
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="reports.weekly.empty_state"
          className="py-12 text-center text-muted-foreground"
        >
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-600">No entries in this range.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="reports.weekly.table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Work Type</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry, idx) => (
                <TableRow
                  key={entry.id.toString()}
                  data-ocid={`reports.weekly.item.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-sm">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-600">{entry.workerName}</TableCell>
                  <TableCell className="text-sm">
                    {formatDateDisplay(entry.date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/30"
                    >
                      {entry.workType}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.hoursWorked.toFixed(2)}</TableCell>
                  <TableCell className="font-600 text-primary">
                    ₹{entry.dailyPayment.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Monthly Report ─────────────────────────────────────────────────────────

function MonthlyReport({ entries }: { entries: WorkEntry[] }) {
  const { year: defYear, month: defMonth } = getCurrentMonthRange();
  const [year, setYear] = useState(defYear);
  const [month, setMonth] = useState(defMonth);

  const monthStr = `${year}-${month.toString().padStart(2, "0")}`;

  const filtered = useMemo(
    () => entries.filter((e) => e.date.startsWith(monthStr)),
    [entries, monthStr],
  );

  const byWorker = useMemo(() => {
    const map: Record<string, { hours: number; payment: number }> = {};
    for (const e of filtered) {
      if (!map[e.workerName]) map[e.workerName] = { hours: 0, payment: 0 };
      map[e.workerName].hours += e.hoursWorked;
      map[e.workerName].payment += e.dailyPayment;
    }
    return Object.entries(map).sort((a, b) => b[1].payment - a[1].payment);
  }, [filtered]);

  const grandHours = byWorker.reduce((s, [, v]) => s + v.hours, 0);
  const grandPayment = byWorker.reduce((s, [, v]) => s + v.payment, 0);

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="reportYear">Year</Label>
          <Input
            id="reportYear"
            type="number"
            data-ocid="reports.monthly.year.input"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-28"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reportMonth">Month</Label>
          <select
            id="reportMonth"
            data-ocid="reports.monthly.month.select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 w-36 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {byWorker.length === 0 ? (
        <div
          data-ocid="reports.monthly.empty_state"
          className="py-12 text-center text-muted-foreground"
        >
          <IndianRupee className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-600">
            No data for {MONTHS[month - 1]} {year}.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="reports.monthly.table">
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Total Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byWorker.map(([worker, stats], idx) => (
                <TableRow
                  key={worker}
                  data-ocid={`reports.monthly.item.${idx + 1}`}
                >
                  <TableCell className="font-600">{worker}</TableCell>
                  <TableCell>{stats.hours.toFixed(2)} hrs</TableCell>
                  <TableCell className="font-600 text-primary">
                    ₹{stats.payment.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <tfoot>
              <TableRow className="border-t-2 border-border bg-muted/30 font-700">
                <TableCell className="font-700 text-foreground">
                  Grand Total
                </TableCell>
                <TableCell className="font-700 text-foreground">
                  {grandHours.toFixed(2)} hrs
                </TableCell>
                <TableCell className="font-700 text-primary">
                  ₹{grandPayment.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            </tfoot>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Worker-wise Summary ────────────────────────────────────────────────────

function WorkerSummary({ entries }: { entries: WorkEntry[] }) {
  const summary = useMemo(() => {
    const map: Record<
      string,
      { entries: number; hours: number; payment: number }
    > = {};
    for (const e of entries) {
      if (!map[e.workerName])
        map[e.workerName] = { entries: 0, hours: 0, payment: 0 };
      map[e.workerName].entries += 1;
      map[e.workerName].hours += e.hoursWorked;
      map[e.workerName].payment += e.dailyPayment;
    }
    return Object.entries(map).sort((a, b) => b[1].payment - a[1].payment);
  }, [entries]);

  if (summary.length === 0) {
    return (
      <div
        data-ocid="reports.worker.empty_state"
        className="py-12 text-center text-muted-foreground"
      >
        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-600">No workers recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table data-ocid="reports.worker.table">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Worker Name</TableHead>
            <TableHead>Total Entries</TableHead>
            <TableHead>Total Hours</TableHead>
            <TableHead>Total Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary.map(([worker, stats], idx) => (
            <TableRow key={worker} data-ocid={`reports.worker.item.${idx + 1}`}>
              <TableCell className="text-muted-foreground text-sm">
                {idx + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-700 text-sm">
                    {worker[0]?.toUpperCase()}
                  </div>
                  <span className="font-600">{worker}</span>
                </div>
              </TableCell>
              <TableCell>{stats.entries}</TableCell>
              <TableCell>{stats.hours.toFixed(2)} hrs</TableCell>
              <TableCell className="font-600 text-primary">
                ₹{stats.payment.toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main Reports Page ──────────────────────────────────────────────────────

export default function Reports() {
  const { data: entries = [], isLoading } = useGetAllWorkEntries();

  return (
    <div data-ocid="reports.section" className="p-6 md:p-8 max-w-5xl mx-auto">
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
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-700 text-foreground">
              Reports
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Analyse work data across time periods and workers.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={item}>
          {isLoading ? (
            <div data-ocid="reports.loading_state" className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="weekly" className="space-y-5">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly" data-ocid="reports.weekly.tab">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" data-ocid="reports.monthly.tab">
                  <IndianRupee className="w-4 h-4 mr-1.5" />
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="workers" data-ocid="reports.worker.tab">
                  <Users className="w-4 h-4 mr-1.5" />
                  Workers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="weekly">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-display font-600 text-foreground text-lg mb-5">
                    Weekly Work Report
                  </h2>
                  <WeeklyReport entries={entries} />
                </div>
              </TabsContent>

              <TabsContent value="monthly">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-display font-600 text-foreground text-lg mb-5">
                    Monthly Payment Report
                  </h2>
                  <MonthlyReport entries={entries} />
                </div>
              </TabsContent>

              <TabsContent value="workers">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-display font-600 text-foreground text-lg mb-5">
                    Worker-wise Summary
                  </h2>
                  <WorkerSummary entries={entries} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
