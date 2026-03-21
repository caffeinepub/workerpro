import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  JobApplicationNotif,
  JobApplicationNotifId,
  UserNotification,
} from "../backend.d";
import { useActor } from "./useActor";

export type { UserNotification, JobApplicationNotif };

export function useGetNotificationsForUser(userId?: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<UserNotification[]>({
    queryKey: ["userNotifications", String(userId ?? 0n)],
    queryFn: async () => {
      if (!actor || userId === undefined) return [];
      return (actor as any).getNotificationsForUser(userId);
    },
    enabled: !!actor && !isFetching && userId !== undefined,
    refetchInterval: 10000,
  });
}

export function useGetJobAppNotifsForUser(userId?: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<JobApplicationNotif[]>({
    queryKey: ["jobAppNotifs", String(userId ?? 0n)],
    queryFn: async () => {
      if (!actor || userId === undefined) return [];
      return (actor as any).getJobAppNotifsForUser(userId);
    },
    enabled: !!actor && !isFetching && userId !== undefined,
    refetchInterval: 5000,
  });
}

export function useGetUnreadCountForUser(userId?: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["userUnreadCount", String(userId ?? 0n)],
    queryFn: async () => {
      if (!actor || userId === undefined) return 0n;
      // Combine both old and new unread counts
      const [oldCount, newCount] = await Promise.all([
        (actor as any).getUnreadCountForUser(userId),
        (actor as any).getJobAppUnreadCount(userId),
      ]);
      return (oldCount as bigint) + (newCount as bigint);
    },
    enabled: !!actor && !isFetching && userId !== undefined,
    refetchInterval: 5000,
  });
}

export function useGetJobAppUnreadCount(userId?: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["jobAppUnreadCount", String(userId ?? 0n)],
    queryFn: async () => {
      if (!actor || userId === undefined) return 0n;
      return (actor as any).getJobAppUnreadCount(userId);
    },
    enabled: !!actor && !isFetching && userId !== undefined,
    refetchInterval: 5000,
  });
}

export function useCreateUserNotification() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      receiverUserId: bigint;
      senderUserId: bigint;
      jobId: bigint;
      title: string;
      message: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createUserNotification(
        vars.receiverUserId,
        vars.senderUserId,
        vars.jobId,
        vars.title,
        vars.message,
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["userNotifications", String(vars.receiverUserId)],
      });
      qc.invalidateQueries({
        queryKey: ["userUnreadCount", String(vars.receiverUserId)],
      });
    },
  });
}

export function useMarkUserNotificationRead(userId?: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).markUserNotificationRead(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["userNotifications", String(userId ?? 0n)],
      });
      qc.invalidateQueries({
        queryKey: ["userUnreadCount", String(userId ?? 0n)],
      });
    },
  });
}

export function useMarkJobAppNotifRead(userId?: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).markJobAppNotifRead(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["jobAppNotifs", String(userId ?? 0n)],
      });
      qc.invalidateQueries({
        queryKey: ["jobAppUnreadCount", String(userId ?? 0n)],
      });
      qc.invalidateQueries({
        queryKey: ["userUnreadCount", String(userId ?? 0n)],
      });
    },
  });
}

export function useMarkAllUserNotificationsRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: bigint) => {
      if (!actor) throw new Error("No actor");
      await Promise.all([
        (actor as any).markAllUserNotificationsRead(userId),
        (actor as any).markAllJobAppNotifsRead(userId),
      ]);
    },
    onSuccess: (_data, userId) => {
      qc.invalidateQueries({ queryKey: ["userNotifications", String(userId)] });
      qc.invalidateQueries({ queryKey: ["jobAppNotifs", String(userId)] });
      qc.invalidateQueries({ queryKey: ["userUnreadCount", String(userId)] });
      qc.invalidateQueries({ queryKey: ["jobAppUnreadCount", String(userId)] });
    },
  });
}

export function useDeleteUserNotification(userId?: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteUserNotification(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["userNotifications", String(userId ?? 0n)],
      });
      qc.invalidateQueries({
        queryKey: ["userUnreadCount", String(userId ?? 0n)],
      });
    },
  });
}

export function useDeleteJobAppNotif(userId?: bigint) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteJobAppNotif(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["jobAppNotifs", String(userId ?? 0n)],
      });
      qc.invalidateQueries({
        queryKey: ["jobAppUnreadCount", String(userId ?? 0n)],
      });
      qc.invalidateQueries({
        queryKey: ["userUnreadCount", String(userId ?? 0n)],
      });
    },
  });
}
