
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Shows the bot\'s latency',
  usage: '!ping',
  async execute(message) {
    const sent = await message.reply('🏓 Pinging...');
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🏓 Pong!')
      .addFields(
        { 
          name: 'Message Latency', 
          value: `${sent.createdTimestamp - message.createdTimestamp}ms`, 
          inline: true 
        },
        { 
          name: 'WebSocket Latency', 
          value: `${Math.round(message.client.ws.ping)}ms`, 
          inline: true 
        }
      )
      .setTimestamp();

    await sent.edit({ content: null, embeds: [embed] });
  }
};
