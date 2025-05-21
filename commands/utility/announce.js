
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Announce a message using its ID')
    .addStringOption(option =>
      option
        .setName('message_id')
        .setDescription('The ID of the message to announce')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to send the announcement in')
        .setRequired(false)
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Role to mention in the announcement')
        .setRequired(false)
    )
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to mention in the announcement')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const messageId = interaction.options.getString('message_id');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const role = interaction.options.getRole('role');
    const userToMention = interaction.options.getUser('user');

    try {
      // Try to fetch the message from the current channel
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const originalMessage = messages.get(messageId);

      if (!originalMessage) {
        return interaction.followUp({
          content: '❌ Could not find the message. Make sure it\'s recent and in this channel.',
          ephemeral: true
        });
      }

      const content = originalMessage.content;
      const files = Array.from(originalMessage.attachments.values());
      const embeds = originalMessage.embeds;

      // Check if there's any content to announce
      const hasContent = content?.trim() || files.length > 0 || embeds.length > 0;
      
      if (!hasContent) {
        return interaction.followUp({
          content: '⚠️ Cannot announce an empty message. The message must contain text, files, or embeds.',
          ephemeral: true
        });
      }

      const roleMention = role ? `${role.toString()} ` : '';
      const userMention = userToMention ? `${userToMention.toString()} ` : '';
      const mention = `${roleMention}${userMention}`.trim();
      
      // Create announcement embed
      const announcementEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setDescription(content || '')
        .setTimestamp()
        .setFooter({ 
          text: `Originally sent in #${originalMessage.channel.name}`,
        });

      if (originalMessage.author) {
        announcementEmbed.setAuthor({
          name: originalMessage.author.tag,
          iconURL: originalMessage.author.displayAvatarURL()
        });
      }

      // Add jump link for admins
      announcementEmbed.addFields({
        name: 'Source',
        value: `[Jump to original message](${originalMessage.url})`,
        inline: true
      });

      // Handle attachments
      if (files.length > 0) {
        const firstFile = files[0];
        if (firstFile.contentType?.startsWith('image/')) {
          announcementEmbed.setImage(firstFile.url);
        }
      }

      // Combine original embeds with our announcement embed
      const allEmbeds = [announcementEmbed, ...embeds];

      await targetChannel.send({
        content: mention || null,
        embeds: allEmbeds,
        files: files.filter(file => 
          !file.contentType?.startsWith('image/') || 
          files.indexOf(file) !== 0
        )
      });

      await interaction.followUp({
        content: '✅ Announcement sent successfully!',
        ephemeral: true
      });

    } catch (error) {
      console.error('Error in announce command:', error);
      await interaction.followUp({
        content: `❌ An error occurred: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
