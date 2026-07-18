import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../types.js";
import { itad } from "../ITAD/client.js"

export const getDeals: Command = {
  data: new SlashCommandBuilder()
    .setName("getdeals")
    .setDescription("Gets the $0 deals from IsThereAnyDeal"),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const deals = await itad.getDeals();
      console.log(deals);
      const embeds = deals.map(d => new EmbedBuilder()
        .setTitle(d.title)
        .setURL(d.url)
        .setImage(d.banner ? d.banner : "https://placehold.co/10"));
      await interaction.editReply({ embeds });
    } catch (e) {
      console.error(e);
      await interaction.editReply("Couldn't fetch deals.");
    }
  },
}
