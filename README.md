# DealChis

A Discord bot that posts free game deals from [IsThereAnyDeal](https://isthereanydeal.com) — on demand via a slash command, or automatically to channels that opt in.

## Features

- `/getdeals` — fetch current $0 deals on demand (not the same styling as the automatic deal pings via /register)
- `/register` — opt a channel into automatic deal pings
- `/unregister` — stop automatic pings in a channel
- `/ping` — bot latency check
- Auto-syncs slash commands on startup and whenever it joins a new server

## Commands

### `/register`

Registers the **current channel** for automatic deal pings. The bot will post new free deals here whenever the scheduled job runs.

**Usage:** type `/register` in the channel you want deals sent to.

**Expected reply:** `Registered Channel <channel-id>` (or an error string if something goes wrong).

### `/unregister`

Stops deal pings in the **current channel**. The channel is removed from the guild's registered list.

**Usage:** type `/unregister` in the channel you want to stop getting pings in.

**Expected reply:** `Unregistereded Channel <channel-id>` (sic — current output; will be cleaned up in a future pass).

### `/getdeals`

Fetches the current list of free deals and posts them as embeds. Useful for one-off lookups in any channel, registered or not.

### `/ping`

Replies with bot latency and Discord WebSocket ping. Useful for sanity-checking that the bot is alive.

## Invite the bot to your server

When adding the bot to a Discord server, use the Discord Developer Portal's OAuth2 URL Builder with:

- **Scopes:** `bot`, `applications.commands`
- **Bot permissions:**
  - Send Messages
  - Embed Links

The resulting URL looks like:


> The bot declares only the `Guilds` intent, so no privileged intents need to be enabled in the Developer Portal.

## Run locally

### Prerequisites

- **Node.js 22+** (matches the Dockerfile; Node 24 also works)
- A **MongoDB** instance (Atlas free tier or local)
- An **IsThereAnyDeal API key** — create an account at isthereanydeal.com and generate one
- A **Discord application + bot token** — create one at the Discord Developer Portal

### Environment variables

Create a `.env` file in the project root. Required and optional variables:

| Variable | Required? | Purpose |
| --- | --- | --- |
| `DISCORD_TOKEN` | **yes** | Bot login |
| `MONGO_CONNECTION_STRING` | **yes** | MongoDB connection URI |
| `ITAD_API_KEY` | **yes** | Calls to IsThereAnyDeal `/deals/v2` |
| `DISCORD_CLIENT_ID` | **yes\*** | Slash command auto-deploy on startup/guild join |
| `DISCORD_GUILD_ID` | optional | Restrict `npm run deploy` to a single guild |


Minimal `.env` for a fully functional bot:

```dotenv
DISCORD_TOKEN=your-bot-token
MONGO_CONNECTION_STRING=mongodb+srv://user:pass@host/dealchis
ITAD_API_KEY=your-itad-api-key
DISCORD_CLIENT_ID=123456789012345678
```

### Install and run

```bash
npm install
npm run dev
```

`npm run dev` uses `tsx watch` and hot-reloads on file changes.

For a production-style local run:

```bash
npm run build
npm start
```

### Manual slash command deploy (optional)

```bash
npm run deploy
```

This pushes slash commands globally (or to `DISCORD_GUILD_ID` if set). Not required for normal operation — the bot auto-syncs commands to every guild on startup and whenever it joins a new server.

## Run in Docker

### Build the image

```bash
docker build -t dealchis .
```

### Run the container

```bash
docker run --restart unless-stopped \
  --env-file .env \
  dealchis
```

The image has **no exposed ports** — the bot is an outbound Discord gateway client, not a server. Environment variables are injected at runtime; nothing sensitive is baked into the image.

### Push to GitHub Container Registry (optional)

```bash
docker login ghcr.io -u YOUR_GITHUB_USERNAME
docker build -t ghcr.io/your-username/dealchis:0.0.1 .
docker push ghcr.io/your-username/dealchis:0.0.1
```

Image names must be **lowercase**. If the package is set to private, your runtime environment will need an image pull secret.

## Run in Kubernetes

Recommended for always-on deployments. Apply order matters: namespace → secret → deployment.

### 1. Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dealchis
```

### 2. Secret

Create imperatively (recommended — values never touch a file):

```bash
kubectl create secret generic dealchis-secrets \
  --namespace=dealchis \
  --from-literal=DISCORD_TOKEN='...' \
  --from-literal=MONGO_CONNECTION_STRING='...' \
  --from-literal=ITAD_API_KEY='...' \
  --from-literal=DISCORD_CLIENT_ID='...'
```

Or via Portainer: cluster → **Configurations & Secrets** → add a Secret with the key/value pairs above.

### 3. Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dealchis-bot
  namespace: dealchis
  labels:
    app: dealchis-bot
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dealchis-bot
  template:
    metadata:
      labels:
        app: dealchis-bot
    spec:
      imagePullSecrets:
        - name: reg-credentials-ghcr   # only if the GHCR package is private
      containers:
        - name: dealchis-bot
          image: ghcr.io/lochis/dealchis:0.0.1
          imagePullPolicy: Always
          envFrom:
            - secretRef:
                name: dealchis-secrets
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

Apply:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml      # if you went the manifest route instead of imperative
kubectl apply -f deployment.yaml
```

### Notes

- **Keep `replicas: 1`.** Discord bots must not be scaled horizontally — multiple replicas would each connect to the gateway and double-handle every event.
- **Pin image tags.** Prefer immutable tags (`:0.0.1`, sha256 digests) over `:latest` so rollouts are predictable.
- **No Service needed.** Nothing inside the cluster needs to reach the bot over the network — it's an outbound client.

## Project layout

```
src/
├── ITAD/
│   └── client.ts          # IsThereAnyDeal API wrapper
├── commands/
│   ├── getDeals.ts
│   ├── ping.ts
│   ├── register.ts
│   ├── unregister.ts
│   └── index.ts           # Command registry
├── events/
│   ├── guildCreate.ts     # Saves guild to Mongo + deploys commands on join
│   ├── guildDelete.ts     # Cleans up Mongo docs when removed
│   ├── interactionCreate.ts
│   └── ready.ts           # Logs in, syncs commands to existing guilds
├── jobs/
│   └── daily.ts           # Scheduled deal-posting cron
├── mongo/
│   └── index.ts           # MongoDB data access layer
├── deploy.ts              # Reusable command-deploy function
├── deploy-commands.ts     # Standalone deploy script (`npm run deploy`)
├── types.ts
└── index.ts               # Entry point
```

## Notes and caveats

- The `/register` command description claims deals are posted "every 30 minutes," but the actual cron schedule in `src/jobs/daily.ts` is **once per day at 16:50 server time**. Adjust the cron expression in `src/jobs/daily.ts` to change the cadence.
- Deals are filtered to **$0 / free** only (`src/ITAD/client.ts`).
- The bot stores per-guild channel registrations in MongoDB (`GuildToChannel` collection) and dedupes already-sent deals per channel (`CachedByChannel` collection).
