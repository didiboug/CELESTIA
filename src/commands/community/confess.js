const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'confess',
  aliases: ['confession'],
  description: 'Envoyer une confession anonyme',
  usage: '+confess',
  category: 'community',
  requiresDb: true,
  cooldown: 30,

  async execute(message, args, client) {
    await message.delete().catch(() => {});

    const modal = new ModalBuilder()
      .setCustomId('confess_modal')
      .setTitle('💬 Confession Anonyme');

    const textInput = new TextInputBuilder()
      .setCustomId('confession_text')
      .setLabel('Ta confession (restera anonyme)')
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(500)
      .setRequired(true)
      .setPlaceholder('Écris ta confession ici...');

    modal.addComponents(new ActionRowBuilder().addComponents(textInput));

    // Envoyer une réponse temporaire pour ouvrir le modal
    const tempMsg = await message.channel.send({ content: `${message.author}, vérifie tes messages privés ou clique ici :` }).catch(() => null);
    // Note: Les modals doivent être ouverts depuis une interaction, pas un message.
    // Alternative: envoyer en DM
    await message.author.send({
      content: '📝 Pour soumettre ta confession anonyme, réponds à ce message avec ta confession (elle sera envoyée de façon anonyme) :'
    }).then(async (dm) => {
      if (tempMsg) await tempMsg.delete().catch(() => {});

      const filter = (m) => m.author.id === message.author.id;
      const collector = dm.channel.createMessageCollector({ filter, max: 1, time: 60000 });

      collector.on('collect', async (m) => {
        const { EmbedBuilder } = require('discord.js');
        const Guild = require('../../models/Guild');

        const guildData = await Guild.findOne({ guildId: message.guild.id });
        const channelId = guildData?.suggestions?.channelId;
        const channel = channelId ? message.guild.channels.cache.get(channelId) : null;

        if (!channel) {
          return dm.channel.send('❌ Aucun canal de confessions configuré sur le serveur.');
        }

        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('💬 Confession Anonyme')
          .setDescription(m.content)
          .setFooter({ text: 'Envoyé anonymement' })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
        await dm.channel.send('✅ Ta confession a été envoyée anonymement !');
      });

      collector.on('end', (_, reason) => {
        if (reason === 'time') dm.channel.send('⏱️ Temps écoulé. La confession n\'a pas été envoyée.').catch(() => {});
      });
    }).catch(async () => {
      if (tempMsg) await tempMsg.edit('❌ Je n\'arrive pas à t\'envoyer un message privé. Vérifie tes paramètres.').catch(() => {});
      setTimeout(() => tempMsg?.delete().catch(() => {}), 5000);
    });
  },
};
