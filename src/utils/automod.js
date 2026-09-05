const { PermissionFlagsBits } = require('discord.js');
const Guild = require('../models/Guild');
const { findLogChannel } = require('./logChannel');
const { modLogEmbed } = require('./embed');

// Mots interdits par défaut (à personnaliser)
const DEFAULT_BAD_WORDS = ['insulte1', 'insulte2'];

// Liens autorisés par défaut
const SAFE_LINK_REGEX = /https?:\/\/(www\.)?(discord\.gg|discord\.com|tenor\.com|giphy\.com)/i;
const LINK_REGEX = /https?:\/\/[^\s]+/gi;

// ─── Anti-Spam ────────────────────────────────────
async function handleAntiSpam(message, client) {
  const guildData = await Guild.findOne({ guildId: message.guild.id });
  if (!guildData?.automod?.antiSpam) return;

  const key = `${message.author.id}-${message.guild.id}`;
  const now = Date.now();
  const INTERVAL = 3000;
  const MAX_MESSAGES = 5;

  if (!client.spamMap.has(key)) {
    client.spamMap.set(key, { messages: [now], warned: false });
    return;
  }

  const data = client.spamMap.get(key);
  data.messages = data.messages.filter(t => now - t < INTERVAL);
  data.messages.push(now);

  if (data.messages.length >= MAX_MESSAGES && !data.warned) {
    data.warned = true;
    await message.member.timeout(300000, 'Anti-spam automatique').catch(() => {});
    await message.channel.send(`🚨 ${message.author}, tu as été mis en timeout pour spam.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    await sendModLog(message.guild, guildData, 'Anti-Spam', message.client.user, message.author, 'Spam détecté automatiquement');
    setTimeout(() => data.warned = false, 300000);
  }
}

// ─── Anti-Lien ────────────────────────────────────
async function handleAntiLink(message) {
  const guildData = await Guild.findOne({ guildId: message.guild.id });
  if (!guildData?.automod?.antiLink) return;
  if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

  if (LINK_REGEX.test(message.content)) {
    const allowed = (guildData.automod.allowedLinks || []).some(link => message.content.includes(link));
    if (!allowed && !SAFE_LINK_REGEX.test(message.content)) {
      await message.delete().catch(() => {});
      const msg = await message.channel.send(`🚫 ${message.author}, les liens ne sont pas autorisés ici.`);
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    }
  }
}

// ─── Anti-Insulte ─────────────────────────────────
async function handleAntiInsult(message) {
  const guildData = await Guild.findOne({ guildId: message.guild.id });
  if (!guildData?.automod?.antiInsult) return;
  if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

  const badWords = [...DEFAULT_BAD_WORDS, ...(guildData.automod.badWords || [])];
  const content = message.content.toLowerCase();

  if (badWords.some(word => content.includes(word.toLowerCase()))) {
    await message.delete().catch(() => {});
    const msg = await message.channel.send(`🚫 ${message.author}, ce message contient un mot interdit.`);
    setTimeout(() => msg.delete().catch(() => {}), 5000);
  }
}

// ─── Anti-Mention ─────────────────────────────────
async function handleAntiMention(message) {
  const guildData = await Guild.findOne({ guildId: message.guild.id });
  if (!guildData?.automod?.antiMention) return;
  if (message.member.permissions.has(PermissionFlagsBits.MentionEveryone)) return;

  const maxMentions = guildData.automod.maxMentions || 5;
  const mentionCount = message.mentions.users.size + message.mentions.roles.size;

  if (mentionCount >= maxMentions) {
    await message.delete().catch(() => {});
    await message.member.timeout(60000, 'Anti-mention automatique').catch(() => {});
    const msg = await message.channel.send(`🚫 ${message.author}, trop de mentions dans un seul message.`);
    setTimeout(() => msg.delete().catch(() => {}), 5000);
  }
}

// ─── Anti-Raid ────────────────────────────────────
async function handleAntiRaid(member, client) {
  const guildData = await Guild.findOne({ guildId: member.guild.id });
  if (!guildData?.automod?.antiRaid) return;

  const key = member.guild.id;
  const now = Date.now();
  const INTERVAL = 10000;
  const THRESHOLD = 10;

  if (!client.raidMap.has(key)) {
    client.raidMap.set(key, [now]);
    return;
  }

  const joins = client.raidMap.get(key).filter(t => now - t < INTERVAL);
  joins.push(now);
  client.raidMap.set(key, joins);

  if (joins.length >= THRESHOLD) {
    await member.kick('Anti-raid automatique').catch(() => {});
    const ch = member.guild.systemChannel;
    if (ch) ch.send('🚨 **Raid détecté !** Les nouveaux membres sont automatiquement expulsés. Vérifiez vos permissions.').catch(() => {});
  }
}

// ─── Anti-Alt ─────────────────────────────────────
async function handleAntiAlt(member) {
  const guildData = await Guild.findOne({ guildId: member.guild.id });
  if (!guildData?.automod?.antiAlt) return;

  const minAge = (guildData.automod.minAccountAge || 7) * 86400000; // jours → ms
  const accountAge = Date.now() - member.user.createdTimestamp;

  if (accountAge < minAge) {
    await member.kick(`Compte trop récent (Anti-Alt). Âge minimum : ${guildData.automod.minAccountAge} jours`).catch(() => {});
    const ch = member.guild.systemChannel;
    if (ch) ch.send(`⚠️ ${member.user.tag} a été expulsé (compte trop récent - Anti-Alt).`).catch(() => {});
  }
}

// ─── Envoi log de modération ──────────────────────
async function sendModLog(guild, guildData, action, moderator, target, reason) {
  const logChannel = findLogChannel(
    guild,
    guildData?.logs?.modLogs || guildData?.logs?.channelId,
    ['mod-logs', 'moderation-logs']
  );
  if (!logChannel) return;

  await logChannel.send({ embeds: [modLogEmbed(action, moderator, target, reason)] }).catch(() => {});
}

module.exports = { handleAntiSpam, handleAntiLink, handleAntiInsult, handleAntiMention, handleAntiRaid, handleAntiAlt, sendModLog };
