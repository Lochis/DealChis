import { deployCommands } from './deploy.js';

const guildId = process.env.DISCORD_GUILD_ID;

try {
  console.log('Started refreshing application (/) commands.');
  await deployCommands(guildId);
} catch (error) {
  console.error(error);
}
