import type { ClientEvents, SlashCommandBuilder } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: import('discord.js').ChatInputCommandInteraction) => Promise<void> | void;
}

export enum UpdateType {
  Register = "Register",
  Unregister = "Unregister"
}

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}
