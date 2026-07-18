import type { Client } from 'discord.js';
import { registerDailyJob } from './daily.js';

export function startJobs(client: Client): void {
  registerDailyJob(client);
}
