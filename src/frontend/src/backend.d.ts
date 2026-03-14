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
export interface WorkEntry {
    id: WorkEntryId;
    startTime: bigint;
    workType: string;
    dailyPayment: number;
    endTime: bigint;
    date: string;
    hoursWorked: number;
    createdAt: Time;
    notes: string;
    workerName: string;
}
export type Time = bigint;
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
export interface JobPosting {
    id: JobPostingId;
    startTime: bigint;
    status: JobStatus;
    title: string;
    endTime: bigint;
    date: string;
    createdAt: Time;
    description: string;
    address: string;
    assignedWorkerName: string;
    paymentAmount: number;
}
export type WorkEntryId = bigint;
export type ScheduleId = bigint;
export type TaskId = bigint;
export type JobPostingId = bigint;
export type NotificationId = bigint;
export interface Note {
    id: NoteId;
    title: string;
    body: string;
    timestamp: Time;
}
export interface Notification {
    id: NotificationId;
    title: string;
    message: string;
    notificationType: string;
    jobId: bigint;
    timestamp: Time;
    isRead: boolean;
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
export enum JobStatus {
    taken = "taken",
    available = "available"
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export interface backendInterface {
    assignJobPosting(id: JobPostingId, workerName: string): Promise<boolean>;
    createJobPosting(title: string, description: string, date: string, startTime: bigint, endTime: bigint, paymentAmount: number, address: string): Promise<JobPostingId>;
    createNote(title: string, body: string): Promise<NoteId>;
    createScheduleEntry(title: string, dayOfWeek: DayOfWeek, startTime: bigint, endTime: bigint, notes: string): Promise<ScheduleId>;
    createTask(title: string, description: string, priority: Priority, dueDate: Time | null): Promise<TaskId>;
    createWorkEntry(workerName: string, date: string, workType: string, startTime: bigint, endTime: bigint, hoursWorked: number, dailyPayment: number, notes: string): Promise<WorkEntryId>;
    deleteJobPosting(id: JobPostingId): Promise<void>;
    deleteNote(noteId: NoteId): Promise<void>;
    deleteScheduleEntry(entryId: ScheduleId): Promise<void>;
    deleteTask(taskId: TaskId): Promise<void>;
    deleteWorkEntry(entryId: WorkEntryId): Promise<void>;
    getAllJobPostings(): Promise<Array<JobPosting>>;
    getAllNotes(): Promise<Array<Note>>;
    getAllScheduleEntries(): Promise<Array<ScheduleEntry>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllWorkEntries(): Promise<Array<WorkEntry>>;
    getAvailableJobPostings(): Promise<Array<JobPosting>>;
    getNote(noteId: NoteId): Promise<Note>;
    getScheduleEntry(entryId: ScheduleId): Promise<ScheduleEntry>;
    getTask(taskId: TaskId): Promise<Task>;
    getWorkEntriesByDate(date: string): Promise<Array<WorkEntry>>;
    getWorkEntriesByDateRange(fromDate: string, toDate: string): Promise<Array<WorkEntry>>;
    getWorkEntriesByWorker(workerName: string): Promise<Array<WorkEntry>>;
    getWorkEntry(entryId: WorkEntryId): Promise<WorkEntry>;
    updateNote(noteId: NoteId, title: string, body: string): Promise<void>;
    updateScheduleEntry(entryId: ScheduleId, title: string, dayOfWeek: DayOfWeek, startTime: bigint, endTime: bigint, notes: string): Promise<void>;
    updateTask(taskId: TaskId, title: string, description: string, priority: Priority, dueDate: Time | null, completed: boolean): Promise<void>;
    updateWorkEntry(entryId: WorkEntryId, workerName: string, date: string, workType: string, startTime: bigint, endTime: bigint, hoursWorked: number, dailyPayment: number, notes: string): Promise<void>;
    createNotification(title: string, message: string, notificationType: string, jobId: bigint): Promise<NotificationId>;
    getAllNotifications(): Promise<Array<Notification>>;
    getUnreadCount(): Promise<bigint>;
    markNotificationRead(id: NotificationId): Promise<void>;
    markAllNotificationsRead(): Promise<void>;
    deleteNotification(id: NotificationId): Promise<void>;
}
