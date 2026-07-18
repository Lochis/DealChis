import type { Event } from '../types.js';
import { ready } from './ready.js';
import { interactionCreate } from './interactionCreate.js';
import { guildCreate } from './guildCreate.js';
import { guildDelete } from './guildDelete.js';

export const events = [ready, interactionCreate, guildCreate, guildDelete] as const;
