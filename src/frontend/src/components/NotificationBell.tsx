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
  useDeleteUserNotification,
  useGetNotificationsForUser,
  useGetUnreadCountForUser,
  useMarkAllUserNotificationsRead,
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
  session,
}: { onOpenCenter: () => void; session?: UserSession | null }) {
  const userId = session?.userId;
  const { data: notifications = [] } = useGetNotificationsForUser(userId);
  const { data: unreadCount = 0n } = useGetUnreadCountForUser(userId);
  const markRead = useMarkUserNotificationRead(userId);
  const markAllRead = useMarkAllUserNotificationsRead();
  const deleteNotif = useDeleteUserNotification(userId);

  const recent = notifications.slice(0, 5);
  const count = Number(unreadCount);

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
          {count > 0 && (
            <span
              data-ocid="notification.badge"
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5"
            >
              {count > 99 ? "99+" : count}
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
          {count > 0 && (
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
        {recent.length === 0 ? (
          <div
            className="py-6 text-center text-sm text-muted-foreground"
            data-ocid="notification.empty_state"
          >
            No notifications yet
          </div>
        ) : (
          recent.map((n, i) => (
            <DropdownMenuItem
              key={String(n.id)}
              data-ocid={`notification.item.${i + 1}`}
              className={`flex flex-col items-start gap-0.5 cursor-pointer p-3 ${
                !n.isRead ? "bg-primary/5" : ""
              }`}
              onClick={() => {
                if (!n.isRead) markRead.mutate(n.id);
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-base">🔔</span>
                <span
                  className={`flex-1 text-sm font-medium leading-tight ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {n.title}
                </span>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotif.mutate(n.id);
                  }}
                  className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  data-ocid={`notification.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground pl-6 leading-snug line-clamp-2">
                {n.message}
              </span>
              <span className="text-xs text-muted-foreground/60 pl-6">
                {formatTime(n.timestamp)}
              </span>
            </DropdownMenuItem>
          ))
        )}
        {notifications.length > 0 && (
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
