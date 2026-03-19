import { Skeleton } from "@/components/ui/skeleton";
import {
  Hammer,
  MapPin,
  PaintBucket,
  Search,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useGetActiveWorkers } from "../hooks/useWorkerQueries";

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

const DISTANCES = ["0.8 km", "1.2 km", "1.5 km", "2.0 km", "2.4 km", "0.5 km"];

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
          className={`w-3 h-3 ${
            s <= Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : s - 0.5 <= rating
                ? "fill-yellow-300 text-yellow-300"
                : "fill-gray-200 text-gray-200"
          }`}
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

interface HomeProps {
  onBookWorker: (skill: string) => void;
}

export default function HomePage({ onBookWorker }: HomeProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const { data: activeWorkers = [], isLoading } = useGetActiveWorkers();

  // Fallback sample data shown only when no backend workers yet
  const sampleWorkers = [
    {
      id: BigInt(1),
      name: "Ramesh Kumar",
      profession: "Electrician",
      phone: "9876543210",
      location: "Koramangala, Bangalore",
      rating: 4.8,
    },
    {
      id: BigInt(2),
      name: "Suresh Patel",
      profession: "Plumber",
      phone: "9876543211",
      location: "Indiranagar, Bangalore",
      rating: 4.6,
    },
    {
      id: BigInt(3),
      name: "Priya Singh",
      profession: "Cleaner",
      phone: "9876543212",
      location: "HSR Layout, Bangalore",
      rating: 4.9,
    },
    {
      id: BigInt(4),
      name: "Anil Sharma",
      profession: "Carpenter",
      phone: "9876543213",
      location: "Whitefield, Bangalore",
      rating: 4.5,
    },
    {
      id: BigInt(5),
      name: "Mohan Das",
      profession: "Painter",
      phone: "9876543214",
      location: "BTM Layout, Bangalore",
      rating: 4.7,
    },
    {
      id: BigInt(6),
      name: "Kavita Rao",
      profession: "Cleaner",
      phone: "9876543215",
      location: "Marathahalli, Bangalore",
      rating: 4.4,
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

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Greeting + Search */}
      <div className="px-5 pt-5 pb-4 bg-card">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-muted-foreground text-sm">{greeting} 👋</p>
          <h1 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Find a Worker Nearby
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

      {/* Service Categories Grid */}
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
              className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ring-2 ${
                activeCategory === cat.id
                  ? `${cat.bg} ${cat.ring} shadow-sm scale-95`
                  : `bg-card ring-transparent hover:${cat.bg}`
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  cat.bg
                }`}
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

      {/* Nearby Workers */}
      <div className="px-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            {activeWorkers.length > 0 ? "Active Workers" : "Nearby Workers"}
          </h2>
          <button
            data-ocid="home.see_all.button"
            onClick={() => setActiveCategory("all")}
            className="text-sm font-medium text-primary"
            type="button"
          >
            See All
          </button>
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
              const distance = DISTANCES[i % DISTANCES.length];
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
                      <span>{distance} away</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid={`home.book_now.button.${i + 1}`}
                    onClick={() => onBookWorker(worker.profession || "")}
                    className="w-full py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Book Now
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
