import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types.js';
import { UpdateType } from '../types.js';
import { updateGuildToChannel } from '../mongo/index.js';

export const register: Command = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register a channel with notifications at 9:00AM every day for new deals!'),
  async execute(interaction) {
    const res = await updateGuildToChannel(interaction.guild!, interaction.channel!, UpdateType.Register)
    await interaction.reply({ content: res });
  },
};
