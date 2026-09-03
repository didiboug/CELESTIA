const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');
const config = require('../../config');

module.exports = {
  name: 'daily',
  description: 'Récupérer ta récompense journalière',
  usage: '+daily',
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
    const lastDaily = userData.economy.lastDaily ? new Date(userData.economy.lastDaily).getTime() : 0;
    const diff = now - lastDaily;
    const cooldown = config.economy.dailyCooldown;

    if (diff < cooldown) {
      const remaining = cooldown - diff;
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      return message.reply({ embeds: [errorEmbed('Daily déjà récupéré', `Tu pourras récupérer ton daily dans **${hours}h ${minutes}min**.`)] });
    }

    // Calcul streak
    const isStreak = diff < cooldown * 2;
    if (isStreak) {
      userData.economy.dailyStreak = (userData.economy.dailyStreak || 0) + 1;
    } else {
      userData.economy.dailyStreak = 1;
    }

    const streak = userData.economy.dailyStreak;
    const bonus = Math.min(streak * 10, 200); // max +200 de bonus streak
    const amount = config.economy.dailyAmount + bonus;

    userData.economy.wallet += amount;
    userData.economy.lastDaily = new Date();
    await userData.save();

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💰 Daily récupéré !')
      .setDescription(`Tu as reçu **${amount} 💵**`)
      .addFields(
        { name: '💼 Portefeuille', value: `${userData.economy.wallet.toLocaleString('fr-FR')} 💵`, inline: true },
        { name: '🔥 Streak', value: `${streak} jour(s)`, inline: true },
        { name: '✨ Bonus streak', value: `+${bonus} 💵`, inline: true }
      )
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
