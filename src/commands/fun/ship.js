const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'ship',
  description: 'Calculer la compatibilité entre deux membres',
  usage: '+ship @membre1 [@membre2]',
  category: 'fun',
  cooldown: 5,

  async execute(message, args, client) {
    const user1 = message.mentions.users.first() || message.author;
    const user2 = message.mentions.users.at(1)
      || (message.mentions.users.size === 1 ? message.author : null);

    if (!user2) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne deux membres !')] });

    // Score déterministe basé sur les IDs
    const combined = (BigInt(user1.id) + BigInt(user2.id)).toString();
    const score = parseInt(combined.slice(-2)) % 101;

    let label, color, emoji;
    if (score < 20) { label = 'Catastrophique 💀'; color = '#ED4245'; emoji = '💀'; }
    else if (score < 40) { label = 'Pas terrible 😬'; color = '#FEE75C'; emoji = '😬'; }
    else if (score < 60) { label = 'Ça peut aller 🤷'; color = '#5865F2'; emoji = '🤷'; }
    else if (score < 80) { label = 'Plutôt compatible 💙'; color = '#57F287'; emoji = '💙'; }
    else if (score < 95) { label = 'Super compatible 💕'; color = '#FF73FA'; emoji = '💕'; }
    else { label = 'Amour parfait 💞'; color = '#FF0080'; emoji = '💞'; }

    const bar = '❤️'.repeat(Math.floor(score / 10)) + '🖤'.repeat(10 - Math.floor(score / 10));

    const shipName = user1.username.slice(0, Math.floor(user1.username.length / 2))
      + user2.username.slice(Math.floor(user2.username.length / 2));

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} Ship — ${shipName}`)
      .setDescription(`${user1} 💘 ${user2}`)
      .addFields(
        { name: '💯 Compatibilité', value: `**${score}%**\n${bar}` },
        { name: '💬 Verdict', value: label }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
