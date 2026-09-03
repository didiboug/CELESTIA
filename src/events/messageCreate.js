const config = require('../config');
const { handleCooldown } = require('../utils/cooldown');
const { handleAntiSpam, handleAntiLink, handleAntiInsult, handleAntiMention } = require('../utils/automod');
const { handleXp } = require('../utils/levelSystem');
const User = require('../models/User');
const Guild = require('../models/Guild');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    // Ignorer les bots et les DM
    if (message.author.bot || !message.guild) return;

    // ─── Fonctionnalités nécessitant la DB ────────
    if (client.dbConnected) {
      // Compteur de messages
      Guild.findOneAndUpdate(
        { guildId: message.guild.id },
        { $inc: { 'counters.messageCount': 1 } },
        { upsert: true }
      ).catch(() => {});

      // Système XP
      handleXp(message).catch(() => {});

      // AutoMod
      handleAntiSpam(message, client).catch(() => {});
      handleAntiLink(message).catch(() => {});
      handleAntiInsult(message).catch(() => {});
      handleAntiMention(message).catch(() => {});

      // Vérification AFK
      try {
        const afkData = await User.findOne({ userId: message.author.id, guildId: message.guild.id });
        if (afkData?.afk?.active) {
          afkData.afk.active = false;
          afkData.afk.reason = null;
          afkData.afk.since = null;
          await afkData.save();
          const msg = await message.reply(`👋 Bienvenue de retour ! Ton statut AFK a été retiré.`);
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }

        if (message.mentions.users.size > 0) {
          for (const [, user] of message.mentions.users) {
            const mentionedAfk = await User.findOne({ userId: user.id, guildId: message.guild.id });
            if (mentionedAfk?.afk?.active) {
              const since = mentionedAfk.afk.since
                ? `<t:${Math.floor(new Date(mentionedAfk.afk.since).getTime() / 1000)}:R>`
                : '';
              await message.reply(`💤 **${user.username}** est AFK ${since}\n> ${mentionedAfk.afk.reason || 'Aucune raison'}`).catch(() => {});
            }
          }
        }
      } catch (_) {}
    }

    // ─── Lecture du préfixe ───────────────────────
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;

    // ─── Parsing de la commande ───────────────────
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!commandName) return;

    // Chercher la commande (directe ou alias)
    const aliasTarget = client.aliases.get(commandName);
    const command = client.commands.get(commandName) || client.commands.get(aliasTarget);

    if (!command) return;

    // ─── Accès privé aux commandes ────────────────
    if (!config.allowedUserIds.includes(message.author.id)) {
      return message.reply({
        content: '❌ Tu n’es pas autorisé à utiliser les commandes de ce bot.',
      });
    }

    // ─── Permissions utilisateur ──────────────────
    if (command.permissions?.length > 0) {
      const { PermissionFlagsBits } = require('discord.js');
      const missing = command.permissions.filter(p => !message.member.permissions.has(PermissionFlagsBits[p]));
      if (missing.length > 0) {
        return message.reply({ content: `❌ Il te manque les permissions : ${missing.map(p => `\`${p}\``).join(', ')}` });
      }
    }

    // ─── Permissions bot ──────────────────────────
    if (command.botPermissions?.length > 0) {
      const { PermissionFlagsBits } = require('discord.js');
      const missing = command.botPermissions.filter(p => !message.guild.members.me.permissions.has(PermissionFlagsBits[p]));
      if (missing.length > 0) {
        return message.reply({ content: `❌ Je n'ai pas les permissions : ${missing.map(p => `\`${p}\``).join(', ')}` });
      }
    }

    // ─── Vérification NSFW ────────────────────────
    if (command.nsfw && !message.channel.nsfw) {
      return message.reply({ content: '🔞 Cette commande est réservée aux canaux NSFW.' });
    }

    // ─── Cooldown ─────────────────────────────────
    if (!handleCooldown(client, message, command)) return;

    // ─── Vérification DB si requise ───────────────
    if (command.requiresDb && !client.dbConnected) {
      return message.reply({ embeds: [
        new (require('discord.js').EmbedBuilder)()
          .setColor('#ED4245')
          .setTitle('❌ Base de données non connectée')
          .setDescription('La connexion à MongoDB n\'est pas encore établie.\n\nVérifie que ton `MONGODB_URI` est correct et que l\'IP de Replit est autorisée dans MongoDB Atlas → **Network Access** → **0.0.0.0/0**')
          .setTimestamp()
      ]});
    }

    // ─── Exécution ────────────────────────────────
    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`Erreur commande ${command.name}:`, err.message);
      message.reply({ content: `❌ Une erreur est survenue : ${err.message?.slice(0, 100)}` }).catch(() => {});
    }
  },
};
