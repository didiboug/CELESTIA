const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

const RESPONSES = [
  // Positifs
  { text: 'C\'est certain ! ✅', positive: true },
  { text: 'Décidément, oui ! ✅', positive: true },
  { text: 'Sans aucun doute ! ✅', positive: true },
  { text: 'Oui, absolument ! ✅', positive: true },
  { text: 'Tu peux compter dessus ! ✅', positive: true },
  { text: 'Comme je le vois, oui ! ✅', positive: true },
  { text: 'Très probablement ! ✅', positive: true },
  { text: 'Les perspectives sont bonnes ! ✅', positive: true },
  // Neutres
  { text: 'La réponse est floue... 🔮', positive: null },
  { text: 'Repose ta question plus tard ! 🔮', positive: null },
  { text: 'Je ne peux pas prédire cela ! 🔮', positive: null },
  { text: 'Ne compte pas dessus maintenant ! 🔮', positive: null },
  // Négatifs
  { text: 'Non, pas du tout ! ❌', positive: false },
  { text: 'Mes sources disent non ! ❌', positive: false },
  { text: 'Les perspectives ne sont pas bonnes ! ❌', positive: false },
  { text: 'Très improbable ! ❌', positive: false },
];

module.exports = {
  name: '8ball',
  aliases: ['8b', 'boule'],
  description: 'Pose une question à la boule magique',
  usage: '+8ball <question>',
  category: 'fun',
  cooldown: 5,

  async execute(message, args, client) {
    const question = args.join(' ');
    if (!question) return message.reply({ embeds: [errorEmbed('Erreur', 'Pose une question à la boule magique !')] });

    const response = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
    const color = response.positive === true ? '#57F287' : response.positive === false ? '#ED4245' : '#5865F2';

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🎱 Boule Magique')
      .addFields(
        { name: '❓ Question', value: question },
        { name: '🔮 Réponse', value: response.text }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
