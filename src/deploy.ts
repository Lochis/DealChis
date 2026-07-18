import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandList } from './commands/index.js';

export async function deployCommands(guildId?: string): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId) {
    throw new Error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment.');
  }

  const commands = commandList.map((command) => command.data.toJSON());
  const rest = new REST().setToken(token);

  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);

  const data = (await rest.put(route, { body: commands })) as unknown[];

  console.log(
    `[deploy] ${data.length} application (/) commands ${guildId ? `in guild ${guildId}` : 'globally'}.`,
  );
}
