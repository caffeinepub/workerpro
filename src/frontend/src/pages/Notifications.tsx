import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import {
  type Notification,
  useDeleteNotification,
  useGetAllNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "../hooks/useNotificationQueries";

function formatDateTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleString();
}

function typeIcon(type: string): string {
  switch (type) {
    case "new_job":
      return "💼";
    case "job_assigned":
      return "✅";
    case "job_accepted":
      return "🤝";
    case "job_completed":
      return "🎉";
    default:
      return "🔔";
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case "new_job":
      return "New Job";
    case "job_assigned":
      return "Assignment";
    case "job_accepted":
      return "Booking";
    case "job_completed":
      return "Completed";
    default:
      return "Notification";
  }
}

function typeBadgeVariant(type: string): "default" | "secondary" | "outline" {
  switch (type) {
    case "new_job":
      return "default";
    case "job_assigned":
      return "secondary";
    case "job_accepted":
      return "secondary";
    case "job_completed":
      return "outline";
    default:
      return "outline";
  }
}

function NotificationCard({
  notification,
  index,
}: {
  notification: Notification;
  index: number;
}) {
  const markRead = useMarkNotificationRead();
  const deleteNotif = useDeleteNotification();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`notifications.item.${index + 1}`}
      className={`rounded-xl border p-4 flex gap-3 transition-colors ${
        !notification.isRead
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border"
      }`}
    >
      <div className="text-2xl flex-shrink-0 mt-0.5">
        {typeIcon(notification.notificationType)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-semibold text-sm ${
                !notification.isRead
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {notification.title}
            </span>
            <Badge
              variant={typeBadgeVariant(notification.notificationType)}
              className="text-xs"
            >
              {typeLabel(notification.notificationType)}
            </Badge>
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => markRead.mutate(notification.id)}
                data-ocid={`notifications.mark_read.button.${index + 1}`}
                title="Mark as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => deleteNotif.mutate(notification.id)}
              data-ocid={`notifications.delete_button.${index + 1}`}
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1 leading-snug">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1.5">
          {formatDateTime(notification.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useGetAllNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const unread = notifications.filter((n) => !n.isRead);
  const jobs = notifications.filter((n) => n.notificationType === "new_job");
  const assignments = notifications.filter(
    (n) =>
      n.notificationType === "job_assigned" ||
      n.notificationType === "job_accepted",
  );
  const completed = notifications.filter(
    (n) => n.notificationType === "job_completed",
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unread.length > 0 ? `${unread.length} unread` : "All caught up"}
            </p>
          </div>
        </div>
        {unread.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAllRead.mutate()}
            data-ocid="notifications.mark_all_read.button"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total",
            count: notifications.length,
            color: "bg-blue-500/10 text-blue-600",
          },
          {
            label: "Unread",
            count: unread.length,
            color: "bg-red-500/10 text-red-600",
          },
          {
            label: "Jobs",
            count: jobs.length,
            color: "bg-green-500/10 text-green-600",
          },
          {
            label: "Assignments",
            count: assignments.length,
            color: "bg-purple-500/10 text-purple-600",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p
                className={`text-2xl font-bold mt-0.5 ${stat.color.split(" ")[1]}`}
              >
                {stat.count}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" data-ocid="notifications.tab">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all" data-ocid="notifications.all.tab">
            All {notifications.length > 0 && `(${notifications.length})`}
          </TabsTrigger>
          <TabsTrigger value="jobs" data-ocid="notifications.jobs.tab">
            Jobs {jobs.length > 0 && `(${jobs.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            data-ocid="notifications.assignments.tab"
          >
            Assignments {assignments.length > 0 && `(${assignments.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            data-ocid="notifications.completed.tab"
          >
            Completed {completed.length > 0 && `(${completed.length})`}
          </TabsTrigger>
        </TabsList>

        {(
          [
            ["all", notifications],
            ["jobs", jobs],
            ["assignments", assignments],
            ["completed", completed],
          ] as [string, Notification[]][]
        ).map(([tab, list]) => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
            {isLoading ? (
              <div
                className="py-12 text-center text-muted-foreground"
                data-ocid={`notifications.${tab}.loading_state`}
              >
                Loading...
              </div>
            ) : list.length === 0 ? (
              <div
                className="py-12 text-center"
                data-ocid={`notifications.${tab}.empty_state`}
              >
                <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No notifications here
                </p>
              </div>
            ) : (
              list.map((n, i) => (
                <NotificationCard
                  key={String(n.id)}
                  notification={n}
                  index={i}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
