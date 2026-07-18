import { Collection } from 'discord.js';
import type { Command } from '../types.js';
import { ping } from './ping.js';
import { getDeals } from './getDeals.js';

export const commandList: Command[] = [ping, getDeals];

export const commands = new Collection<string, Command>(
  commandList.map((command) => [command.data.name, command]),
);
