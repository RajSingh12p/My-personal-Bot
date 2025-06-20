const mongoose = require('mongoose');

const serverLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  logChannel: { type: String, default: null },
  categories: {
    memberEvents: { type: Boolean, default: true },
    messageEvents: { type: Boolean, default: true },
    channelEvents: { type: Boolean, default: true },
    roleEvents: { type: Boolean, default: true },
    serverEvents: { type: Boolean, default: true },
    moderation: { type: Boolean, default: true },
    voice: { type: Boolean, default: false },
    invites: { type: Boolean, default: false },
    tickets: { type: Boolean, default: false },
    automod: { type: Boolean, default: false },
  },
  ignoredChannels: [{ type: String }],
  ignoredUsers: [{ type: String }],
  webhookUrl: { type: String, default: null },
});

module.exports = mongoose.model('ServerLog', serverLogSchema);
