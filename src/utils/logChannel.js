function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s_]+/g, '-');
}

function findLogChannel(guild, configuredId, names) {
  const configured = configuredId ? guild.channels.cache.get(configuredId) : null;
  if (configured?.isTextBased()) return configured;

  const expectedNames = names.map(normalizeName);
  return guild.channels.cache.find(channel =>
    channel.isTextBased() && expectedNames.includes(normalizeName(channel.name))
  ) || null;
}

function findLogChannels(guild, configuredId, names, generalConfiguredId) {
  const specific = findLogChannel(guild, configuredId, names);
  const general = findLogChannel(guild, generalConfiguredId, ['general-logs']);
  return [...new Map(
    [specific, general].filter(Boolean).map(channel => [channel.id, channel])
  ).values()];
}

async function sendToLogChannels(channels, payload, label = 'logs') {
  await Promise.all(channels.map(channel =>
    channel.send(payload).catch(error => {
      console.error(`❌ Envoi ${label} impossible dans #${channel.name}: ${error.message}`);
    })
  ));
}

module.exports = { findLogChannel, findLogChannels, sendToLogChannels };