const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');
const Giveaway = require('../../models/Giveaway');

function parseDuration(str) {
  const match = str?.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const n = parseInt(match[1]);
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * map[match[2]];
}

function formatDuration(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [d && `${d}j`, h && `${h}h`, m && `${m}min`, s && `${s}s`].filter(Boolean).join(' ');
}

module.exports = {
  name: 'gstart',
  aliases: ['gcreate'],
  description: 'Lancer un giveaway',
  usage: '+gstart <durée> <gagnants> <lot>',
  category: 'giveaway',
  requiresDb: true,
  permissions: ['ManageGuild'],
  cooldown: 10,

  async execute(message, args, client) {
    if (args.length < 3) {
      return message.reply({ embeds: [errorEmbed('Usage', '`+gstart <durée> <gagnants> <lot>`\nEx: `+gstart 1h 2 Nitro`')] });
    }

    const duration = parseDuration(args[0]);
    if (!duration) return message.reply({ embeds: [errorEmbed('Durée invalide', 'Exemples : `30m`, `2h`, `1d`')] });

    const winners = parseInt(args[1]);
    if (isNaN(winners) || winners < 1 || winners > 20) {
      return message.reply({ embeds: [errorEmbed('Erreur', 'Le nombre de gagnants doit être entre 1 et 20.')] });
    }

    const prize = args.slice(2).join(' ');
    const endsAt = new Date(Date.now() + duration);

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🎉 GIVEAWAY — ${prize}`)
      .setDescription(`Clique sur 🎉 pour participer !\n\n**Lot :** ${prize}\n**Gagnant(s) :** ${winners}\n**Fin :** <t:${Math.floor(endsAt.getTime() / 1000)}:R> (<t:${Math.floor(endsAt.getTime() / 1000)}:F>)`)
      .addFields({ name: '🎟️ Organisateur', value: `${message.author}`, inline: true })
      .setFooter({ text: `Durée : ${formatDuration(duration)}` })
      .setTimestamp(endsAt);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('giveaway_join_PLACEHOLDER')
        .setLabel('🎉 Participer (0)')
        .setStyle(ButtonStyle.Primary)
    );

    const gMsg = await message.channel.send({ embeds: [embed], components: [row] });

    // Mettre à jour avec le vrai messageId
    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_join_${gMsg.id}`)
        .setLabel('🎉 Participer (0)')
        .setStyle(ButtonStyle.Primary)
    );
    await gMsg.edit({ components: [row2] });

    await Giveaway.create({
      guildId: message.guild.id,
      channelId: message.channel.id,
      messageId: gMsg.id,
      hostId: message.author.id,
      prize,
      winners,
      endsAt,
    });

    await message.reply({ content: `✅ Giveaway lancé dans ${message.channel} !` }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
  },
};
