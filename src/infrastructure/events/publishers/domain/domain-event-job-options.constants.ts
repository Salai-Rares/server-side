import { JobsOptions } from "bullmq";

export const DOMAIN_EVENT_JOB_OPTIONS: Record<string, JobsOptions> = {
  UserRegistered: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 60 * 60 }, // keep 1h
    removeOnFail: { age: 24 * 60 * 60 }, // keep 24h
  },
};

export const DEFAULT_EVENT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { age: 60 * 60 }, // keep 1h
  removeOnFail: { age: 24 * 60 * 60 }, // keep 24h
};
