import { Events } from "discord.js";
import { Event } from "../types.js";
import { saveGuildToChannel } from "../mongo/index.js";
import { deployCommands } from "../deploy.js";

export const guildCreate: Event<Events.GuildCreate> = {
  name: Events.GuildCreate,
  execute(guild) {
    console.log(`Joined new server! Name: ${guild.name} | ID: ${guild.id}`);
    saveGuildToChannel(guild).catch(console.dir);
    deployCommands(guild.id).catch(console.dir);
  }
}

