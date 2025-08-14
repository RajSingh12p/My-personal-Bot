
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  description: 'Shows information about the current server',
  usage: '!serverinfo',
  async execute(message) {
    const guild = message.guild;
    if (!guild) {
      return message.reply('❌ This command can only be used in a server!');
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`📊 Server Info - ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: '🆔 Server ID', value: guild.id, inline: true },
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
        { name: '📺 Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: '💬 Text Channels', value: guild.channels.cache.filter(ch => ch.type === 0).size.toString(), inline: true },
        { name: '🔊 Voice Channels', value: guild.channels.cache.filter(ch => ch.type === 2).size.toString(), inline: true },
        { name: '🚀 Boost Level', value: `Level ${guild.premiumTier}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

    if (guild.description) {
      embed.setDescription(guild.description);
    }

    message.reply({ embeds: [embed] });
  }
};
