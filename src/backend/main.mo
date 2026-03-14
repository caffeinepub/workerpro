import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";

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
};
