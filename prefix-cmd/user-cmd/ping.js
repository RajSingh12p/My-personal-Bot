
module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  usage: '!ping',
  async execute(message, args) {
    const sent = await message.reply('🏓 Pinging...');
    const timeDiff = sent.createdTimestamp - message.createdTimestamp;
    
    sent.edit(`🏓 Pong! Latency: ${timeDiff}ms | API Latency: ${Math.round(message.client.ws.ping)}ms`);
  },
};
