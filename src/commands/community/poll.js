const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
  name: 'poll',
  aliases: ['sondage', 'vote'],
  description: 'Créer un sondage',
  usage: '+poll "Question" "Option1" "Option2" ...',
  category: 'community',
  cooldown: 15,

  async execute(message, args, client) {
    // Extraire les éléments entre guillemets
    const parts = message.content.slice(message.content.indexOf('poll') + 4).trim().match(/"([^"]+)"/g);
    if (!parts || parts.length < 3) {
      return message.reply({ embeds: [errorEmbed('Format incorrect',
        'Utilise : `+poll "Question" "Option1" "Option2" ...`\nExemple : `+poll "Couleur préférée ?" "Rouge" "Bleu" "Vert"`')] });
    }

    const question = parts[0].replace(/"/g, '');
    const options = parts.slice(1, 11).map(o => o.replace(/"/g, ''));

    if (options.length < 2) return message.reply({ embeds: [errorEmbed('Erreur', 'Ajoute au moins 2 options.')] });

    const description = options.map((opt, i) => `${EMOJIS[i]} ${opt}`).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📊 ${question}`)
      .setDescription(description)
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: `${options.length} option(s) | Votez avec les réactions` })
      .setTimestamp();

    const pollMsg = await message.channel.send({ embeds: [embed] });
    await message.delete().catch(() => {});

    for (let i = 0; i < options.length; i++) {
      await pollMsg.react(EMOJIS[i]).catch(() => {});
    }
  },
};
