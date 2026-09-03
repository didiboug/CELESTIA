const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');
const config = require('../../config');

const JOBS = [
  { name: 'Développeur', emoji: '💻', min: 150, max: 400 },
  { name: 'Médecin', emoji: '🏥', min: 200, max: 500 },
  { name: 'Chef cuisinier', emoji: '👨‍🍳', min: 100, max: 300 },
  { name: 'Mécanicien', emoji: '🔧', min: 80, max: 250 },
  { name: 'Enseignant', emoji: '📚', min: 120, max: 350 },
  { name: 'Avocat', emoji: '⚖️', min: 250, max: 600 },
  { name: 'Artiste', emoji: '🎨', min: 50, max: 400 },
  { name: 'Livreur', emoji: '🚚', min: 60, max: 180 },
];

const PHRASES = [
  'Tu as travaillé dur comme {job} et gagné **{amount} 💵** !',
  'Excellente journée de travail en tant que {job} : **{amount} 💵** !',
  'Ton patron t\'a versé **{amount} 💵** pour ton travail de {job}.',
  'Mission accomplie ! Tu rentres à la maison avec **{amount} 💵** en tant que {job}.',
];

module.exports = {
  name: 'work',
  aliases: ['travail'],
  description: 'Travailler pour gagner de l\'argent',
  usage: '+work',
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
    const lastWork = userData.economy.lastWork ? new Date(userData.economy.lastWork).getTime() : 0;
    const diff = now - lastWork;

    if (diff < config.economy.workCooldown) {
      const remaining = config.economy.workCooldown - diff;
      const minutes = Math.floor(remaining / 60000);
      return message.reply({ embeds: [errorEmbed('Déjà au travail', `Tu peux retravailler dans **${minutes} min**.`)] });
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const amount = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
      .replace('{job}', `${job.emoji} ${job.name}`)
      .replace('{amount}', amount.toLocaleString('fr-FR'));

    userData.economy.wallet += amount;
    userData.economy.lastWork = new Date();
    await userData.save();

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle(`${job.emoji} Travail effectué !`)
      .setDescription(phrase)
      .addFields({ name: '💼 Portefeuille', value: `${userData.economy.wallet.toLocaleString('fr-FR')} 💵`, inline: true })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
