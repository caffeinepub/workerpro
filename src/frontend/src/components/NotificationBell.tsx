import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  useDeleteJobAppNotif,
  useDeleteUserNotification,
  useGetJobAppNotifsForUser,
  useGetJobAppUnreadCount,
  useGetNotificationsForUser,
  useGetUnreadCountForUser,
  useMarkAllUserNotificationsRead,
  useMarkJobAppNotifRead,
  useMarkUserNotificationRead,
} from "../hooks/useUserNotificationQueries";
import type { UserSession } from "../hooks/useWorkerQueries";

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString();
}

export default function NotificationBell({
  onOpenCenter,
  onNavigateToJobs,
  session,
}: {
  onOpenCenter: () => void;
  onNavigateToJobs?: () => void;
  session?: UserSession | null;
}) {
  const userId = session?.userId;
  const { data: notifications = [] } = useGetNotificationsForUser(userId);
  const { data: unreadCount = 0n } = useGetUnreadCountForUser(userId);
  const { data: jobAppNotifs = [] } = useGetJobAppNotifsForUser(userId);
  const { data: jobAppUnreadCount = 0n } = useGetJobAppUnreadCount(userId);
  const markRead = useMarkUserNotificationRead(userId);
  const markJobAppRead = useMarkJobAppNotifRead(userId);
  const markAllRead = useMarkAllUserNotificationsRead();
  const deleteNotif = useDeleteUserNotification(userId);
  const deleteJobAppNotif = useDeleteJobAppNotif(userId);

  // Combine unread counts from both notification types
  const totalUnread = Number(unreadCount) + Number(jobAppUnreadCount);

  // Show recent from both types, sorted by timestamp (newest first)
  const recentJobApp = [...jobAppNotifs]
    .sort((a, b) => Number(b.timestamp - a.timestamp))
    .slice(0, 3)
    .map((n) => ({ ...n, _type: "jobapp" as const }));
  const recentSys = notifications
    .slice(0, 3)
    .map((n) => ({ ...n, _type: "sys" as const }));
  const allRecent = [...recentJobApp, ...recentSys]
    .sort((a, b) => Number(b.timestamp - a.timestamp))
    .slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-ocid="notification.bell.button"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {totalUnread > 0 && (
            <span
              data-ocid="notification.badge"
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80"
        data-ocid="notification.dropdown_menu"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {totalUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1"
              onClick={() => userId && markAllRead.mutate(userId)}
              data-ocid="notification.mark_all_read.button"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allRecent.length === 0 ? (
          <div
            className="py-6 text-center text-sm text-muted-foreground"
            data-ocid="notification.empty_state"
          >
            No notifications yet
          </div>
        ) : (
          allRecent.map((n, i) => {
            const isJobApp = n._type === "jobapp";
            const isUnread = !n.isRead;
            const title = isJobApp
              ? "New Application Received"
              : ((n as { title?: string }).title ?? "");
            const message = isJobApp
              ? `Someone applied for: ${String((n as { jobTitle?: unknown }).jobTitle ?? "")}`
              : ((n as { message?: string }).message ?? "");
            return (
              <DropdownMenuItem
                key={String(n.id) + n._type}
                data-ocid={`notification.item.${i + 1}`}
                className={`flex flex-col items-start gap-0.5 cursor-pointer p-3 ${
                  isUnread ? "bg-primary/5" : ""
                }`}
                onClick={() => {
                  if (isUnread) {
                    if (isJobApp) markJobAppRead.mutate(n.id);
                    else markRead.mutate(n.id);
                  }
                  if (isJobApp && onNavigateToJobs) {
                    onNavigateToJobs();
                  }
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-base">{isJobApp ? "📋" : "🔔"}</span>
                  <span
                    className={`flex-1 text-sm font-medium leading-tight ${
                      isUnread ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {title}
                  </span>
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isJobApp) deleteJobAppNotif.mutate(n.id);
                      else deleteNotif.mutate(n.id);
                    }}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                    data-ocid={`notification.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground pl-6 leading-snug line-clamp-2">
                  {message}
                </span>
                <span className="text-xs text-muted-foreground/60 pl-6">
                  {formatTime(n.timestamp)}
                </span>
              </DropdownMenuItem>
            );
          })
        )}
        {(notifications.length > 0 || jobAppNotifs.length > 0) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-sm text-primary font-medium"
              onClick={onOpenCenter}
              data-ocid="notification.view_all.button"
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
