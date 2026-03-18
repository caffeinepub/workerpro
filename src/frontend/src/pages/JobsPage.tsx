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
  DollarSign,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { JobVacancy } from "../hooks/useVacancyQueries";
import {
  useApplyToVacancy,
  useCreateJobVacancy,
  useGetOpenJobVacancies,
} from "../hooks/useVacancyQueries";

const CATEGORY_OPTIONS = [
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
  },
];

function JobVacancyCard({
  vacancy,
  onApply,
}: {
  vacancy: JobVacancy;
  onApply: (v: JobVacancy) => void;
}) {
  const catColor =
    CATEGORY_COLORS[vacancy.category] ?? "bg-gray-100 text-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="worker-card p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-sm text-foreground leading-tight">
            {vacancy.title}
          </h3>
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
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="w-3 h-3 text-green-500" />
            <span className="font-medium text-green-600">{vacancy.salary}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{vacancy.location}</span>
        </div>
      </div>

      {vacancy.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {vacancy.description}
        </p>
      )}

      <Button
        size="sm"
        data-ocid={`jobs.apply_now.button.${Number(vacancy.id)}`}
        onClick={() => onApply(vacancy)}
        className="w-full rounded-full text-xs font-semibold"
      >
        Apply Now
      </Button>
    </motion.div>
  );
}

function ApplyModal({
  vacancy,
  open,
  onClose,
}: {
  vacancy: JobVacancy | null;
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const applyMutation = useApplyToVacancy();

  const handleSubmit = async () => {
    if (!vacancy || !name.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await applyMutation.mutateAsync({
        vacancyId: vacancy.id,
        applicantName: name.trim(),
        applicantPhone: phone.trim(),
      });
      toast.success("Application submitted successfully!");
      setName("");
      setPhone("");
      onClose();
    } catch {
      toast.error("Failed to submit application");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="jobs.apply.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Apply for {vacancy?.title}</DialogTitle>
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

function BrowseJobsTab() {
  const { data: vacancies, isLoading } = useGetOpenJobVacancies();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [applyTarget, setApplyTarget] = useState<JobVacancy | null>(null);

  const displayVacancies =
    vacancies && vacancies.length > 0 ? vacancies : SAMPLE_VACANCIES;

  const filtered = displayVacancies.filter((v) => {
    const matchesSearch =
      !search ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase()) ||
      v.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      filterCategory === "all" ||
      v.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          data-ocid="jobs.search_input"
          type="text"
          placeholder="Search jobs, companies, locations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
        />
      </div>

      {/* Category filter */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {["all", ...CATEGORY_OPTIONS].map((cat) => (
          <button
            key={cat}
            type="button"
            data-ocid={`jobs.${cat.toLowerCase()}.tab`}
            onClick={() => setFilterCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCategory === cat
                ? "bg-primary text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Vacancy list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="jobs.loading_state">
          {[1, 2, 3].map((i) => (
            <div key={i} className="worker-card p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-9 w-full rounded-full" />
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
          <p className="font-semibold text-foreground">No job vacancies yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back soon or post a new vacancy
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v, i) => (
            <motion.div
              key={String(v.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`jobs.item.${i + 1}`}
            >
              <JobVacancyCard vacancy={v} onApply={setApplyTarget} />
            </motion.div>
          ))}
        </div>
      )}

      <ApplyModal
        vacancy={applyTarget}
        open={!!applyTarget}
        onClose={() => setApplyTarget(null)}
      />
    </div>
  );
}

function PostJobTab() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreateJobVacancy();

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
      });
      toast.success("Job vacancy posted successfully!");
      setTitle("");
      setCompany("");
      setCategory("");
      setLocation("");
      setSalary("");
      setDescription("");
    } catch {
      toast.error("Failed to post job vacancy");
    }
  };

  return (
    <div className="space-y-4">
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
          placeholder="e.g. ABC Services Pvt. Ltd."
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger data-ocid="jobs.post_category.select">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((c) => (
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
          placeholder="e.g. ₹20,000–₹30,000/mo"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="job-description">Description</Label>
        <Textarea
          id="job-description"
          data-ocid="jobs.post_description.textarea"
          placeholder="Describe the job requirements and responsibilities…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <Button
        data-ocid="jobs.post_submit.button"
        className="w-full rounded-full"
        onClick={handleSubmit}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {createMutation.isPending ? "Posting..." : "Post Job Vacancy"}
      </Button>
    </div>
  );
}

export default function JobsPage() {
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
          Browse open positions or post a new vacancy
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
            <BrowseJobsTab />
          </TabsContent>
          <TabsContent value="post">
            <PostJobTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
