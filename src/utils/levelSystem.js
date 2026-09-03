const User = require('../models/User');
const Guild = require('../models/Guild');
const config = require('../config');

/**
 * Calcule l'XP requis pour atteindre un niveau donné
 */
function xpRequiredForLevel(level) {
  return 5 * level * level + 50 * level + 100;
}

/**
 * Calcule le niveau à partir de l'XP totale
 */
function levelFromXp(totalXp) {
  let level = 0;
  let xp = totalXp;
  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level++;
  }
  return level;
}

/**
 * Gère le gain d'XP lors d'un message
 */
async function handleXp(message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  const guildData = await Guild.findOne({ guildId: message.guild.id });
  if (!guildData?.levels?.enabled) return;

  // Vérifier si le canal est exclu
  if (guildData.levels.noXpChannels?.includes(message.channel.id)) return;

  // Vérifier si le rôle est exclu
  const hasNoXpRole = message.member.roles.cache.some(r => guildData.levels.noXpRoles?.includes(r.id));
  if (hasNoXpRole) return;

  const userData = await User.findOneAndUpdate(
    { userId: message.author.id, guildId: message.guild.id },
    {},
    { upsert: true, new: true }
  );

  // Cooldown XP
  const now = Date.now();
  const cooldown = config.levels.xpCooldown;
  if (userData.levels.lastXpGain && now - userData.levels.lastXpGain < cooldown) return;

  // Calcul XP gagné
  const baseXp = config.levels.xpPerMessage;
  const variance = config.levels.xpVariance;
  const xpGained = Math.floor(baseXp + (Math.random() * variance * 2) - variance);

  const oldLevel = userData.levels.level;

  userData.levels.xp += xpGained;
  userData.levels.totalXp += xpGained;
  userData.levels.messages += 1;
  userData.levels.lastXpGain = new Date();

  // Vérifier passage de niveau
  let newLevel = oldLevel;
  while (userData.levels.xp >= xpRequiredForLevel(newLevel)) {
    userData.levels.xp -= xpRequiredForLevel(newLevel);
    newLevel++;
  }
  userData.levels.level = newLevel;

  await userData.save();

  // Si montée de niveau
  if (newLevel > oldLevel) {
    await handleLevelUp(message, userData, newLevel, guildData);
  }
}

/**
 * Gère la montée de niveau
 */
async function handleLevelUp(message, userData, newLevel, guildData) {
  const { EmbedBuilder } = require('discord.js');

  // Envoyer le message de niveau
  const levelChannel = guildData.levels.channelId
    ? message.guild.channels.cache.get(guildData.levels.channelId)
    : message.channel;

  if (levelChannel) {
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('⬆️ Montée de niveau !')
      .setDescription(`Félicitations ${message.author} ! Tu as atteint le **niveau ${newLevel}** ! 🎉`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await levelChannel.send({ embeds: [embed] }).catch(() => {});
  }

  // Attribuer les récompenses de rôle
  const rewards = guildData.levels.rewards?.filter(r => r.level <= newLevel) || [];
  for (const reward of rewards) {
    if (!message.member.roles.cache.has(reward.roleId)) {
      await message.member.roles.add(reward.roleId).catch(() => {});
    }
  }
}

module.exports = { handleXp, xpRequiredForLevel, levelFromXp };
