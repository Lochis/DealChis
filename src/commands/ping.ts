import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types.js';

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with the bot latency.'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...' });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`Pong! Latency: ${latency}ms (API: ${interaction.client.ws.ping}ms)`);
  },
};
