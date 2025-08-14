const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  // Load slash commands
  client.commands = new Map();

  const commandsPath = path.join(__dirname, '../commands');
  let commandCount = 0;
  let categoryCount = 0;

  const categories = fs.readdirSync(commandsPath);
  categoryCount = categories.length;

  categories.forEach((category) => {
    const categoryPath = path.join(commandsPath, category);
    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(categoryPath, file));
      client.commands.set(command.data.name, { ...command, category });
      commandCount++;
    }
  });

  console.log(
    global.styles.successColor(
      `✅ Loaded ${commandCount} slash commands across ${categoryCount} categories.`
    )
  );

  // Load prefix commands
  require('./prefixCommandHandler')(client);
};
