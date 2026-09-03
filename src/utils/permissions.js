const { PermissionFlagsBits } = require('discord.js');
const { errorEmbed } = require('./embed');

/**
 * Vérifie si l'auteur possède les permissions requises
 * @param {Message} message
 * @param {string[]} perms - Liste de permissions Discord
 * @returns {boolean}
 */
function checkPermissions(message, perms) {
  const missing = perms.filter(p => !message.member.permissions.has(PermissionFlagsBits[p]));
  if (missing.length > 0) {
    const list = missing.map(p => `\`${p}\``).join(', ');
    message.reply({ embeds: [errorEmbed('Permission refusée', `Il te manque les permissions : ${list}`)] });
    return false;
  }
  return true;
}

/**
 * Vérifie si le bot possède les permissions requises
 * @param {Message} message
 * @param {string[]} perms
 * @returns {boolean}
 */
function checkBotPermissions(message, perms) {
  const missing = perms.filter(p => !message.guild.members.me.permissions.has(PermissionFlagsBits[p]));
  if (missing.length > 0) {
    const list = missing.map(p => `\`${p}\``).join(', ');
    message.reply({ embeds: [errorEmbed('Permission manquante', `Je n\'ai pas les permissions : ${list}`)] });
    return false;
  }
  return true;
}

/**
 * Vérifie si l'auteur est admin ou propriétaire du serveur
 */
function isAdmin(member) {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.id === member.guild.ownerId
  );
}

/**
 * Vérifie si l'auteur est le propriétaire du bot
 */
function isOwner(userId) {
  const config = require('../config');
  return userId === config.ownerId;
}

module.exports = { checkPermissions, checkBotPermissions, isAdmin, isOwner };
