
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Shows all available prefix commands',
  usage: '!help [command]',
  async execute(message, args) {
    const { prefixCommands } = message.client;
    
    if (args.length === 0) {
      // Show all commands grouped by category
      const categories = {};
      
      prefixCommands.forEach((command, name) => {
        const category = command.category || 'Uncategorized';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({
          name: name,
          description: command.description || 'No description provided',
          permissions: command.permissions || null
        });
      });

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('📚 Prefix Commands Help')
        .setDescription('Here are all available prefix commands:')
        .setTimestamp();

      Object.keys(categories).forEach(category => {
        const filteredCommands = categories[category].filter(cmd => {
          if (!cmd.permissions) return true; // No permissions required
          
          return cmd.permissions.some(permission => {
            if (permission === 'ADMINISTRATOR') {
              return message.member.permissions.has('Administrator');
            }
            if (permission === 'MANAGE_GUILD') {
              return message.member.permissions.has('ManageGuild');
            }
            if (permission === 'MODERATE_MEMBERS') {
              return message.member.permissions.has('ModerateMembers');
            }
            if (permission === 'MANAGE_MESSAGES') {
              return message.member.permissions.has('ManageMessages');
            }
            return message.member.permissions.has(permission);
          });
        });

        if (filteredCommands.length > 0) {
          const commandList = filteredCommands
            .map(cmd => `\`!${cmd.name}\` - ${cmd.description}${cmd.permissions ? ' **(Admin)**' : ''}`)
            .join('\n');
          
          embed.addFields({
            name: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
            value: commandList,
            inline: false
          });
        }
      });

      embed.setFooter({ text: 'Use !help [command] for detailed information about a specific command' });

      return message.reply({ embeds: [embed] });
    } else {
      // Show specific command info
      const commandName = args[0].toLowerCase();
      const command = prefixCommands.get(commandName);

      if (!command) {
        return message.reply(`❌ Command \`${commandName}\` not found!`);
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`📖 Command: !${command.name}`)
        .setDescription(command.description || 'No description provided')
        .addFields(
          { name: 'Usage', value: command.usage || `!${command.name}`, inline: true },
          { name: 'Category', value: command.category || 'Uncategorized', inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }
  }
};
