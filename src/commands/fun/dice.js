const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dice',
  aliases: ['de', 'roll'],
  description: 'Lancer un ou plusieurs dés',
  usage: '+dice [NdN ex: 2d6] [faces ex: 20]',
  category: 'fun',
  cooldown: 3,

  async execute(message, args, client) {
    let count = 1;
    let faces = 6;

    if (args[0]) {
      const diceNotation = args[0].match(/^(\d+)d(\d+)$/i);
      if (diceNotation) {
        count = Math.min(parseInt(diceNotation[1]), 20);
        faces = Math.min(parseInt(diceNotation[2]), 1000);
      } else if (!isNaN(parseInt(args[0]))) {
        faces = Math.min(parseInt(args[0]), 1000);
      }
    }

    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * faces) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);

    const DICE_EMOJIS = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎲 Lancer de dés')
      .setDescription(count === 1
        ? `${faces <= 6 ? (DICE_EMOJIS[rolls[0]] || rolls[0]) : rolls[0]} **${rolls[0]}** sur un d${faces}`
        : `Résultats : ${rolls.join(', ')}\n**Total : ${total}**`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
