import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type JobApplication,
  type JobVacancyWithOwner as JobVacancy,
  type RentalProperty,
  RentalStatus,
  type RentalWithOwner,
} from "../backend.d";
import { useActor } from "./useActor";

export type { JobVacancy, JobApplication, RentalProperty, RentalWithOwner };
export { RentalStatus };

// ── Job Vacancies ───────────────────────────────────────────────────────────

export function useGetOpenJobVacancies() {
  const { actor, isFetching } = useActor();
  return useQuery<JobVacancy[]>({
    queryKey: ["jobVacancies", "open"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOpenJobVacancies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJobVacanciesByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<JobVacancy[]>({
    queryKey: ["jobVacancies", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (!category || category === "all") return actor.getOpenJobVacancies();
      return actor.getJobVacanciesByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateJobVacancy() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      title: string;
      companyName: string;
      category: string;
      salary: string | null;
      location: string;
      description: string;
      postedByUserId: bigint;
      contactPhone: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createJobVacancy(
        vars.title,
        vars.companyName,
        vars.category,
        vars.salary,
        vars.location,
        vars.description,
        vars.postedByUserId,
        vars.contactPhone,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobVacancies"] }),
  });
}

export function useApplyToVacancy() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      vacancyId: bigint;
      applicantUserId: bigint;
      applicantName: string;
      applicantPhone: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).applyToVacancy(
        vars.vacancyId,
        vars.applicantUserId,
        vars.applicantName,
        vars.applicantPhone,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobApplications"] }),
  });
}

export function useGetUserApplications(userId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<JobApplication[]>({
    queryKey: ["jobApplications", "user", String(userId)],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return (actor as any).getUserApplications(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useDeleteJobVacancy() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: bigint; requestingUserId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteJobVacancy(vars.id, vars.requestingUserId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobVacancies"] }),
  });
}

export function useUpdateJobVacancy() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: bigint;
      title: string;
      companyName: string;
      category: string;
      salary: string | null;
      location: string;
      description: string;
      requestingUserId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateJobVacancy(
        vars.id,
        vars.title,
        vars.companyName,
        vars.category,
        vars.salary,
        vars.location,
        vars.description,
        vars.requestingUserId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobVacancies"] }),
  });
}

// ── Rental Properties ───────────────────────────────────────────────────────

export function useGetAvailableRentals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["rentals", "available"],
    queryFn: async (): Promise<RentalWithOwner[]> => {
      if (!actor) return [];
      const result = await actor.getAvailableRentals();
      return result as RentalWithOwner[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRentalProperty() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      title: string;
      description: string;
      location: string;
      pricePerMonth: number;
      numberOfRooms: bigint;
      contactPhone: string;
      ownerName: string;
      postedByUserId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createRentalProperty(
        vars.title,
        vars.description,
        vars.location,
        vars.pricePerMonth,
        vars.numberOfRooms,
        vars.contactPhone,
        vars.ownerName,
        vars.postedByUserId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rentals"] }),
  });
}

export function useDeleteRentalProperty() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: bigint; requestingUserId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteRentalProperty(
        vars.id,
        vars.requestingUserId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rentals"] }),
  });
}
