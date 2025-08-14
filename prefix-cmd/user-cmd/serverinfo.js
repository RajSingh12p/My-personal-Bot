
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  description: 'Get information about the server',
  usage: '!serverinfo',
  async execute(message, args) {
    const guild = message.guild;
    
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`Server Info - ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Members', value: guild.memberCount.toString(), inline: true },
        { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
        { name: 'Boost Level', value: guild.premiumTier.toString(), inline: true },
        { name: 'Boosts', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
