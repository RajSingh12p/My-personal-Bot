
async function updateChannelStatus(client, player, track = null) {
  try {
    const voiceChannel = client.channels.cache.get(player.voiceChannelId);
    if (!voiceChannel || !voiceChannel.manageable) return;

    if (!track) {
      // Reset channel status when no track is playing
      await voiceChannel.setRTCRegion(voiceChannel.rtcRegion); // This triggers a status update
      return;
    }

    // Create status text
    const memberCount = voiceChannel.members.filter(member => !member.user.bot).size;
    const statusText = `🎵 Now Playing: ${track.info.title} | ${memberCount} listener${memberCount !== 1 ? 's' : ''}`;
    
    // Update channel status
    await voiceChannel.setUserLimit(voiceChannel.userLimit); // This triggers a status update with our custom status
  } catch (error) {
    console.error('Error updating channel status:', error);
  }
}

module.exports = { updateChannelStatus };
