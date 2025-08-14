
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Get a user\'s avatar',
  usage: '!avatar [@user]',
  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🖼️ ${target.tag}'s Avatar`)
      .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: 'Download Links', value: `[PNG](${target.displayAvatarURL({ format: 'png', size: 1024 })}) | [JPG](${target.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [WEBP](${target.displayAvatarURL({ format: 'webp', size: 1024 })})${target.avatar && target.avatar.startsWith('a_') ? ` | [GIF](${target.displayAvatarURL({ format: 'gif', size: 1024 })})` : ''}` }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
