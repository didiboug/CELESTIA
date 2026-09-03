# 🤖 Bot Discord Full Communauté

Bot Discord complet avec préfixe **`+`**, construit avec Discord.js v14 et MongoDB.

## 🚀 Installation

```bash
cd discord-bot
npm install
```

## ⚙️ Configuration

1. Copie `.env.example` → `.env`
2. Remplis :
   - `DISCORD_TOKEN` — ton token Discord
   - `MONGODB_URI` — URI MongoDB Atlas
   - `OWNER_ID` — ton ID Discord (optionnel)

```bash
cp .env.example .env
# Édite .env avec tes valeurs
node src/index.js
```

## 📋 Commandes

| Préfixe | Toutes les commandes |
|---------|----------------------|
| `+`     | Voir `+help`         |

### 🛡️ Modération
`+ban` `+kick` `+mute` `+unmute` `+timeout` `+warn` `+warnings` `+clear` `+lock` `+unlock` `+slowmode` `+nick` `+purge` `+unban`

### 💰 Économie
`+balance` `+daily` `+work` `+crime` `+rob` `+deposit` `+withdraw` `+pay` `+shop` `+inventory` `+leaderboard`

### 🎵 Musique
`+play` `+skip` `+stop` `+queue` `+pause` `+resume` `+volume`

### 🎮 Fun
`+avatar` `+banner` `+meme` `+ship` `+8ball` `+dice` `+coinflip` `+iq` `+hack` `+hug` `+kiss` `+slap`

### 📈 Communauté
`+level` `+leveltop` `+afk` `+suggest` `+poll` `+confess` `+birthday` `+invite` `+inviteleaderboard`

### 🎉 Giveaway
`+gstart` `+greroll` `+gend`

### 🎫 Tickets
`+ticket` `+ticketpanel`

### 👑 Administration
`+setup` `+config` `+serverinfo` `+userinfo` `+additem` `+levelreward` `+resetxp` `+setmoney` `+unban` `+help`

## 🔧 Configuration rapide

```
+setup welcome #bienvenue
+setup goodbye #aurevoir
+setup logs #logs-mod
+setup autorole @Membre
+setup muterole @Mute
+setup tickets
+ticketpanel
+setup verification #verification @Vérifié
+setup suggestions #suggestions
+setup birthdays #anniversaires
+setup levels on #niveaux
+setup antimod antispam
+setup antimod antilink
```

## 🏗️ Structure

```
src/
├── index.js              # Point d'entrée
├── config.js             # Configuration
├── handlers/             # Chargeurs de commandes/événements
├── commands/
│   ├── moderation/       # Commandes de modération
│   ├── economy/          # Économie
│   ├── music/            # Musique (DisTube)
│   ├── fun/              # Divertissement
│   ├── community/        # Communauté & niveaux
│   ├── giveaway/         # Giveaways
│   ├── tickets/          # Système de tickets
│   └── admin/            # Administration
├── events/               # Événements Discord
├── models/               # Schémas MongoDB
└── utils/                # Utilitaires
```

## 📦 Stack

- **Discord.js v14**
- **MongoDB + Mongoose**
- **DisTube** (musique YouTube)
- **node-cron** (schedulers anniversaires/giveaways)
