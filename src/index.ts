import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { events } from './events/index.js';
import { startJobs } from './jobs/index.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

for (const event of events) {
  const handler = event.execute as (...args: unknown[]) => void;
  if (event.once) {
    client.once(event.name, handler);
  } else {
    client.on(event.name, handler);
  }
}

startJobs(client);

void client.login(process.env.DISCORD_TOKEN!).catch((error) => {
  console.error('Failed to login:', error);
  process.exit(1);
});
