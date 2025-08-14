const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot) return;

    const prefix = '!'; // You can make this configurable later
    const mention = new RegExp(`^<@!?${message.client.user.id}>( |)$`);

    // Handle prefix commands
    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command = message.client.prefixCommands?.get(commandName);
      if (!command) return;

      // Check permissions
      if (command.permissions) {
        const hasPermission = command.permissions.some(permission => {
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

        if (!hasPermission) {
          return message.reply('❌ You do not have permission to use this command!').catch(console.error);
        }
      }

      try {
        await command.execute(message, args);
      } catch (error) {
        console.error('Error executing prefix command:', error);
        message.reply('There was an error executing that command!').catch(console.error);
      }
      return;
    }

    // Handle bot mentions
    if (message.content.match(mention)) {
      try {
        const commands = await message.client.application.commands.fetch();

        const helpCommand = commands.find((cmd) => cmd.name === 'help');
        const helpCommandId = helpCommand ? helpCommand.id : 'unknown';

        const mentionEmbed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setDescription(
            `Hey ${message.author}, I'm ! ᴅᴏ ᴏʀ ᴅɪᴇ, I use both \`/\` commands and \`${prefix}\` prefix commands.\nCheck out my commands, type </help:${helpCommandId}> or \`${prefix}help\``
          )
          .setTimestamp();

        message.reply({ embeds: [mentionEmbed] }).catch(console.error);
      } catch (error) {
        console.error('Error fetching commands:', error);
      }
    }
  },
};
