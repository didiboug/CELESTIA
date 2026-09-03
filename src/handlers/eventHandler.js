const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  let total = 0;

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));

    if (!event.name) {
      console.warn(`⚠️  Événement sans nom ignoré: ${file}`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    total++;
  }

  console.log(`✅ ${total} événements chargés`);
};
