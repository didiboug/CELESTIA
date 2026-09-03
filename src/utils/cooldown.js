const { Collection } = require('discord.js');
const { warnEmbed } = require('./embed');

/**
 * Vérifie et applique le cooldown d'une commande
 * @param {Client} client
 * @param {Message} message
 * @param {Object} command
 * @returns {boolean} - true si la commande peut être exécutée
 */
function handleCooldown(client, message, command) {
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }

  const timestamps = client.cooldowns.get(command.name);
  const now = Date.now();
  const key = `${message.author.id}-${message.guild.id}`;

  if (timestamps.has(key)) {
    const expirationTime = timestamps.get(key) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
      message.reply({
        embeds: [warnEmbed('Cooldown', `Attends encore **${timeLeft}s** avant de réutiliser \`+${command.name}\`.`)],
      }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      return false;
    }
  }

  timestamps.set(key, now);
  setTimeout(() => timestamps.delete(key), cooldownAmount);
  return true;
}

module.exports = { handleCooldown };
