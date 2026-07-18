import { MongoClient, ServerApiVersion } from 'mongodb';
import { Guild } from "discord.js";
import { UpdateType } from '../types.js';
import { Deal } from '../ITAD/client.js';

const uri = process.env.MONGO_CONNECTION_STRING || "";

if (uri === "") {
  console.error("Mongo connection string is not set in env.");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export interface iGuildToChannel {
  id: string;
  name: string;
  channel_ids: string[];
}

export interface iCachedByChannel {
  channel_id: string;
  deal_ids: string[];
}


export async function saveGuildToChannel(guild: Guild) {
  // adds a guild id to GuildToChannel collection for later adding of channel.

  try {
    const db = client.db("DealChis");
    const guildtoChannel = db.collection("GuildToChannel");

    const doc: iGuildToChannel = {
      id: guild.id,
      name: guild.name,
      channel_ids: []
    };

    const res = await guildtoChannel.insertOne(doc);
    console.log(`GuildToChannel (up)inserted with _id: ${res.insertedId}`);
  } finally {
  }
}

export async function removeGuildToChannel(guild: Guild) {
  try {
    const db = client.db("DealChis");
    const guildtoChannel = db.collection<iGuildToChannel>("GuildToChannel");
    const cachedByChannel = db.collection<iCachedByChannel>("CachedByChannel");

    const doc = {
      id: guild.id
    }

    // get channelids and delete all CachedByChannel documents for each channel
    const guildToChannelDoc = await guildtoChannel.findOne(doc);
    const channelIds = guildToChannelDoc?.channel_ids;

    if (channelIds != undefined && channelIds.length > 0) {
      const res = await cachedByChannel.deleteMany({ channel_id: { $in: channelIds } })
      console.log(`${res.deletedCount} documents deleted in CachedByChannel for Guild ${guild.name}`);
    } else {
      console.log("No channels needed to be deleted.")
    }

    // delete guild from GuildtoChannel
    await guildtoChannel.deleteOne(doc);
    console.log(`Deleted guild ${guild.id} from mongodb`);

  } finally {
  }
}

export async function updateGuildToChannel(guild: Guild | iGuildToChannel, channelId: string, type: UpdateType): Promise<string> {
  // will unregister or register a channel to GuildToChannel collection.
  try {
    const db = client.db("DealChis");
    const guildtoChannel = db.collection<iGuildToChannel>("GuildToChannel");

    const query = {
      id: guild.id
    }

    let doc;

    // addToSet instead of push allows for the addition if does not already exist.
    doc = {
      $addToSet: { channel_ids: channelId }
    }

    if (type == UpdateType.Unregister)
      doc = {
        $pull: { channel_ids: channelId }
      }

    await guildtoChannel.updateOne(query, doc, { upsert: true })
    return `${type.toString()}ed Channel ${channelId}`;

  } catch (e) {
    return `Error in ${type.toString()}ing channel ${channelId}. ${e}`;
  } finally {
  }
}

export async function getGuildToChannel(): Promise<iGuildToChannel[]> {
  try {
    const db = client.db("DealChis");
    const guildtoChannel = db.collection<iGuildToChannel>("GuildToChannel");

    let guildstoChannels: iGuildToChannel[] = [];

    const cursor = guildtoChannel.find();

    for await (const doc of cursor) {
      guildstoChannels.push(doc);
    }
    return guildstoChannels;

  } catch (e) {
    console.error(`Error getting GuildToChannel documents from mongodb. ${e}`)
    return [];
  } finally {
  }
}

export async function getCachedByChannel(channelId: string): Promise<string[]> {
  try {
    const db = client.db("DealChis");
    const c = db.collection<iCachedByChannel>("CachedByChannel");

    const query = {
      channel_id: channelId
    }

    const cachedByChannel = await c.findOne(query);
    if (!cachedByChannel) {
      console.log(`No cached deals for channel ${channelId}`);
      return [];
    }

    const deals: string[] = cachedByChannel.deal_ids;
    return deals;

  } catch (e) {
    return [];
  } finally {
  }
}

export async function cacheDealsByChannel(channelId: string, deals: Deal[]) {
  try {
    const db = client.db("DealChis");
    const c = db.collection<iCachedByChannel>("CachedByChannel");

    const dealIds = deals.map(deal => deal.id);

    const query = {
      channel_id: channelId
    }

    let doc = {
      $addToSet: {
        deal_ids: { $each: dealIds }
      }
    }
    const res = await c.updateOne(query, doc, { upsert: true });
    if (res.modifiedCount > 0) {
      console.log(`Added deals for caching to channel ${channelId} to CachedByChannel`);
    } else {
      console.log(`No deals were added to cache for ${channelId}`);
    }

  } finally {
  }
}
