import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Save, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Note,
  useCreateNote,
  useDeleteNote,
  useGetAllNotes,
  useUpdateNote,
} from "../hooks/useQueries";

export default function Notes() {
  const { data: notes, isLoading } = useGetAllNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const [editNote, setEditNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createNote.mutateAsync({
      title: newTitle.trim(),
      body: newBody.trim(),
    });
    toast.success("Note created");
    setNewTitle("");
    setNewBody("");
    setShowCreate(false);
  };

  const handleOpenEdit = (note: Note) => {
    setEditNote(note);
    setEditTitle(note.title);
    setEditBody(note.body);
  };

  const handleSaveEdit = async () => {
    if (!editNote || !editTitle.trim()) return;
    await updateNote.mutateAsync({
      id: editNote.id,
      title: editTitle.trim(),
      body: editBody.trim(),
    });
    toast.success("Note saved");
    setEditNote(null);
  };

  const handleDelete = async (id: bigint, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNote.mutateAsync(id);
    toast.success("Note deleted");
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-700">Notes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {notes?.length ?? 0} notes saved
          </p>
        </div>
        <Button
          data-ocid="notes.add_button"
          onClick={() => setShowCreate(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="font-display">New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Input
                placeholder="Note title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                autoFocus
                className="bg-background/60"
              />
              <Textarea
                placeholder="Write your note here..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={6}
                className="bg-background/60 resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="notes.submit_button"
                type="submit"
                disabled={createNote.isPending || !newTitle.trim()}
              >
                {createNote.isPending ? "Saving..." : "Save Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editNote}
        onOpenChange={(open) => !open && setEditNote(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-background/60"
              autoFocus
            />
            <Textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={8}
              className="bg-background/60 resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditNote(null)}
            >
              <X className="w-4 h-4 mr-1" /> Discard
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={updateNote.isPending || !editTitle.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              {updateNote.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (notes ?? []).length === 0 ? (
        <div
          data-ocid="notes.empty_state"
          className="glass-card rounded-xl p-16 text-center"
        >
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-600 text-foreground">No notes yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first note to get started
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(notes ?? []).map((note, idx) => (
              <motion.div
                key={note.id.toString()}
                data-ocid={`notes.item.${idx + 1}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleOpenEdit(note)}
                className="glass-card rounded-xl p-5 cursor-pointer group hover:border-primary/30 transition-colors relative flex flex-col gap-2 min-h-[140px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-600 text-foreground line-clamp-1 flex-1">
                    {note.title}
                  </h3>
                  <button
                    type="button"
                    data-ocid={`notes.delete_button.${idx + 1}`}
                    onClick={(e) => handleDelete(note.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0 p-1 rounded"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                  {note.body || <span className="italic">Empty note</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-auto">
                  {formatDate(note.timestamp)}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
