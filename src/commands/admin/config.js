const { EmbedBuilder } = require('discord.js');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'config',
  aliases: ['configuration', 'botconfig'],
  description: 'Voir la configuration actuelle du bot',
  usage: '+config',
  category: 'admin',
  requiresDb: true,
  permissions: ['ManageGuild'],
  cooldown: 5,

  async execute(message, args, client) {
    const guildData = await Guild.findOne({ guildId: message.guild.id });

    if (!guildData) {
      return message.reply({ content: 'Aucune configuration trouvée. Utilise `+setup` pour configurer le bot.' });
    }

    const check = (val) => val ? '✅' : '❌';
    const channel = (id) => id ? `<#${id}>` : '❌ Non configuré';
    const role = (id) => id ? `<@&${id}>` : '❌ Non configuré';

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`⚙️ Configuration — ${message.guild.name}`)
      .addFields(
        {
          name: '👋 Bienvenue / Au revoir',
          value: `Bienvenue : ${check(guildData.welcome.enabled)} ${channel(guildData.welcome.channelId)}\nAu revoir : ${check(guildData.goodbye.enabled)} ${channel(guildData.goodbye.channelId)}`,
          inline: false
        },
        {
          name: '🛡️ Modération',
          value: `Logs : ${check(guildData.logs.enabled)} ${channel(guildData.logs.channelId)}\nRôle mute : ${role(guildData.muteRoleId)}`,
          inline: false
        },
        {
          name: '🔒 AutoMod',
          value: `Anti-spam : ${check(guildData.automod.antiSpam)} | Anti-lien : ${check(guildData.automod.antiLink)}\nAnti-insulte : ${check(guildData.automod.antiInsult)} | Anti-raid : ${check(guildData.automod.antiRaid)}\nAnti-alt : ${check(guildData.automod.antiAlt)} | Anti-mention : ${check(guildData.automod.antiMention)}`,
          inline: false
        },
        {
          name: '🎫 Tickets',
          value: `Activé : ${check(guildData.tickets.enabled)}\nLogs : ${channel(guildData.tickets.logChannelId)}\nTotal créés : ${guildData.tickets.ticketCount || 0}`,
          inline: false
        },
        {
          name: '🎁 Niveaux & Économie',
          value: `XP activé : ${check(guildData.levels.enabled)}\nCanal niveau : ${channel(guildData.levels.channelId)}`,
          inline: false
        },
        {
          name: '📢 Communauté',
          value: `Suggestions : ${check(guildData.suggestions.enabled)} ${channel(guildData.suggestions.channelId)}\nAnniversaires : ${check(guildData.birthdays.enabled)} ${channel(guildData.birthdays.channelId)}\nVérification : ${check(guildData.verification.enabled)} Canal: ${channel(guildData.verification.channelId)}`,
          inline: false
        }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
