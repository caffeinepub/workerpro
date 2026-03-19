import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type JobVacancyId = bigint;
export type Time = bigint;
export interface Task {
    id: TaskId;
    title: string;
    completed: boolean;
    dueDate?: Time;
    description: string;
    priority: Priority;
}
export interface JobApplication {
    id: JobApplicationId;
    appliedAt: Time;
    applicantName: string;
    applicantPhone: string;
    vacancyId: JobVacancyId;
}
export interface UserAccount {
    id: bigint;
    emailOrPhone: string;
    name: string;
    createdAt: Time;
    role: UserRole;
    passwordHash: string;
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
    assignedWorkerAddress: string;
    assignedWorkerPhone: string;
    assignedWorkerName: string;
    paymentAmount: number;
}
export type RentalPropertyId = bigint;
export type WorkEntryId = bigint;
export type JobPostingId = bigint;
export interface Note {
    id: NoteId;
    title: string;
    body: string;
    timestamp: Time;
}
export interface RentalProperty {
    id: RentalPropertyId;
    status: RentalStatus;
    title: string;
    ownerName: string;
    createdAt: Time;
    numberOfRooms: bigint;
    description: string;
    pricePerMonth: number;
    location: string;
    contactPhone: string;
}
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
export type JobApplicationId = bigint;
export interface JobVacancy {
    id: JobVacancyId;
    status: JobVacancyStatus;
    title: string;
    postedAt: Time;
    salary?: string;
    description: string;
    companyName: string;
    category: string;
    location: string;
}
export interface ScheduleEntry {
    id: ScheduleId;
    startTime: bigint;
    title: string;
    endTime: bigint;
    dayOfWeek: DayOfWeek;
    notes: string;
}
export type UserId = bigint;
export type ScheduleId = bigint;
export interface WorkerProfile {
    id: bigint;
    status: WorkerStatus;
    userId: bigint;
    name: string;
    createdAt: Time;
    profession: string;
    rating: number;
    phone: string;
    location: string;
}
export type TaskId = bigint;
export type NotificationId = bigint;
export interface Notification {
    id: NotificationId;
    title: string;
    notificationType: string;
    jobId: bigint;
    isRead: boolean;
    message: string;
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
export enum JobStatus {
    assigned = "assigned",
    deleted = "deleted",
    completed = "completed",
    available = "available"
}
export enum JobVacancyStatus {
    closed = "closed",
    open = "open"
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum RentalStatus {
    rented = "rented",
    available = "available"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    worker = "worker"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WorkerStatus {
    active = "active",
    blocked = "blocked",
    inactive = "inactive"
}
export interface backendInterface {
    applyToVacancy(vacancyId: JobVacancyId, applicantName: string, applicantPhone: string): Promise<JobApplicationId>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignJobPosting(id: JobPostingId, workerName: string, workerPhone: string, workerAddress: string): Promise<boolean>;
    closeJobVacancy(id: JobVacancyId): Promise<void>;
    completeJobPosting(id: JobPostingId): Promise<boolean>;
    createJobPosting(title: string, description: string, date: string, startTime: bigint, endTime: bigint, paymentAmount: number, address: string): Promise<JobPostingId>;
    createJobVacancy(title: string, companyName: string, category: string, salary: string | null, location: string, description: string): Promise<JobVacancyId>;
    createNote(title: string, body: string): Promise<NoteId>;
    createNotification(title: string, message: string, notificationType: string, jobId: bigint): Promise<NotificationId>;
    createRentalProperty(title: string, description: string, location: string, pricePerMonth: number, numberOfRooms: bigint, contactPhone: string, ownerName: string): Promise<RentalPropertyId>;
    createScheduleEntry(title: string, dayOfWeek: DayOfWeek, startTime: bigint, endTime: bigint, notes: string): Promise<ScheduleId>;
    createTask(title: string, description: string, priority: Priority, dueDate: Time | null): Promise<TaskId>;
    createWorkEntry(workerName: string, date: string, workType: string, startTime: bigint, endTime: bigint, hoursWorked: number, dailyPayment: number, notes: string): Promise<WorkEntryId>;
    createWorkerProfile(userId: bigint, name: string, profession: string, phone: string, rating: number, location: string): Promise<bigint>;
    deleteJobVacancy(id: JobVacancyId): Promise<void>;
    deleteNote(noteId: NoteId): Promise<void>;
    deleteNotification(id: NotificationId): Promise<void>;
    deleteRentalProperty(id: RentalPropertyId): Promise<void>;
    deleteScheduleEntry(entryId: ScheduleId): Promise<void>;
    deleteTask(taskId: TaskId): Promise<void>;
    deleteWorkEntry(entryId: WorkEntryId): Promise<void>;
    getActiveWorkers(): Promise<Array<WorkerProfile>>;
    getAllJobVacancies(): Promise<Array<JobVacancy>>;
    getAllNotes(): Promise<Array<Note>>;
    getAllNotifications(): Promise<Array<Notification>>;
    getAllRentals(): Promise<Array<RentalProperty>>;
    getAllScheduleEntries(): Promise<Array<ScheduleEntry>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllUsers(): Promise<Array<UserAccount>>;
    getAllWorkEntries(): Promise<Array<WorkEntry>>;
    getAllWorkerProfiles(): Promise<Array<WorkerProfile>>;
    getApplicationsForVacancy(vacancyId: JobVacancyId): Promise<Array<JobApplication>>;
    getAvailableJobPostings(): Promise<Array<JobPosting>>;
    getAvailableRentals(): Promise<Array<RentalProperty>>;
    getCallerUserRole(): Promise<UserRole__1>;
    getJobVacanciesByCategory(category: string): Promise<Array<JobVacancy>>;
    getJobVacanciesByLocation(location: string): Promise<Array<JobVacancy>>;
    getNotInterestedJobIds(workerId: string): Promise<Array<JobPostingId>>;
    getNote(noteId: NoteId): Promise<Note>;
    getOpenJobVacancies(): Promise<Array<JobVacancy>>;
    getRentalsByLocation(location: string): Promise<Array<RentalProperty>>;
    getScheduleEntry(entryId: ScheduleId): Promise<ScheduleEntry>;
    getTask(taskId: TaskId): Promise<Task>;
    getUnreadCount(): Promise<bigint>;
    getUserById(id: UserId): Promise<UserAccount | null>;
    getWorkEntriesByDate(date: string): Promise<Array<WorkEntry>>;
    getWorkEntriesByDateRange(fromDate: string, toDate: string): Promise<Array<WorkEntry>>;
    getWorkEntriesByWorker(workerName: string): Promise<Array<WorkEntry>>;
    getWorkEntry(entryId: WorkEntryId): Promise<WorkEntry>;
    getWorkerProfileByUserId(userId: bigint): Promise<WorkerProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    login(emailOrPhone: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: {
            userId: UserId;
            role: UserRole;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    markAllNotificationsRead(): Promise<void>;
    markNotificationRead(id: NotificationId): Promise<void>;
    register(name: string, emailOrPhone: string, passwordHash: string, role: UserRole): Promise<{
        __kind__: "ok";
        ok: UserId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setJobPreference(workerId: string, jobId: JobPostingId, interested: boolean): Promise<void>;
    setWorkerStatus(workerId: bigint, status: WorkerStatus): Promise<boolean>;
    updateNote(noteId: NoteId, title: string, body: string): Promise<void>;
    updateRentalStatus(id: RentalPropertyId, status: RentalStatus): Promise<void>;
    updateScheduleEntry(entryId: ScheduleId, title: string, dayOfWeek: DayOfWeek, startTime: bigint, endTime: bigint, notes: string): Promise<void>;
    updateTask(taskId: TaskId, title: string, description: string, priority: Priority, dueDate: Time | null, completed: boolean): Promise<void>;
    updateWorkEntry(entryId: WorkEntryId, workerName: string, date: string, workType: string, startTime: bigint, endTime: bigint, hoursWorked: number, dailyPayment: number, notes: string): Promise<void>;
    updateWorkerStatus(workerId: bigint, active: boolean): Promise<boolean>;
}
