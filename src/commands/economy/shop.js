const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ShopItem = require('../../models/Economy');
const User = require('../../models/User');
const { errorEmbed, successEmbed } = require('../../utils/embed');

module.exports = {
  name: 'shop',
  aliases: ['boutique', 'magasin'],
  description: 'Voir la boutique du serveur',
  usage: '+shop [buy <id>]',
  category: 'economy',
  requiresDb: true,
  cooldown: 5,

  async execute(message, args, client) {
    // Achat
    if (args[0]?.toLowerCase() === 'buy' || args[0]?.toLowerCase() === 'acheter') {
      const itemId = args[1];
      if (!itemId) return message.reply({ embeds: [errorEmbed('Erreur', 'Précise l\'ID de l\'objet : `+shop buy <id>`')] });

      const item = await ShopItem.findOne({ guildId: message.guild.id, itemId, available: true });
      if (!item) return message.reply({ embeds: [errorEmbed('Introuvable', 'Cet objet n\'existe pas dans la boutique.')] });

      const userData = await User.findOneAndUpdate({ userId: message.author.id, guildId: message.guild.id }, {}, { upsert: true, new: true });
      if (userData.economy.wallet < item.price) {
        return message.reply({ embeds: [errorEmbed('Fonds insuffisants', `Il te manque **${(item.price - userData.economy.wallet).toLocaleString('fr-FR')} 💵**.`)] });
      }

      userData.economy.wallet -= item.price;
      const existing = userData.economy.inventory.find(i => i.itemId === item.itemId);
      if (existing) existing.quantity++;
      else userData.economy.inventory.push({ itemId: item.itemId, itemName: item.name, quantity: 1, emoji: item.emoji });
      await userData.save();

      if (item.roleId) {
        const member = message.guild.members.cache.get(message.author.id);
        const role = message.guild.roles.cache.get(item.roleId);
        if (member && role) await member.roles.add(role).catch(() => {});
      }

      return message.reply({ embeds: [successEmbed('Achat effectué !', `Tu as acheté **${item.emoji} ${item.name}** pour **${item.price.toLocaleString('fr-FR')} 💵** !`)] });
    }

    // Affichage de la boutique
    const items = await ShopItem.find({ guildId: message.guild.id, available: true });

    if (items.length === 0) {
      return message.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('🏪 Boutique').setDescription('La boutique est vide pour l\'instant.\n\nLes administrateurs peuvent ajouter des articles avec `+additem`.').setTimestamp()] });
    }

    const list = items.map(item =>
      `**${item.emoji} ${item.name}** — \`ID: ${item.itemId}\`\n> ${item.description}\n> Prix : **${item.price.toLocaleString('fr-FR')} 💵**${item.stock !== -1 ? ` | Stock : ${item.stock}` : ''}`
    ).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🏪 Boutique — ${message.guild.name}`)
      .setDescription(list)
      .setFooter({ text: 'Utilise +shop buy <id> pour acheter' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
