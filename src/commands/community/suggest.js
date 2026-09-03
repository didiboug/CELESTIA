const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { errorEmbed } = require('../../utils/embed');
const Guild = require('../../models/Guild');

module.exports = {
  name: 'suggest',
  aliases: ['suggestion'],
  description: 'Faire une suggestion au serveur',
  usage: '+suggest <texte>',
  category: 'community',
  requiresDb: true,
  cooldown: 30,

  async execute(message, args, client) {
    const suggestion = args.join(' ');
    if (!suggestion) return message.reply({ embeds: [errorEmbed('Erreur', 'Écris ta suggestion !')] });

    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData?.suggestions?.channelId) {
      return message.reply({ embeds: [errorEmbed('Non configuré', 'Le canal de suggestions n\'est pas configuré. Utilise `+setup suggestions #canal`.')] });
    }

    const channel = message.guild.channels.cache.get(guildData.suggestions.channelId);
    if (!channel) return message.reply({ embeds: [errorEmbed('Erreur', 'Le canal de suggestions est introuvable.')] });

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('💡 Nouvelle Suggestion')
      .setDescription(suggestion)
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .addFields(
        { name: '✅ Pour', value: '0 vote(s)', inline: true },
        { name: '❌ Contre', value: '0 vote(s)', inline: true },
      )
      .setFooter({ text: `ID: ${message.author.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('suggest_up').setLabel('✅ Pour').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('suggest_down').setLabel('❌ Contre').setStyle(ButtonStyle.Danger),
    );

    const suggMsg = await channel.send({ embeds: [embed], components: [row] });
    await suggMsg.react('✅').catch(() => {});
    await suggMsg.react('❌').catch(() => {});

    await message.reply({ embeds: [new EmbedBuilder().setColor('#57F287').setDescription(`✅ Ta suggestion a été envoyée dans ${channel} !`).setTimestamp()] });
    await message.delete().catch(() => {});
  },
};
