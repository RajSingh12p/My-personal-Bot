const mongoose = require('mongoose');

const ticketSettingsSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    categoryId: { type: String, required: true },
    logChannelId: { type: String, required: true },
    supportRoleIds: [{ type: String }],
    ticketLimit: { type: Number, default: 3 },
    requireReason: { type: Boolean, default: false },
    welcomeMessage: {
      type: String,
      default:
        'Welcome to your ticket, {user}! Support will be with you shortly.',
    },
    closeMessage: {
      type: String,
      default: 'This ticket will be closed in 5 seconds.',
    },
    namingPattern: {
      type: String,
      default: '{category}-{count}',
      required: true,
    },
    autoClose: { type: Boolean, default: false },
    autoCloseTime: { type: Number, default: 24 }, // hours
    transcriptEnabled: { type: Boolean, default: true },
    ratingEnabled: { type: Boolean, default: false },
    priorityEnabled: { type: Boolean, default: false },
    customFields: [{
      name: String,
      required: Boolean,
      type: { type: String, enum: ['text', 'number', 'boolean'] }
    }],
    maxTicketsPerUser: { type: Number, default: 3 },
    dmOnCreate: { type: Boolean, default: false },
    dmOnClose: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TicketSettings', ticketSettingsSchema);
