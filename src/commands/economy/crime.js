const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');
const config = require('../../config');

const CRIMES = [
  { name: 'braqué une banque', success: 0.4, winMin: 500, winMax: 2000, loseMin: 200, loseMax: 800 },
  { name: 'volé une voiture', success: 0.5, winMin: 200, winMax: 800, loseMin: 100, loseMax: 400 },
  { name: 'hacké un système', success: 0.45, winMin: 300, winMax: 1500, loseMin: 150, loseMax: 600 },
  { name: 'vendu des marchandises volées', success: 0.6, winMin: 100, winMax: 500, loseMin: 50, loseMax: 300 },
  { name: 'falsifié des documents', success: 0.5, winMin: 200, winMax: 700, loseMin: 100, loseMax: 350 },
];

module.exports = {
  name: 'crime',
  description: 'Commettre un crime pour gagner (ou perdre) de l\'argent',
  usage: '+crime',
  category: 'economy',
  requiresDb: true,
  cooldown: 3,

  async execute(message, args, client) {
    const userData = await User.findOneAndUpdate(
      { userId: message.author.id, guildId: message.guild.id },
      {},
      { upsert: true, new: true }
    );

    const now = Date.now();
    const last = userData.economy.lastCrime ? new Date(userData.economy.lastCrime).getTime() : 0;
    if (now - last < config.economy.crimeCooldown) {
      const remaining = config.economy.crimeCooldown - (now - last);
      const minutes = Math.floor(remaining / 60000);
      return message.reply({ embeds: [errorEmbed('Cooldown', `Tu dois attendre encore **${minutes} min** avant de commettre un autre crime.`)] });
    }

    const crime = CRIMES[Math.floor(Math.random() * CRIMES.length)];
    const success = Math.random() < crime.success;
    userData.economy.lastCrime = new Date();

    if (success) {
      const amount = Math.floor(Math.random() * (crime.winMax - crime.winMin)) + crime.winMin;
      userData.economy.wallet += amount;
      await userData.save();

      return message.reply({ embeds: [new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('🦹 Crime réussi !')
        .setDescription(`Tu as ${crime.name} et tu t'en tires avec **${amount} 💵** !`)
        .addFields({ name: '💼 Portefeuille', value: `${userData.economy.wallet.toLocaleString('fr-FR')} 💵` })
        .setTimestamp()] });
    } else {
      const fine = Math.floor(Math.random() * (crime.loseMax - crime.loseMin)) + crime.loseMin;
      userData.economy.wallet = Math.max(0, userData.economy.wallet - fine);
      await userData.save();

      return message.reply({ embeds: [new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('🚔 Arrêté par la police !')
        .setDescription(`Tu as tenté de ${crime.name} mais tu t'es fait attraper ! Amende : **${fine} 💵**.`)
        .addFields({ name: '💼 Portefeuille', value: `${userData.economy.wallet.toLocaleString('fr-FR')} 💵` })
        .setTimestamp()] });
    }
  },
};
