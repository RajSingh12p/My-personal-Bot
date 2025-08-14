
const fs = require('fs');
const path = require('path');

class PrefixHandler {
  constructor(client) {
    this.client = client;
    this.commands = new Map();
    this.prefix = '!';
  }

  loadCommands() {
    try {
      // Load permission commands
      const permsPath = path.join(__dirname, '../prefix-cmd/perms-cmd');
      if (fs.existsSync(permsPath)) {
        const permsFiles = fs.readdirSync(permsPath).filter(file => file.endsWith('.js'));
        
        for (const file of permsFiles) {
          try {
            delete require.cache[require.resolve(path.join(permsPath, file))];
            const command = require(path.join(permsPath, file));
            if (command && command.name) {
              this.commands.set(command.name, command);
              console.log(`✅ Loaded permission command: ${command.name}`);
            }
          } catch (error) {
            console.error(`❌ Error loading permission command ${file}:`, error.message);
          }
        }
      }

      // Load user commands
      const userPath = path.join(__dirname, '../prefix-cmd/user-cmd');
      if (fs.existsSync(userPath)) {
        const userFiles = fs.readdirSync(userPath).filter(file => file.endsWith('.js'));
        
        for (const file of userFiles) {
          try {
            delete require.cache[require.resolve(path.join(userPath, file))];
            const command = require(path.join(userPath, file));
            if (command && command.name) {
              this.commands.set(command.name, command);
              console.log(`✅ Loaded user command: ${command.name}`);
            }
          } catch (error) {
            console.error(`❌ Error loading user command ${file}:`, error.message);
          }
        }
      }

      console.log(`✅ Prefix handler loaded ${this.commands.size} commands with prefix: ${this.prefix}`);
    } catch (error) {
      console.error('❌ Error loading prefix commands:', error.message);
    }
  }

  async handleMessage(message) {
    try {
      if (!message.content.startsWith(this.prefix) || message.author.bot) return;

      const args = message.content.slice(this.prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (!this.commands.has(commandName)) return;

      const command = this.commands.get(commandName);
      
      if (command && typeof command.execute === 'function') {
        await command.execute(message, args);
      }
    } catch (error) {
      console.error(`❌ Error executing prefix command:`, error.message);
      try {
        await message.reply('❌ An error occurred while executing this command!');
      } catch (replyError) {
        console.error('❌ Could not send error message:', replyError.message);
      }
    }
  }

  getCommands() {
    return Array.from(this.commands.values());
  }

  setPrefix(newPrefix) {
    this.prefix = newPrefix;
    console.log(`✅ Prefix changed to: ${this.prefix}`);
  }
}

module.exports = PrefixHandler;
