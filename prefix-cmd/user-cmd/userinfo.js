
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Get information about a user',
  usage: '!userinfo [user]',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`User Info - ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Username', value: user.username, inline: true },
        { name: 'Discriminator', value: user.discriminator || 'None', inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      );

    if (member) {
      embed.addFields(
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: 'Roles', value: member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.toString()).join(', ') || 'None', inline: false }
      );
    }

    message.reply({ embeds: [embed] });
  },
};
