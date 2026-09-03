const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');
const Warning = require('../../models/Warning');

module.exports = {
  name: 'warnings',
  aliases: ['warns'],
  description: 'Voir les avertissements d\'un membre',
  usage: '+warnings [@membre]',
  category: 'moderation',
  requiresDb: true,
  permissions: ['ManageMessages'],
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first()
      || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null)
      || message.author;

    const warnings = await Warning.find({ guildId: message.guild.id, userId: target.id, active: true })
      .sort({ createdAt: -1 });

    if (warnings.length === 0) {
      return message.reply({ embeds: [new EmbedBuilder()
        .setColor('#57F287')
        .setTitle(`✅ ${target.tag} — Aucun avertissement`)
        .setDescription('Cet utilisateur n\'a aucun avertissement actif.')
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setTimestamp()] });
    }

    const list = warnings.slice(0, 10).map((w, i) =>
      `**${i + 1}.** \`${w.warnId}\` — ${w.reason}\n> Modérateur : <@${w.moderatorId}> | <t:${Math.floor(w.createdAt.getTime() / 1000)}:R>`
    ).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle(`⚠️ Avertissements de ${target.tag}`)
      .setDescription(list)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `${warnings.length} avertissement(s) total` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
