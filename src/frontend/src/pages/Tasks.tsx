import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Priority,
  useCreateTask,
  useDeleteTask,
  useGetAllTasks,
  useUpdateTask,
} from "../hooks/useQueries";

const PRIORITY_CONFIG = {
  high: { label: "High", className: "priority-high border" },
  medium: { label: "Medium", className: "priority-medium border" },
  low: { label: "Low", className: "priority-low border" },
};

export default function Tasks() {
  const { data: tasks, isLoading } = useGetAllTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.medium);
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const dueDateBigInt = dueDate
      ? BigInt(new Date(dueDate).getTime() * 1_000_000)
      : null;
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDateBigInt,
    });
    toast.success("Task created");
    setTitle("");
    setDescription("");
    setPriority(Priority.medium);
    setDueDate("");
    setShowForm(false);
  };

  const handleToggle = async (
    task: NonNullable<ReturnType<typeof useGetAllTasks>["data"]>[0],
  ) => {
    await updateTask.mutateAsync({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      completed: !task.completed,
    });
  };

  const handleDelete = async (id: bigint) => {
    await deleteTask.mutateAsync(id);
    toast.success("Task deleted");
  };

  const filteredTasks = (tasks ?? []).filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-700">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tasks?.length ?? 0} total ·{" "}
            {tasks?.filter((t) => !t.completed).length ?? 0} pending
          </p>
        </div>
        <Button
          data-ocid="tasks.add_button"
          onClick={() => setShowForm((v) => !v)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form
              onSubmit={handleSubmit}
              className="glass-card rounded-xl p-5 space-y-4"
            >
              <h2 className="font-display font-600 text-sm uppercase tracking-wider text-muted-foreground">
                New Task
              </h2>
              <Input
                data-ocid="tasks.input"
                placeholder="Task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                className="bg-background/60"
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="bg-background/60 resize-none"
              />
              <div className="flex gap-3 flex-wrap">
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as Priority)}
                >
                  <SelectTrigger className="w-36 bg-background/60">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Priority.high}>🔴 High</SelectItem>
                    <SelectItem value={Priority.medium}>🟡 Medium</SelectItem>
                    <SelectItem value={Priority.low}>🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-background/60"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="tasks.submit_button"
                  type="submit"
                  disabled={createTask.isPending || !title.trim()}
                >
                  {createTask.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 bg-muted/50 rounded-lg p-1 w-fit">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            type="button"
            data-ocid="tasks.filter.tab"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md text-sm font-500 transition-colors capitalize ${
              filter === f
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div
          data-ocid="tasks.empty_state"
          className="glass-card rounded-xl p-10 text-center"
        >
          <p className="text-muted-foreground">No tasks here.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add a task to get started.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id.toString()}
                data-ocid={`tasks.item.${idx + 1}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`glass-card rounded-xl p-4 flex items-start gap-3 group transition-opacity ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  data-ocid={`tasks.checkbox.${idx + 1}`}
                  onClick={() => handleToggle(task)}
                  className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={
                    task.completed ? "Mark incomplete" : "Mark complete"
                  }
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`font-600 text-foreground truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </p>
                    <Badge
                      className={`text-xs px-2 py-0 ${PRIORITY_CONFIG[task.priority].className}`}
                    >
                      {PRIORITY_CONFIG[task.priority].label}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {task.description}
                    </p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due{" "}
                      {new Date(
                        Number(task.dueDate) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  data-ocid={`tasks.delete_button.${idx + 1}`}
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(task.id)}
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
