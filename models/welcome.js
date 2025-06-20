const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  description: { type: String, default: 'Welcome {member} to {server}' },
  channelId: { type: String, default: null },
  embedEnabled: { type: Boolean, default: true },
  embedColor: { type: String, default: '#00FF00' },
  embedTitle: { type: String, default: 'Welcome!' },
  enableImage: { type: Boolean, default: false },
  imageUrl: { type: String, default: null },
  enableThumbnail: { type: Boolean, default: true },
  enableFooter: { type: Boolean, default: true },
  footerText: { type: String, default: 'Enjoy your stay!' },
  enableTimestamp: { type: Boolean, default: true },
  mentionUser: { type: Boolean, default: true },
  welcomeRole: { type: String, default: null },
  dmWelcome: { type: Boolean, default: false },
  dmMessage: { type: String, default: 'Welcome to {server}! Please read the rules.' }
});

const Welcome = mongoose.model('Welcome', welcomeSchema);

module.exports = Welcome;
