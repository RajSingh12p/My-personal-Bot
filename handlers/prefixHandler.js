
const fs = require('fs');
const path = require('path');

class PrefixHandler {
  constructor(client) {
    this.client = client;
    this.permsCommands = new Map();
    this.userCommands = new Map();
    this.prefix = '!'; // Default prefix
  }

  loadCommands() {
    // Load permission commands
    const permsPath = path.join(__dirname, '../prefix-cmd/perms-cmd');
    if (fs.existsSync(permsPath)) {
      const permsFiles = fs.readdirSync(permsPath).filter(file => file.endsWith('.js'));
      
      for (const file of permsFiles) {
        const command = require(path.join(permsPath, file));
        this.permsCommands.set(command.name, command);
        console.log(`Loaded permission command: ${command.name}`);
      }
    }

    // Load user commands
    const userPath = path.join(__dirname, '../prefix-cmd/user-cmd');
    if (fs.existsSync(userPath)) {
      const userFiles = fs.readdirSync(userPath).filter(file => file.endsWith('.js'));
      
      for (const file of userFiles) {
        const command = require(path.join(userPath, file));
        this.userCommands.set(command.name, command);
        console.log(`Loaded user command: ${command.name}`);
      }
    }
  }

  async handleMessage(message) {
    if (!message.content.startsWith(this.prefix) || message.author.bot) return;

    const args = message.content.slice(this.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check permission commands first
    if (this.permsCommands.has(commandName)) {
      const command = this.permsCommands.get(commandName);
      
      try {
        await command.execute(message, args);
      } catch (error) {
        console.error(`Error executing permission command ${commandName}:`, error);
        message.reply('❌ An error occurred while executing this command!');
      }
      return;
    }

    // Check user commands
    if (this.userCommands.has(commandName)) {
      const command = this.userCommands.get(commandName);
      
      try {
        await command.execute(message, args);
      } catch (error) {
        console.error(`Error executing user command ${commandName}:`, error);
        message.reply('❌ An error occurred while executing this command!');
      }
      return;
    }
  }

  getCommands() {
    return {
      perms: Array.from(this.permsCommands.values()),
      user: Array.from(this.userCommands.values())
    };
  }
}

module.exports = PrefixHandler;
