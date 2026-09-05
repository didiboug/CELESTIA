const { EmbedBuilder } = require('discord.js');
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

    const endTimestamp = Math.floor(endsAt.getTime() / 1000);
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎉 NOUVEAU GIVEAWAY')
      .setDescription(
        [
          `## ${prize}`,
          '',
          'Clique sur la réaction **🎉** sous ce message pour participer.',
          'Retire ta réaction pour annuler ta participation.',
        ].join('\n')
      )
      .addFields(
        { name: '🏆 Lot', value: prize, inline: true },
        { name: '👑 Gagnant(s)', value: String(winners), inline: true },
        { name: '⏰ Fin', value: `<t:${endTimestamp}:R>\n<t:${endTimestamp}:F>`, inline: false },
        { name: '🎟️ Organisateur', value: `${message.author}`, inline: true },
      )
      .setFooter({ text: `Participation par réaction • Durée : ${formatDuration(duration)}` })
      .setTimestamp(endsAt);

    const gMsg = await message.channel.send({ embeds: [embed] });

    await Giveaway.create({
      guildId: message.guild.id,
      channelId: message.channel.id,
      messageId: gMsg.id,
      hostId: message.author.id,
      prize,
      winners,
      endsAt,
      ended: false,
      participants: [],
      winnerIds: [],
    });

    await gMsg.react('🎉');
    await message.reply({ content: `✅ Giveaway lancé dans ${message.channel} !` }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
  },
};
