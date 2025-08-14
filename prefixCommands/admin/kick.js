
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kick a user from the server',
  usage: '!kick <user> [reason]',
  permissions: ['ADMINISTRATOR', 'MODERATE_MEMBERS'],
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply('❌ Please provide a user to kick!');
    }

    const target = message.mentions.users.first() || 
                  message.guild.members.cache.get(args[0])?.user;
    
    if (!target) {
      return message.reply('❌ User not found!');
    }

    const member = message.guild.members.cache.get(target.id);
    if (!member) {
      return message.reply('❌ User is not in this server!');
    }

    if (!member.kickable) {
      return message.reply('❌ I cannot kick this user!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.kick(reason);
      
      const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('👢 User Kicked')
        .addFields(
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ Failed to kick user!');
    }
  }
};
