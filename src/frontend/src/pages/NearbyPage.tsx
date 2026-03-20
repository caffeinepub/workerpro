import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  MapPin,
  Navigation,
  Search,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { WorkerProfile } from "../hooks/useWorkerQueries";
import { useGetActiveWorkers } from "../hooks/useWorkerQueries";

interface NearbyPageProps {
  onBack: () => void;
}

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

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function WorkerCard({
  worker,
  distance,
  index,
}: { worker: WorkerProfile; distance: string; index: number }) {
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="worker-card p-4 flex items-center gap-4"
      data-ocid={`nearby.worker.item.${index + 1}`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${colorClass}`}
      >
        {getInitials(worker.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{worker.name}</p>
        <span className="skill-badge inline-block mt-0.5">
          {worker.profession}
        </span>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${s <= Math.floor(worker.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{distance}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NearbyPage({ onBack }: NearbyPageProps) {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { data: workers = [], isLoading: workersLoading } =
    useGetActiveWorkers();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
        setLocLoading(false);
      },
      () => {
        setLocError(
          "Location access denied. Please enable GPS in your browser settings.",
        );
        setLocLoading(false);
      },
      { timeout: 10000 },
    );
  }, []);

  const workersWithDistance = workers
    .map((w, i) => {
      const hasCoords = w.latitude !== 0 || w.longitude !== 0;
      let distStr = "Location not set";
      let distKm = Number.POSITIVE_INFINITY;
      if (hasCoords && userLat !== null && userLon !== null) {
        distKm = haversineKm(userLat, userLon, w.latitude, w.longitude);
        distStr =
          distKm < 1
            ? `${Math.round(distKm * 1000)}m away`
            : `${distKm.toFixed(1)} km away`;
      } else if (userLat === null) {
        distStr = w.location || "Location not set";
      }
      return { worker: w, distStr, distKm, index: i };
    })
    .filter(
      (x) =>
        !search ||
        x.worker.name.toLowerCase().includes(search.toLowerCase()) ||
        x.worker.profession.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => a.distKm - b.distKm);

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors"
          data-ocid="nearby.back.button"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            Nearby Workers
          </h1>
          <p className="text-xs text-muted-foreground">
            {locLoading
              ? "Getting your location..."
              : locError
                ? "Using general listing"
                : "Workers near you"}
          </p>
        </div>
      </div>

      {/* Location status */}
      {locLoading && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
          <Navigation className="w-5 h-5 text-blue-500 animate-pulse" />
          <p className="text-sm text-blue-700">Getting your location...</p>
        </div>
      )}
      {locError && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-700">{locError}</p>
        </div>
      )}
      {!locLoading && !locError && userLat !== null && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
          <Navigation className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-700">
            Location detected. Showing workers sorted by distance.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="px-5 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or profession..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-ocid="nearby.search.input"
          />
        </div>
      </div>

      {/* Worker List */}
      <div className="px-5 pt-2 space-y-3">
        {workersLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="worker-card p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : workersWithDistance.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 text-center"
            data-ocid="nearby.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No workers found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search
            </p>
          </motion.div>
        ) : (
          workersWithDistance.map(({ worker, distStr, index }) => (
            <WorkerCard
              key={worker.id.toString()}
              worker={worker}
              distance={distStr}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}
