const { successEmbed, errorEmbed } = require('../../utils/embed');
const ShopItem = require('../../models/Economy');

module.exports = {
  name: 'additem',
  description: 'Ajouter un article à la boutique',
  usage: '+additem <id> <prix> <emoji> <nom>',
  category: 'admin',
  requiresDb: true,
  permissions: ['ManageGuild'],
  cooldown: 5,

  async execute(message, args, client) {
    if (args.length < 4) {
      return message.reply({ embeds: [errorEmbed('Usage', '`+additem <id> <prix> <emoji> <nom>`\nEx: `+additem vip 5000 👑 Rôle VIP`')] });
    }

    const [itemId, priceStr, emoji, ...nameParts] = args;
    const price = parseInt(priceStr);
    const name = nameParts.join(' ');

    if (isNaN(price) || price <= 0) return message.reply({ embeds: [errorEmbed('Erreur', 'Le prix doit être un nombre positif.')] });

    const existing = await ShopItem.findOne({ guildId: message.guild.id, itemId });
    if (existing) return message.reply({ embeds: [errorEmbed('Déjà existant', `Un article avec l'ID \`${itemId}\` existe déjà.`)] });

    await ShopItem.create({ guildId: message.guild.id, itemId, name, price, emoji });

    message.reply({ embeds: [successEmbed('Article ajouté !', `${emoji} **${name}** (\`${itemId}\`) a été ajouté à la boutique pour **${price.toLocaleString('fr-FR')} 💵**.`)] });
  },
};
