const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'help',
  aliases: ['h', 'aide', 'commandes'],
  description: 'Afficher l\'aide du bot',
  usage: '+help [commande]',
  category: 'admin',
  cooldown: 5,

  async execute(message, args, client) {
    const prefix = config.prefix;

    // Aide détaillée pour une commande spécifique
    if (args[0]) {
      const cmdName = args[0].toLowerCase();
      const aliasTarget = client.aliases.get(cmdName);
      const cmd = client.commands.get(cmdName) || client.commands.get(aliasTarget);

      if (!cmd || cmd.name === null) {
        return message.reply({ content: `❌ Commande \`${prefix}${cmdName}\` introuvable.` });
      }

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`📖 Aide — \`${prefix}${cmd.name}\``)
        .addFields(
          { name: '📝 Description', value: cmd.description || 'Aucune description', inline: false },
          { name: '📌 Usage', value: `\`${cmd.usage || prefix + cmd.name}\``, inline: true },
          { name: '🏷️ Catégorie', value: cmd.category || 'Inconnue', inline: true },
          { name: '⏱️ Cooldown', value: `${cmd.cooldown || 3}s`, inline: true },
        );

      if (cmd.aliases?.length) embed.addFields({ name: '🔀 Alias', value: cmd.aliases.map(a => `\`${prefix}${a}\``).join(', '), inline: false });
      if (cmd.permissions?.length) embed.addFields({ name: '🔑 Permissions requises', value: cmd.permissions.join(', '), inline: false });

      return message.reply({ embeds: [embed] });
    }

    // Regrouper les commandes par catégorie
    const categories = {};
    client.commands.forEach(cmd => {
      if (!cmd || !cmd.name) return;
      const cat = cmd.category || 'Autre';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.name);
    });

    const categoryEmojis = {
      moderation: '🛡️',
      economy: '💰',
      music: '🎵',
      fun: '🎮',
      community: '📈',
      giveaway: '🎉',
      tickets: '🎫',
      admin: '👑',
    };

    const categoryNames = {
      moderation: 'Modération',
      economy: 'Économie',
      music: 'Musique',
      fun: 'Fun',
      community: 'Communauté',
      giveaway: 'Giveaway',
      tickets: 'Tickets',
      admin: 'Administration',
    };

    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle(`🤖 Aide — Bot Communauté`)
      .setDescription(`Préfixe : \`${prefix}\` | \`${prefix}help <commande>\` pour plus de détails`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `${client.commands.filter(c => c && c.name).size} commandes disponibles` })
      .setTimestamp();

    for (const [cat, cmds] of Object.entries(categories)) {
      const emoji = categoryEmojis[cat] || '📋';
      const name = categoryNames[cat] || cat;
      const list = cmds.filter(Boolean).map(c => `\`${prefix}${c}\``).join(' ');
      if (list) embed.addFields({ name: `${emoji} ${name} (${cmds.length})`, value: list, inline: false });
    }

    message.reply({ embeds: [embed] });
  },
};
