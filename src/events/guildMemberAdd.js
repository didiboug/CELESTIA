const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const Guild = require('../models/Guild');
const User = require('../models/User');
const { handleAntiRaid, handleAntiAlt } = require('../utils/automod');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    if (!client.dbConnected) return;
    const guildData = await Guild.findOne({ guildId: member.guild.id });
    if (!guildData) return;

    // ─── Anti-Raid ────────────────────────────────
    await handleAntiRaid(member, client).catch(() => {});

    // ─── Anti-Alt ─────────────────────────────────
    await handleAntiAlt(member).catch(() => {});

    // Tracker les invitations
    await trackInvite(member, guildData).catch(() => {});

    // ─── Auto-Rôle ────────────────────────────────
    // Utilise le rôle configuré, sinon cherche automatiquement « Citoyen ».
    const configuredRole = guildData?.autorole?.enabled
      ? member.guild.roles.cache.get(guildData.autorole.roleId)
      : null;
    const citizenRole = member.guild.roles.cache.find(
      role => role.name.toLowerCase() === 'citoyen'
    );
    const arrivalRole = configuredRole || citizenRole;

    if (arrivalRole && !member.user.bot) {
      await member.roles.add(arrivalRole, 'Rôle automatique à l’arrivée').catch(error => {
        console.error(`❌ Auto-rôle impossible pour ${member.user.tag}: ${error.message}`);
      });
    }

    // ─── Message de bienvenue ─────────────────────
    if (!guildData.welcome?.enabled || !guildData.welcome?.channelId) return;

    const channel = member.guild.channels.cache.get(guildData.welcome.channelId);
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    // Vérification si captcha activé
    if (guildData.verification?.captchaEnabled) {
      const verifChannel = member.guild.channels.cache.get(guildData.verification.channelId);
      if (verifChannel) {
        await sendVerification(member, verifChannel).catch(() => {});
        return; // Ne pas envoyer le welcome avant vérification
      }
    }

    await sendWelcomeMessage(member, channel, guildData, memberCount);
  },
};

async function sendWelcomeMessage(member, channel, guildData, memberCount) {
  const customMsg = guildData.welcome.message;

  // Message personnalisé (via +setup welcomemsg)
  const text = (customMsg ||
    `Bienvenue sur **{server}**, 🎉 {user} 🔥\nTu es officiellement le membre n°{count} du serveur.`)
    .replace(/{user}/g, `<@${member.id}>`)
    .replace(/{username}/g, member.user.username)
    .replace(/{server}/g, member.guild.name)
    .replace(/{count}/g, memberCount.toLocaleString('fr-FR'));

  // Vérification par bouton
  if (guildData.verification?.enabled) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`verify_${member.id}`)
        .setLabel('✅ Je vérifie mon compte')
        .setStyle(ButtonStyle.Success)
    );
    await channel.send({ content: text, components: [row] }).catch(() => {});
  } else {
    await channel.send({ content: text }).catch(() => {});
  }
}

async function sendVerification(member, channel) {
  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  const embed = new EmbedBuilder()
    .setColor('#FEE75C')
    .setTitle('🔐 Vérification requise')
    .setDescription(`Bienvenue ${member} !\n\nPour accéder au serveur, clique sur le bouton ci-dessous.`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`verify_${member.id}`)
      .setLabel('✅ Je ne suis pas un bot')
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({ content: `${member}`, embeds: [embed], components: [row] });
}

async function trackInvite(member, guildData) {
  // Simple tracking — les invitations exactes nécessitent de stocker les usages avant/après
}
