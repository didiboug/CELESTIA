const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'setup',
  description: 'Configurer les fonctionnalités du bot',
  usage: '+setup <module> [options...]',
  category: 'admin',
  requiresDb: true,
  permissions: ['Administrator'],
  cooldown: 5,

  async execute(message, args, client) {
    const module = args[0]?.toLowerCase();

    if (!module) {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('⚙️ Configuration du Bot')
        .setDescription('Utilise `+setup <module>` pour configurer un module.')
        .addFields(
          { name: '📋 Modules disponibles', value:
            '`welcome` — Canal de bienvenue\n' +
            '`goodbye` — Canal d\'au revoir\n' +
            '`autorole` — Rôle automatique\n' +
            '`logs` — Canal de logs\n' +
            '`tickets` — Système de tickets\n' +
            '`suggestions` — Canal de suggestions\n' +
            '`levels` — Système de niveaux\n' +
            '`birthdays` — Anniversaires\n' +
            '`muterole` — Rôle mute\n' +
            '`verification` — Système de vérification\n' +
            '`antimod` — AutoMod (spam/lien/insulte/raid)\n' +
            '`counters` — Compteurs statistiques' }
        )
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const guildData = await Guild.findOneAndUpdate(
      { guildId: message.guild.id },
      {},
      { upsert: true, new: true }
    );

    switch (module) {
      // ─── Welcome ──────────────────────────────────
      case 'welcome': {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un canal : `+setup welcome #canal`')] });
        guildData.welcome.channelId = channel.id;
        guildData.welcome.enabled = true;
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Welcome configuré', `Les messages de bienvenue seront envoyés dans ${channel}.`)] });
      }

      case 'welcomemsg': {
        const msg = args.slice(1).join(' ');
        if (!msg) return message.reply({ embeds: [errorEmbed('Erreur', 'Indique un message.\nVariables : `{user}`, `{username}`, `{server}`, `{count}`')] });
        guildData.welcome.message = msg;
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Message de bienvenue mis à jour', `Nouveau message :\n${msg}`)] });
      }

      // ─── Goodbye ──────────────────────────────────
      case 'goodbye': {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un canal : `+setup goodbye #canal`')] });
        guildData.goodbye.channelId = channel.id;
        guildData.goodbye.enabled = true;
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Goodbye configuré', `Les messages d\'au revoir seront envoyés dans ${channel}.`)] });
      }

      // ─── Auto-Rôle ────────────────────────────────
      case 'autorole': {
        const role = message.mentions.roles.first();
        if (!role) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un rôle : `+setup autorole @role`')] });
        await Guild.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { autorole: { roleId: role.id, enabled: true } } },
          { upsert: true }
        );
        return message.reply({ embeds: [successEmbed('✅ Auto-rôle configuré', `Le rôle ${role} sera automatiquement donné aux nouveaux membres.`)] });
      }

      // ─── Logs ────────────────────────────────────
      case 'logs': {
        const { ChannelType, PermissionFlagsBits } = require('discord.js');
        const msg0 = await message.reply({ embeds: [infoEmbed('⏳ Création en cours...', 'Je crée la catégorie et les salons de logs...')] });

        // Créer la catégorie
        const category = await message.guild.channels.create({
          name: `${message.guild.me?.displayName || 'Bot'} • logs`,
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            { id: message.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: message.guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory] },
            { id: message.author.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] },
          ],
        }).catch(() => null);

        const logChannels = [
          { name: 'raid-logs',  key: 'raidLogs' },
          { name: 'mod-logs',   key: 'modLogs' },
          { name: 'msg-logs',   key: 'msgLogs' },
          { name: 'rôle-logs',  key: 'roleLogs' },
          { name: 'voice-logs', key: 'voiceLogs' },
          { name: 'boost-logs', key: 'boostLogs' },
          { name: 'general-logs', key: 'generalLogs' },
        ];

        if (!guildData.logs) guildData.logs = {};
        guildData.logs.enabled = true;
        if (category) {
          guildData.logs.categoryId = category.id;
        }

        for (const { name, key } of logChannels) {
          let ch = message.guild.channels.cache.find(channel =>
            channel.type === ChannelType.GuildText &&
            channel.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() ===
              name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
          );

          if (!ch) {
            ch = await message.guild.channels.create({
              name,
              type: ChannelType.GuildText,
              parent: category?.id || null,
              permissionOverwrites: [
                { id: message.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: message.guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory] },
                { id: message.author.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] },
              ],
            }).catch(() => null);
          } else {
            await ch.permissionOverwrites.edit(message.guild.members.me, {
              ViewChannel: true,
              SendMessages: true,
              EmbedLinks: true,
              ReadMessageHistory: true,
            }).catch(() => {});
            await ch.permissionOverwrites.edit(message.author, {
              ViewChannel: true,
              ReadMessageHistory: true,
            }).catch(() => {});
          }

          if (ch) {
            guildData.logs[key] = ch.id;
            await ch.send(`✅ **${name} fonctionne.** Configuration effectuée par ${message.author}.`).catch(error => {
              console.error(`❌ Test ${name} impossible: ${error.message}`);
            });
          }
        }

        await guildData.save();
        await msg0.edit({ embeds: [successEmbed('✅ Logs configurés', `Catégorie **${category?.name || 'logs'}** configurée avec 7 salons :\n• raid-logs\n• mod-logs\n• msg-logs\n• rôle-logs\n• voice-logs\n• boost-logs\n• general-logs (reçoit tout)`)] });
        return;
      }

      // ─── Salons de logs individuels ───────────────
      case 'raidlogs':
      case 'modlogs':
      case 'msglogs':
      case 'rolelogs':
      case 'voicelogs':
      case 'boostlogs':
      case 'generallogs': {
        const channel = message.mentions.channels.first();
        if (!channel?.isTextBased()) {
          return message.reply({ embeds: [errorEmbed('Erreur', `Mentionne le salon à utiliser : \`+setup ${module} #salon\``)] });
        }

        const keys = {
          raidlogs: 'raidLogs',
          modlogs: 'modLogs',
          msglogs: 'msgLogs',
          rolelogs: 'roleLogs',
          voicelogs: 'voiceLogs',
          boostlogs: 'boostLogs',
          generallogs: 'generalLogs',
        };

        guildData.logs ||= {};
        guildData.logs.enabled = true;
        guildData.logs[keys[module]] = channel.id;
        await guildData.save();
        await channel.send(`✅ **${module} fonctionne.** Configuration effectuée par ${message.author}.`).catch(error => {
          console.error(`❌ Test ${module} impossible: ${error.message}`);
        });

        return message.reply({
          embeds: [successEmbed('Salon de logs configuré', `Les événements **${module}** seront envoyés dans ${channel}.`)],
        });
      }

      case 'ticketlogs': {
        const channel = message.mentions.channels.first();
        if (!channel?.isTextBased()) {
          return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne le salon : `+setup ticketlogs #ticket-logs`')] });
        }

        guildData.tickets ||= {};
        guildData.tickets.enabled = true;
        guildData.tickets.logChannelId = channel.id;
        await guildData.save();

        return message.reply({
          embeds: [successEmbed('Tickets activés', `Le système de tickets est activé.\nLes ouvertures et fermetures seront envoyées dans ${channel}.`)],
        });
      }

      // ─── Tickets ──────────────────────────────────
      case 'tickets': {
        const category = message.guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase().includes('ticket'));
        guildData.tickets.enabled = true;
        if (category) guildData.tickets.categoryId = category.id;
        const logChannel = message.mentions.channels.first();
        if (logChannel) guildData.tickets.logChannelId = logChannel.id;
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Tickets activés', `Le système de tickets est activé.\nUtilise \`+ticketpanel\` pour créer le panel.`)] });
      }

      // ─── Suggestions ──────────────────────────────
      case 'suggestions': {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un canal : `+setup suggestions #canal`')] });
        guildData.suggestions.channelId = channel.id;
        guildData.suggestions.enabled = true;
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Suggestions configurées', `Les suggestions seront envoyées dans ${channel}.`)] });
      }

      // ─── Niveaux ──────────────────────────────────
      case 'levels': {
        const toggle = args[1]?.toLowerCase();
        if (toggle === 'off' || toggle === 'disable') {
          guildData.levels.enabled = false;
        } else {
          guildData.levels.enabled = true;
          const channel = message.mentions.channels.first();
          if (channel) guildData.levels.channelId = channel.id;
        }
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Niveaux', guildData.levels.enabled ? `Système de niveaux activé !${guildData.levels.channelId ? ` Canal : <#${guildData.levels.channelId}>` : ''}` : 'Système de niveaux désactivé.')] });
      }

      // ─── Anniversaires ────────────────────────────
      case 'birthdays': {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un canal : `+setup birthdays #canal`')] });
        guildData.birthdays.channelId = channel.id;
        guildData.birthdays.enabled = true;
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Anniversaires configurés', `Les anniversaires seront annoncés dans ${channel}.`)] });
      }

      // ─── Rôle Mute ────────────────────────────────
      case 'muterole': {
        const role = message.mentions.roles.first();
        if (!role) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un rôle : `+setup muterole @role`')] });
        guildData.muteRoleId = role.id;
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Rôle mute configuré', `${role} sera utilisé pour les mutes.`)] });
      }

      // ─── Vérification ────────────────────────────
      case 'verification': {
        const channel = message.mentions.channels.first();
        const role = message.mentions.roles.first();
        if (!channel || !role) return message.reply({ embeds: [errorEmbed('Erreur', 'Utilise : `+setup verification #canal @role`')] });
        guildData.verification.channelId = channel.id;
        guildData.verification.roleId = role.id;
        guildData.verification.enabled = true;
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Vérification configurée', `Canal : ${channel}\nRôle : ${role}`)] });
      }

      // ─── AutoMod ─────────────────────────────────
      case 'antimod': {
        const sub = args[1]?.toLowerCase();
        const map = { antispam: 'antiSpam', antilink: 'antiLink', antiinsult: 'antiInsult', antiraid: 'antiRaid', antialt: 'antiAlt', antimention: 'antiMention' };
        const key = map[sub];
        if (!key) return message.reply({ embeds: [errorEmbed('Erreur', 'Modules : `antispam`, `antilink`, `antiinsult`, `antiraid`, `antialt`, `antimention`')] });
        guildData.automod[key] = !guildData.automod[key];
        await guildData.save();
        return message.reply({ embeds: [successEmbed('AutoMod', `\`${sub}\` est maintenant **${guildData.automod[key] ? 'activé' : 'désactivé'}**.`)] });
      }

      // ─── Compteurs ────────────────────────────────
      case 'counters': {
        const type = args[1]?.toLowerCase();
        const channel = message.mentions.channels.first();
        if (!type || !channel) return message.reply({ embeds: [errorEmbed('Usage', '`+setup counters <type> #canal`\nTypes : `members`, `bots`, `boosts`, `tickets`, `messages`')] });
        const counterMap = { members: 'membersChannelId', bots: 'botsChannelId', boosts: 'boostsChannelId', tickets: 'ticketsChannelId', messages: 'messagesChannelId' };
        const key = counterMap[type];
        if (!key) return message.reply({ embeds: [errorEmbed('Type inconnu', 'Types valides : `members`, `bots`, `boosts`, `tickets`, `messages`')] });
        guildData.counters[key] = channel.id;
        await guildData.save();
        return message.reply({ embeds: [successEmbed('Compteur configuré', `Le compteur \`${type}\` est lié à ${channel}.`)] });
      }

      default:
        return message.reply({ embeds: [errorEmbed('Module inconnu', `Module \`${module}\` inconnu. Utilise \`+setup\` pour voir la liste.`)] });
    }
  },
};
