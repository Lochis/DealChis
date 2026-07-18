import cron from 'node-cron';
import type { Client, TextChannel } from 'discord.js';

export function registerDailyJob(client: Client): void {
  // Runs every day at 09:00 in the server's local timezone.
  // Change the expression below to adjust the schedule (see https://crontab.guru).
  cron.schedule('0 9 * * *', async () => {
    const channelId = process.env.DAILY_CHANNEL_ID;
    if (!channelId) {
      console.warn('[daily] DAILY_CHANNEL_ID is not set, skipping.');
      return;
    }

    try {
      const channel = (await client.channels.fetch(channelId)) as TextChannel | null;
      if (!channel?.isTextBased()) {
        console.warn(`[daily] Channel ${channelId} is not a text channel.`);
        return;
      }
      await channel.send('Good morning! This is your daily scheduled message.');
    } catch (error) {
      console.error('[daily] Failed to send message:', error);
    }
  });

  console.log('[daily] Scheduled daily job for 09:00.');
}
