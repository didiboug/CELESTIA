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

module.exports = { findLogChannel };