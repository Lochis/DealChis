import { MongoClient, ServerApiVersion } from 'mongodb';
import { Guild, Channel } from "discord.js";
import { UpdateType } from '../types.js';

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

interface iGuildToChannel {
  guild_id: string;
  guild_name: string;
  channel_ids: string[];
}


export async function saveGuildToChannel(guild: Guild) {
  // adds a guild id to GuildToChannel collection for later adding of channel.

  try {
    await client.connect();
    const db = client.db("DealChis");
    const guildtoChannel = db.collection("GuildToChannel");

    const doc: iGuildToChannel = {
      guild_id: guild.id,
      guild_name: guild.name,
      channel_ids: []
    };

    const res = await guildtoChannel.insertOne(doc);
    console.log(`GuildToChannel inserted with _id: ${res.insertedId}`);
  } finally {
    await client.close();
  }
}

export async function removeGuildToChannel(guild: Guild) {
  try {
    await client.connect();
    const db = client.db("DealChis");
    const guildtoChannel = db.collection<iGuildToChannel>("GuildToChannel");

    const doc = {
      guild_id: guild.id
    }

    await guildtoChannel.deleteOne(doc);
    console.log(`Deleted guild ${guild.id} from mongodb`);

  } finally {
    await client.close();
  }
}

export async function updateGuildToChannel(guild: Guild, channel: Channel, type: UpdateType): Promise<string> {
  // will unregister or register a channel to GuildToChannel collection.
  try {
    await client.connect();
    const db = client.db("DealChis");
    const guildtoChannel = db.collection<iGuildToChannel>("GuildToChannel");

    const query = {
      guild_id: guild.id
    }

    let doc;

    // addToSet instead of push allows for the addition if does not already exist.
    doc = {
      $addToSet: { channel_ids: channel.id }
    }

    if (type == UpdateType.Unregister)
      doc = {
        $pull: { channel_ids: channel.id }
      }

    await guildtoChannel.updateOne(query, doc)
    return `${type.toString()}ed Channel ${channel.id}`;

  } catch (e) {
    return `Error in ${type.toString()}ing channel ${channel.id}. ${e}`;
  } finally {
    await client.close();
  }


}
