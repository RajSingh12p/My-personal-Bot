
module.exports = {
  name: 'kick',
  description: 'Kick a user from the server',
  permissions: ['KICK_MEMBERS'],
  usage: '!kick <user> [reason]',
  async execute(message, args) {
    if (!message.member.permissions.has('KICK_MEMBERS')) {
      return message.reply('❌ You do not have permission to use this command!');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('❌ Please mention a user to kick!');
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply('❌ User not found in this server!');
    }

    if (!member.kickable) {
      return message.reply('❌ I cannot kick this user!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.kick(reason);
      message.reply(`✅ Successfully kicked ${user.tag} for: ${reason}`);
    } catch (error) {
      console.error(error);
      message.reply('❌ An error occurred while kicking the user!');
    }
  },
};
