const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');

module.exports = {
  name: 'birthday',
  aliases: ['anniversaire', 'bday'],
  description: 'Définir ou voir ton anniversaire',
  usage: '+birthday [set DD/MM | remove | @membre]',
  category: 'community',
  requiresDb: true,
  cooldown: 10,

  async execute(message, args, client) {
    const sub = args[0]?.toLowerCase();

    // Voir l'anniversaire d'un membre
    if (!sub || message.mentions.users.first()) {
      const target = message.mentions.users.first() || message.author;
      const userData = await User.findOne({ userId: target.id, guildId: message.guild.id });

      if (!userData?.birthday) {
        return message.reply({ embeds: [errorEmbed('Inconnu', `${target.tag} n'a pas défini son anniversaire.`)] });
      }

      const [day, month] = userData.birthday.split('/');
      const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      const monthName = months[parseInt(month) - 1];

      return message.reply({ embeds: [new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎂 Anniversaire')
        .setDescription(`L'anniversaire de **${target.tag}** est le **${day} ${monthName}** 🎉`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setTimestamp()] });
    }

    // Définir son anniversaire
    if (sub === 'set' || sub === 'définir') {
      const date = args[1];
      if (!date) return message.reply({ embeds: [errorEmbed('Erreur', 'Indique une date : `+birthday set DD/MM`')] });

      const match = date.match(/^(\d{1,2})\/(\d{1,2})$/);
      if (!match) return message.reply({ embeds: [errorEmbed('Format invalide', 'Utilise le format `DD/MM`. Ex: `25/12`')] });

      const day = parseInt(match[1]);
      const month = parseInt(match[2]);
      if (day < 1 || day > 31 || month < 1 || month > 12) {
        return message.reply({ embeds: [errorEmbed('Date invalide', 'La date n\'est pas valide.')] });
      }

      await User.findOneAndUpdate(
        { userId: message.author.id, guildId: message.guild.id },
        { birthday: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}` },
        { upsert: true }
      );

      return message.reply({ embeds: [successEmbed('Anniversaire défini !', `Ton anniversaire est maintenant défini au **${day}/${month}** 🎂`)] });
    }

    // Supprimer son anniversaire
    if (sub === 'remove' || sub === 'supprimer') {
      await User.findOneAndUpdate(
        { userId: message.author.id, guildId: message.guild.id },
        { birthday: null },
        { upsert: true }
      );
      return message.reply({ embeds: [successEmbed('Anniversaire supprimé', 'Ton anniversaire a été retiré.')] });
    }
  },
};
