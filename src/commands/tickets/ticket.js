const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'ticket',
  aliases: ['newticket', 'openticket'],
  description: 'Ouvrir un ticket de support',
  usage: '+ticket [catégorie]',
  category: 'tickets',
  requiresDb: true,
  cooldown: 30,

  async execute(message, args, client) {
    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData?.tickets?.enabled) {
      return message.reply({ embeds: [errorEmbed('Non activé', 'Le système de tickets n\'est pas activé sur ce serveur.')] });
    }

    const category = args.join(' ') || null;

    // Utiliser une interaction simulée avec l'auteur du message
    const fakeInteraction = {
      guild: message.guild,
      user: message.author,
      member: message.member,
      channel: message.channel,
      deferReply: async () => {},
      editReply: async (opts) => message.reply(opts),
      reply: async (opts) => message.reply(opts),
    };

    // Envoyer un panel de sélection de catégorie si pas de catégorie spécifiée
    const categories = [
      { label: 'Dossier entreprises en jeu', value: 'Dossier entreprises en jeu', emoji: '🧰' },
      { label: 'Dossier organisations en jeu', value: 'Dossier organisations en jeu', emoji: '🪄' },
      { label: 'Demande boutique', value: 'Demande boutique', emoji: '🛒' },
      { label: 'Demande débannissement en jeu', value: 'Demande débannissement en jeu', emoji: '🚫' },
      { label: 'Remboursement en jeu', value: 'Remboursement en jeu', emoji: '💸' },
      { label: 'Plainte joueur', value: 'Plainte joueur', emoji: '👨‍⚖️' },
      { label: 'Plainte staff/support', value: 'Plainte staff/support', emoji: '🛡️' },
      { label: 'Questions/problèmes autre', value: 'Questions/problèmes autre', emoji: '🧑' },
      { label: 'Dossier Mort RP', value: 'Dossier Mort RP', emoji: '💀' },
    ];

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎫 Créer un ticket')
      .setDescription('Sélectionne la catégorie de ton ticket dans le menu ci-dessous.');

    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket_category')
      .setPlaceholder('Choisir une catégorie...')
      .addOptions(categories);

    const row = new ActionRowBuilder().addComponents(select);
    await message.reply({ embeds: [embed], components: [row] });
    await message.delete().catch(() => {});
  },
};
