
const { Events, EmbedBuilder } = require('discord.js');
const AutoMod = require('../models/AutoMod');

const spamTracker = new Map();

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const autoMod = await AutoMod.findOne({ guildId: message.guild.id });
    if (!autoMod || !autoMod.enabled) return;

    // Check if user/channel is ignored
    if (autoMod.ignoredChannels.includes(message.channel.id)) return;
    if (message.member.roles.cache.some(role => autoMod.ignoredRoles.includes(role.id))) return;

    let violations = [];

    // Anti-spam check
    if (autoMod.antiSpam.enabled) {
      const userId = message.author.id;
      const now = Date.now();
      
      if (!spamTracker.has(userId)) {
        spamTracker.set(userId, []);
      }
      
      const userMessages = spamTracker.get(userId);
      userMessages.push(now);
      
      // Remove old messages outside time window
      const timeWindow = autoMod.antiSpam.timeWindow * 1000;
      const filtered = userMessages.filter(time => now - time < timeWindow);
      spamTracker.set(userId, filtered);
      
      if (filtered.length > autoMod.antiSpam.maxMessages) {
        violations.push('spam');
      }
    }

    // Bad words check
    if (autoMod.badWords.enabled && autoMod.badWords.words.length > 0) {
      const content = message.content.toLowerCase();
      const hasBadWord = autoMod.badWords.words.some(word => content.includes(word));
      if (hasBadWord) {
        violations.push('badwords');
      }
    }

    // Anti-invite check
    if (autoMod.antiInvite.enabled) {
      const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+/gi;
      if (inviteRegex.test(message.content)) {
        violations.push('invite');
      }
    }

    // Anti-caps check
    if (autoMod.antiCaps.enabled && message.content.length >= autoMod.antiCaps.minLength) {
      const caps = message.content.replace(/[^A-Z]/g, '').length;
      const letters = message.content.replace(/[^A-Za-z]/g, '').length;
      const percentage = letters > 0 ? (caps / letters) * 100 : 0;
      
      if (percentage > autoMod.antiCaps.percentage) {
        violations.push('caps');
      }
    }

    // Anti-mention check
    if (autoMod.antiMention.enabled) {
      const mentions = message.mentions.users.size + message.mentions.roles.size;
      if (mentions > autoMod.antiMention.maxMentions) {
        violations.push('mention');
      }
    }

    // Handle violations
    if (violations.length > 0) {
      await handleViolations(message, violations, autoMod);
    }
  },
};

async function handleViolations(message, violations, autoMod) {
  try {
    let action = 'warn';
    let shouldDelete = false;
    
    // Determine action based on violations
    for (const violation of violations) {
      switch (violation) {
        case 'spam':
          action = autoMod.antiSpam.punishment;
          break;
        case 'badwords':
          action = autoMod.badWords.punishment;
          shouldDelete = true;
          break;
        case 'invite':
          action = autoMod.antiInvite.punishment;
          shouldDelete = true;
          break;
        case 'caps':
          action = autoMod.antiCaps.punishment;
          shouldDelete = true;
          break;
        case 'mention':
          action = autoMod.antiMention.punishment;
          break;
      }
    }

    // Delete message if needed
    if (shouldDelete && message.deletable) {
      await message.delete();
    }

    // Execute punishment
    switch (action) {
      case 'warn':
        await message.channel.send({
          content: `⚠️ ${message.author}, please follow the server rules! Violations: ${violations.join(', ')}`,
        });
        break;
        
      case 'mute':
        // Implementation depends on your mute system
        await message.channel.send({
          content: `🔇 ${message.author} has been muted for violating server rules.`,
        });
        break;
        
      case 'kick':
        if (message.member.kickable) {
          await message.member.kick(`AutoMod: ${violations.join(', ')}`);
        }
        break;
        
      case 'ban':
        if (message.member.bannable) {
          await message.member.ban({ reason: `AutoMod: ${violations.join(', ')}` });
        }
        break;
    }

    // Log to mod channel
    if (autoMod.logChannelId) {
      const logChannel = message.guild.channels.cache.get(autoMod.logChannelId);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('AutoMod Action')
          .addFields(
            { name: 'User', value: message.author.toString(), inline: true },
            { name: 'Channel', value: message.channel.toString(), inline: true },
            { name: 'Violations', value: violations.join(', '), inline: true },
            { name: 'Action', value: action, inline: true },
            { name: 'Message', value: message.content.substring(0, 1000) || 'No content', inline: false }
          )
          .setTimestamp();
          
        await logChannel.send({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error('AutoMod error:', error);
  }
}
