const { successEmbed, errorEmbed } = require('../../utils/embed');
const User = require('../../models/User');

module.exports = {
  name: 'afk',
  description: 'Définir ou retirer ton statut AFK',
  usage: '+afk [raison]',
  category: 'community',
  requiresDb: true,
  cooldown: 10,

  async execute(message, args, client) {
    const userData = await User.findOneAndUpdate(
      { userId: message.author.id, guildId: message.guild.id },
      {},
      { upsert: true, new: true }
    );

    if (userData.afk?.active) {
      userData.afk.active = false;
      userData.afk.reason = null;
      userData.afk.since = null;
      await userData.save();
      return message.reply({ embeds: [successEmbed('AFK retiré', 'Ton statut AFK a été retiré. Bienvenue de retour !')] });
    }

    const reason = args.join(' ') || 'Pas de raison';
    userData.afk = { active: true, reason, since: new Date() };
    await userData.save();

    message.reply({ embeds: [successEmbed('AFK activé 💤', `Tu es maintenant AFK.\n📝 Raison : ${reason}`)] });
  },
};
