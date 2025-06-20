
const mongoose = require('mongoose');

const autoReplySchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  trigger: { type: String, required: true },
  response: { type: String, required: true },
  isExact: { type: Boolean, default: false },
  isRegex: { type: Boolean, default: false },
  ignoreCase: { type: Boolean, default: true },
  channelIds: [{ type: String }], // Empty array means all channels
  roleIds: [{ type: String }], // Empty array means all roles
  enabled: { type: Boolean, default: true },
  cooldown: { type: Number, default: 0 }, // Cooldown in seconds
  deleteOriginal: { type: Boolean, default: false },
  embedResponse: { type: Boolean, default: false },
  embedColor: { type: String, default: '#0099FF' },
  useCount: { type: Number, default: 0 },
  createdBy: { type: String, required: true },
}, { timestamps: true });

autoReplySchema.index({ guildId: 1, trigger: 1 }, { unique: true });

module.exports = mongoose.model('AutoReply', autoReplySchema);
