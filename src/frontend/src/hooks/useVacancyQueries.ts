import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type JobApplication,
  type JobVacancy,
  type RentalProperty,
  RentalStatus,
} from "../backend.d";
import { useActor } from "./useActor";

export type { JobVacancy, JobApplication, RentalProperty };
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
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createJobVacancy(
        vars.title,
        vars.companyName,
        vars.category,
        vars.salary,
        vars.location,
        vars.description,
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
      applicantName: string;
      applicantPhone: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.applyToVacancy(
        vars.vacancyId,
        vars.applicantName,
        vars.applicantPhone,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobApplications"] }),
  });
}

export function useDeleteJobVacancy() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteJobVacancy(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobVacancies"] }),
  });
}

// ── Rental Properties ───────────────────────────────────────────────────────

export function useGetAvailableRentals() {
  const { actor, isFetching } = useActor();
  return useQuery<RentalProperty[]>({
    queryKey: ["rentals", "available"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableRentals();
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
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createRentalProperty(
        vars.title,
        vars.description,
        vars.location,
        vars.pricePerMonth,
        vars.numberOfRooms,
        vars.contactPhone,
        vars.ownerName,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rentals"] }),
  });
}

export function useDeleteRentalProperty() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteRentalProperty(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rentals"] }),
  });
}
