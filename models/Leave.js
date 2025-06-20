
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  channelId: { type: String, default: null },
  message: { 
    type: String, 
    default: 'Goodbye {member}! We will miss you in {server}. You were with us for {duration}.' 
  },
  embedEnabled: { type: Boolean, default: true },
  embedColor: { type: String, default: '#FF0000' },
  embedTitle: { type: String, default: 'Member Left' },
  enableImage: { type: Boolean, default: false },
  imageUrl: { type: String, default: null },
  enableFooter: { type: Boolean, default: true },
  footerText: { type: String, default: 'We hope to see you again!' }
});

module.exports = mongoose.model('Leave', leaveSchema);
