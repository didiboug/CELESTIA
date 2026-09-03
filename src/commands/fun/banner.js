const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'banner',
  description: 'Voir la bannière d\'un membre',
  usage: '+banner [@membre]',
  category: 'fun',
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.users.first()
      || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null)
      || message.author;

    // Récupérer la bannière (nécessite fetch complet)
    const user = await client.users.fetch(target.id, { force: true });
    const bannerURL = user.bannerURL({ dynamic: true, size: 1024 });

    if (!bannerURL) {
      return message.reply({ embeds: [errorEmbed('Pas de bannière', `${target.tag} n'a pas de bannière de profil.`)] });
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🖼️ Bannière de ${target.tag}`)
      .setImage(bannerURL)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
