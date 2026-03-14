import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type NoteId = bigint;
export type ScheduleId = bigint;
export type Time = bigint;
export type TaskId = bigint;
export interface ScheduleEntry {
    id: ScheduleId;
    startTime: bigint;
    title: string;
    endTime: bigint;
    dayOfWeek: DayOfWeek;
    notes: string;
}
export interface Task {
    id: TaskId;
    title: string;
    completed: boolean;
    dueDate?: Time;
    description: string;
    priority: Priority;
}
export interface Note {
    id: NoteId;
    title: string;
    body: string;
    timestamp: Time;
}
export enum DayOfWeek {
    tuesday = "tuesday",
    wednesday = "wednesday",
    saturday = "saturday",
    thursday = "thursday",
    sunday = "sunday",
    friday = "friday",
    monday = "monday"
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export interface backendInterface {
    createNote(title: string, body: string): Promise<NoteId>;
    createScheduleEntry(title: string, dayOfWeek: DayOfWeek, startTime: bigint, endTime: bigint, notes: string): Promise<ScheduleId>;
    createTask(title: string, description: string, priority: Priority, dueDate: Time | null): Promise<TaskId>;
    deleteNote(noteId: NoteId): Promise<void>;
    deleteScheduleEntry(entryId: ScheduleId): Promise<void>;
    deleteTask(taskId: TaskId): Promise<void>;
    getAllNotes(): Promise<Array<Note>>;
    getAllScheduleEntries(): Promise<Array<ScheduleEntry>>;
    getAllTasks(): Promise<Array<Task>>;
    getNote(noteId: NoteId): Promise<Note>;
    getScheduleEntry(entryId: ScheduleId): Promise<ScheduleEntry>;
    getTask(taskId: TaskId): Promise<Task>;
    updateNote(noteId: NoteId, title: string, body: string): Promise<void>;
    updateScheduleEntry(entryId: ScheduleId, title: string, dayOfWeek: DayOfWeek, startTime: bigint, endTime: bigint, notes: string): Promise<void>;
    updateTask(taskId: TaskId, title: string, description: string, priority: Priority, dueDate: Time | null, completed: boolean): Promise<void>;
}
