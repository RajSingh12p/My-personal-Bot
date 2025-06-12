const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dmrole')
    .setDescription('Send a DM to all members with a specific role')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to send DMs to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('The message to send. Use {user} for member mention')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('delay')
        .setDescription('Delay between messages in seconds (1-30)')
        .setMinValue(1)
        .setMaxValue(30)
    )
    .addBooleanOption(option =>
      option
        .setName('preview')
        .setDescription('Preview the message without sending')
    )
    .addBooleanOption(option =>
      option
        .setName('anonymous')
        .setDescription('Send message without showing who sent it')
    )
    .addStringOption(option =>
      option
        .setName('message_id')
        .setDescription('ID of message to fetch and send (optional)')
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName('source_channel')
        .setDescription('Channel to fetch the message from (required if message_id is provided)')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Check authorization through three methods
    const authorizedUsername = '_do_or_die_1';
    const isOwner = interaction.user.username === authorizedUsername;
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    const exeBotRole = interaction.guild.roles.cache.find(role => role.name === 'exe.bot');
    const hasExeBotRole = exeBotRole && interaction.member.roles.cache.has(exeBotRole.id);

    if (!isOwner && !isAdmin && !hasExeBotRole) {
      return interaction.reply({
        content: '❌ You need one of the following to use this command:\n• Be the bot owner (_do_or_die_1)\n• Have Administrator permissions\n• Have the `exe.bot` role',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const role = interaction.options.getRole('role');
    let message = interaction.options.getString('message');
    const messageId = interaction.options.getString('message_id');
    const sourceChannel = interaction.options.getChannel('source_channel');
    const delay = (interaction.options.getInteger('delay') || 2) * 1000;
    const preview = interaction.options.getBoolean('preview') || false;
    const anonymous = interaction.options.getBoolean('anonymous') || false;

    // Validate that either message or message_id is provided
    if (!message && !messageId) {
      return await interaction.editReply({
        content: '❌ You must provide either a message or a message_id to fetch.',
        ephemeral: true
      });
    }

    // Validate message_id and source_channel options
    if (messageId && !sourceChannel) {
      return await interaction.editReply({
        content: '❌ You must provide a source channel when using message_id.',
        ephemeral: true
      });
    }

    if (sourceChannel && !messageId) {
      return await interaction.editReply({
        content: '❌ You must provide a message_id when specifying a source channel.',
        ephemeral: true
      });
    }

    // Fetch message if message_id is provided
    if (messageId && sourceChannel) {
      try {
        const fetchedMessage = await sourceChannel.messages.fetch(messageId);

        // Use the fetched message content instead of the provided message
        message = fetchedMessage.content || 'No text content in the original message.';

        // If the fetched message has embeds, add their descriptions
        if (fetchedMessage.embeds.length > 0) {
          const embedDescriptions = fetchedMessage.embeds
            .map(embed => embed.description || embed.title || 'Embed content')
            .join('\n\n');
          message += `\n\n${embedDescriptions}`;
        }

        // If the fetched message has attachments, mention them
        if (fetchedMessage.attachments.size > 0) {
          const attachmentUrls = fetchedMessage.attachments.map(att => att.url).join('\n');
          message += `\n\nAttachments:\n${attachmentUrls}`;
        }
      } catch (error) {
        return await interaction.editReply({
          content: '❌ Failed to fetch the message. Make sure the message ID and source channel are correct.',
          ephemeral: true
        });
      }
    }

    // Preview mode
    if (preview) {
      const previewMessage = message.replace('{user}', interaction.user.toString());
      const previewInfo = messageId ? `\n\n*Message fetched from <#${sourceChannel.id}> (ID: ${messageId})*` : '';
      return await interaction.editReply({
        content: `Preview of your message:\n\n${previewMessage}${previewInfo}`,
        ephemeral: true
      });
    }

    const members = role.members;
    let successCount = 0;
    let failCount = 0;
    let successfulMembers = [];
    let failedMembers = [];
    const totalMembers = members.size;

    // Add sender info if not anonymous
    if (!anonymous) {
      message = `Message from ${interaction.user.tag}:\n\n${message}`;
    }

    for (const [, member] of members) {
      try {
        // Replace placeholders
        const personalizedMessage = message.replace('{user}', member.toString());

        await new Promise(resolve => setTimeout(resolve, delay));
        await member.send(personalizedMessage);
        successCount++;
        successfulMembers.push(member.user.tag);
      } catch (error) {
        failCount++;
        failedMembers.push(member.user.tag);
        console.error(`Failed to send DM to ${member.user.tag}: ${error}`);
      }

      // Update progress after each attempt
      const progress = `Progress: ${successCount + failCount}/${totalMembers}`;
      await interaction.editReply({
        content: `Sending messages... ${progress}`,
        ephemeral: true
      });
    }

    const summary = [
      `📊 DM Notification Results`,
      `\n📈 Statistics:`,
      `• Total members: ${totalMembers}`,
      `• ✅ Successfully DMed: ${successCount} members (${Math.round((successCount/totalMembers) * 100)}%)`,
      `• ❌ Failed to DM: ${failCount} members (${Math.round((failCount/totalMembers) * 100)}%)`,
      `\n✅ Successfully DMed members:`,
      successfulMembers.length > 0 ? successfulMembers.slice(0, 10).join('\n') : 'None',
      successfulMembers.length > 10 ? `...and ${successfulMembers.length - 10} more` : '',
      `\n❌ Failed to DM members:`,
      failedMembers.length > 0 ? failedMembers.slice(0, 10).join('\n') : 'None',
      failedMembers.length > 10 ? `...and ${failedMembers.length - 10} more` : '',
      `\n⚙️ Settings:`,
      `• ⏱️ Delay: ${delay/1000}s`,
      `• 🎭 Anonymous: ${anonymous}`,
      messageId ? `• 📨 Source: <#${sourceChannel.id}> (Message ID: ${messageId})` : ''
    ].join('\n');

    await interaction.editReply({
      content: summary,
      ephemeral: true
    });
  },
};
