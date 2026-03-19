import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type WorkerProfile, WorkerStatus } from "../backend.d";
import { useActor } from "./useActor";

export type { WorkerProfile };
export { WorkerStatus };

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const SESSION_KEY = "workerPro_session";

export interface UserSession {
  userId: bigint;
  role: "admin" | "user" | "worker";
  name: string;
}

export function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // userId is stored as string (bigint can't be JSON serialized)
    return { ...parsed, userId: BigInt(parsed.userId) };
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...session, userId: session.userId.toString() }),
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function useGetActiveWorkers() {
  const { actor, isFetching } = useActor();
  return useQuery<WorkerProfile[]>({
    queryKey: ["activeWorkers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveWorkers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllWorkers() {
  const { actor, isFetching } = useActor();
  return useQuery<WorkerProfile[]>({
    queryKey: ["allWorkers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWorkerProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetWorkerStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { workerId: bigint; status: WorkerStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.setWorkerStatus(vars.workerId, vars.status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allWorkers"] });
      qc.invalidateQueries({ queryKey: ["activeWorkers"] });
    },
  });
}

export function useUpdateWorkerStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { workerId: bigint; active: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateWorkerStatus(vars.workerId, vars.active);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allWorkers"] });
      qc.invalidateQueries({ queryKey: ["activeWorkers"] });
    },
  });
}

export function useGetWorkerByUserId(userId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<WorkerProfile | null>({
    queryKey: ["workerByUserId", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getWorkerProfileByUserId(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}
