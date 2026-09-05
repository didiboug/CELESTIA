const Giveaway = require('../models/Giveaway');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    if (user.bot || reaction.emoji.name !== '🎉') return;

    if (reaction.partial) await reaction.fetch().catch(() => null);
    if (reaction.message.partial) await reaction.message.fetch().catch(() => null);

    const giveaway = await Giveaway.findOne({ messageId: reaction.message.id });
    if (!giveaway || giveaway.ended) return;

    giveaway.participants = Array.isArray(giveaway.participants) ? giveaway.participants : [];
    if (!giveaway.participants.includes(user.id)) return;

    giveaway.participants = giveaway.participants.filter(id => id !== user.id);
    await giveaway.save().catch(error => {
      console.error('❌ Retrait participation impossible:', error);
    });
    console.log(`↩️ Participation retirée: ${user.tag} (${giveaway.participants.length})`);
  },
};