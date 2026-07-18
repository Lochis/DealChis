import cron from 'node-cron';
import type { Client, TextChannel } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import { getGuildToChannel, iGuildToChannel, getCachedByChannel, cacheDealsByChannel, updateGuildToChannel } from '../mongo/index.js';
import { Deal, itad } from '../ITAD/client.js';
import { UpdateType } from '../types.js';

export function registerThirtyMinuteJob(client: Client): void {
  // Runs every day at 09:00 in the server's local timezone.
  // Change the expression below to adjust the schedule (see https://crontab.guru).
  cron.schedule('0,30 * * * *', async () => {
    try {
      await sendDeals(client);
    } catch (error) {
      console.error('[30 min] Failed to send deals:', error);
    }
  });

  console.log('[30 min] Scheduled job for every 30 minutes.');
}

// TODO: move to ITAD client
async function sendDeals(client: Client) {
  const guildstoChannels: iGuildToChannel[] = await getGuildToChannel();

  const deals: Deal[] = await itad.getDeals();

  // in each guild, send messages to each channel id
  for (const guild of guildstoChannels) {
    console.log(`Sending for Guild ${guild.name} (${guild.id})`)
    for (const channelId of guild.channel_ids) {
      // finding channel in discord guild
      const channel = (await client.channels.fetch(channelId)) as TextChannel | null;
      try {
        if (channel == null) {
          await updateGuildToChannel(guild, channelId, UpdateType.Unregister);
          throw new Error("Channel does not exist.");
        }
        // get cached deals for the channel id
        const cachedByChannel = await getCachedByChannel(channelId);

        const embeds: EmbedBuilder[] = await createDealEmbeds(deals, cachedByChannel);
        const embedBatches: EmbedBuilder[][] = [];

        for (let i = 0; i < embeds.length; i += 10) {
          const batch: EmbedBuilder[] = embeds.slice(i, i + 10);
          embedBatches.push(batch);
        }

        for (const batch of embedBatches) {
          await channel.send({ embeds: batch });
        }

        await cacheDealsByChannel(channelId, deals);

      } catch (e) {
        console.error(e);
      }

    }
  }
}

// TODO: move to ITAD client, or somewhere better...
async function createDealEmbeds(deals: Deal[], cachedDeals: string[]): Promise<EmbedBuilder[]> {
  try {
    const filteredDeals = deals.filter(deal => !cachedDeals.includes(deal.id));

    const embeds = filteredDeals.map(d => {
      const stores = d.drm.map(s => s.name).join(", ");
      return new EmbedBuilder()
        .setTitle(d.title)
        .setURL(d.url)
        .setImage(d.banner ?? "https://placehold.co")
        .addFields(
          { name: "Store", value: stores || "—", inline: true },
          { name: "Price", value: `~~$${d.regPrice}~~ **Free**`, inline: true },
        );
    });

    return embeds;
  } catch (e) {
    console.error(e);
    return [];
  }
}

