import { Skeleton } from "@/components/ui/skeleton";
import {
  Hammer,
  MapPin,
  PaintBucket,
  Search,
  Sparkles,
  Star,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  type UserSession,
  useGetActiveWorkers,
} from "../hooks/useWorkerQueries";

const SERVICE_CATEGORIES = [
  {
    id: "painter",
    label: "Painter",
    icon: PaintBucket,
    bg: "bg-orange-50",
    iconColor: "text-orange-500",
    ring: "ring-orange-100",
  },
  {
    id: "cleaner",
    label: "Cleaner",
    icon: Sparkles,
    bg: "bg-teal-50",
    iconColor: "text-teal-500",
    ring: "ring-teal-100",
  },
  {
    id: "plumber",
    label: "Plumber",
    icon: Wrench,
    bg: "bg-blue-50",
    iconColor: "text-blue-500",
    ring: "ring-blue-100",
  },
  {
    id: "carpenter",
    label: "Carpenter",
    icon: Hammer,
    bg: "bg-amber-50",
    iconColor: "text-amber-500",
    ring: "ring-amber-100",
  },
  {
    id: "electrician",
    label: "Electrician",
    icon: Zap,
    bg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    ring: "ring-yellow-100",
  },
];

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : s - 0.5 <= rating ? "fill-yellow-300 text-yellow-300" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-0.5">{rating}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="worker-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-9 w-full rounded-full" />
    </div>
  );
}

interface BookingModalProps {
  workerName: string;
  workerProfession: string;
  workerId: bigint;
  session: UserSession;
  onClose: () => void;
}

function BookingModal({
  workerName,
  workerProfession,
  workerId,
  session,
  onClose,
}: BookingModalProps) {
  const { actor } = useActor();
  const [serviceType, setServiceType] = useState(workerProfession);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!actor) {
      toast.error("Connecting to server...");
      return;
    }
    setLoading(true);
    try {
      await actor.createBooking(
        session.userId,
        workerId,
        workerName,
        serviceType || workerProfession,
        note,
      );
      toast.success(`Booking sent to ${workerName}!`);
      onClose();
    } catch {
      toast.error("Failed to send booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-background w-full max-w-lg rounded-t-3xl p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
        data-ocid="booking.modal"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Book Worker</h3>
            <p className="text-sm text-muted-foreground">
              {workerName} · {workerProfession}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="service-type-input" className="text-sm font-medium">
              Service Type
            </label>
            <input
              id="service-type-input"
              data-ocid="booking.service_type.input"
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Pipe repair, House painting..."
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="booking-note-input" className="text-sm font-medium">
              Additional Notes
            </label>
            <textarea
              id="booking-note-input"
              data-ocid="booking.note.input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Any specific requirements or details..."
            />
          </div>
          <button
            type="button"
            data-ocid="booking.confirm.button"
            onClick={handleBook}
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Sending..." : "Confirm Booking"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface HomeProps {
  onBookWorker: (skill: string) => void;
  session: UserSession | null;
  onNearby?: () => void;
}

export default function HomePage({
  onBookWorker,
  session,
  onNearby,
}: HomeProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [bookingWorker, setBookingWorker] = useState<{
    id: bigint;
    name: string;
    profession: string;
  } | null>(null);

  const { data: activeWorkers = [], isLoading } = useGetActiveWorkers();

  const isWorker = session?.role === "worker";

  const sampleWorkers = [
    {
      id: BigInt(1),
      name: "Ramesh Kumar",
      profession: "Electrician",
      phone: "9876543210",
      location: "Koramangala, Bangalore",
      rating: 4.8,
      latitude: 12.9352,
      longitude: 77.6245,
      status: "active" as const,
      userId: BigInt(1),
      createdAt: BigInt(0),
    },
    {
      id: BigInt(2),
      name: "Suresh Patel",
      profession: "Plumber",
      phone: "9876543211",
      location: "Indiranagar, Bangalore",
      rating: 4.6,
      latitude: 12.9784,
      longitude: 77.6408,
      status: "active" as const,
      userId: BigInt(2),
      createdAt: BigInt(0),
    },
    {
      id: BigInt(3),
      name: "Priya Singh",
      profession: "Cleaner",
      phone: "9876543212",
      location: "HSR Layout, Bangalore",
      rating: 4.9,
      latitude: 12.9116,
      longitude: 77.6474,
      status: "active" as const,
      userId: BigInt(3),
      createdAt: BigInt(0),
    },
    {
      id: BigInt(4),
      name: "Anil Sharma",
      profession: "Carpenter",
      phone: "9876543213",
      location: "Whitefield, Bangalore",
      rating: 4.5,
      latitude: 12.9698,
      longitude: 77.75,
      status: "active" as const,
      userId: BigInt(4),
      createdAt: BigInt(0),
    },
    {
      id: BigInt(5),
      name: "Mohan Das",
      profession: "Painter",
      phone: "9876543214",
      location: "BTM Layout, Bangalore",
      rating: 4.7,
      latitude: 12.9165,
      longitude: 77.6101,
      status: "active" as const,
      userId: BigInt(5),
      createdAt: BigInt(0),
    },
    {
      id: BigInt(6),
      name: "Kavita Rao",
      profession: "Cleaner",
      phone: "9876543215",
      location: "Marathahalli, Bangalore",
      rating: 4.4,
      latitude: 12.9591,
      longitude: 77.6974,
      status: "active" as const,
      userId: BigInt(6),
      createdAt: BigInt(0),
    },
  ];

  const workers = activeWorkers.length > 0 ? activeWorkers : sampleWorkers;

  const filtered = workers.filter((w) => {
    const profession = w.profession.toLowerCase();
    const matchesCategory =
      activeCategory === "all" || profession.includes(activeCategory);
    const matchesSearch =
      !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      profession.includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleBookNow = (worker: {
    id: bigint;
    name: string;
    profession: string;
  }) => {
    if (session && session.role === "user") {
      setBookingWorker(worker);
    } else if (!session) {
      onBookWorker(worker.profession);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      <AnimatePresence>
        {bookingWorker && session && (
          <BookingModal
            workerName={bookingWorker.name}
            workerProfession={bookingWorker.profession}
            workerId={bookingWorker.id}
            session={session}
            onClose={() => setBookingWorker(null)}
          />
        )}
      </AnimatePresence>

      {/* Greeting + Search */}
      <div className="px-5 pt-5 pb-4 bg-card">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-muted-foreground text-sm">{greeting} 👋</p>
          <h1 className="font-display text-xl font-semibold text-foreground mt-0.5">
            {isWorker ? "Worker Dashboard" : "Find a Worker Nearby"}
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-4 relative"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-ocid="home.search_input"
            type="text"
            placeholder="Search plumber, electrician…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </motion.div>
      </div>

      {/* Worker-only info banner */}
      {isWorker && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-green-50 border border-green-200">
          <p className="text-sm text-green-700 font-medium">👷 Worker Mode</p>
          <p className="text-xs text-green-600 mt-0.5">
            You're logged in as a worker. Manage your bookings in the Bookings
            tab.
          </p>
        </div>
      )}

      {/* Service Categories */}
      {!isWorker && (
        <div className="px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground mb-3">
            Services
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {SERVICE_CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`home.${cat.id}.tab`}
                type="button"
                onClick={() =>
                  setActiveCategory(activeCategory === cat.id ? "all" : cat.id)
                }
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ring-2 ${activeCategory === cat.id ? `${cat.bg} ${cat.ring} shadow-sm scale-95` : `bg-card ring-transparent hover:${cat.bg}`}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg}`}
                >
                  <cat.icon className={`w-5 h-5 ${cat.iconColor}`} />
                </div>
                <span className="text-[10px] font-medium text-foreground leading-tight text-center">
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Workers Grid */}
      <div className="px-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            {isWorker
              ? "Available Workers"
              : activeWorkers.length > 0
                ? "Active Workers"
                : "Nearby Workers"}
          </h2>
          <div className="flex items-center gap-2">
            {onNearby && (
              <button
                type="button"
                data-ocid="home.nearby.button"
                onClick={onNearby}
                className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full"
              >
                <MapPin className="w-3 h-3" />
                Nearby
              </button>
            )}
            <button
              data-ocid="home.see_all.button"
              onClick={() => setActiveCategory("all")}
              className="text-sm font-medium text-primary"
              type="button"
            >
              See All
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            data-ocid="home.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No workers found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different category or search term
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((worker, i) => {
              const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <motion.div
                  key={worker.id.toString()}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="worker-card p-4 flex flex-col gap-3"
                  data-ocid={`home.worker.item.${i + 1}`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${colorClass}`}
                    >
                      {getInitials(worker.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-tight">
                        {worker.name}
                      </p>
                      <span className="skill-badge mt-1 inline-block">
                        {worker.profession || "Worker"}
                      </span>
                    </div>
                    <StarRating rating={worker.rating || 4.5} />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {worker.location || "Nearby"}
                      </span>
                    </div>
                  </div>
                  {!isWorker && (
                    <button
                      type="button"
                      data-ocid={`home.book_now.button.${i + 1}`}
                      onClick={() =>
                        handleBookNow({
                          id: worker.id,
                          name: worker.name,
                          profession: worker.profession,
                        })
                      }
                      className="w-full py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Book Now
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
