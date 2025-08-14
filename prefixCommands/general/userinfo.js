
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Get information about a user',
  usage: '!userinfo [@user]',
  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(target.id);

    if (!member) {
      return message.reply('❌ User not found in this server!');
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`👤 User Info - ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Username', value: target.username, inline: true },
        { name: 'Discriminator', value: `#${target.discriminator}`, inline: true },
        { name: 'ID', value: target.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
        { name: 'Roles', value: member.roles.cache.size > 1 ? member.roles.cache.filter(role => role.id !== message.guild.id).map(role => role.toString()).join(', ') : 'None', inline: false }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
