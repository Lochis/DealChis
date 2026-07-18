import { SlashCommandBuilder } from 'discord.js';
import { UpdateType, type Command } from '../types.js';
import { updateGuildToChannel } from '../mongo/index.js';

export const unregister: Command = {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Unregister a registered channel'),
  async execute(interaction) {
    const res = await updateGuildToChannel(interaction.guild!, interaction.channel!.id, UpdateType.Unregister)
    await interaction.reply({ content: res });
  },
};
