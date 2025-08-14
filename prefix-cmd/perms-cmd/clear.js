
module.exports = {
  name: 'clear',
  description: 'Delete multiple messages',
  permissions: ['MANAGE_MESSAGES'],
  usage: '!clear <amount>',
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('❌ You do not have permission to use this command!');
    }

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply('❌ Please provide a number between 1 and 100!');
    }

    try {
      await message.channel.bulkDelete(amount + 1, true);
      const reply = await message.channel.send(`✅ Successfully deleted ${amount} messages!`);
      
      setTimeout(() => {
        reply.delete().catch(console.error);
      }, 3000);
    } catch (error) {
      console.error(error);
      message.reply('❌ An error occurred while deleting messages!');
    }
  },
};
