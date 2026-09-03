require('dotenv').config();

module.exports = {
  // Paramètres principaux
  prefix: process.env.PREFIX || '+',
  token: process.env.DISCORD_TOKEN,
  mongoUri: process.env.MONGODB_URI,
  ownerId: process.env.OWNER_ID,
  allowedUserIds: [
    '698866208627228702',
    '1328607096538796083',
    '1259864895999053876',
    '770422183855390740',
  ],

  // Apparence
  color: process.env.BOT_COLOR || '#5865F2',
  errorColor: '#ED4245',
  successColor: '#57F287',
  warningColor: '#FEE75C',

  // Cooldowns par défaut (en secondes)
  defaultCooldown: 3,

  // Économie
  economy: {
    dailyAmount: 200,
    dailyCooldown: 86400000, // 24h en ms
    workCooldown: 3600000,   // 1h en ms
    crimeCooldown: 7200000,  // 2h en ms
    robCooldown: 3600000,
    startBalance: 0,
    maxBankSize: 1000000,
  },

  // Niveaux XP
  levels: {
    xpPerMessage: 15,
    xpCooldown: 60000, // 1 min entre chaque gain
    xpVariance: 10,    // ±10 XP de variation
  },

  // Tickets
  tickets: {
    categories: ['Support', 'Signalement', 'Partenariat', 'Autre'],
    transcriptChannel: null,
  },

  // Anti-spam
  antiSpam: {
    maxMessages: 5,
    interval: 3000,
    action: 'mute', // 'warn', 'mute', 'kick', 'ban'
    muteDuration: 300000, // 5 min
  },

  // Anti-raid
  antiRaid: {
    joinThreshold: 10,
    interval: 10000,
    action: 'kick',
  },
};
