const cron = require('node-cron');
const User = require('../models/User');
const Guild = require('../models/Guild');
const { EmbedBuilder } = require('discord.js');

/**
 * Vérifie chaque jour à 8h00 les anniversaires
 */
function startBirthdayScheduler(client) {
  cron.schedule('0 8 * * *', () => checkBirthdays(client));
  console.log('🎂 Scheduler anniversaires démarré');
}

async function checkBirthdays(client) {
  if (!client.dbConnected) return;
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const todayStr = `${day}/${month}`;

  const guilds = await Guild.find({ 'birthdays.enabled': true, 'birthdays.channelId': { $ne: null } });

  for (const guildData of guilds) {
    const guild = client.guilds.cache.get(guildData.guildId);
    if (!guild) continue;

    const channel = guild.channels.cache.get(guildData.birthdays.channelId);
    if (!channel) continue;

    const usersToday = await User.find({
      guildId: guildData.guildId,
      birthday: todayStr,
    });

    for (const user of usersToday) {
      const member = guild.members.cache.get(user.userId);
      if (!member) continue;

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎂 Joyeux Anniversaire !')
        .setDescription(`Tout le serveur souhaite un joyeux anniversaire à ${member} ! 🎉🎈\nN'hésitez pas à lui souhaiter !`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      await channel.send({ content: `🎂 ${member}`, embeds: [embed] }).catch(() => {});
    }
  }
}

module.exports = { startBirthdayScheduler };
