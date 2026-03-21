import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, Phone, Trash2, User } from "lucide-react";
import { motion } from "motion/react";
import {
  type JobApplicationNotif,
  type UserNotification,
  useDeleteJobAppNotif,
  useDeleteUserNotification,
  useGetJobAppNotifsForUser,
  useGetNotificationsForUser,
  useMarkAllUserNotificationsRead,
  useMarkJobAppNotifRead,
  useMarkUserNotificationRead,
} from "../hooks/useUserNotificationQueries";
import type { UserSession } from "../hooks/useWorkerQueries";

function formatDateTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleString();
}

// Card for job application notifications (with full applicant details)
function JobAppNotifCard({
  notification,
  index,
  userId,
}: {
  notification: JobApplicationNotif;
  index: number;
  userId?: bigint;
}) {
  const markRead = useMarkJobAppNotifRead(userId);
  const deleteNotif = useDeleteJobAppNotif(userId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`notifications.job_app.item.${index + 1}`}
      className={`rounded-xl border p-4 flex gap-3 transition-colors ${
        !notification.isRead
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border"
      }`}
    >
      <div className="text-2xl flex-shrink-0 mt-0.5">📋</div>
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
              New Job Application
            </span>
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
                data-ocid={`notifications.job_app.mark_read.${index + 1}`}
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
              data-ocid={`notifications.job_app.delete.${index + 1}`}
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Job title */}
        <p className="text-sm font-medium text-foreground mt-1">
          {String(notification.jobTitle)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {String(notification.message)}
        </p>

        {/* Applicant details */}
        <div className="mt-2 rounded-lg bg-muted/50 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs">
            <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">Applicant:</span>
            <span className="font-medium text-foreground">
              {String(notification.applicantName)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">Phone:</span>
            <a
              href={`tel:${String(notification.applicantPhone)}`}
              className="font-medium text-primary underline"
            >
              {String(notification.applicantPhone)}
            </a>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60 mt-1.5">
          {formatDateTime(notification.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

// Card for generic system notifications
function SystemNotifCard({
  notification,
  index,
  userId,
}: {
  notification: UserNotification;
  index: number;
  userId?: bigint;
}) {
  const markRead = useMarkUserNotificationRead(userId);
  const deleteNotif = useDeleteUserNotification(userId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`notifications.system.item.${index + 1}`}
      className={`rounded-xl border p-4 flex gap-3 transition-colors ${
        !notification.isRead
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border"
      }`}
    >
      <div className="text-2xl flex-shrink-0 mt-0.5">🔔</div>
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

export default function NotificationsPage({
  session,
}: { session?: UserSession | null }) {
  const userId = session?.userId;
  const { data: sysNotifs = [], isLoading: sysLoading } =
    useGetNotificationsForUser(userId);
  const { data: jobAppNotifs = [], isLoading: jobLoading } =
    useGetJobAppNotifsForUser(userId);
  const markAllRead = useMarkAllUserNotificationsRead();

  const isLoading = sysLoading || jobLoading;

  const unreadSys = sysNotifs.filter((n) => !n.isRead).length;
  const unreadJobApp = jobAppNotifs.filter((n) => !n.isRead).length;
  const totalUnread = unreadSys + unreadJobApp;
  const total = sysNotifs.length + jobAppNotifs.length;

  // Sort all job app notifs by timestamp desc
  const sortedJobApp = [...jobAppNotifs].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );
  const unreadJobAppList = sortedJobApp.filter((n) => !n.isRead);

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
              {totalUnread > 0 ? `${totalUnread} unread` : "All caught up"}
            </p>
          </div>
        </div>
        {totalUnread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => userId && markAllRead.mutate(userId)}
            data-ocid="notifications.mark_all_read.button"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Total",
            count: total,
            color: "text-blue-600",
          },
          {
            label: "Unread",
            count: totalUnread,
            color: "text-red-600",
          },
          {
            label: "Job Applications",
            count: jobAppNotifs.length,
            color: "text-green-600",
          },
          {
            label: "Read",
            count: total - totalUnread,
            color: "text-muted-foreground",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>
                {stat.count}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="applications" data-ocid="notifications.tab">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger
            value="applications"
            data-ocid="notifications.applications.tab"
          >
            Applications {jobAppNotifs.length > 0 && `(${jobAppNotifs.length})`}
          </TabsTrigger>
          <TabsTrigger value="unread" data-ocid="notifications.unread.tab">
            Unread {totalUnread > 0 && `(${totalUnread})`}
          </TabsTrigger>
          <TabsTrigger value="all" data-ocid="notifications.all.tab">
            All {total > 0 && `(${total})`}
          </TabsTrigger>
        </TabsList>

        {/* Job Applications Tab */}
        <TabsContent value="applications" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading...
            </div>
          ) : sortedJobApp.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {userId
                  ? "No job application notifications yet"
                  : "Log in to see your notifications"}
              </p>
            </div>
          ) : (
            sortedJobApp.map((n, i) => (
              <JobAppNotifCard
                key={String(n.id)}
                notification={n}
                index={i}
                userId={userId}
              />
            ))
          )}
        </TabsContent>

        {/* Unread Tab */}
        <TabsContent value="unread" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading...
            </div>
          ) : unreadJobAppList.length === 0 && unreadSys === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No unread notifications
              </p>
            </div>
          ) : (
            <>
              {unreadJobAppList.map((n, i) => (
                <JobAppNotifCard
                  key={String(n.id)}
                  notification={n}
                  index={i}
                  userId={userId}
                />
              ))}
              {sysNotifs
                .filter((n) => !n.isRead)
                .map((n, i) => (
                  <SystemNotifCard
                    key={String(n.id)}
                    notification={n}
                    index={i}
                    userId={userId}
                  />
                ))}
            </>
          )}
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading...
            </div>
          ) : total === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {userId
                  ? "No notifications here"
                  : "Log in to see your notifications"}
              </p>
            </div>
          ) : (
            <>
              {sortedJobApp.map((n, i) => (
                <JobAppNotifCard
                  key={String(n.id)}
                  notification={n}
                  index={i}
                  userId={userId}
                />
              ))}
              {sysNotifs.map((n, i) => (
                <SystemNotifCard
                  key={String(n.id)}
                  notification={n}
                  index={sortedJobApp.length + i}
                  userId={userId}
                />
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
