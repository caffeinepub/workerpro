import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Float "mo:core/Float";

actor {
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
    if (not tasks.containsKey(taskId)) { Runtime.trap("Task not found") };
    tasks.remove(taskId);
  };

  public query ({ caller }) func getTask(taskId : TaskId) : async Task {
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
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
    if (not scheduleEntries.containsKey(entryId)) { Runtime.trap("Schedule entry not found") };
    scheduleEntries.remove(entryId);
  };

  public query ({ caller }) func getScheduleEntry(entryId : ScheduleId) : async ScheduleEntry {
    switch (scheduleEntries.get(entryId)) {
      case (null) { Runtime.trap("Schedule entry not found") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func getAllScheduleEntries() : async [ScheduleEntry] {
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
    if (not notes.containsKey(noteId)) { Runtime.trap("Note not found") };
    notes.remove(noteId);
  };

  public query ({ caller }) func getNote(noteId : NoteId) : async Note {
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) { note };
    };
  };

  public query ({ caller }) func getAllNotes() : async [Note] {
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
    if (not workEntries.containsKey(entryId)) { Runtime.trap("Work entry not found") };
    workEntries.remove(entryId);
  };

  public query ({ caller }) func getWorkEntry(entryId : WorkEntryId) : async WorkEntry {
    switch (workEntries.get(entryId)) {
      case (null) { Runtime.trap("Work entry not found") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func getAllWorkEntries() : async [WorkEntry] {
    workEntries.values().toArray().sort();
  };

  public query ({ caller }) func getWorkEntriesByDate(date : Text) : async [WorkEntry] {
    workEntries.values().toArray().filter(
      func(entry) {
        entry.date == date;
      }
    ).sort();
  };

  public query ({ caller }) func getWorkEntriesByWorker(workerName : Text) : async [WorkEntry] {
    workEntries.values().toArray().filter(
      func(entry) {
        entry.workerName == workerName;
      }
    ).sort();
  };

  public query ({ caller }) func getWorkEntriesByDateRange(fromDate : Text, toDate : Text) : async [WorkEntry] {
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
    jobPostings.values().toArray().filter(
      func(job) {
        job.status == #available;
      }
    );
  };

  public query ({ caller }) func getAvailableJobPostingsForWorker(workerId : Text) : async [JobPosting] {
    let notInterestedIds = jobPreferences.values().toArray().filter(
      func(pref : JobPreference) : Bool {
        pref.workerId == workerId and pref.status == #notInterested;
      }
    );
    jobPostings.values().toArray().filter(
      func(job : JobPosting) : Bool {
        if (job.status != #available) { return false };
        for (pref in notInterestedIds.vals()) {
          if (pref.jobId == job.id) { return false };
        };
        true;
      }
    );
  };

  public query ({ caller }) func getAssignedJobPostings() : async [JobPosting] {
    jobPostings.values().toArray().filter(
      func(job) {
        job.status == #assigned;
      }
    );
  };

  public query ({ caller }) func getAllJobPostings() : async [JobPosting] {
    jobPostings.values().toArray();
  };

  public shared ({ caller }) func assignJobPosting(id : JobPostingId, workerName : Text, workerPhone : Text, workerAddress : Text) : async Bool {
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

  public shared ({ caller }) func deleteJobPosting(id : JobPostingId) : async () {
    switch (jobPostings.get(id)) {
      case (null) { () };
      case (?jobEntry) {
        let updatedJob : JobPosting = {
          id = jobEntry.id;
          title = jobEntry.title;
          description = jobEntry.description;
          date = jobEntry.date;
          startTime = jobEntry.startTime;
          endTime = jobEntry.endTime;
          paymentAmount = jobEntry.paymentAmount;
          address = jobEntry.address;
          status = #deleted;
          assignedWorkerName = jobEntry.assignedWorkerName;
          assignedWorkerPhone = jobEntry.assignedWorkerPhone;
          assignedWorkerAddress = jobEntry.assignedWorkerAddress;
          createdAt = jobEntry.createdAt;
        };
        jobPostings.add(id, updatedJob);
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
    let key = workerId # "_" # jobId.toText();
    let pref : JobPreference = {
      workerId;
      jobId;
      status = if (interested) { #interested } else { #notInterested };
    };
    jobPreferences.add(key, pref);
  };

  public query ({ caller }) func getNotInterestedJobIds(workerId : Text) : async [JobPostingId] {
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
    notifications.values().toArray().sort(func(a : Notification, b : Notification) : Order.Order {
      Nat.compare(b.id, a.id);
    });
  };

  public query ({ caller }) func getUnreadCount() : async Nat {
    notifications.values().toArray().filter(func(n : Notification) : Bool { not n.isRead }).size();
  };

  public shared ({ caller }) func markNotificationRead(id : NotificationId) : async () {
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
    jobVacancies.values().toArray().filter(
      func(vacancy) {
        vacancy.status == #open;
      }
    );
  };

  public query ({ caller }) func getAllJobVacancies() : async [JobVacancy] {
    jobVacancies.values().toArray();
  };

  public query ({ caller }) func getJobVacanciesByCategory(category : Text) : async [JobVacancy] {
    jobVacancies.values().toArray().filter(
      func(vacancy) {
        vacancy.category == category;
      }
    );
  };

  public query ({ caller }) func getJobVacanciesByLocation(location : Text) : async [JobVacancy] {
    jobVacancies.values().toArray().filter(
      func(vacancy) {
        vacancy.location == location;
      }
    );
  };

  public shared ({ caller }) func closeJobVacancy(id : JobVacancyId) : async () {
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
    rentals.values().toArray().filter(
      func(rental) {
        rental.status == #available;
      }
    );
  };

  public query ({ caller }) func getAllRentals() : async [RentalProperty] {
    rentals.values().toArray();
  };

  public query ({ caller }) func getRentalsByLocation(location : Text) : async [RentalProperty] {
    rentals.values().toArray().filter(
      func(rental) {
        rental.location == location;
      }
    );
  };

  public shared ({ caller }) func updateRentalStatus(id : RentalPropertyId, status : RentalStatus) : async () {
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
    if (not rentals.containsKey(id)) {
      Runtime.trap("Rental property not found");
    };
    rentals.remove(id);
  };
};
