
module.exports = {
  name: 'ban',
  description: 'Ban a user from the server',
  permissions: ['BAN_MEMBERS'],
  usage: '!ban <user> [reason]',
  async execute(message, args) {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('❌ You do not have permission to use this command!');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('❌ Please mention a user to ban!');
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply('❌ User not found in this server!');
    }

    if (!member.bannable) {
      return message.reply('❌ I cannot ban this user!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.ban({ reason });
      message.reply(`✅ Successfully banned ${user.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('❌ An error occurred while banning the user!');
    }
  },
};
