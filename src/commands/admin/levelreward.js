const { successEmbed, errorEmbed } = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'levelreward',
  aliases: ['addreward', 'setreward'],
  description: 'Ajouter une récompense de niveau',
  usage: '+levelreward <niveau> @role',
  category: 'admin',
  requiresDb: true,
  permissions: ['ManageGuild'],
  cooldown: 5,

  async execute(message, args, client) {
    const level = parseInt(args[0]);
    const role = message.mentions.roles.first();

    if (isNaN(level) || level < 1) return message.reply({ embeds: [errorEmbed('Erreur', 'Indique un niveau valide (1 minimum).')] });
    if (!role) return message.reply({ embeds: [errorEmbed('Erreur', 'Mentionne un rôle.')] });

    const guildData = await Guild.findOneAndUpdate(
      { guildId: message.guild.id },
      {},
      { upsert: true, new: true }
    );

    // Supprimer si existant pour ce niveau
    guildData.levels.rewards = (guildData.levels.rewards || []).filter(r => r.level !== level);
    guildData.levels.rewards.push({ level, roleId: role.id });
    await guildData.save();

    message.reply({ embeds: [successEmbed('Récompense ajoutée', `Au niveau **${level}**, ${role} sera automatiquement attribué.`)] });
  },
};
