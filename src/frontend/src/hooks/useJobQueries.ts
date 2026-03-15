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

export function useGetAssignedJobPostings() {
  const { actor, isFetching } = useActor();
  return useQuery<JobPosting[]>({
    queryKey: ["jobPostings", "assigned"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssignedJobPostings();
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
    mutationFn: async (vars: {
      id: bigint;
      workerName: string;
      workerPhone: string;
      workerAddress: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignJobPosting(
        vars.id,
        vars.workerName,
        vars.workerPhone,
        vars.workerAddress,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobPostings"] });
    },
  });
}

export function useCompleteJobPosting() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.completeJobPosting(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobPostings"] });
    },
  });
}

export function useGetAvailableJobPostingsForWorker(workerId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<JobPosting[]>({
    queryKey: ["jobPostings", "availableForWorker", workerId],
    queryFn: async () => {
      if (!actor) return [];
      if (!workerId) return actor.getAvailableJobPostings();
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (actor as any).getAvailableJobPostingsForWorker(workerId);
      } catch {
        return actor.getAvailableJobPostings();
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetJobPreference() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      workerId: string;
      jobId: bigint;
      interested: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (actor as any).setJobPreference(
          vars.workerId,
          vars.jobId,
          vars.interested,
        );
      } catch {
        // Backend may not have this method yet; fail silently
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["jobPostings", "availableForWorker", vars.workerId],
      });
    },
  });
}
