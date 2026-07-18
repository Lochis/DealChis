import { Events } from "discord.js";
import { Event } from "../types.js";
import { removeGuildToChannel } from "../mongo/index.js";

export const guildDelete: Event<Events.GuildDelete> = {
  name: Events.GuildDelete,
  async execute(guild) {
    await removeGuildToChannel(guild).catch(console.dir);
    console.log(`Removed from guild Name: ${guild.name} | ID: ${guild.id}`);
  }
}
