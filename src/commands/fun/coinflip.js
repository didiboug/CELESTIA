const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'coinflip',
  aliases: ['cf', 'pile', 'face'],
  description: 'Lancer une pièce',
  usage: '+coinflip [pile|face]',
  category: 'fun',
  cooldown: 3,

  async execute(message, args, client) {
    const result = Math.random() < 0.5 ? 'pile' : 'face';
    const guess = args[0]?.toLowerCase();

    const won = guess && (guess === result || (guess === 'p' && result === 'pile') || (guess === 'f' && result === 'face'));
    const lost = guess && !won;

    const embed = new EmbedBuilder()
      .setColor(won ? '#57F287' : lost ? '#ED4245' : '#5865F2')
      .setTitle(`🪙 Pile ou Face`)
      .setDescription(
        result === 'pile' ? '**Pile !** 🔵' : '**Face !** 🟡'
      );

    if (guess) {
      embed.addFields({ name: won ? '✅ Tu as gagné !' : '❌ Tu as perdu !', value: `Tu avais parié sur **${guess}**, c'est **${result}** !` });
    }

    embed.setTimestamp();
    message.reply({ embeds: [embed] });
  },
};
