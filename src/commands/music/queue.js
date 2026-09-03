const { EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');

module.exports = {
  name: 'queue',
  aliases: ['q', 'file'],
  description: 'Voir la file d\'attente musicale',
  usage: '+queue',
  category: 'music',
  cooldown: 5,

  async execute(message, args, client) {
    const queue = client.distube?.getQueue(message.guild.id);
    if (!queue || !queue.songs.length) return message.reply({ embeds: [errorEmbed('Erreur', 'La file d\'attente est vide.')] });

    const songs = queue.songs.slice(0, 10);
    const list = songs.map((s, i) =>
      i === 0
        ? `▶️ **[${s.name}](${s.url})** — ${s.formattedDuration} — demandé par ${s.user}`
        : `**${i}.** [${s.name}](${s.url}) — ${s.formattedDuration}`
    ).join('\n');

    const totalDuration = queue.songs.reduce((acc, s) => acc + s.duration, 0);
    const h = Math.floor(totalDuration / 3600);
    const m = Math.floor((totalDuration % 3600) / 60);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎵 File d\'attente')
      .setDescription(list)
      .addFields(
        { name: '🎶 Chansons', value: `${queue.songs.length}`, inline: true },
        { name: '⏱️ Durée totale', value: h > 0 ? `${h}h ${m}min` : `${m}min`, inline: true },
        { name: '🔁 Répétition', value: queue.repeatMode ? (queue.repeatMode === 1 ? 'Chanson' : 'File') : 'Désactivée', inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
