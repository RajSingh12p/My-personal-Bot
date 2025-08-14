
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Show all available prefix commands',
  usage: '!help [command]',
  async execute(message, args) {
    const prefixHandler = message.client.prefixHandler;
    const commands = prefixHandler.getCommands();

    if (args[0]) {
      // Show specific command help
      const commandName = args[0].toLowerCase();
      let command = commands.perms.find(cmd => cmd.name === commandName) || 
                   commands.user.find(cmd => cmd.name === commandName);

      if (!command) {
        return message.reply('❌ Command not found!');
      }

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`Command: ${command.name}`)
        .setDescription(command.description)
        .addFields(
          { name: 'Usage', value: command.usage || `!${command.name}`, inline: true },
          { name: 'Permissions', value: command.permissions ? command.permissions.join(', ') : 'None', inline: true }
        );

      return message.reply({ embeds: [embed] });
    }

    // Show all commands
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('Prefix Commands Help')
      .setDescription('Here are all available prefix commands:');

    if (commands.user.length > 0) {
      embed.addFields({
        name: '👥 User Commands (No Permissions Required)',
        value: commands.user.map(cmd => `\`!${cmd.name}\` - ${cmd.description}`).join('\n'),
        inline: false
      });
    }

    if (commands.perms.length > 0) {
      embed.addFields({
        name: '🛡️ Permission Commands (Staff Only)',
        value: commands.perms.map(cmd => `\`!${cmd.name}\` - ${cmd.description}`).join('\n'),
        inline: false
      });
    }

    embed.setFooter({ text: 'Use !help <command> for detailed information about a specific command' });

    message.reply({ embeds: [embed] });
  },
};
