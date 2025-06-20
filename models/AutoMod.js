
const mongoose = require('mongoose');

const autoModSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  
  // Anti-spam settings
  antiSpam: {
    enabled: { type: Boolean, default: false },
    maxMessages: { type: Number, default: 5 },
    timeWindow: { type: Number, default: 5 }, // seconds
    punishment: { type: String, enum: ['warn', 'mute', 'kick', 'ban'], default: 'warn' },
    muteDuration: { type: Number, default: 300 }, // seconds
  },
  
  // Bad words filter
  badWords: {
    enabled: { type: Boolean, default: false },
    words: [{ type: String }],
    punishment: { type: String, enum: ['delete', 'warn', 'mute', 'kick', 'ban'], default: 'delete' },
    muteDuration: { type: Number, default: 600 },
  },
  
  // Anti-invite
  antiInvite: {
    enabled: { type: Boolean, default: false },
    punishment: { type: String, enum: ['delete', 'warn', 'mute', 'kick', 'ban'], default: 'delete' },
    whitelist: [{ type: String }], // Whitelisted server IDs
  },
  
  // Anti-caps
  antiCaps: {
    enabled: { type: Boolean, default: false },
    percentage: { type: Number, default: 70 },
    minLength: { type: Number, default: 10 },
    punishment: { type: String, enum: ['delete', 'warn'], default: 'delete' },
  },
  
  // Anti-mention spam
  antiMention: {
    enabled: { type: Boolean, default: false },
    maxMentions: { type: Number, default: 5 },
    punishment: { type: String, enum: ['delete', 'warn', 'mute'], default: 'warn' },
  },
  
  // Auto role on join
  autoRole: {
    enabled: { type: Boolean, default: false },
    roleId: { type: String, default: null },
    botRoleId: { type: String, default: null },
  },
  
  // Ignored channels and roles
  ignoredChannels: [{ type: String }],
  ignoredRoles: [{ type: String }],
  
  // Log channel
  logChannelId: { type: String, default: null },
  
}, { timestamps: true });

module.exports = mongoose.model('AutoMod', autoModSchema);
