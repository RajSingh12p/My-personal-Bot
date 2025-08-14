
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a user from the server',
  usage: '!ban <user> [reason]',
  permissions: ['ADMINISTRATOR', 'MANAGE_GUILD'],
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply('❌ Please provide a user to ban!');
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

    if (!member.bannable) {
      return message.reply('❌ I cannot ban this user!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.ban({ reason });
      
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🔨 User Banned')
        .addFields(
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ Failed to ban user!');
    }
  }
};
