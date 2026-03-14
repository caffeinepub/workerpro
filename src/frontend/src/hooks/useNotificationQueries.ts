import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  backendInterface as ExtendedBackendInterface,
  Notification,
} from "../backend.d";
import { useActor } from "./useActor";

export type { Notification };

function extActor(actor: unknown): ExtendedBackendInterface {
  return actor as ExtendedBackendInterface;
}

export function useGetAllNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return extActor(actor).getAllNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useGetUnreadCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      if (!actor) return 0n;
      return extActor(actor).getUnreadCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useCreateNotification() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      title: string;
      message: string;
      notificationType: string;
      jobId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return extActor(actor).createNotification(
        vars.title,
        vars.message,
        vars.notificationType,
        vars.jobId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return extActor(actor).markNotificationRead(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return extActor(actor).markAllNotificationsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return extActor(actor).deleteNotification(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
