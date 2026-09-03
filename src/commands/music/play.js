const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'play',
  aliases: ['p', 'jouer'],
  description: 'Jouer une musique (YouTube, Spotify...)',
  usage: '+play <titre ou lien>',
  category: 'music',
  cooldown: 3,

  async execute(message, args, client) {
    const query = args.join(' ');
    if (!query) return message.reply({ embeds: [errorEmbed('Erreur', 'Donne un titre ou un lien à jouer.')] });

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply({ embeds: [errorEmbed('Erreur', 'Tu dois être dans un canal vocal pour utiliser cette commande.')] });
    }

    const permissions = voiceChannel.permissionsFor(message.guild.members.me);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return message.reply({ embeds: [errorEmbed('Erreur', 'Je n\'ai pas les permissions pour rejoindre ou parler dans ce canal.')] });
    }

    try {
      if (!client.distube) {
        return message.reply({ embeds: [errorEmbed('Erreur', 'Le module musique n\'est pas initialisé. Vérifie la configuration dans `src/index.js`.')] });
      }
      await client.distube.play(voiceChannel, query, { message, textChannel: message.channel });
    } catch (err) {
      message.reply({ embeds: [errorEmbed('Erreur', `Impossible de jouer cette musique : ${err.message}`)] });
    }
  },
};
