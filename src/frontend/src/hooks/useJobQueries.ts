import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type JobPosting, JobStatus } from "../backend.d";
import { useActor } from "./useActor";

export { JobStatus };
export type { JobPosting };

export function useGetAvailableJobPostings() {
  const { actor, isFetching } = useActor();
  return useQuery<JobPosting[]>({
    queryKey: ["jobPostings", "available"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableJobPostings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllJobPostings() {
  const { actor, isFetching } = useActor();
  return useQuery<JobPosting[]>({
    queryKey: ["jobPostings", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobPostings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateJobPosting() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      title: string;
      description: string;
      date: string;
      startTime: bigint;
      endTime: bigint;
      paymentAmount: number;
      address: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createJobPosting(
        vars.title,
        vars.description,
        vars.date,
        vars.startTime,
        vars.endTime,
        vars.paymentAmount,
        vars.address,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobPostings"] });
    },
  });
}

export function useAssignJobPosting() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: bigint; workerName: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignJobPosting(vars.id, vars.workerName);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobPostings"] });
    },
  });
}
