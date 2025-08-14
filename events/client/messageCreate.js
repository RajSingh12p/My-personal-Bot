const { Events } = require('discord.js');
const PrefixHandler = require('../../handlers/prefixHandler');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot) return;

    // Handle prefix commands
    if (message.client.prefixHandler) {
      await message.client.prefixHandler.handleMessage(message);
    }
  },
};
