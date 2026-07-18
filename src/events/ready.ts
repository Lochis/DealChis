import { Events } from 'discord.js';
import type { Event } from '../types.js';

export const ready: Event<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user?.tag ?? 'unknown'}`);
  },
};
