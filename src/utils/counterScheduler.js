const Guild = require('../models/Guild');

/**
 * Met à jour les compteurs de statistiques toutes les 5 minutes
 */
function startCounterScheduler(client) {
  setInterval(() => updateCounters(client), 300000);
  updateCounters(client); // Mise à jour immédiate au démarrage
  console.log('📊 Scheduler compteurs démarré');
}

async function updateCounters(client) {
  if (!client.dbConnected) return;
  const guilds = await Guild.find({}).catch(() => []);

  for (const guildData of guilds) {
    const guild = client.guilds.cache.get(guildData.guildId);
    if (!guild) continue;

    try {
      await guild.members.fetch();

      const totalMembers = guild.memberCount;
      const bots = guild.members.cache.filter(m => m.user.bot).size;
      const humans = totalMembers - bots;
      const boosts = guild.premiumSubscriptionCount || 0;

      // Compteur membres
      if (guildData.counters.membersChannelId) {
        const ch = guild.channels.cache.get(guildData.counters.membersChannelId);
        if (ch) await ch.setName(`👥 Membres : ${humans}`).catch(() => {});
      }

      // Compteur bots
      if (guildData.counters.botsChannelId) {
        const ch = guild.channels.cache.get(guildData.counters.botsChannelId);
        if (ch) await ch.setName(`🤖 Bots : ${bots}`).catch(() => {});
      }

      // Compteur boosts
      if (guildData.counters.boostsChannelId) {
        const ch = guild.channels.cache.get(guildData.counters.boostsChannelId);
        if (ch) await ch.setName(`⚡ Boosts : ${boosts}`).catch(() => {});
      }

      // Compteur tickets
      if (guildData.counters.ticketsChannelId) {
        const ch = guild.channels.cache.get(guildData.counters.ticketsChannelId);
        if (ch) await ch.setName(`🎫 Tickets : ${guildData.tickets.ticketCount || 0}`).catch(() => {});
      }

      // Compteur messages
      if (guildData.counters.messagesChannelId) {
        const ch = guild.channels.cache.get(guildData.counters.messagesChannelId);
        if (ch) await ch.setName(`💬 Messages : ${guildData.counters.messageCount || 0}`).catch(() => {});
      }
    } catch (_) {}
  }
}

module.exports = { startCounterScheduler };
