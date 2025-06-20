
const { Events, EmbedBuilder } = require('discord.js');
const AutoReply = require('../models/AutoReply');

const cooldowns = new Map();

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const autoReplies = await AutoReply.find({ 
      guildId: message.guild.id, 
      enabled: true 
    });

    if (autoReplies.length === 0) return;

    for (const autoReply of autoReplies) {
      let shouldReply = false;
      const messageContent = autoReply.ignoreCase 
        ? message.content.toLowerCase() 
        : message.content;
      const trigger = autoReply.ignoreCase 
        ? autoReply.trigger.toLowerCase() 
        : autoReply.trigger;

      // Check if message matches trigger
      if (autoReply.isRegex) {
        try {
          const regex = new RegExp(trigger, autoReply.ignoreCase ? 'i' : '');
          shouldReply = regex.test(messageContent);
        } catch (error) {
          console.error('Invalid regex in auto reply:', error);
          continue;
        }
      } else if (autoReply.isExact) {
        shouldReply = messageContent === trigger;
      } else {
        shouldReply = messageContent.includes(trigger);
      }

      if (!shouldReply) continue;

      // Check channel restrictions
      if (autoReply.channelIds.length > 0 && !autoReply.channelIds.includes(message.channel.id)) {
        continue;
      }

      // Check role restrictions
      if (autoReply.roleIds.length > 0) {
        const hasRole = message.member.roles.cache.some(role => 
          autoReply.roleIds.includes(role.id)
        );
        if (!hasRole) continue;
      }

      // Check cooldown
      const cooldownKey = `${autoReply._id}-${message.author.id}`;
      if (autoReply.cooldown > 0) {
        const lastUsed = cooldowns.get(cooldownKey);
        if (lastUsed && Date.now() - lastUsed < autoReply.cooldown * 1000) {
          continue;
        }
      }

      try {
        let response = autoReply.response
          .replace(/{user}/g, message.author.toString())
          .replace(/{username}/g, message.author.username)
          .replace(/{server}/g, message.guild.name)
          .replace(/{channel}/g, message.channel.toString());

        if (autoReply.embedResponse) {
          const embed = new EmbedBuilder()
            .setColor(autoReply.embedColor)
            .setDescription(response)
            .setTimestamp();

          await message.reply({ embeds: [embed] });
        } else {
          await message.reply(response);
        }

        // Update cooldown and use count
        if (autoReply.cooldown > 0) {
          cooldowns.set(cooldownKey, Date.now());
        }

        autoReply.useCount += 1;
        await autoReply.save();

        // Delete original message if configured
        if (autoReply.deleteOriginal && message.deletable) {
          await message.delete();
        }

        break; // Only respond to first matching trigger
      } catch (error) {
        console.error('Auto reply error:', error);
      }
    }
  },
};
