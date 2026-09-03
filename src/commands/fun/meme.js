const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'meme',
  description: 'Afficher un mème aléatoire',
  usage: '+meme',
  category: 'fun',
  cooldown: 5,

  async execute(message, args, client) {
    try {
      const subreddits = ['memes', 'dankmemes', 'me_irl', 'funny', 'okbuddyretard'];
      const sub = subreddits[Math.floor(Math.random() * subreddits.length)];

      const response = await axios.get(`https://www.reddit.com/r/${sub}/random/.json?limit=1`, {
        headers: { 'User-Agent': 'DiscordBot/1.0' },
        timeout: 5000,
      });

      const post = response.data?.[0]?.data?.children?.[0]?.data;
      if (!post || post.over_18) throw new Error('Post NSFW ou invalide');

      const embed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle(post.title.slice(0, 256))
        .setImage(post.url)
        .setFooter({ text: `👍 ${post.ups.toLocaleString()} | 💬 ${post.num_comments.toLocaleString()} | r/${sub}` })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (err) {
      message.reply({ content: '😅 Impossible de charger un mème pour le moment. Réessaie !' });
    }
  },
};
