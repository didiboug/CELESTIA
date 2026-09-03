const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'iq',
  description: 'Tester ton QI (fun)',
  usage: '+iq [@membre]',
  category: 'fun',
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;

    // Seed basée sur l'ID + date (même résultat dans la même journée)
    const seed = parseInt(target.id.slice(-6)) + new Date().toDateString().length;
    const iq = (seed % 150) + 50; // entre 50 et 199

    let description, color;
    if (iq < 70) { description = '🪨 Génie inversé... ou alors juste une pierre.'; color = '#ED4245'; }
    else if (iq < 90) { description = '😅 Il reste encore de la marge...'; color = '#FEE75C'; }
    else if (iq < 110) { description = '😐 Absolument dans la moyenne. Félicitations ?'; color = '#5865F2'; }
    else if (iq < 130) { description = '🧠 Plutôt intelligent(e) !'; color = '#57F287'; }
    else if (iq < 150) { description = '🎓 Très intelligente ! On frôle le génie.'; color = '#FFD700'; }
    else { description = '🧬 Niveau Einstein. Le MENSA t\'attend.'; color = '#E040FB'; }

    const bar = '█'.repeat(Math.floor(iq / 20)) + '░'.repeat(10 - Math.floor(iq / 20));

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🧠 QI de ${target.tag}`)
      .addFields(
        { name: '📊 Score', value: `**${iq} IQ**\n\`${bar}\`` },
        { name: '💬 Verdict', value: description }
      )
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Ceci est un indicateur totalement fictif 😄' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
