const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  aliases: ['si', 'server', 'serveur'],
  description: 'Informations sur le serveur',
  usage: '+serverinfo',
  category: 'admin',
  cooldown: 10,

  async execute(message, args, client) {
    const guild = message.guild;
    await guild.members.fetch();

    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = guild.memberCount - bots;
    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === 0).size;
    const voiceChannels = channels.filter(c => c.type === 2).size;
    const categories = channels.filter(c => c.type === 4).size;

    const verificationLevels = { NONE: 'Aucune', LOW: 'Faible', MEDIUM: 'Moyenne', HIGH: 'Élevée', VERY_HIGH: 'Très élevée' };

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📋 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Membres', value: `Total: **${guild.memberCount}** | Humains: **${humans}** | Bots: **${bots}**`, inline: false },
        { name: '📺 Canaux', value: `Texte: **${textChannels}** | Vocal: **${voiceChannels}** | Catégories: **${categories}**`, inline: false },
        { name: '✨ Boosts', value: `**${guild.premiumSubscriptionCount}** (Niveau ${guild.premiumTier})`, inline: true },
        { name: '🎭 Rôles', value: `**${guild.roles.cache.size}**`, inline: true },
        { name: '😀 Emojis', value: `**${guild.emojis.cache.size}**`, inline: true },
        { name: '🔒 Vérification', value: guild.verificationLevel.toString(), inline: true },
      )
      .setImage(guild.bannerURL({ size: 1024 }) || null)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
