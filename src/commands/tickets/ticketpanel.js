const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'ticketpanel',
  aliases: ['panel'],
  description: 'Envoyer le panel de création de tickets',
  usage: '+ticketpanel [#canal]',
  category: 'tickets',
  requiresDb: true,
  permissions: ['ManageGuild'],
  cooldown: 10,

  async execute(message, args, client) {
    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData?.tickets?.enabled) {
      return message.reply({ embeds: [errorEmbed('Non activé', 'Active d\'abord les tickets avec `+setup tickets`.')] });
    }

    const channel = message.mentions.channels.first() || message.channel;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎫 Système de Tickets')
      .setDescription(
        'Choisis la catégorie correspondant à ta demande :\n\n' +
        '🧰 **Dossier entreprises en jeu**\n' +
        '🪄 **Dossier organisations en jeu**\n' +
        '🛒 **Demande boutique**\n' +
        '🚫 **Demande débannissement en jeu**\n' +
        '💸 **Remboursement en jeu**\n\n' +
        '👨‍⚖️ **Plainte joueur**\n' +
        '🛡️ **Plainte staff/support**\n' +
        '🧑 **Questions/problèmes autre**\n' +
        '💀 **Dossier Mort RP**'
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setFooter({ text: message.guild.name });

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_Dossier entreprises en jeu').setLabel('Entreprises').setEmoji('🧰').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_Dossier organisations en jeu').setLabel('Organisations').setEmoji('🪄').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('ticket_Demande boutique').setLabel('Boutique').setEmoji('🛒').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ticket_Demande débannissement en jeu').setLabel('Débannissement').setEmoji('🚫').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ticket_Remboursement en jeu').setLabel('Remboursement').setEmoji('💸').setStyle(ButtonStyle.Success),
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_Plainte joueur').setLabel('Plainte joueur').setEmoji('👨‍⚖️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ticket_Plainte staff-support').setLabel('Plainte staff/support').setEmoji('🛡️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ticket_Questions-problèmes autre').setLabel('Questions / problèmes').setEmoji('🧑').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_Dossier Mort RP').setLabel('Mort RP').setEmoji('💀').setStyle(ButtonStyle.Secondary),
    );

    await channel.send({ embeds: [embed], components: [row1, row2] });
    message.reply({ embeds: [successEmbed('Panel envoyé', `Le panel de tickets a été envoyé dans ${channel}.`)] });
  },
};
