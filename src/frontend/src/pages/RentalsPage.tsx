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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BedDouble,
  Building2,
  Edit,
  Home,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type {
  RentalProperty,
  RentalWithOwner,
} from "../hooks/useVacancyQueries";
import {
  useCreateRentalProperty,
  useDeleteRentalProperty,
  useGetAvailableRentals,
} from "../hooks/useVacancyQueries";
import type { UserSession } from "../hooks/useWorkerQueries";
import { uploadImageFile } from "../utils/imageUpload";

const GRADIENT_PRESETS = [
  "from-blue-400 to-indigo-500",
  "from-green-400 to-teal-500",
  "from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-purple-400 to-violet-500",
  "from-cyan-400 to-sky-500",
];

const PRICE_FILTERS = [
  { label: "Any", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "<10k", min: 0, max: 10000 },
  { label: "10k–25k", min: 10000, max: 25000 },
  { label: "25k+", min: 25000, max: Number.POSITIVE_INFINITY },
];

const SAMPLE_RENTALS: RentalWithOwner[] = [
  {
    id: BigInt(1),
    title: "Spacious 2BHK Apartment",
    ownerName: "Rajesh Nair",
    contactPhone: "9876541230",
    location: "Koramangala, Bangalore",
    pricePerMonth: 22000,
    numberOfRooms: BigInt(2),
    description:
      "Well-maintained 2BHK with parking, close to metro station and shopping complex. Semi-furnished with modular kitchen.",
    status: "available" as any,
    createdAt: BigInt(Date.now()),
    postedByUserId: BigInt(0),
  },
  {
    id: BigInt(2),
    title: "Cozy 1BHK Near IT Park",
    ownerName: "Meena Iyer",
    contactPhone: "9876541231",
    location: "Whitefield, Bangalore",
    pricePerMonth: 14000,
    numberOfRooms: BigInt(1),
    description:
      "Fully furnished 1BHK perfect for IT professionals. Walking distance to major tech parks.",
    status: "available" as any,
    createdAt: BigInt(Date.now()),
    postedByUserId: BigInt(0),
  },
  {
    id: BigInt(3),
    title: "3BHK Independent House",
    ownerName: "Suresh Kumar",
    contactPhone: "9876541232",
    location: "HSR Layout, Bangalore",
    pricePerMonth: 35000,
    numberOfRooms: BigInt(3),
    description:
      "Independent house with garden, parking for 2 cars, and full backup power. Ideal for families.",
    status: "available" as any,
    createdAt: BigInt(Date.now()),
    postedByUserId: BigInt(0),
  },
];

// ── Image Upload Field ─────────────────────────────────────────────────────

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
      <Label>Property Photo (optional)</Label>
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Property preview"
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
          data-ocid="rentals.image.upload_button"
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
            {uploading ? "Uploading..." : "Tap to add photo"}
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

// ── Edit Rental Modal ──────────────────────────────────────────────────────

function EditRentalModal({
  rental,
  open,
  onClose,
  requestingUserId,
}: {
  rental: RentalWithOwner | null;
  open: boolean;
  onClose: () => void;
  requestingUserId: bigint;
}) {
  const { actor } = useActor();
  const [title, setTitle] = useState(rental?.title ?? "");
  const [ownerName, setOwnerName] = useState(rental?.ownerName ?? "");
  const [phone, setPhone] = useState(rental?.contactPhone ?? "");
  const [location, setLocation] = useState(rental?.location ?? "");
  const [price, setPrice] = useState(String(rental?.pricePerMonth ?? ""));
  const [rooms, setRooms] = useState(String(rental?.numberOfRooms ?? ""));
  const [description, setDescription] = useState(rental?.description ?? "");
  const [saving, setSaving] = useState(false);

  // Reset fields when rental changes
  if (open && rental && title === "" && rental.title !== "") {
    setTitle(rental.title);
    setOwnerName(rental.ownerName);
    setPhone(rental.contactPhone);
    setLocation(rental.location);
    setPrice(String(rental.pricePerMonth));
    setRooms(String(rental.numberOfRooms));
    setDescription(rental.description);
  }

  const handleSubmit = async () => {
    if (!rental || !title.trim() || !location.trim() || !price || !rooms) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!actor) return;
    setSaving(true);
    try {
      await (actor as any).updateRentalProperty(
        rental.id,
        title.trim(),
        description.trim(),
        location.trim(),
        Number(price),
        BigInt(rooms),
        phone.trim(),
        ownerName.trim(),
        requestingUserId,
      );
      toast.success("Rental updated!");
      onClose();
    } catch (err) {
      console.error("Failed to update rental:", err);
      toast.error("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="rentals.edit.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Rental</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="edit-rental-title">Property Title *</Label>
            <Input
              id="edit-rental-title"
              data-ocid="rentals.edit_title.input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-rental-owner">Owner Name</Label>
            <Input
              id="edit-rental-owner"
              data-ocid="rentals.edit_owner.input"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-rental-phone">Contact Phone</Label>
            <Input
              id="edit-rental-phone"
              data-ocid="rentals.edit_phone.input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-rental-location">Location *</Label>
            <Input
              id="edit-rental-location"
              data-ocid="rentals.edit_location.input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="edit-rental-price">Price/Month (₹)</Label>
              <Input
                id="edit-rental-price"
                data-ocid="rentals.edit_price.input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-rental-rooms">Rooms</Label>
              <Input
                id="edit-rental-rooms"
                data-ocid="rentals.edit_rooms.input"
                type="number"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-rental-desc">Description</Label>
            <Textarea
              id="edit-rental-desc"
              data-ocid="rentals.edit_description.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={onClose}
              data-ocid="rentals.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-full"
              onClick={handleSubmit}
              disabled={saving}
              data-ocid="rentals.edit.save_button"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Rental Card ────────────────────────────────────────────────────────────

function RentalCard({
  rental,
  index,
  onViewDetails,
  currentUserId,
  onDelete,
  onEdit,
}: {
  rental: RentalWithOwner;
  index: number;
  onViewDetails: (r: RentalWithOwner) => void;
  currentUserId?: bigint;
  onDelete?: (r: RentalWithOwner) => void;
  onEdit?: (r: RentalWithOwner) => void;
}) {
  const isOwner =
    currentUserId !== undefined &&
    currentUserId !== BigInt(0) &&
    rental.postedByUserId !== undefined &&
    currentUserId === rental.postedByUserId;
  const gradient =
    GRADIENT_PRESETS[Number(rental.id) % GRADIENT_PRESETS.length];
  const imageUrl = (rental as any).imageUrl as string | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="worker-card overflow-hidden"
      data-ocid={`rentals.item.${index + 1}`}
    >
      {/* Image area */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={rental.title}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div
          className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <Home className="w-10 h-10 text-white/60" />
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-foreground font-bold text-xs px-2.5 py-1 rounded-full border-0 shadow-sm">
              ₹{rental.pricePerMonth.toLocaleString("en-IN")}/mo
            </Badge>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-sm text-foreground">
            {rental.title}
          </h3>
          {imageUrl && (
            <Badge className="bg-primary/10 text-primary font-bold text-xs px-2 py-0.5 rounded-full border-0 shrink-0">
              ₹{rental.pricePerMonth.toLocaleString("en-IN")}/mo
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{rental.ownerName}</span>
            {isOwner && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 ml-1">
                Your Post
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{rental.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BedDouble className="w-3 h-3" />
            <span>
              {String(rental.numberOfRooms)} Room
              {Number(rental.numberOfRooms) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-full text-xs"
            data-ocid={`rentals.view_details.button.${index + 1}`}
            onClick={() => onViewDetails(rental)}
          >
            View Details
          </Button>
          {isOwner ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs px-2.5"
                data-ocid={`rentals.edit_button.${index + 1}`}
                onClick={() => onEdit?.(rental)}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 rounded-full text-xs"
                data-ocid={`rentals.delete_button.${index + 1}`}
                onClick={() => onDelete?.(rental)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="flex-1 rounded-full text-xs"
              data-ocid={`rentals.contact_owner.button.${index + 1}`}
              asChild
            >
              <a href={`tel:${rental.contactPhone}`}>
                <Phone className="w-3 h-3 mr-1" />
                Contact
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Rental Detail Modal ────────────────────────────────────────────────────

function RentalDetailModal({
  rental,
  open,
  onClose,
}: {
  rental: RentalWithOwner | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!rental) return null;
  const gradient =
    GRADIENT_PRESETS[Number(rental.id) % GRADIENT_PRESETS.length];
  const imageUrl = (rental as any).imageUrl as string | undefined;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="rentals.detail.dialog" className="max-w-sm">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={rental.title}
            className="-mx-6 -mt-6 w-[calc(100%+48px)] h-40 object-cover rounded-t-lg"
          />
        ) : (
          <div
            className={`-mx-6 -mt-6 h-32 bg-gradient-to-br ${gradient} flex items-center justify-center rounded-t-lg`}
          >
            <Home className="w-10 h-10 text-white/70" />
          </div>
        )}
        <DialogHeader className="mt-2">
          <DialogTitle>{rental.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Monthly Rent</p>
              <p className="font-bold text-sm text-primary">
                ₹{rental.pricePerMonth.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Rooms</p>
              <p className="font-bold text-sm text-foreground">
                {String(rental.numberOfRooms)} BHK
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{rental.ownerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{rental.location}</span>
            </div>
          </div>
          {rental.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {rental.description}
            </p>
          )}
          <Button
            className="w-full rounded-full"
            data-ocid="rentals.contact_owner_modal.button"
            asChild
          >
            <a href={`tel:${rental.contactPhone}`}>
              <Phone className="w-4 h-4 mr-2" />
              Call Owner
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Browse Rentals Tab ─────────────────────────────────────────────────────

function BrowseRentalsTab({ session }: { session: UserSession | null }) {
  const { data: rentals, isLoading } = useGetAvailableRentals();
  const deleteMutation = useDeleteRentalProperty();
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState(0); // index into PRICE_FILTERS
  const [detailRental, setDetailRental] = useState<RentalWithOwner | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<RentalWithOwner | null>(
    null,
  );
  const [editTarget, setEditTarget] = useState<RentalWithOwner | null>(null);
  const currentUserId = session?.userId;

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !currentUserId) return;
    try {
      await deleteMutation.mutateAsync({
        id: deleteTarget.id,
        requestingUserId: currentUserId,
      });
      toast.success("Property deleted.");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Failed to delete. Please try again.");
      setDeleteTarget(null);
    }
  };

  const displayRentals =
    rentals && rentals.length > 0 ? rentals : SAMPLE_RENTALS;

  const { min: priceMin, max: priceMax } = PRICE_FILTERS[priceFilter];

  const filtered = displayRentals.filter((r) => {
    const matchesSearch =
      !search ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchesPrice =
      r.pricePerMonth >= priceMin && r.pricePerMonth <= priceMax;
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          data-ocid="rentals.search_input"
          type="text"
          placeholder="Search by location or title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
        />
      </div>

      {/* Price Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRICE_FILTERS.map((pf, i) => (
          <button
            key={pf.label}
            type="button"
            data-ocid={`rentals.price_filter_${pf.label.replace(/[^a-z0-9]/gi, "").toLowerCase()}.tab`}
            onClick={() => setPriceFilter(i)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              priceFilter === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
          >
            {pf.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="rentals.loading_state">
          {[1, 2].map((i) => (
            <div key={i} className="worker-card overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          data-ocid="rentals.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <Building2 className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No rentals available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different filter or check back soon
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r, i) => (
            <RentalCard
              key={String(r.id)}
              rental={r}
              index={i}
              onViewDetails={setDetailRental}
              currentUserId={currentUserId}
              onDelete={setDeleteTarget}
              onEdit={setEditTarget}
            />
          ))}
        </div>
      )}

      <RentalDetailModal
        rental={detailRental}
        open={!!detailRental}
        onClose={() => setDetailRental(null)}
      />

      {editTarget && currentUserId && (
        <EditRentalModal
          rental={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          requestingUserId={currentUserId}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="rentals.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title ?? ""}"?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="rentals.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="rentals.delete.confirm_button"
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

// ── List Property Tab ──────────────────────────────────────────────────────

function ListPropertyTab({ session }: { session: UserSession | null }) {
  const [title, setTitle] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const createMutation = useCreateRentalProperty();

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
    if (
      !title.trim() ||
      !ownerName.trim() ||
      !phone.trim() ||
      !location.trim() ||
      !price ||
      !rooms
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        pricePerMonth: Number(price),
        numberOfRooms: BigInt(rooms),
        contactPhone: phone.trim(),
        ownerName: ownerName.trim(),
        postedByUserId: session?.userId ?? BigInt(0),
      });
      toast.success("Property listed successfully!");
      setTitle("");
      setOwnerName("");
      setPhone("");
      setLocation("");
      setPrice("");
      setRooms("");
      setDescription("");
      setImageUrl("");
    } catch (err) {
      console.error("Failed to list property:", err);
      toast.error("Failed to list property. Please try again.");
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
        <Label htmlFor="rental-title">Property Title *</Label>
        <Input
          id="rental-title"
          data-ocid="rentals.list_title.input"
          placeholder="e.g. Spacious 2BHK Apartment"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="owner-name">Owner Name *</Label>
        <Input
          id="owner-name"
          data-ocid="rentals.list_owner.input"
          placeholder="Your full name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="owner-phone">Contact Phone *</Label>
        <Input
          id="owner-phone"
          data-ocid="rentals.list_phone.input"
          placeholder="e.g. 9876543210"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rental-location">Location *</Label>
        <Input
          id="rental-location"
          data-ocid="rentals.list_location.input"
          placeholder="e.g. Koramangala, Bangalore"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rental-price">Price/Month (₹) *</Label>
          <Input
            id="rental-price"
            data-ocid="rentals.list_price.input"
            placeholder="e.g. 15000"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rental-rooms">No. of Rooms *</Label>
          <Input
            id="rental-rooms"
            data-ocid="rentals.list_rooms.input"
            placeholder="e.g. 2"
            type="number"
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rental-description">Description</Label>
        <Textarea
          id="rental-description"
          data-ocid="rentals.list_description.textarea"
          placeholder="Describe the property, amenities, and nearby facilities…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <Button
        data-ocid="rentals.list_submit.button"
        className="w-full rounded-full"
        onClick={handleSubmit}
        disabled={createMutation.isPending || uploadingImage}
      >
        {createMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {createMutation.isPending ? "Listing..." : "List Property"}
      </Button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function RentalsPage({
  session,
}: { session: UserSession | null }) {
  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-card">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-accent" />
          </div>
          <h1 className="font-display text-xl font-semibold text-foreground">
            Rental Houses
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Find your next home or list your property
        </p>
      </div>

      {/* Tabs */}
      <div className="px-5 flex-1">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList
            className="grid grid-cols-2 w-full mb-4 rounded-full"
            data-ocid="rentals.tabs.panel"
          >
            <TabsTrigger
              value="browse"
              className="rounded-full"
              data-ocid="rentals.browse.tab"
            >
              Browse Rentals
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="rounded-full"
              data-ocid="rentals.list.tab"
            >
              List Property
            </TabsTrigger>
          </TabsList>
          <TabsContent value="browse">
            <BrowseRentalsTab session={session} />
          </TabsContent>
          <TabsContent value="list">
            <ListPropertyTab session={session} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
