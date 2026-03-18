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
  Home,
  Loader2,
  MapPin,
  Phone,
  Search,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { RentalProperty } from "../hooks/useVacancyQueries";
import {
  useCreateRentalProperty,
  useGetAvailableRentals,
} from "../hooks/useVacancyQueries";

const GRADIENT_PRESETS = [
  "from-blue-400 to-indigo-500",
  "from-green-400 to-teal-500",
  "from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-purple-400 to-violet-500",
  "from-cyan-400 to-sky-500",
];

const SAMPLE_RENTALS: RentalProperty[] = [
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
  },
];

function RentalCard({
  rental,
  index,
  onViewDetails,
}: {
  rental: RentalProperty;
  index: number;
  onViewDetails: (r: RentalProperty) => void;
}) {
  const gradient =
    GRADIENT_PRESETS[Number(rental.id) % GRADIENT_PRESETS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="worker-card overflow-hidden"
      data-ocid={`rentals.item.${index + 1}`}
    >
      {/* Image area */}
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

      {/* Details */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-display font-semibold text-sm text-foreground">
          {rental.title}
        </h3>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{rental.ownerName}</span>
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
        </div>
      </div>
    </motion.div>
  );
}

function RentalDetailModal({
  rental,
  open,
  onClose,
}: {
  rental: RentalProperty | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!rental) return null;
  const gradient =
    GRADIENT_PRESETS[Number(rental.id) % GRADIENT_PRESETS.length];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="rentals.detail.dialog" className="max-w-sm">
        <div
          className={`-mx-6 -mt-6 h-32 bg-gradient-to-br ${gradient} flex items-center justify-center rounded-t-lg`}
        >
          <Home className="w-10 h-10 text-white/70" />
        </div>
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

function BrowseRentalsTab() {
  const { data: rentals, isLoading } = useGetAvailableRentals();
  const [search, setSearch] = useState("");
  const [detailRental, setDetailRental] = useState<RentalProperty | null>(null);

  const displayRentals =
    rentals && rentals.length > 0 ? rentals : SAMPLE_RENTALS;

  const filtered = displayRentals.filter(
    (r) =>
      !search ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
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
            Try a different location or check back soon
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
            />
          ))}
        </div>
      )}

      <RentalDetailModal
        rental={detailRental}
        open={!!detailRental}
        onClose={() => setDetailRental(null)}
      />
    </div>
  );
}

function ListPropertyTab() {
  const [title, setTitle] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreateRentalProperty();

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
      });
      toast.success("Property listed successfully!");
      setTitle("");
      setOwnerName("");
      setPhone("");
      setLocation("");
      setPrice("");
      setRooms("");
      setDescription("");
    } catch {
      toast.error("Failed to list property");
    }
  };

  return (
    <div className="space-y-4">
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
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {createMutation.isPending ? "Listing..." : "List Property"}
      </Button>
    </div>
  );
}

export default function RentalsPage() {
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
            <BrowseRentalsTab />
          </TabsContent>
          <TabsContent value="list">
            <ListPropertyTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
