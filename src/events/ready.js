const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
    console.log(`📊 Présent sur ${client.guilds.cache.size} serveur(s)`);
    console.log(`👥 ${client.users.cache.size} utilisateurs en cache`);

    // Statut du bot (rotation toutes les 30 secondes)
    const statuses = [
      { name: '+help | Bot Communauté', type: ActivityType.Playing },
      { name: `${client.guilds.cache.size} serveurs`, type: ActivityType.Watching },
      { name: `${client.users.cache.size} membres`, type: ActivityType.Watching },
      { name: 'votre serveur 🛡️', type: ActivityType.Watching },
    ];

    let i = 0;
    const setStatus = () => {
      client.user.setActivity(statuses[i % statuses.length]);
      i++;
    };

    setStatus();
    setInterval(setStatus, 30000);
  },
};
