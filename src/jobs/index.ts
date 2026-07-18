import type { Client } from 'discord.js';
import { registerThirtyMinuteJob } from './daily.js';

export function startJobs(client: Client): void {
  registerThirtyMinuteJob(client);
}
