module.exports = {
  name: 'trackError',
  async execute(client, player, track, error) {
    const channel = client.channels.cache.get(player.textChannelId);
    
    // If it's a Spotify track that failed, try to find it on YouTube
    if (track.info.sourceName === 'spotify' && error.exception?.message?.includes('unavailable')) {
      try {
        const searchQuery = `${track.info.title} ${track.info.author}`;
        const results = await player.search({ 
          query: searchQuery, 
          source: 'ytsearch' 
        });
        
        if (results?.tracks?.length > 0) {
          const fallbackTrack = results.tracks[0];
          fallbackTrack.userData = track.userData; // Preserve requester info
          
          // Add the YouTube version to the front of the queue
          await player.queue.add(fallbackTrack, 0);
          
          if (channel) {
            channel.send(
              `🔄 Spotify track unavailable, playing YouTube version: \`${fallbackTrack.info.title}\``
            );
          }
          return;
        }
      } catch (searchError) {
        console.error('Fallback search failed:', searchError);
      }
    }
    
    // Default error handling for other cases
    if (channel) {
      channel.send(
        `❌ There was an error playing the track: \`${track.info.title}\`. Skipping to the next track.`
      );
    }
    console.error(`Error with track ${track.info.title}:`, error);
  },
};
