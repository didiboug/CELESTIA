const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/**
 * Crée un embed de succès
 */
function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.successColor)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Crée un embed d'erreur
 */
function errorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.errorColor)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Crée un embed d'avertissement
 */
function warnEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(config.warningColor)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Crée un embed d'info générique
 */
function infoEmbed(title, description, color = config.color) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Crée un embed de log de modération
 */
function modLogEmbed(action, moderator, target, reason, extra = {}) {
  const colors = {
    ban: '#ED4245',
    kick: '#FEE75C',
    mute: '#FEE75C',
    timeout: '#FEE75C',
    warn: '#FEE75C',
    unban: '#57F287',
    unmute: '#57F287',
    clear: '#5865F2',
  };

  const embed = new EmbedBuilder()
    .setColor(colors[action.toLowerCase()] || config.color)
    .setTitle(`🔨 Modération — ${action}`)
    .addFields(
      { name: '👤 Utilisateur', value: `${target.tag || target} (${target.id || target})`, inline: true },
      { name: '🛡️ Modérateur', value: `${moderator.tag || moderator} (${moderator.id || moderator})`, inline: true },
      { name: '📝 Raison', value: reason || 'Aucune raison fournie' }
    )
    .setTimestamp();

  if (extra.duration) embed.addFields({ name: '⏱️ Durée', value: extra.duration, inline: true });
  if (extra.count) embed.addFields({ name: '🗑️ Messages', value: `${extra.count}`, inline: true });

  return embed;
}

module.exports = { successEmbed, errorEmbed, warnEmbed, infoEmbed, modLogEmbed };
