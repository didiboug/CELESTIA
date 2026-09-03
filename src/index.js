require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const config = require('./config');
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');
const { startGiveawayScheduler } = require('./utils/giveawayScheduler');
const { startBirthdayScheduler } = require('./utils/birthdayScheduler');
const { startCounterScheduler } = require('./utils/counterScheduler');

// ─── Création du client Discord ───────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User,
  ],
});

// ─── Collections ──────────────────────────────────
client.commands   = new Collection(); // Map des commandes
client.cooldowns  = new Collection(); // Cooldowns des commandes
client.aliases    = new Collection(); // Alias des commandes
client.spamMap    = new Collection(); // Anti-spam
client.raidMap    = new Collection(); // Anti-raid
client.afkMap     = new Collection(); // AFK temporaire
client.ticketMap  = new Collection(); // Tickets actifs

// ─── DisTube (Musique) ────────────────────────────
client.distube = new DisTube(client, {
  emitNewSongOnly: false,
  joinNewVoiceChannel: true,
  plugins: [new YouTubePlugin()],
});

// Événements DisTube
client.distube
  .on('playSong', (queue, song) => {
    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎵 Lecture en cours')
      .setDescription(`**[${song.name}](${song.url})**`)
      .addFields(
        { name: '⏱️ Durée', value: song.formattedDuration, inline: true },
        { name: '👤 Demandé par', value: `${song.user}`, inline: true },
        { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
      )
      .setThumbnail(song.thumbnail)
      .setTimestamp();
    queue.textChannel?.send({ embeds: [embed] }).catch(() => {});
  })
  .on('addSong', (queue, song) => {
    queue.textChannel?.send(`➕ **${song.name}** ajouté à la file d'attente. Position : \`${queue.songs.length}\``).catch(() => {});
  })
  .on('error', (error, queue) => {
    console.error('DisTube error:', error.message);
    queue?.textChannel?.send(`❌ Erreur musique : ${error.message}`).catch(() => {});
  })
  .on('empty', (queue) => {
    queue.textChannel?.send('👋 Canal vocal vide, je quitte.').catch(() => {});
  })
  .on('finish', (queue) => {
    queue.textChannel?.send('✅ File d\'attente terminée.').catch(() => {});
  });

// ─── Base de données locale (NeDB) ───────────────
require('./db'); // Initialise les fichiers de données locaux
client.dbConnected = true;
console.log('✅ Base de données locale initialisée (fichiers JSON)');

// ─── Chargement des commandes & événements ────────
commandHandler(client);
eventHandler(client);

// ─── Schedulers ───────────────────────────────────
client.once('ready', () => {
  startGiveawayScheduler(client);
  startBirthdayScheduler(client);
  startCounterScheduler(client);
});

// ─── Gestion des erreurs globales ─────────────────
process.on('unhandledRejection', (reason) => {
  console.error('❌ Rejection non gérée:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
});

// ─── Connexion du bot ─────────────────────────────
client.login(config.token)
  .catch(err => {
    console.error('❌ Impossible de se connecter à Discord:', err.message);
    console.error('Vérifie que DISCORD_TOKEN est correct dans ton fichier .env');
    process.exit(1);
  });
