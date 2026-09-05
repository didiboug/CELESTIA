const { EmbedBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const Ticket = require('../models/Ticket');
const Giveaway = require('../models/Giveaway');
const User = require('../models/User');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ─── Boutons ──────────────────────────────────
    if (interaction.isButton()) {
      console.log(`🔘 Bouton reçu: ${interaction.customId} par ${interaction.user.tag}`);
      const [action, ...rest] = interaction.customId.split('_');

      // Vérification de membre
      if (action === 'verify') {
        await handleVerify(interaction).catch(console.error);
      }

      // Créer un ticket
      else if (action === 'ticket') {
        await handleTicketCreate(interaction, rest.join('_'), client).catch(console.error);
      }

      // Fermer un ticket
      else if (action === 'close' && rest[0] === 'ticket') {
        await handleTicketClose(interaction, client).catch(console.error);
      }

      // Rejoindre un giveaway
      else if (action === 'giveaway' && rest[0] === 'join') {
        await handleGiveawayJoin(interaction, rest[1]).catch(async error => {
          console.error('❌ Erreur participation giveaway:', error);
          const response = { content: '❌ Une erreur est survenue. Réessaie dans quelques secondes.' };
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply(response).catch(() => {});
          } else {
            await interaction.reply({ ...response, ephemeral: true }).catch(() => {});
          }
        });
      }

      // Suggestions — vote oui/non
      else if (action === 'suggest') {
        await handleSuggestVote(interaction, rest[0]).catch(console.error);
      }

      // Sondage — vote
      else if (action === 'poll') {
        await handlePollVote(interaction, rest).catch(console.error);
      }
    }

    // ─── Menus déroulants ─────────────────────────
    else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket_category') {
        await handleTicketCategory(interaction, client).catch(console.error);
      }
    }

    // ─── Modals ───────────────────────────────────
    else if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('ticket_subject_')) {
        await handleTicketSubject(interaction, client).catch(console.error);
      } else if (interaction.customId === 'confess_modal') {
        await handleConfessModal(interaction).catch(console.error);
      } else if (interaction.customId === 'present_modal') {
        await handlePresentModal(interaction).catch(console.error);
      }
    }
  },
};

// ─── Vérification ─────────────────────────────────
async function handleVerify(interaction) {
  const targetUserId = interaction.customId.split('_')[1];

  // Vérifier que c'est bien l'utilisateur lui-même
  if (interaction.user.id !== targetUserId) {
    return interaction.reply({ content: '❌ Ce bouton n\'est pas pour toi.', ephemeral: true });
  }

  const guildData = await Guild.findOne({ guildId: interaction.guild.id });
  if (!guildData?.verification?.roleId) {
    return interaction.reply({ content: '❌ Aucun rôle de vérification configuré.', ephemeral: true });
  }

  const role = interaction.guild.roles.cache.get(guildData.verification.roleId);
  if (!role) {
    return interaction.reply({ content: '❌ Le rôle de vérification est introuvable.', ephemeral: true });
  }

  await interaction.member.roles.add(role).catch(() => {});
  await interaction.reply({ content: `✅ Tu es maintenant vérifié ! Bienvenue sur **${interaction.guild.name}** !`, ephemeral: true });
}

// ─── Créer un ticket via menu ──────────────────────
async function handleTicketCategory(interaction, client) {
  await interaction.deferReply({ ephemeral: true });
  const category = interaction.values[0];
  await createTicket(interaction, category, client);
}

async function handleTicketCreate(interaction, category, client) {
  await interaction.deferReply({ ephemeral: true });
  await createTicket(interaction, category || 'Support', client);
}

async function createTicket(interaction, category, client) {
  const guildData = await Guild.findOne({ guildId: interaction.guild.id });
  if (!guildData?.tickets?.enabled) {
    return interaction.editReply({ content: '❌ Le système de tickets est désactivé.' });
  }

  // Vérifier si l'utilisateur a déjà un ticket ouvert
  const existingTicket = await Ticket.findOne({
    guildId: interaction.guild.id,
    userId: interaction.user.id,
    status: 'open',
  });

  if (existingTicket) {
    const ch = interaction.guild.channels.cache.get(existingTicket.channelId);
    if (ch) return interaction.editReply({ content: `❌ Tu as déjà un ticket ouvert : ${ch}` });
  }

  // Incrémenter le compteur
  guildData.tickets.ticketCount = (guildData.tickets.ticketCount || 0) + 1;
  const ticketId = guildData.tickets.ticketCount;
  await guildData.save();

  // Créer le channel ticket
  const channelName = `ticket-${String(ticketId).padStart(4, '0')}`;
  const parentId = guildData.tickets.categoryId;
  const supportRoleId = guildData.tickets.supportRoleId;

  const permissionOverwrites = [
    { id: interaction.guild.id, deny: ['ViewChannel'] },
    { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
  ];

  if (supportRoleId) {
    permissionOverwrites.push({
      id: supportRoleId,
      allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages'],
    });
  }

  const ticketChannel = await interaction.guild.channels.create({
    name: channelName,
    type: 0, // GUILD_TEXT
    parent: parentId || null,
    permissionOverwrites,
    topic: `Ticket de ${interaction.user.tag} | Catégorie: ${category}`,
  }).catch(() => null);

  if (!ticketChannel) {
    return interaction.editReply({ content: '❌ Impossible de créer le ticket.' });
  }

  // Sauvegarder en base
  await Ticket.create({
    guildId: interaction.guild.id,
    userId: interaction.user.id,
    channelId: ticketChannel.id,
    ticketId,
    category,
  });

  // Message d'accueil dans le ticket
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`🎫 Ticket #${String(ticketId).padStart(4, '0')} — ${category}`)
    .setDescription(`Bonjour ${interaction.user} !\n\nUn membre de l'équipe va vous répondre dès que possible.\n\nPour fermer ce ticket, cliquez sur le bouton ci-dessous.`)
    .addFields({ name: '📋 Catégorie', value: category, inline: true })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`close_ticket_${ticketChannel.id}`)
      .setLabel('🔒 Fermer le ticket')
      .setStyle(ButtonStyle.Danger)
  );

  await ticketChannel.send({
    content: `${interaction.user}${supportRoleId ? ` <@&${supportRoleId}>` : ''}`,
    embeds: [embed],
    components: [row],
  });

  await interaction.editReply({ content: `✅ Ticket créé : ${ticketChannel}` });

  const logChannel = interaction.guild.channels.cache.get(guildData.tickets.logChannelId);
  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('🎫 Ticket ouvert')
      .addFields(
        { name: '👤 Créateur', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
        { name: '📋 Catégorie', value: category, inline: true },
        { name: '📌 Salon', value: `${ticketChannel}`, inline: true },
      )
      .setFooter({ text: `Ticket #${String(ticketId).padStart(4, '0')}` })
      .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] }).catch(error => {
      console.error(`❌ Envoi ticket-logs impossible: ${error.message}`);
    });
  }

}

// ─── Fermer un ticket ─────────────────────────────
async function handleTicketClose(interaction, client) {
  await interaction.deferReply();

  const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
  if (!ticket) return interaction.editReply({ content: '❌ Ce canal n\'est pas un ticket.' });
  if (ticket.status === 'closed') return interaction.editReply({ content: '❌ Ce ticket est déjà fermé.' });

  ticket.status = 'closed';
  ticket.closedBy = interaction.user.id;
  ticket.closedAt = new Date();
  await ticket.save();

  const guildData = await Guild.findOne({ guildId: interaction.guild.id });
  const logChannel = interaction.guild.channels.cache.get(guildData?.tickets?.logChannelId);
  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🔒 Ticket fermé')
      .addFields(
        { name: '👤 Créateur', value: `<@${ticket.userId}> (${ticket.userId})`, inline: true },
        { name: '🛡️ Fermé par', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
        { name: '📋 Catégorie', value: ticket.category || 'Non précisée', inline: true },
        { name: '📌 Salon', value: `#${interaction.channel.name}`, inline: true },
      )
      .setFooter({ text: `Ticket #${String(ticket.ticketId).padStart(4, '0')}` })
      .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] }).catch(error => {
      console.error(`❌ Envoi ticket-logs impossible: ${error.message}`);
    });
  }

  const embed = new EmbedBuilder()
    .setColor('#ED4245')
    .setTitle('🔒 Ticket Fermé')
    .setDescription(`Ticket fermé par ${interaction.user}\n\nCe canal sera supprimé dans 5 secondes.`)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
  setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
}

// ─── Rejoindre un giveaway ────────────────────────
async function handleGiveawayJoin(interaction, messageId) {
  // Confirmer immédiatement l'interaction pour éviter le délai Discord de 3 secondes.
  await interaction.deferReply({ ephemeral: true });

  const giveaway = await Giveaway.findOne({ messageId });
  if (!giveaway || giveaway.ended) {
    return interaction.editReply({ content: '❌ Ce giveaway est terminé.' });
  }

  giveaway.participants = Array.isArray(giveaway.participants) ? giveaway.participants : [];

  if (giveaway.participants.includes(interaction.user.id)) {
    // Retrait de la participation
    giveaway.participants = giveaway.participants.filter(id => id !== interaction.user.id);
    await giveaway.save();
    await interaction.editReply({ content: '❌ Tu t\'es retiré du giveaway.' });
  } else {
    // Ajout
    giveaway.participants.push(interaction.user.id);
    await giveaway.save();
    await interaction.editReply({ content: `✅ Tu participes au giveaway **${giveaway.prize}** ! 🎉` });
  }

  // Mettre à jour le message
  const channel = interaction.guild.channels.cache.get(giveaway.channelId);
  if (channel) {
    const msg = await channel.messages.fetch(messageId).catch(() => null);
    if (msg) {
      const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway_join_${messageId}`)
          .setLabel(`🎉 Participer (${giveaway.participants.length})`)
          .setStyle(ButtonStyle.Primary)
      );
      await msg.edit({ components: [row] }).catch(() => {});
    }
  }
}

// ─── Votes suggestions ────────────────────────────
async function handleSuggestVote(interaction, vote) {
  await interaction.deferUpdate();
  // Logique de vote gérée dans la commande suggest
}

// ─── Votes sondage ────────────────────────────────
async function handlePollVote(interaction, rest) {
  await interaction.deferUpdate();
}

// ─── Modal confession ─────────────────────────────
async function handleConfessModal(interaction) {
  const confession = interaction.fields.getTextInputValue('confession_text');
  const guildData = await Guild.findOne({ guildId: interaction.guild.id });

  // Envoyer dans le canal des confessions si configuré
  const channel = guildData?.suggestions?.channelId
    ? interaction.guild.channels.cache.get(guildData.suggestions.channelId)
    : null;

  if (!channel) return interaction.reply({ content: '❌ Aucun canal de confession configuré.', ephemeral: true });

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('💬 Confession Anonyme')
    .setDescription(confession)
    .setFooter({ text: 'Envoyé anonymement' })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: '✅ Ta confession a été envoyée anonymement.', ephemeral: true });
}

// ─── Modal présentation ───────────────────────────
async function handlePresentModal(interaction) {
  const bio = interaction.fields.getTextInputValue('present_bio');
  const age = interaction.fields.getTextInputValue('present_age');
  const hobbies = interaction.fields.getTextInputValue('present_hobbies');

  await User.findOneAndUpdate(
    { userId: interaction.user.id, guildId: interaction.guild.id },
    { 'presentation.bio': bio, 'presentation.age': age, 'presentation.hobbies': hobbies },
    { upsert: true }
  );

  await interaction.reply({ content: '✅ Ta présentation a été enregistrée !', ephemeral: true });
}
