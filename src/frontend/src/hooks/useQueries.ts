import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DayOfWeek,
  type Note,
  Priority,
  type ScheduleEntry,
  type Task,
} from "../backend.d";
import { useActor } from "./useActor";

export { DayOfWeek, Priority };
export type { Task, ScheduleEntry, Note };

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      title: string;
      description: string;
      priority: Priority;
      dueDate: bigint | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTask(
        vars.title,
        vars.description,
        vars.priority,
        vars.dueDate,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      title: string;
      description: string;
      priority: Priority;
      dueDate: bigint | null;
      completed: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTask(
        vars.id,
        vars.title,
        vars.description,
        vars.priority,
        vars.dueDate,
        vars.completed,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTask(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useGetAllScheduleEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<ScheduleEntry[]>({
    queryKey: ["schedule"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllScheduleEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateScheduleEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      title: string;
      dayOfWeek: DayOfWeek;
      startTime: bigint;
      endTime: bigint;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createScheduleEntry(
        vars.title,
        vars.dayOfWeek,
        vars.startTime,
        vars.endTime,
        vars.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
  });
}

export function useUpdateScheduleEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      title: string;
      dayOfWeek: DayOfWeek;
      startTime: bigint;
      endTime: bigint;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateScheduleEntry(
        vars.id,
        vars.title,
        vars.dayOfWeek,
        vars.startTime,
        vars.endTime,
        vars.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
  });
}

export function useDeleteScheduleEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteScheduleEntry(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
  });
}

export function useGetAllNotes() {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { title: string; body: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createNote(vars.title, vars.body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: bigint; title: string; body: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateNote(vars.id, vars.title, vars.body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteNote(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}
