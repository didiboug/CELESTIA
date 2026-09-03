const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '..', 'commands');

  // Lecture récursive de tous les dossiers de commandes
  const categories = fs.readdirSync(commandsPath).filter(dir =>
    fs.statSync(path.join(commandsPath, dir)).isDirectory()
  );

  let total = 0;

  for (const category of categories) {
    const commandFiles = fs.readdirSync(path.join(commandsPath, category))
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, category, file));

      if (!command.name) {
        console.warn(`⚠️  Commande sans nom ignorée: ${file}`);
        continue;
      }

      // Enregistrement de la commande principale
      client.commands.set(command.name, command);

      // Enregistrement des alias
      if (command.aliases && Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          client.aliases.set(alias, command.name);
        }
      }

      total++;
    }
  }

  console.log(`✅ ${total} commandes chargées (${categories.length} catégories)`);
};
