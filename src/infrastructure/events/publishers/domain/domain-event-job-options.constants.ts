import { JobsOptions } from "bullmq";

export const DOMAIN_EVENT_JOB_OPTIONS: Record<string, JobsOptions> = {
  UserRegistered: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 60 * 60 },      // keep 1h
    removeOnFail: { age: 24 * 60 * 60 },     // keep 24h
  },
  PasswordResetRequested: {
    attempts: 3,
    backoff: { type: "exponential", delay: 500 }, // faster retries — token expires in 15 min
    removeOnComplete: { age: 15 * 60 },           // keep 15 min (token TTL)
    removeOnFail: { age: 15 * 60 },               // keep 15 min — stale after token expires
  },
};

export const DEFAULT_EVENT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { age: 60 * 60 }, // keep 1h
  removeOnFail: { age: 24 * 60 * 60 }, // keep 24h
};
