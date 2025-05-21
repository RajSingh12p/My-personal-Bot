
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const messageId = interaction.options.getString('message_id');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const role = interaction.options.getRole('role');

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

      if (!content && files.length === 0) {
        return interaction.followUp({
          content: '⚠️ The message is empty or contains unsupported content.',
          ephemeral: true
        });
      }

      const mention = role ? `${role.toString()}\n` : '';
      await targetChannel.send({
        content: `${mention}${content}`,
        files: files
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
