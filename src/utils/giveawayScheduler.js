const Giveaway = require('../models/Giveaway');
const { EmbedBuilder } = require('discord.js');

/**
 * Démarre le scheduler des giveaways (vérifie toutes les 15 secondes)
 */
function startGiveawayScheduler(client) {
  setInterval(() => checkGiveaways(client), 15000);
  migrateActiveGiveaways(client).catch(error => {
    console.error('❌ Migration des giveaways impossible:', error);
  });
  console.log('🎉 Scheduler giveaway démarré');
}

async function migrateActiveGiveaways(client) {
  if (!client.dbConnected) return;

  const activeGiveaways = await Giveaway.find({ ended: false }).catch(() => []);
  let migrated = 0;

  for (const giveaway of activeGiveaways) {
    const guild = client.guilds.cache.get(giveaway.guildId);
    const channel = guild?.channels.cache.get(giveaway.channelId);
    const message = channel
      ? await channel.messages.fetch(giveaway.messageId).catch(() => null)
      : null;

    if (!message) continue;

    await message.edit({ components: [] }).catch(() => {});
    await message.react('🎉').catch(() => {});
    migrated++;
  }

  console.log(`🎉 ${migrated} giveaway(s) actif(s) converti(s) en réactions`);
}

async function checkGiveaways(client) {
  if (!client.dbConnected) return;
  const now = new Date();
  const expiredGiveaways = await Giveaway.find({ ended: false, endsAt: { $lte: now } }).catch(() => []);

  for (const giveaway of expiredGiveaways) {
    await endGiveaway(client, giveaway);
  }
}

async function endGiveaway(client, giveaway) {
  try {
    const guild = client.guilds.cache.get(giveaway.guildId);
    if (!guild) return;

    const channel = guild.channels.cache.get(giveaway.channelId);
    if (!channel) return;

    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);

    // La réaction Discord est la source de vérité, même après un redémarrage.
    let participants = Array.isArray(giveaway.participants) ? giveaway.participants : [];
    if (message) {
      const giveawayReaction = message.reactions.cache.find(reaction => reaction.emoji.name === '🎉');
      if (giveawayReaction) {
        const reactedUsers = await giveawayReaction.users.fetch().catch(() => null);
        if (reactedUsers) {
          participants = reactedUsers
            .filter(user => !user.bot)
            .map(user => user.id);
        }
      }
    }

    giveaway.participants = participants;
    const winnerCount = Math.min(giveaway.winners, participants.length);
    const winners = [];

    const pool = [...participants];
    for (let i = 0; i < winnerCount; i++) {
      if (pool.length === 0) break;
      const idx = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(idx, 1)[0]);
    }

    giveaway.winnerIds = winners;
    giveaway.ended = true;
    await giveaway.save();

    // Mettre à jour le message du giveaway
    if (message) {
      const winnerMentions = winners.length > 0
        ? winners.map(id => `<@${id}>`).join(', ')
        : 'Aucun gagnant (pas de participants)';

      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle(`🎉 GIVEAWAY TERMINÉ — ${giveaway.prize}`)
        .setDescription(
          `**Gagnant(s) :** ${winnerMentions}\n` +
          `**Participants :** ${participants.length}\n` +
          `**Organisé par :** <@${giveaway.hostId}>`
        )
        .setFooter({ text: 'Giveaway terminé • Participation par réaction' })
        .setTimestamp();

      await message.edit({ embeds: [embed], components: [] }).catch(() => {});

      if (winners.length > 0) {
        await channel.send(`🎉 Félicitations ${winnerMentions} ! Vous avez gagné **${giveaway.prize}** !`);
      } else {
        await channel.send(`😢 Le giveaway **${giveaway.prize}** est terminé mais personne n'a participé.`);
      }
    }
  } catch (err) {
    console.error('Erreur giveaway scheduler:', err);
  }
}

module.exports = { startGiveawayScheduler, endGiveaway };
