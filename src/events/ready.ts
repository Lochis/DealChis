import { Events } from 'discord.js';
import type { Event } from '../types.js';
import { deployCommands } from '../deploy.js';

export const ready: Event<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user?.tag ?? 'unknown'}`);

    const guildIds = [...client.guilds.cache.keys()];
    console.log(`[ready] Syncing commands to ${guildIds.length} guild(s).`);
    for (const guildId of guildIds) {
      await deployCommands(guildId).catch((e) => {
        console.error(`[ready] Failed to sync commands for guild ${guildId}:`, e);
      });
    }
  },
};
