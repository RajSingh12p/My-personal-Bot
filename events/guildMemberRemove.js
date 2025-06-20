
const { Events, EmbedBuilder } = require('discord.js');
const Leave = require('../models/Leave');

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member) {
    const leave = await Leave.findOne({ serverId: member.guild.id });
    
    if (!leave || !leave.enabled || !leave.channelId) return;
    
    const leaveChannel = member.guild.channels.cache.get(leave.channelId);
    if (!leaveChannel) return;
    
    const joinedAt = member.joinedAt;
    const duration = joinedAt ? Math.floor((Date.now() - joinedAt) / (1000 * 60 * 60 * 24)) : 0;
    
    let message = leave.message
      .replace(/{member}/g, member.user.tag)
      .replace(/{server}/g, member.guild.name)
      .replace(/{duration}/g, `${duration} days`);
    
    if (leave.embedEnabled) {
      const embed = new EmbedBuilder()
        .setColor(leave.embedColor)
        .setTitle(leave.embedTitle)
        .setDescription(message)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();
      
      if (leave.enableImage && leave.imageUrl) {
        embed.setImage(leave.imageUrl);
      }
      
      if (leave.enableFooter) {
        embed.setFooter({ text: leave.footerText });
      }
      
      leaveChannel.send({ embeds: [embed] });
    } else {
      leaveChannel.send(message);
    }
  },
};
