import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetBookingsForUser(userId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookings-user", userId?.toString()],
    queryFn: () => actor!.getBookingsForUser(userId!),
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetBookingsForWorker(workerId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookings-worker", workerId?.toString()],
    queryFn: () => actor!.getBookingsForWorker(workerId!),
    enabled: !!actor && !isFetching && !!workerId,
  });
}

export function useAcceptBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.acceptBooking(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings-worker"] }),
  });
}

export function useRejectBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.rejectBooking(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings-worker"] }),
  });
}
