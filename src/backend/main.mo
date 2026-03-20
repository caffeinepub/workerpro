import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import OtpRecord "OtpRecord";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Authentication System
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // USER PROFILES (for Principal-based authentication)
  public type UserProfile = {
    userId : ?Nat; // Link to UserAccount if registered
    name : Text;
    phone : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // USERS

  type UserId = Nat;
  var nextUserId = 0;

  type UserRole = {
    #admin;
    #user;
    #worker;
  };

  type UserAccount = {
    id : Nat;
    name : Text;
    emailOrPhone : Text;
    passwordHash : Text;
    role : UserRole;
    createdAt : Time.Time;
  };

  let users = Map.empty<UserId, UserAccount>();

  // Public registration - no auth required
  public shared ({ caller }) func register(name : Text, emailOrPhone : Text, passwordHash : Text, role : UserRole) : async {
    #ok : UserId;
    #err : Text;
  } {
    for ((id, user) in users.entries()) {
      if (Text.equal(user.emailOrPhone, emailOrPhone)) {
        return #err("Email or phone already registered");
      };
    };

    let userId = nextUserId;
    let account : UserAccount = {
      id = userId;
      name;
      emailOrPhone;
      passwordHash;
      role;
      createdAt = Time.now();
    };
    users.add(userId, account);
    nextUserId += 1;
    #ok(userId);
  };

  // Public login - no auth required
  public shared ({ caller }) func login(emailOrPhone : Text, passwordHash : Text) : async {
    #ok : { userId : UserId; role : UserRole };
    #err : Text;
  } {
    for ((id, user) in users.entries()) {
      if (Text.equal(user.emailOrPhone, emailOrPhone)) {
        if (Text.equal(user.passwordHash, passwordHash)) {
          return #ok({ userId = user.id; role = user.role });
        } else {
          return #err("Invalid credentials");
        };
      };
    };
    #err("Invalid credentials");
  };

  public query ({ caller }) func getUserById(id : UserId) : async ?UserAccount {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view user details");
    };
    users.get(id);
  };

  public query ({ caller }) func getAllUsers() : async [UserAccount] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.values().toArray();
  };

  // TASKS

  type TaskId = Nat;
  var nextTaskId = 0;

  type Priority = {
    #low;
    #medium;
    #high;
  };

  type Task = {
    id : TaskId;
    title : Text;
    description : Text;
    priority : Priority;
    dueDate : ?Time.Time;
    completed : Bool;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  let tasks = Map.empty<TaskId, Task>();

  public shared ({ caller }) func createTask(title : Text, description : Text, priority : Priority, dueDate : ?Time.Time) : async TaskId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };
    let taskId = nextTaskId;
    let task : Task = {
      id = taskId;
      title;
      description;
      priority;
      dueDate;
      completed = false;
    };
    tasks.add(taskId, task);
    nextTaskId += 1;
    taskId;
  };

  public shared ({ caller }) func updateTask(taskId : TaskId, title : Text, description : Text, priority : Priority, dueDate : ?Time.Time, completed : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?_) {
        let task : Task = {
          id = taskId;
          title;
          description;
          priority;
          dueDate;
          completed;
        };
        tasks.add(taskId, task);
      };
    };
  };

  public shared ({ caller }) func deleteTask(taskId : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    if (not tasks.containsKey(taskId)) { Runtime.trap("Task not found") };
    tasks.remove(taskId);
  };

  public query ({ caller }) func getTask(taskId : TaskId) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    tasks.values().toArray().sort();
  };

  // SCHEDULE ENTRIES

  type ScheduleId = Nat;
  var nextScheduleId = 0;

  type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
  };

  type ScheduleEntry = {
    id : ScheduleId;
    title : Text;
    dayOfWeek : DayOfWeek;
    startTime : Nat;
    endTime : Nat;
    notes : Text;
  };

  module ScheduleEntry {
    public func compare(entry1 : ScheduleEntry, entry2 : ScheduleEntry) : Order.Order {
      Nat.compare(entry1.id, entry2.id);
    };
  };

  let scheduleEntries = Map.empty<ScheduleId, ScheduleEntry>();

  public shared ({ caller }) func createScheduleEntry(title : Text, dayOfWeek : DayOfWeek, startTime : Nat, endTime : Nat, notes : Text) : async ScheduleId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create schedule entries");
    };
    let entryId = nextScheduleId;
    let entry : ScheduleEntry = {
      id = entryId;
      title;
      dayOfWeek;
      startTime;
      endTime;
      notes;
    };
    scheduleEntries.add(entryId, entry);
    nextScheduleId += 1;
    entryId;
  };

  public shared ({ caller }) func updateScheduleEntry(entryId : ScheduleId, title : Text, dayOfWeek : DayOfWeek, startTime : Nat, endTime : Nat, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update schedule entries");
    };
    switch (scheduleEntries.get(entryId)) {
      case (null) { Runtime.trap("Schedule entry not found") };
      case (?_) {
        let entry : ScheduleEntry = {
          id = entryId;
          title;
          dayOfWeek;
          startTime;
          endTime;
          notes;
        };
        scheduleEntries.add(entryId, entry);
      };
    };
  };

  public shared ({ caller }) func deleteScheduleEntry(entryId : ScheduleId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete schedule entries");
    };
    if (not scheduleEntries.containsKey(entryId)) { Runtime.trap("Schedule entry not found") };
    scheduleEntries.remove(entryId);
  };

  public query ({ caller }) func getScheduleEntry(entryId : ScheduleId) : async ScheduleEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view schedule entries");
    };
    switch (scheduleEntries.get(entryId)) {
      case (null) { Runtime.trap("Schedule entry not found") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func getAllScheduleEntries() : async [ScheduleEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view schedule entries");
    };
    scheduleEntries.values().toArray().sort();
  };

  // NOTES

  type NoteId = Nat;
  var nextNoteId = 0;

  type Note = {
    id : NoteId;
    title : Text;
    body : Text;
    timestamp : Time.Time;
  };

  module Note {
    public func compare(note1 : Note, note2 : Note) : Order.Order {
      Nat.compare(note1.id, note2.id);
    };
  };

  let notes = Map.empty<NoteId, Note>();

  public shared ({ caller }) func createNote(title : Text, body : Text) : async NoteId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create notes");
    };
    let noteId = nextNoteId;
    let note : Note = {
      id = noteId;
      title;
      body;
      timestamp = Time.now();
    };
    notes.add(noteId, note);
    nextNoteId += 1;
    noteId;
  };

  public shared ({ caller }) func updateNote(noteId : NoteId, title : Text, body : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update notes");
    };
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note not found") };
      case (?existingNote) {
        let updatedNote : Note = {
          id = noteId;
          title;
          body;
          timestamp = existingNote.timestamp;
        };
        notes.add(noteId, updatedNote);
      };
    };
  };

  public shared ({ caller }) func deleteNote(noteId : NoteId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete notes");
    };
    if (not notes.containsKey(noteId)) { Runtime.trap("Note not found") };
    notes.remove(noteId);
  };

  public query ({ caller }) func getNote(noteId : NoteId) : async Note {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notes");
    };
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) { note };
    };
  };

  public query ({ caller }) func getAllNotes() : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notes");
    };
    notes.values().toArray().sort();
  };

  // WORK ENTRIES

  type WorkEntryId = Nat;
  var nextWorkEntryId = 0;

  type WorkEntry = {
    id : WorkEntryId;
    workerName : Text;
    date : Text; // YYYY-MM-DD format
    workType : Text;
    startTime : Nat; // Minutes since midnight
    endTime : Nat; // Minutes since midnight
    hoursWorked : Float;
    dailyPayment : Float;
    notes : Text;
    createdAt : Time.Time;
  };

  module WorkEntry {
    public func compare(entry1 : WorkEntry, entry2 : WorkEntry) : Order.Order {
      Nat.compare(entry1.id, entry2.id);
    };
  };

  let workEntries = Map.empty<WorkEntryId, WorkEntry>();

  public shared ({ caller }) func createWorkEntry(workerName : Text, date : Text, workType : Text, startTime : Nat, endTime : Nat, hoursWorked : Float, dailyPayment : Float, notes : Text) : async WorkEntryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create work entries");
    };
    let entryId = nextWorkEntryId;
    let entry : WorkEntry = {
      id = entryId;
      workerName;
      date;
      workType;
      startTime;
      endTime;
      hoursWorked;
      dailyPayment;
      notes;
      createdAt = Time.now();
    };
    workEntries.add(entryId, entry);
    nextWorkEntryId += 1;
    entryId;
  };

  public shared ({ caller }) func updateWorkEntry(entryId : WorkEntryId, workerName : Text, date : Text, workType : Text, startTime : Nat, endTime : Nat, hoursWorked : Float, dailyPayment : Float, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update work entries");
    };
    switch (workEntries.get(entryId)) {
      case (null) { Runtime.trap("Work entry not found") };
      case (?existingEntry) {
        let updatedEntry : WorkEntry = {
          id = entryId;
          workerName;
          date;
          workType;
          startTime;
          endTime;
          hoursWorked;
          dailyPayment;
          notes;
          createdAt = existingEntry.createdAt;
        };
        workEntries.add(entryId, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func deleteWorkEntry(entryId : WorkEntryId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete work entries");
    };
    if (not workEntries.containsKey(entryId)) { Runtime.trap("Work entry not found") };
    workEntries.remove(entryId);
  };

  public query ({ caller }) func getWorkEntry(entryId : WorkEntryId) : async WorkEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view work entries");
    };
    switch (workEntries.get(entryId)) {
      case (null) { Runtime.trap("Work entry not found") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func getAllWorkEntries() : async [WorkEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view work entries");
    };
    workEntries.values().toArray().sort();
  };

  public query ({ caller }) func getWorkEntriesByDate(date : Text) : async [WorkEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view work entries");
    };
    workEntries.values().toArray().filter(
      func(entry) {
        entry.date == date;
      }
    ).sort();
  };

  public query ({ caller }) func getWorkEntriesByWorker(workerName : Text) : async [WorkEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view work entries");
    };
    workEntries.values().toArray().filter(
      func(entry) {
        entry.workerName == workerName;
      }
    ).sort();
  };

  public query ({ caller }) func getWorkEntriesByDateRange(fromDate : Text, toDate : Text) : async [WorkEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view work entries");
    };
    workEntries.values().toArray().filter(
      func(entry) {
        entry.date >= fromDate and entry.date <= toDate;
      }
    ).sort();
  };

  // JOB BOARD

  type JobPostingId = Nat;
  var nextJobPostingId = 0;

  type JobStatus = {
    #available;
    #assigned;
    #completed;
    #deleted;
  };

  type JobPosting = {
    id : JobPostingId;
    title : Text;
    description : Text;
    date : Text;
    startTime : Int;
    endTime : Int;
    paymentAmount : Float;
    address : Text;
    status : JobStatus;
    assignedWorkerName : Text;
    assignedWorkerPhone : Text;
    assignedWorkerAddress : Text;
    createdAt : Time.Time;
  };

  let jobPostings = Map.empty<JobPostingId, JobPosting>();

  public shared ({ caller }) func createJobPosting(title : Text, description : Text, date : Text, startTime : Int, endTime : Int, paymentAmount : Float, address : Text) : async JobPostingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create job postings");
    };
    let jobId = nextJobPostingId;
    let job : JobPosting = {
      id = jobId;
      title;
      description;
      date;
      startTime;
      endTime;
      paymentAmount;
      address;
      status = #available;
      assignedWorkerName = "";
      assignedWorkerPhone = "";
      assignedWorkerAddress = "";
      createdAt = Time.now();
    };
    jobPostings.add(jobId, job);
    nextJobPostingId += 1;
    jobId;
  };

  public query ({ caller }) func getAvailableJobPostings() : async [JobPosting] {
    // Public access - anyone can view available jobs
    jobPostings.values().toArray().filter(
      func(job) {
        job.status == #available;
      }
    );
  };

  public query ({ caller }) func getAllJobPostings() : async [JobPosting] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all job postings");
    };
    jobPostings.values().toArray();
  };

  public query ({ caller }) func getAssignedJobPostings() : async [JobPosting] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assigned job postings");
    };
    jobPostings.values().toArray().filter(
      func(job) {
        job.status == #assigned;
      }
    );
  };

  public shared ({ caller }) func assignJobPosting(id : JobPostingId, workerName : Text, workerPhone : Text, workerAddress : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can assign job postings");
    };
    switch (jobPostings.get(id)) {
      case (null) { false };
      case (?job) {
        switch (job.status) {
          case (#assigned or #completed or #deleted) { false };
          case (#available) {
            let updatedJob : JobPosting = {
              id = job.id;
              title = job.title;
              description = job.description;
              date = job.date;
              startTime = job.startTime;
              endTime = job.endTime;
              paymentAmount = job.paymentAmount;
              address = job.address;
              status = #assigned;
              assignedWorkerName = workerName;
              assignedWorkerPhone = workerPhone;
              assignedWorkerAddress = workerAddress;
              createdAt = job.createdAt;
            };
            jobPostings.add(id, updatedJob);
            true;
          };
        };
      };
    };
  };

  public shared ({ caller }) func completeJobPosting(id : JobPostingId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete job postings");
    };
    switch (jobPostings.get(id)) {
      case (null) { false };
      case (?job) {
        switch (job.status) {
          case (#completed or #deleted or #available) { false };
          case (#assigned) {
            let updatedJob : JobPosting = {
              id = job.id;
              title = job.title;
              description = job.description;
              date = job.date;
              startTime = job.startTime;
              endTime = job.endTime;
              paymentAmount = job.paymentAmount;
              address = job.address;
              status = #completed;
              assignedWorkerName = job.assignedWorkerName;
              assignedWorkerPhone = job.assignedWorkerPhone;
              assignedWorkerAddress = job.assignedWorkerAddress;
              createdAt = job.createdAt;
            };
            jobPostings.add(id, updatedJob);
            true;
          };
        };
      };
    };
  };

  // JOB PREFERENCES

  type JobPreferenceStatus = {
    #interested;
    #notInterested;
  };

  type JobPreference = {
    workerId : Text;
    jobId : JobPostingId;
    status : JobPreferenceStatus;
  };

  // Key: workerId # "_" # jobId
  let jobPreferences = Map.empty<Text, JobPreference>();

  public shared ({ caller }) func setJobPreference(workerId : Text, jobId : JobPostingId, interested : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set job preferences");
    };
    let key = workerId # "_" # jobId.toText();
    let pref : JobPreference = {
      workerId;
      jobId;
      status = if (interested) { #interested } else { #notInterested };
    };
    jobPreferences.add(key, pref);
  };

  public query ({ caller }) func getNotInterestedJobIds(workerId : Text) : async [JobPostingId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view job preferences");
    };
    jobPreferences.values().toArray().filter(
      func(pref : JobPreference) : Bool {
        pref.workerId == workerId and pref.status == #notInterested;
      }
    ).map(func(pref : JobPreference) : JobPostingId { pref.jobId });
  };

  // NOTIFICATIONS

  type NotificationId = Nat;
  var nextNotificationId = 0;

  type Notification = {
    id : NotificationId;
    title : Text;
    message : Text;
    notificationType : Text;
    jobId : Nat;
    timestamp : Time.Time;
    isRead : Bool;
  };

  let notifications = Map.empty<NotificationId, Notification>();

  public shared ({ caller }) func createNotification(title : Text, message : Text, notificationType : Text, jobId : Nat) : async NotificationId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create notifications");
    };
    let notifId = nextNotificationId;
    let notif : Notification = {
      id = notifId;
      title;
      message;
      notificationType;
      jobId;
      timestamp = Time.now();
      isRead = false;
    };
    notifications.add(notifId, notif);
    nextNotificationId += 1;
    notifId;
  };

  public query ({ caller }) func getAllNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    notifications.values().toArray().sort(func(a : Notification, b : Notification) : Order.Order {
      Nat.compare(a.id, b.id);
    });
  };

  public query ({ caller }) func getUnreadCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view unread count");
    };
    notifications.values().toArray().filter(func(n : Notification) : Bool { not n.isRead }).size();
  };

  public shared ({ caller }) func markNotificationRead(id : NotificationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    switch (notifications.get(id)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?n) {
        let updated : Notification = {
          id = n.id;
          title = n.title;
          message = n.message;
          notificationType = n.notificationType;
          jobId = n.jobId;
          timestamp = n.timestamp;
          isRead = true;
        };
        notifications.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    for ((id, n) in notifications.entries()) {
      let updated : Notification = {
        id = n.id;
        title = n.title;
        message = n.message;
        notificationType = n.notificationType;
        jobId = n.jobId;
        timestamp = n.timestamp;
        isRead = true;
      };
      notifications.add(id, updated);
    };
  };

  public shared ({ caller }) func deleteNotification(id : NotificationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete notifications");
    };
    if (not notifications.containsKey(id)) { Runtime.trap("Notification not found") };
    notifications.remove(id);
  };

  /////////////////////////////////////
  // ** NEW MODULES BELOW **

  // JOB VACANCIES

  type JobVacancyId = Nat;
  type JobVacancyStatus = {
    #open;
    #closed;
  };

  type JobVacancy = {
    id : JobVacancyId;
    title : Text;
    companyName : Text;
    category : Text;
    salary : ?Text;
    location : Text;
    description : Text;
    status : JobVacancyStatus;
    postedAt : Time.Time;
  };

  let jobVacancies = Map.empty<JobVacancyId, JobVacancy>();
  var nextVacancyId = 0;

  public shared ({ caller }) func createJobVacancy(title : Text, companyName : Text, category : Text, salary : ?Text, location : Text, description : Text) : async JobVacancyId {
    let id = nextVacancyId;
    let vacancy : JobVacancy = {
      id;
      title;
      companyName;
      category;
      salary;
      location;
      description;
      status = #open;
      postedAt = Time.now();
    };
    jobVacancies.add(id, vacancy);
    nextVacancyId += 1;
    id;
  };

  public query ({ caller }) func getOpenJobVacancies() : async [JobVacancy] {
    // Public access - anyone can view open vacancies
    jobVacancies.values().toArray().filter(
      func(vacancy) {
        vacancy.status == #open;
      }
    );
  };

  public query ({ caller }) func getAllJobVacancies() : async [JobVacancy] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all job vacancies");
    };
    jobVacancies.values().toArray();
  };

  public query ({ caller }) func getJobVacanciesByCategory(category : Text) : async [JobVacancy] {
    // Public access - anyone can search by category
    jobVacancies.values().toArray().filter(
      func(vacancy) {
        vacancy.category == category;
      }
    );
  };

  public query ({ caller }) func getJobVacanciesByLocation(location : Text) : async [JobVacancy] {
    // Public access - anyone can search by location
    jobVacancies.values().toArray().filter(
      func(vacancy) {
        vacancy.location == location;
      }
    );
  };

  public shared ({ caller }) func closeJobVacancy(id : JobVacancyId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can close job vacancies");
    };
    switch (jobVacancies.get(id)) {
      case (null) { Runtime.trap("Job vacancy not found") };
      case (?vacancy) {
        let updated : JobVacancy = {
          id = vacancy.id;
          title = vacancy.title;
          companyName = vacancy.companyName;
          category = vacancy.category;
          salary = vacancy.salary;
          location = vacancy.location;
          description = vacancy.description;
          status = #closed;
          postedAt = vacancy.postedAt;
        };
        jobVacancies.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteJobVacancy(id : JobVacancyId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete job vacancies");
    };
    if (not jobVacancies.containsKey(id)) {
      Runtime.trap("Job vacancy not found");
    };
    jobVacancies.remove(id);
  };

  // JOB APPLICATIONS

  type JobApplicationId = Nat;

  type JobApplication = {
    id : JobApplicationId;
    vacancyId : JobVacancyId;
    applicantName : Text;
    applicantPhone : Text;
    appliedAt : Time.Time;
  };

  let jobApplications = Map.empty<JobApplicationId, JobApplication>();
  var nextApplicationId = 0;

  public shared ({ caller }) func applyToVacancy(vacancyId : JobVacancyId, applicantName : Text, applicantPhone : Text) : async JobApplicationId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply to vacancies");
    };
    switch (jobVacancies.get(vacancyId)) {
      case (null) {
        Runtime.trap("Job vacancy not found");
      };
      case (?vacancy) {
        if (vacancy.status == #closed) {
          Runtime.trap("Cannot apply to a closed vacancy");
        };
      };
    };

    let id = nextApplicationId;
    let application : JobApplication = {
      id;
      vacancyId;
      applicantName;
      applicantPhone;
      appliedAt = Time.now();
    };
    jobApplications.add(id, application);
    nextApplicationId += 1;
    id;
  };

  public query ({ caller }) func getApplicationsForVacancy(vacancyId : JobVacancyId) : async [JobApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view applications");
    };
    jobApplications.values().toArray().filter(
      func(app) {
        app.vacancyId == vacancyId;
      }
    );
  };

  // RENTAL PROPERTIES

  type RentalPropertyId = Nat;

  type RentalStatus = {
    #available;
    #rented;
  };

  type RentalProperty = {
    id : RentalPropertyId;
    title : Text;
    description : Text;
    location : Text;
    pricePerMonth : Float;
    numberOfRooms : Nat;
    contactPhone : Text;
    ownerName : Text;
    status : RentalStatus;
    createdAt : Time.Time;
  };

  let rentals = Map.empty<RentalPropertyId, RentalProperty>();
  var nextRentalId = 0;

  public shared ({ caller }) func createRentalProperty(title : Text, description : Text, location : Text, pricePerMonth : Float, numberOfRooms : Nat, contactPhone : Text, ownerName : Text) : async RentalPropertyId {
    let id = nextRentalId;
    let property : RentalProperty = {
      id;
      title;
      description;
      location;
      pricePerMonth;
      numberOfRooms;
      contactPhone;
      ownerName;
      status = #available;
      createdAt = Time.now();
    };
    rentals.add(id, property);
    nextRentalId += 1;
    id;
  };

  public query ({ caller }) func getAvailableRentals() : async [RentalProperty] {
    // Public access - anyone can view available rentals
    rentals.values().toArray().filter(
      func(rental) {
        rental.status == #available;
      }
    );
  };

  public query ({ caller }) func getAllRentals() : async [RentalProperty] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all rentals");
    };
    rentals.values().toArray();
  };

  public query ({ caller }) func getRentalsByLocation(location : Text) : async [RentalProperty] {
    // Public access - anyone can search by location
    rentals.values().toArray().filter(
      func(rental) {
        rental.location == location;
      }
    );
  };

  public shared ({ caller }) func updateRentalStatus(id : RentalPropertyId, status : RentalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update rental status");
    };
    switch (rentals.get(id)) {
      case (null) { Runtime.trap("Rental property not found") };
      case (?rental) {
        let updated : RentalProperty = {
          id = rental.id;
          title = rental.title;
          description = rental.description;
          location = rental.location;
          pricePerMonth = rental.pricePerMonth;
          numberOfRooms = rental.numberOfRooms;
          contactPhone = rental.contactPhone;
          ownerName = rental.ownerName;
          status;
          createdAt = rental.createdAt;
        };
        rentals.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteRentalProperty(id : RentalPropertyId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete rental properties");
    };
    if (not rentals.containsKey(id)) {
      Runtime.trap("Rental property not found");
    };
    rentals.remove(id);
  };

  ////////////////////////////////////////
  // WORKER MODULE

  type WorkerId = Nat;
  var nextWorkerId = 0;

  type WorkerStatus = {
    #active;
    #inactive;
    #blocked;
  };

  type WorkerProfile = {
    id : WorkerId;
    userId : Nat;
    name : Text;
    profession : Text;
    phone : Text;
    rating : Float;
    location : Text;
    latitude : Float;
    longitude : Float;
    status : WorkerStatus;
    createdAt : Time.Time;
  };

  let workers = Map.empty<WorkerId, WorkerProfile>();

  public shared ({ caller }) func createWorkerProfile(userId : Nat, name : Text, profession : Text, phone : Text, rating : Float, location : Text, latitude : Float, longitude : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create worker profiles");
    };
    let workerId = nextWorkerId;
    let profile : WorkerProfile = {
      id = workerId;
      userId;
      name;
      profession;
      phone;
      rating;
      location;
      latitude;
      longitude;
      status = #active;
      createdAt = Time.now();
    };
    workers.add(workerId, profile);
    nextWorkerId += 1;
    workerId;
  };

  public shared ({ caller }) func setWorkerStatus(workerId : Nat, status : WorkerStatus) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set worker status");
    };
    switch (workers.get(workerId)) {
      case (null) { false };
      case (?worker) {
        let updated : WorkerProfile = {
          id = workerId;
          userId = worker.userId;
          name = worker.name;
          profession = worker.profession;
          phone = worker.phone;
          rating = worker.rating;
          location = worker.location;
          latitude = worker.latitude;
          longitude = worker.longitude;
          status;
          createdAt = worker.createdAt;
        };
        workers.add(workerId, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func updateWorkerStatus(workerId : WorkerId, active : Bool) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update worker status");
    };
    switch (workers.get(workerId)) {
      case (null) { false };
      case (?worker) {
        if (worker.status == #blocked) { return false };
        let newStatus = if (active) { #active } else { #inactive };
        let updated : WorkerProfile = {
          id = workerId;
          userId = worker.userId;
          name = worker.name;
          profession = worker.profession;
          phone = worker.phone;
          rating = worker.rating;
          location = worker.location;
          latitude = worker.latitude;
          longitude = worker.longitude;
          status = newStatus;
          createdAt = worker.createdAt;
        };
        workers.add(workerId, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func updateWorkerLocation(workerId : WorkerId, latitude : Float, longitude : Float) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update worker location");
    };
    switch (workers.get(workerId)) {
      case (null) { false };
      case (?worker) {
        let updated : WorkerProfile = {
          id = workerId;
          userId = worker.userId;
          name = worker.name;
          profession = worker.profession;
          phone = worker.phone;
          rating = worker.rating;
          location = worker.location;
          latitude;
          longitude;
          status = worker.status;
          createdAt = worker.createdAt;
        };
        workers.add(workerId, updated);
        true;
      };
    };
  };

  public query ({ caller }) func getActiveWorkers() : async [WorkerProfile] {
    // Public access - anyone can view active workers
    workers.values().toArray().filter(
      func(worker) {
        worker.status == #active;
      }
    );
  };

  public query ({ caller }) func getAllWorkerProfiles() : async [WorkerProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all worker profiles");
    };
    workers.values().toArray();
  };

  public query ({ caller }) func getWorkerProfileByUserId(userId : Nat) : async ?WorkerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view worker profiles");
    };
    for ((id, worker) in workers.entries()) {
      if (worker.userId == userId) {
        return ?worker;
      };
    };
    null;
  };

  ///////////////////////////////
  /// OTP VERIFICATION MODULE ///
  ///////////////////////////////

  type OtpRecord = {
    phone : Text;
    otp : Text;
    createdAt : Time.Time;
    used : Bool;
  };

  let otpRecords = Map.empty<Text, OtpRecord>();

  // Public - OTP generation doesn't require auth
  public shared ({ caller }) func generateOtp(phone : Text) : async Text {
    let seed : Time.Time = Time.now();
    let codeInt = ((seed % 900_000_000_000_000) / 1_234_567) % 1_000_000;
    let code = codeInt.toText();
    let paddedCode = if (code.size() < 6) { "0" # code } else { code };

    let otpRecord : OtpRecord = {
      phone;
      otp = paddedCode;
      createdAt = seed;
      used = false;
    };
    otpRecords.add(phone, otpRecord);

    paddedCode;
  };

  // Public - OTP verification doesn't require auth
  public shared ({ caller }) func verifyOtp(phone : Text, otp : Text) : async Bool {
    switch (otpRecords.get(phone)) {
      case (null) { false };
      case (?record) {
        if (record.used) { return false };
        if (record.otp != otp) { return false };
        let now = Time.now();
        let age = now - record.createdAt;
        let fiveMinutesNanos = 5 * 60 * 1_000_000_000;

        if (age > fiveMinutesNanos) { return false };
        let updated : OtpRecord = {
          phone = record.phone;
          otp = record.otp;
          createdAt = record.createdAt;
          used = true;
        };
        otpRecords.add(phone, updated);
        true;
      };
    };
  };

  /////////////////////////
  /// BOOKING SYSTEM //////
  /////////////////////////

  type BookingStatus = {
    #pending;
    #accepted;
    #rejected;
    #cancelled;
  };

  type Booking = {
    id : BookingId;
    userId : Nat;
    workerId : Nat;
    workerName : Text;
    serviceType : Text;
    note : Text;
    status : BookingStatus;
    createdAt : Time.Time;
  };

  type BookingId = Nat;
  var nextBookingId = 0;

  let bookings = Map.empty<BookingId, Booking>();

  public shared ({ caller }) func createBooking(userId : Nat, workerId : Nat, workerName : Text, serviceType : Text, note : Text) : async BookingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };
    let bookingId = nextBookingId;
    let booking : Booking = {
      id = bookingId;
      userId;
      workerId;
      workerName;
      serviceType;
      note;
      status = #pending;
      createdAt = Time.now();
    };
    bookings.add(bookingId, booking);
    nextBookingId += 1;
    bookingId;
  };

  public query ({ caller }) func getBookingsForWorker(workerId : Nat) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    bookings.values().toArray().filter(
      func(b) { b.workerId == workerId }
    );
  };

  public query ({ caller }) func getBookingsForUser(userId : Nat) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    bookings.values().toArray().filter(
      func(b) { b.userId == userId }
    );
  };

  public shared ({ caller }) func acceptBooking(id : BookingId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept bookings");
    };
    switch (bookings.get(id)) {
      case (null) { false };
      case (?booking) {
        let updated : Booking = {
          id = booking.id;
          userId = booking.userId;
          workerId = booking.workerId;
          workerName = booking.workerName;
          serviceType = booking.serviceType;
          note = booking.note;
          status = #accepted;
          createdAt = booking.createdAt;
        };
        bookings.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func rejectBooking(id : BookingId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject bookings");
    };
    switch (bookings.get(id)) {
      case (null) { false };
      case (?booking) {
        let updated : Booking = {
          id = booking.id;
          userId = booking.userId;
          workerId = booking.workerId;
          workerName = booking.workerName;
          serviceType = booking.serviceType;
          note = booking.note;
          status = #rejected;
          createdAt = booking.createdAt;
        };
        bookings.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func cancelBooking(id : BookingId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel bookings");
    };
    switch (bookings.get(id)) {
      case (null) { false };
      case (?booking) {
        let updated : Booking = {
          id = booking.id;
          userId = booking.userId;
          workerId = booking.workerId;
          workerName = booking.workerName;
          serviceType = booking.serviceType;
          note = booking.note;
          status = #cancelled;
          createdAt = booking.createdAt;
        };
        bookings.add(id, updated);
        true;
      };
    };
  };
};
