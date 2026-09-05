const { ActivityType } = require('discord.js');

function updateMemberStatus(client) {
  const memberCount = client.guilds.cache.reduce(
    (total, guild) => total + guild.memberCount,
    0
  );

  client.user.setActivity(`${memberCount} membres`, {
    type: ActivityType.Watching,
  });
}

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
    console.log(`📊 Présent sur ${client.guilds.cache.size} serveur(s)`);
    console.log(`👥 ${client.users.cache.size} utilisateurs en cache`);

    // Compteur de membres visible et actualisé automatiquement
    updateMemberStatus(client);
    setInterval(() => updateMemberStatus(client), 10000);
  },
};
