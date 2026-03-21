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
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type UserNotificationId = bigint;
export type Time = bigint;
export interface Task {
    id: TaskId;
    title: string;
    completed: boolean;
    dueDate?: Time;
    description: string;
    priority: Priority;
}
export interface UserNotification {
    id: UserNotificationId;
    title: string;
    receiverUserId: bigint;
    jobId: bigint;
    isRead: boolean;
    message: string;
    timestamp: bigint;
    senderUserId: bigint;
}
export type JobApplicationNotifId = bigint;
export interface JobApplicationNotif {
    id: JobApplicationNotifId;
    receiverUserId: bigint;
    senderUserId: bigint;
    jobId: bigint;
    jobTitle: string;
    applicantName: string;
    applicantPhone: string;
    message: string;
    timestamp: bigint;
    isRead: boolean;
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
export interface JobApplication {
    id: JobApplicationId;
    status: string;
    appliedAt: Time;
    applicantName: string;
    applicantPhone: string;
    vacancyId: JobVacancyId;
    postedByUserId: bigint;
    applicantUserId: bigint;
}
export type RentalPropertyId = bigint;
export type WorkEntryId = bigint;
export interface JobVacancyWithOwner {
    id: JobVacancyId;
    status: JobVacancyStatus;
    title: string;
    postedAt: Time;
    salary?: string;
    description: string;
    postedByUserId: bigint;
    companyName: string;
    category: string;
    location: string;
    contactPhone?: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type JobPostingId = bigint;
export interface RentalWithOwner {
    id: RentalPropertyId;
    status: RentalStatus;
    title: string;
    ownerName: string;
    createdAt: Time;
    numberOfRooms: bigint;
    description: string;
    postedByUserId: bigint;
    pricePerMonth: number;
    location: string;
    contactPhone: string;
}
export interface Booking {
    id: BookingId;
    status: BookingStatus;
    serviceType: string;
    workerId: bigint;
    userId: bigint;
    note: string;
    createdAt: Time;
    workerName: string;
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
export interface Note {
    id: NoteId;
    title: string;
    body: string;
    timestamp: Time;
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
export type BookingId = bigint;
export interface ScheduleEntry {
    id: ScheduleId;
    startTime: bigint;
    title: string;
    endTime: bigint;
    dayOfWeek: DayOfWeek;
    notes: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type UserId = bigint;
export type ScheduleId = bigint;
export interface WorkerProfile {
    id: WorkerId;
    status: WorkerStatus;
    latitude: number;
    userId: bigint;
    name: string;
    createdAt: Time;
    profession: string;
    longitude: number;
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
export type WorkerId = bigint;
export interface UserProfile {
    userId?: bigint;
    name: string;
    phone: string;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
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
    acceptBooking(id: BookingId): Promise<boolean>;
    applyToVacancy(vacancyId: JobVacancyId, applicantUserId: bigint, applicantName: string, applicantPhone: string): Promise<JobApplicationId>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignJobPosting(id: JobPostingId, workerName: string, workerPhone: string, workerAddress: string): Promise<boolean>;
    cancelBooking(id: BookingId): Promise<boolean>;
    closeJobVacancy(id: JobVacancyId): Promise<void>;
    completeJobPosting(id: JobPostingId): Promise<boolean>;
    createBooking(userId: bigint, workerId: bigint, workerName: string, serviceType: string, note: string): Promise<BookingId>;
    createJobPosting(title: string, description: string, date: string, startTime: bigint, endTime: bigint, paymentAmount: number, address: string): Promise<JobPostingId>;
    createJobVacancy(title: string, companyName: string, category: string, salary: string | null, location: string, description: string, postedByUserId: bigint, contactPhone: string | null): Promise<JobVacancyId>;
    createNote(title: string, body: string): Promise<NoteId>;
    createNotification(title: string, message: string, notificationType: string, jobId: bigint): Promise<NotificationId>;
    createRentalProperty(title: string, description: string, location: string, pricePerMonth: number, numberOfRooms: bigint, contactPhone: string, ownerName: string, postedByUserId: bigint): Promise<RentalPropertyId>;
    createScheduleEntry(title: string, dayOfWeek: DayOfWeek, startTime: bigint, endTime: bigint, notes: string): Promise<ScheduleId>;
    createTask(title: string, description: string, priority: Priority, dueDate: Time | null): Promise<TaskId>;
    createUserNotification(receiverUserId: bigint, senderUserId: bigint, jobId: bigint, title: string, message: string): Promise<UserNotificationId>;
    createWorkEntry(workerName: string, date: string, workType: string, startTime: bigint, endTime: bigint, hoursWorked: number, dailyPayment: number, notes: string): Promise<WorkEntryId>;
    createWorkerProfile(userId: bigint, name: string, profession: string, phone: string, rating: number, location: string, latitude: number, longitude: number): Promise<bigint>;
    deleteJobVacancy(id: JobVacancyId, requestingUserId: bigint): Promise<void>;
    deleteNote(noteId: NoteId): Promise<void>;
    deleteNotification(id: NotificationId): Promise<void>;
    deleteRentalProperty(id: RentalPropertyId, requestingUserId: bigint): Promise<void>;
    deleteScheduleEntry(entryId: ScheduleId): Promise<void>;
    deleteTask(taskId: TaskId): Promise<void>;
    deleteUserNotification(id: UserNotificationId): Promise<void>;
    getJobAppNotifsForUser(userId: bigint): Promise<Array<JobApplicationNotif>>;
    getJobAppUnreadCount(userId: bigint): Promise<bigint>;
    markJobAppNotifRead(id: JobApplicationNotifId): Promise<void>;
    markAllJobAppNotifsRead(userId: bigint): Promise<void>;
    deleteJobAppNotif(id: JobApplicationNotifId): Promise<void>;
    deleteWorkEntry(entryId: WorkEntryId): Promise<void>;
    generateOtp(phone: string): Promise<boolean>;
    getOtpForPhone(phone: string): Promise<string>;
    getActiveWorkers(): Promise<Array<WorkerProfile>>;
    getAllJobPostings(): Promise<Array<JobPosting>>;
    getAllJobVacancies(): Promise<Array<JobVacancyWithOwner>>;
    getAllNotes(): Promise<Array<Note>>;
    getAllNotifications(): Promise<Array<Notification>>;
    getAllRentals(): Promise<Array<RentalProperty>>;
    getAllScheduleEntries(): Promise<Array<ScheduleEntry>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllUsers(): Promise<Array<UserAccount>>;
    getAllWorkEntries(): Promise<Array<WorkEntry>>;
    getAllWorkerProfiles(): Promise<Array<WorkerProfile>>;
    getApplicationsForVacancy(vacancyId: JobVacancyId): Promise<Array<JobApplication>>;
    getAssignedJobPostings(): Promise<Array<JobPosting>>;
    getAvailableJobPostings(): Promise<Array<JobPosting>>;
    getAvailableRentals(): Promise<Array<RentalWithOwner>>;
    getBookingsForUser(userId: bigint): Promise<Array<Booking>>;
    getBookingsForWorker(workerId: bigint): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getJobVacanciesByCategory(category: string): Promise<Array<JobVacancyWithOwner>>;
    getJobVacanciesByLocation(location: string): Promise<Array<JobVacancyWithOwner>>;
    getNotInterestedJobIds(workerId: string): Promise<Array<JobPostingId>>;
    getNote(noteId: NoteId): Promise<Note>;
    getNotificationsForUser(userId: bigint): Promise<Array<UserNotification>>;
    getOpenJobVacancies(): Promise<Array<JobVacancyWithOwner>>;
    getRentalsByLocation(location: string): Promise<Array<RentalProperty>>;
    getScheduleEntry(entryId: ScheduleId): Promise<ScheduleEntry>;
    getTask(taskId: TaskId): Promise<Task>;
    getUnreadCount(): Promise<bigint>;
    getUnreadCountForUser(userId: bigint): Promise<bigint>;
    getUserApplications(userId: bigint): Promise<Array<JobApplication>>;
    getUserById(id: UserId): Promise<UserAccount | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkEntriesByDate(date: string): Promise<Array<WorkEntry>>;
    getWorkEntriesByDateRange(fromDate: string, toDate: string): Promise<Array<WorkEntry>>;
    getWorkEntriesByWorker(workerName: string): Promise<Array<WorkEntry>>;
    getWorkEntry(entryId: WorkEntryId): Promise<WorkEntry>;
    getWorkerProfileByUserId(userId: bigint): Promise<WorkerProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isSmsConfigured(): Promise<boolean>;
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
    sendLoginOtp(phone: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    loginWithOtp(phone: string, otp: string): Promise<{
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
    markAllUserNotificationsRead(userId: bigint): Promise<void>;
    markNotificationRead(id: NotificationId): Promise<void>;
    markUserNotificationRead(id: UserNotificationId): Promise<void>;
    register(name: string, emailOrPhone: string, passwordHash: string, role: UserRole): Promise<{
        __kind__: "ok";
        ok: UserId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    rejectBooking(id: BookingId): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setJobPreference(workerId: string, jobId: JobPostingId, interested: boolean): Promise<void>;
    setTwilioConfig(accountSid: string, base64Auth: string, fromPhone: string): Promise<void>;
    setWorkerStatus(workerId: bigint, status: WorkerStatus): Promise<boolean>;
    transformOtpResponse(input: TransformationInput): Promise<TransformationOutput>;
    updateJobVacancy(id: JobVacancyId, title: string, companyName: string, category: string, salary: string | null, location: string, description: string, requestingUserId: bigint): Promise<void>;
    updateNote(noteId: NoteId, title: string, body: string): Promise<void>;
    updateRentalStatus(id: RentalPropertyId, status: RentalStatus): Promise<void>;
    updateScheduleEntry(entryId: ScheduleId, title: string, dayOfWeek: DayOfWeek, startTime: bigint, endTime: bigint, notes: string): Promise<void>;
    updateTask(taskId: TaskId, title: string, description: string, priority: Priority, dueDate: Time | null, completed: boolean): Promise<void>;
    updateWorkEntry(entryId: WorkEntryId, workerName: string, date: string, workType: string, startTime: bigint, endTime: bigint, hoursWorked: number, dailyPayment: number, notes: string): Promise<void>;
    updateWorkerLocation(workerId: WorkerId, latitude: number, longitude: number): Promise<boolean>;
    updateWorkerStatus(workerId: WorkerId, active: boolean): Promise<boolean>;
    verifyOtp(phone: string, otp: string): Promise<boolean>;
}
