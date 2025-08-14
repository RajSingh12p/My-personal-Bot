
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.prefixCommands = new Map();

  const prefixCommandsPath = path.join(__dirname, '../prefixCommands');
  
  // Create prefixCommands directory if it doesn't exist
  if (!fs.existsSync(prefixCommandsPath)) {
    fs.mkdirSync(prefixCommandsPath, { recursive: true });
  }

  // Check if directory has any files
  const categories = fs.readdirSync(prefixCommandsPath).filter(item => 
    fs.statSync(path.join(prefixCommandsPath, item)).isDirectory()
  );

  if (categories.length === 0) {
    console.log(global.styles.warningColor('⚠️ No prefix command categories found.'));
    return;
  }

  let commandCount = 0;
  let categoryCount = categories.length;

  categories.forEach((category) => {
    const categoryPath = path.join(prefixCommandsPath, category);
    const commandFiles = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(categoryPath, file));
      
      if (command.name && command.execute) {
        client.prefixCommands.set(command.name, { ...command, category });
        commandCount++;
      } else {
        console.log(global.styles.warningColor(`⚠️ Prefix command ${file} is missing required properties.`));
      }
    }
  });

  console.log(
    global.styles.successColor(
      `✅ Loaded ${commandCount} prefix commands across ${categoryCount} categories.`
    )
  );
};
