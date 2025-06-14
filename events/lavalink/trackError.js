module.exports = {
  name: 'trackError',
  async execute(client, player, track, error) {
    const channel = client.channels.cache.get(player.textChannelId);
    
    // If it's a Spotify or YouTube track that failed, try to find alternatives
    if (error.exception?.message?.includes('unavailable')) {
      try {
        let searchQuery = `${track.info.title} ${track.info.author}`;
        let searchSource = 'ytsearch';
        let fallbackMessage = '';
        
        // For Spotify tracks, search on YouTube
        if (track.info.sourceName === 'spotify') {
          searchSource = 'ytsearch';
          fallbackMessage = '🔄 Spotify track unavailable, playing YouTube version';
        }
        // For YouTube tracks, try YouTube Music or search again
        else if (track.info.sourceName === 'youtube') {
          searchSource = 'ytmsearch';
          fallbackMessage = '🔄 YouTube track unavailable, trying YouTube Music';
        }
        
        const results = await player.search({ 
          query: searchQuery, 
          source: searchSource 
        });
        
        if (results?.tracks?.length > 0) {
          // Filter out the same track that failed
          const filteredTracks = results.tracks.filter(
            t => t.info.identifier !== track.info.identifier
          );
          
          if (filteredTracks.length > 0) {
            const fallbackTrack = filteredTracks[0];
            fallbackTrack.userData = track.userData; // Preserve requester info
            
            // Add the fallback version to the front of the queue
            await player.queue.add(fallbackTrack, 0);
            
            if (channel) {
              channel.send(
                `${fallbackMessage}: \`${fallbackTrack.info.title}\``
              );
            }
            return;
          }
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
