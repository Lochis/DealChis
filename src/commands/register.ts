import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types.js';
import { UpdateType } from '../types.js';
import { updateGuildToChannel } from '../mongo/index.js';

export const register: Command = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register a channel to get notified every 30 minutes (if there are new ones) for FREE deals!'),
  async execute(interaction) {
    const res = await updateGuildToChannel(interaction.guild!, interaction.channel!.id, UpdateType.Register)
    await interaction.reply({ content: res });
  },
};
