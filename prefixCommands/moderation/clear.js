const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Clear messages from the channel',
  usage: '!clear <amount> [user]',
  permissions: ['ADMINISTRATOR', 'MANAGE_MESSAGES'],
  async execute(message, args) {
    // Check if user has manage messages permission
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ You need the **Manage Messages** permission to use this command!');
    }

    // Check if bot has manage messages permission
    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ I need the **Manage Messages** permission to clear messages!');
    }

    const amount = parseInt(args[0]);

    if (!amount || amount < 1 || amount > 100) {
      return message.reply('❌ Please provide a number between 1 and 100!');
    }

    let targetUser = null;
    if (args[1]) {
      // Try to find the user by mention or ID
      const userMention = args[1].match(/^<@!?(\d+)>$/);
      const userId = userMention ? userMention[1] : args[1];
      targetUser = message.guild.members.cache.get(userId);

      if (!targetUser) {
        return message.reply('❌ User not found!');
      }
    }

    try {
      // Fetch messages
      const messages = await message.channel.messages.fetch({ 
        limit: targetUser ? 100 : amount + 1 // +1 to include the command message
      });

      let messagesToDelete = messages.filter(msg => {
        if (targetUser) {
          return msg.author.id === targetUser.id;
        }
        return true;
      });

      if (targetUser) {
        messagesToDelete = messagesToDelete.first(amount);
      }

      // Delete messages
      await message.channel.bulkDelete(messagesToDelete, true);

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('🗑️ Messages Cleared')
        .setDescription(
          targetUser 
            ? `Successfully deleted ${messagesToDelete.size} messages from ${targetUser.user.username}!`
            : `Successfully deleted ${messagesToDelete.size} messages!`
        )
        .setTimestamp()
        .setFooter({ 
          text: `Cleared by ${message.author.username}`, 
          iconURL: message.author.displayAvatarURL({ dynamic: true }) 
        });

      const reply = await message.channel.send({ embeds: [embed] });

      // Delete the confirmation message after 5 seconds
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 5000);

    } catch (error) {
      console.error('Error clearing messages:', error);
      message.reply('❌ There was an error clearing messages!');
    }
  }
};