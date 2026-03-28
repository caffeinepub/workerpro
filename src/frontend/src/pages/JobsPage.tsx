import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Building2,
  CalendarDays,
  DollarSign,
  Edit,
  Eye,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateUserNotification } from "../hooks/useUserNotificationQueries";
import type { JobVacancy } from "../hooks/useVacancyQueries";
import {
  useApplyToVacancy,
  useCreateJobVacancy,
  useDeleteJobVacancy,
  useGetOpenJobVacancies,
  useGetUserApplications,
  useUpdateJobVacancy,
} from "../hooks/useVacancyQueries";
import type { UserSession } from "../hooks/useWorkerQueries";
import { uploadImageFile } from "../utils/imageUpload";

const CATEGORY_OPTIONS = [
  "All",
  "Painter",
  "Cleaner",
  "Plumber",
  "Carpenter",
  "Electrician",
  "General",
];

const CATEGORY_COLORS: Record<string, string> = {
  Painter: "bg-orange-100 text-orange-700",
  Cleaner: "bg-teal-100 text-teal-700",
  Plumber: "bg-blue-100 text-blue-700",
  Carpenter: "bg-amber-100 text-amber-700",
  Electrician: "bg-yellow-100 text-yellow-700",
  General: "bg-gray-100 text-gray-700",
};

const SAMPLE_VACANCIES: JobVacancy[] = [
  {
    id: BigInt(1),
    title: "Senior Electrician",
    companyName: "Bright Sparks Pvt. Ltd.",
    category: "Electrician",
    salary: "₹25,000–₹35,000/mo",
    location: "Koramangala, Bangalore",
    description:
      "Looking for an experienced electrician for residential wiring projects.",
    status: "open" as any,
    postedAt: BigInt(Date.now()),
    postedByUserId: BigInt(0),
    contactPhone: "+91 98765 43210",
  },
  {
    id: BigInt(2),
    title: "House Cleaner",
    companyName: "CleanHome Services",
    category: "Cleaner",
    salary: "₹12,000–₹18,000/mo",
    location: "Indiranagar, Bangalore",
    description:
      "Daily housekeeping tasks for residential apartments in central Bangalore.",
    status: "open" as any,
    postedAt: BigInt(Date.now()),
    postedByUserId: BigInt(0),
  },
  {
    id: BigInt(3),
    title: "Plumber – Pipe Fitter",
    companyName: "AquaFix Solutions",
    category: "Plumber",
    salary: "₹20,000/mo",
    location: "HSR Layout, Bangalore",
    description:
      "Handle plumbing installations and maintenance for commercial spaces.",
    status: "open" as any,
    postedAt: BigInt(Date.now()),
    postedByUserId: BigInt(0),
    contactPhone: "+91 91234 56789",
  },
  {
    id: BigInt(4),
    title: "Furniture Carpenter",
    companyName: "WoodCraft Studio",
    category: "Carpenter",
    location: "Whitefield, Bangalore",
    description:
      "Skilled carpenter needed for custom furniture creation and installation.",
    status: "open" as any,
    postedAt: BigInt(Date.now()),
    postedByUserId: BigInt(0),
  },
];

// ── Details Modal ─────────────────────────────────────────────────────────

function DetailsModal({
  vacancy,
  open,
  onClose,
}: {
  vacancy: JobVacancy | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!vacancy) return null;
  const postedDate = new Date(Number(vacancy.postedAt)).toLocaleDateString(
    "en-IN",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="jobs.details.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{vacancy.title}</DialogTitle>
        </DialogHeader>
        {(vacancy as any).imageUrl && (
          <img
            src={(vacancy as any).imageUrl}
            alt={vacancy.title}
            className="w-full h-40 object-cover rounded-xl"
          />
        )}
        <div className="space-y-3 pt-1 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span>{vacancy.companyName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{vacancy.location}</span>
          </div>
          {vacancy.salary && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              <span>{vacancy.salary}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="w-4 h-4 flex-shrink-0" />
            <span>Posted {postedDate}</span>
          </div>
          {vacancy.description && (
            <p className="text-foreground leading-relaxed pt-1">
              {vacancy.description}
            </p>
          )}
        </div>
        <Button
          data-ocid="jobs.details.close_button"
          variant="outline"
          className="w-full mt-2 rounded-full"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── Contact Modal ─────────────────────────────────────────────────────────

function ContactModal({
  vacancy,
  open,
  onClose,
}: {
  vacancy: JobVacancy | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!vacancy) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="jobs.contact.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Contact Employer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1 text-sm">
          <div>
            <p className="font-semibold text-foreground">{vacancy.title}</p>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span>{vacancy.companyName}</span>
            </div>
          </div>
          {vacancy.contactPhone ? (
            <div className="pt-2">
              <p className="text-muted-foreground mb-3">
                You can reach the employer directly at:
              </p>
              <Button
                data-ocid="jobs.contact.call_button"
                className="w-full rounded-full"
                onClick={() =>
                  window.open(`tel:${vacancy.contactPhone}`, "_self")
                }
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now: {vacancy.contactPhone}
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Contact {vacancy.companyName} directly for this position at{" "}
              {vacancy.location}.
            </p>
          )}
        </div>
        <Button
          data-ocid="jobs.contact.close_button"
          variant="outline"
          className="w-full mt-1 rounded-full"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────

function EditVacancyModal({
  vacancy,
  open,
  onClose,
  requestingUserId,
}: {
  vacancy: JobVacancy | null;
  open: boolean;
  onClose: () => void;
  requestingUserId: bigint;
}) {
  const [title, setTitle] = useState(vacancy?.title ?? "");
  const [company, setCompany] = useState(vacancy?.companyName ?? "");
  const [category, setCategory] = useState(vacancy?.category ?? "");
  const [location, setLocation] = useState(vacancy?.location ?? "");
  const [salary, setSalary] = useState(vacancy?.salary ?? "");
  const [description, setDescription] = useState(vacancy?.description ?? "");
  const updateMutation = useUpdateJobVacancy();

  const handleOpen = (v: JobVacancy | null) => {
    setTitle(v?.title ?? "");
    setCompany(v?.companyName ?? "");
    setCategory(v?.category ?? "");
    setLocation(v?.location ?? "");
    setSalary(v?.salary ?? "");
    setDescription(v?.description ?? "");
  };

  if (open && vacancy && title === "" && vacancy.title !== "") {
    handleOpen(vacancy);
  }

  const handleSubmit = async () => {
    if (
      !vacancy ||
      !title.trim() ||
      !company.trim() ||
      !category ||
      !location.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: vacancy.id,
        title: title.trim(),
        companyName: company.trim(),
        category,
        salary: salary.trim() || null,
        location: location.trim(),
        description: description.trim(),
        requestingUserId,
      });
      toast.success("Job vacancy updated successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to update job vacancy:", err);
      toast.error("Failed to update. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
        else if (vacancy) handleOpen(vacancy);
      }}
    >
      <DialogContent data-ocid="jobs.edit.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Job Vacancy</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="edit-title">Job Title *</Label>
            <Input
              id="edit-title"
              data-ocid="jobs.edit_title.input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Electrician"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-company">Company Name *</Label>
            <Input
              id="edit-company"
              data-ocid="jobs.edit_company.input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. ABC Services"
            />
          </div>
          <div className="space-y-1">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-ocid="jobs.edit_category.select">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.filter((c) => c !== "All").map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-location">Location *</Label>
            <Input
              id="edit-location"
              data-ocid="jobs.edit_location.input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Koramangala, Bangalore"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-salary">Salary (optional)</Label>
            <Input
              id="edit-salary"
              data-ocid="jobs.edit_salary.input"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. ₹20,000/mo"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              data-ocid="jobs.edit_description.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the role…"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              data-ocid="jobs.edit.cancel_button"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="jobs.edit.save_button"
              className="flex-1 rounded-full"
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Apply Modal ───────────────────────────────────────────────────────────

function ApplyModal({
  vacancy,
  open,
  onClose,
  session,
}: {
  vacancy: JobVacancy | null;
  open: boolean;
  onClose: () => void;
  session: UserSession | null;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const applyMutation = useApplyToVacancy();
  const createNotification = useCreateUserNotification();
  const applicantUserId = session?.userId ?? BigInt(0);

  const handleSubmit = async () => {
    if (!session) {
      toast.error("Please log in to apply for jobs");
      return;
    }
    if (!vacancy || !name.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await applyMutation.mutateAsync({
        vacancyId: vacancy.id,
        applicantUserId,
        applicantName: name.trim(),
        applicantPhone: phone.trim(),
      });
      // Notify the job owner
      if (vacancy.postedByUserId && vacancy.postedByUserId !== BigInt(0)) {
        try {
          await createNotification.mutateAsync({
            receiverUserId: vacancy.postedByUserId,
            senderUserId: applicantUserId,
            jobId: vacancy.id,
            title: "New Application Received",
            message: `${name.trim()} applied to your job: ${vacancy.title}`,
          });
        } catch (_notifErr) {
          console.error("Failed to send notification", _notifErr);
        }
      }
      toast.success("Application submitted successfully!");
      setName("");
      setPhone("");
      onClose();
    } catch (err) {
      console.error("Failed to submit application:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to submit application. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="jobs.apply.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Apply for {vacancy?.title ?? ""}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="applicant-name">Your Name</Label>
            <Input
              id="applicant-name"
              data-ocid="jobs.applicant_name.input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="applicant-phone">Phone Number</Label>
            <Input
              id="applicant-phone"
              data-ocid="jobs.applicant_phone.input"
              placeholder="Enter your phone number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button
            data-ocid="jobs.apply_submit.button"
            className="w-full rounded-full"
            onClick={handleSubmit}
            disabled={applyMutation.isPending}
          >
            {applyMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {applyMutation.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Job Vacancy Card ──────────────────────────────────────────────────────

function JobVacancyCard({
  vacancy,
  onApply,
  currentUserId,
  onDelete,
  onEdit,
  onViewDetails,
  onContact,
  hasApplied,
  index,
}: {
  vacancy: JobVacancy;
  onApply: (v: JobVacancy) => void;
  currentUserId?: bigint;
  onDelete?: (v: JobVacancy) => void;
  onEdit?: (v: JobVacancy) => void;
  onViewDetails?: (v: JobVacancy) => void;
  onContact?: (v: JobVacancy) => void;
  hasApplied?: boolean;
  index: number;
}) {
  const catColor =
    CATEGORY_COLORS[vacancy.category] ?? "bg-gray-100 text-gray-700";
  const isOwner =
    currentUserId !== undefined &&
    currentUserId === vacancy.postedByUserId &&
    currentUserId !== BigInt(0);
  const imageUrl = (vacancy as any).imageUrl as string | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="worker-card overflow-hidden"
      data-ocid={`jobs.item.${index + 1}`}
    >
      {/* Post image if available */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={vacancy.title}
          className="w-full h-36 object-cover"
        />
      )}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-sm text-foreground leading-tight">
                {vacancy.title}
              </h3>
              {isOwner && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 flex-shrink-0">
                  Your Post
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3" />
              <span>{vacancy.companyName}</span>
            </div>
          </div>
          <Badge
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 flex-shrink-0 ${catColor}`}
          >
            {vacancy.category}
          </Badge>
        </div>

        <div className="flex flex-col gap-1">
          {vacancy.salary && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
              <DollarSign className="w-3 h-3" />
              <span>{vacancy.salary}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{vacancy.location}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {isOwner ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-full text-xs"
              data-ocid={`jobs.view_details.button.${index + 1}`}
              onClick={() => onViewDetails?.(vacancy)}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-full text-xs"
              data-ocid={`jobs.edit_button.${index + 1}`}
              onClick={() => onEdit?.(vacancy)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 rounded-full text-xs"
              data-ocid={`jobs.delete_button.${index + 1}`}
              onClick={() => onDelete?.(vacancy)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {hasApplied ? (
              <div className="flex-1 flex items-center justify-center px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                Applied ✓
              </div>
            ) : (
              <Button
                size="sm"
                className="flex-1 rounded-full text-xs"
                data-ocid={`jobs.apply_button.${index + 1}`}
                onClick={() => onApply(vacancy)}
              >
                Apply Now
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-full text-xs"
              data-ocid={`jobs.view_details.button.${index + 1}`}
              onClick={() => onViewDetails?.(vacancy)}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs px-2.5"
              data-ocid={`jobs.contact_button.${index + 1}`}
              onClick={() => onContact?.(vacancy)}
            >
              <Phone className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Image Upload Field ────────────────────────────────────────────────────

function ImageUploadField({
  imageUrl,
  uploading,
  onSelect,
  onClear,
}: {
  imageUrl: string;
  uploading: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <Label>Post Image (optional)</Label>
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Post preview"
            className="w-full h-32 object-cover rounded-xl"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-ocid="jobs.image.upload_button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ImagePlus className="w-5 h-5" />
          )}
          <span className="text-xs">
            {uploading ? "Uploading..." : "Tap to add image"}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── Browse Jobs Tab ───────────────────────────────────────────────────────

function BrowseJobsTab({ session }: { session: UserSession | null }) {
  const { data: vacancies, isLoading } = useGetOpenJobVacancies();
  const { data: userApplications } = useGetUserApplications(session?.userId);
  const deleteMutation = useDeleteJobVacancy();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [detailVacancy, setDetailVacancy] = useState<JobVacancy | null>(null);
  const [applyVacancy, setApplyVacancy] = useState<JobVacancy | null>(null);
  const [contactVacancy, setContactVacancy] = useState<JobVacancy | null>(null);
  const [editVacancy, setEditVacancy] = useState<JobVacancy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobVacancy | null>(null);

  const currentUserId = session?.userId;
  const appliedJobIds = new Set(
    (userApplications ?? []).map((a) => String(a.vacancyId)),
  );

  const displayVacancies =
    vacancies && vacancies.length > 0 ? vacancies : SAMPLE_VACANCIES;

  const filtered = displayVacancies.filter((v) => {
    const matchesSearch =
      !search ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.companyName.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !currentUserId) return;
    try {
      await deleteMutation.mutateAsync({
        id: deleteTarget.id,
        requestingUserId: currentUserId,
      });
      toast.success("Job deleted.");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Failed to delete. Please try again.");
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          data-ocid="jobs.search_input"
          type="text"
          placeholder="Search by title, company, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat}
            type="button"
            data-ocid={`jobs.filter_${cat.toLowerCase()}.tab`}
            onClick={() => setCategoryFilter(cat)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="jobs.loading_state">
          {[1, 2].map((i) => (
            <div key={i} className="worker-card p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          data-ocid="jobs.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <Briefcase className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No jobs found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v, i) => (
            <JobVacancyCard
              key={String(v.id)}
              vacancy={v}
              index={i}
              currentUserId={currentUserId}
              hasApplied={appliedJobIds.has(String(v.id))}
              onApply={setApplyVacancy}
              onViewDetails={setDetailVacancy}
              onContact={setContactVacancy}
              onEdit={setEditVacancy}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <DetailsModal
        vacancy={detailVacancy}
        open={!!detailVacancy}
        onClose={() => setDetailVacancy(null)}
      />
      <ApplyModal
        vacancy={applyVacancy}
        open={!!applyVacancy}
        onClose={() => setApplyVacancy(null)}
        session={session}
      />
      <ContactModal
        vacancy={contactVacancy}
        open={!!contactVacancy}
        onClose={() => setContactVacancy(null)}
      />
      {editVacancy && currentUserId && (
        <EditVacancyModal
          vacancy={editVacancy}
          open={!!editVacancy}
          onClose={() => setEditVacancy(null)}
          requestingUserId={currentUserId}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="jobs.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title ?? ""}"?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="jobs.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="jobs.delete.confirm_button"
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Post Job Tab ──────────────────────────────────────────────────────────

function PostJobTab({ session }: { session: UserSession | null }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const createMutation = useCreateJobVacancy();

  const handleImageSelect = async (file: File) => {
    setUploadingImage(true);
    try {
      const url = await uploadImageFile(file);
      setImageUrl(url);
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !company.trim() || !category || !location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        companyName: company.trim(),
        category,
        salary: salary.trim() || null,
        location: location.trim(),
        description: description.trim(),
        postedByUserId: session?.userId ?? BigInt(0),
        contactPhone: contactPhone.trim() || null,
      });
      toast.success("Job vacancy posted successfully!");
      setTitle("");
      setCompany("");
      setCategory("");
      setLocation("");
      setSalary("");
      setDescription("");
      setContactPhone("");
      setImageUrl("");
    } catch (err) {
      console.error("Failed to post job vacancy:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to post. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-4">
      <ImageUploadField
        imageUrl={imageUrl}
        uploading={uploadingImage}
        onSelect={handleImageSelect}
        onClear={() => setImageUrl("")}
      />
      <div className="space-y-1.5">
        <Label htmlFor="job-title">Job Title *</Label>
        <Input
          id="job-title"
          data-ocid="jobs.post_title.input"
          placeholder="e.g. Senior Electrician"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="job-company">Company / Employer Name *</Label>
        <Input
          id="job-company"
          data-ocid="jobs.post_company.input"
          placeholder="e.g. ABC Services"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger data-ocid="jobs.post_category.select">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.filter((c) => c !== "All").map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="job-location">Location *</Label>
        <Input
          id="job-location"
          data-ocid="jobs.post_location.input"
          placeholder="e.g. Koramangala, Bangalore"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="job-salary">Salary (optional)</Label>
        <Input
          id="job-salary"
          data-ocid="jobs.post_salary.input"
          placeholder="e.g. ₹20,000/mo"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="job-phone">Contact Phone (optional)</Label>
        <Input
          id="job-phone"
          data-ocid="jobs.post_phone.input"
          placeholder="e.g. +91 98765 43210"
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="job-description">Description</Label>
        <Textarea
          id="job-description"
          data-ocid="jobs.post_description.textarea"
          placeholder="Describe the role, requirements, and responsibilities…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>
      <Button
        data-ocid="jobs.post_submit.button"
        className="w-full rounded-full"
        onClick={handleSubmit}
        disabled={createMutation.isPending || uploadingImage}
      >
        {createMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {createMutation.isPending ? "Posting..." : "Post Job Vacancy"}
      </Button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function JobsPage({ session }: { session: UserSession | null }) {
  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-card">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <h1 className="font-display text-xl font-semibold text-foreground">
            Job Vacancies
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Find work or post a vacancy
        </p>
      </div>

      {/* Tabs */}
      <div className="px-5 flex-1">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList
            className="grid grid-cols-2 w-full mb-4 rounded-full"
            data-ocid="jobs.tabs.panel"
          >
            <TabsTrigger
              value="browse"
              className="rounded-full"
              data-ocid="jobs.browse.tab"
            >
              Browse Jobs
            </TabsTrigger>
            <TabsTrigger
              value="post"
              className="rounded-full"
              data-ocid="jobs.post.tab"
            >
              Post a Job
            </TabsTrigger>
          </TabsList>
          <TabsContent value="browse">
            <BrowseJobsTab session={session} />
          </TabsContent>
          <TabsContent value="post">
            <PostJobTab session={session} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
