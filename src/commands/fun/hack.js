const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'hack',
  description: 'Simuler un hack (100% faux, pour rire)',
  usage: '+hack @membre',
  category: 'fun',
  cooldown: 10,

  async execute(message, args, client) {
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne quelqu\'un à "hacker" 😈')] });

    const msg = await message.reply(`💻 Initialisation du hack sur **${target.tag}**...`);

    const steps = [
      '🔍 Analyse de la cible...',
      '🌐 Connexion au serveur cible...',
      '🔓 Bypass du pare-feu...',
      '💾 Extraction des données...',
      '📧 Email : **h••••@gmail.com**',
      '🔑 Mot de passe : **••••••••**',
      '📍 IP : **192.168.1.XXX**',
      '💳 Carte bancaire : **4••• •••• •••• 1337**',
      '✅ Hack terminé !',
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 700));
      await msg.edit(step);
    }

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle(`💻 Hack de ${target.tag} — TERMINÉ`)
      .setDescription('⚠️ **ATTENTION : Ceci est 100% fictif et fait pour rire !**\nAucune vraie donnée n\'a été collectée.')
      .addFields(
        { name: '📧 Email', value: `h••••@gmail.com` },
        { name: '📍 Localisation', value: 'Ta chambre, probablement 😂' },
        { name: '🎮 Jeu préféré', value: 'Minecraft en mode créatif' },
        { name: '🍕 Nourriture favorite', value: 'Pizza Hawaïenne (honte à toi)' }
      )
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: '😂 C\'est une blague, aucune donnée réelle n\'a été utilisée' })
      .setTimestamp();

    await msg.edit({ content: null, embeds: [embed] });
  },
};
