import { claimJob, completeJob, failJob } from "./jobQueue.js";
import type { JobName, JobRecord } from "./jobTypes.js";

export type JobHandler = (job: JobRecord) => Promise<void>;

export class JobWorker {
  private timer?: NodeJS.Timeout;
  private running = false;
  constructor(private readonly handlers: Partial<Record<JobName, JobHandler>>, private readonly pollMs = 2_000) {}

  async runOnce(jobIds: string[]) {
    for (const jobId of jobIds) {
      const job = await claimJob(jobId);
      if (!job) continue;
      try {
        const handler = this.handlers[job.name as JobName];
        if (!handler) throw new Error(`No handler registered for ${job.name}`);
        await handler(job as JobRecord);
        await completeJob(job.id);
      } catch (error) {
        await failJob(job.id, Number(job.attempts), Number(job.maxAttempts), error);
      }
    }
  }

  start(discover: () => Promise<string[]>) {
    if (this.running) return;
    this.running = true;
    const tick = async () => {
      if (!this.running) return;
      try { await this.runOnce(await discover()); } finally { if (this.running) this.timer = setTimeout(tick, this.pollMs); }
    };
    void tick();
  }

  stop() { this.running = false; if (this.timer) clearTimeout(this.timer); }
}
