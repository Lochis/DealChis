import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandList } from './commands/index.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  throw new Error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment.');
}

const commands = commandList.map((command) => command.data.toJSON());

const rest = new REST().setToken(token);

await (async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const route = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);

    const data = (await rest.put(route, { body: commands })) as unknown[];

    console.log(
      `Successfully reloaded ${data.length} application (/) commands ${guildId ? `in guild ${guildId}` : 'globally'
      }.`,
    );
  } catch (error) {
    console.error(error);
  }
})();
