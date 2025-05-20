
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
        .setRequired(true)
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
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    let message = interaction.options.getString('message');
    const delay = (interaction.options.getInteger('delay') || 2) * 1000;
    const preview = interaction.options.getBoolean('preview') || false;
    const anonymous = interaction.options.getBoolean('anonymous') || false;
    
    await interaction.deferReply({ ephemeral: true });

    // Preview mode
    if (preview) {
      const previewMessage = message.replace('{user}', interaction.user.toString());
      return await interaction.editReply({
        content: `Preview of your message:\n\n${previewMessage}`,
        ephemeral: true
      });
    }

    const members = role.members;
    let successCount = 0;
    let failCount = 0;

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
      } catch (error) {
        failCount++;
        console.error(`Failed to send DM to ${member.user.tag}: ${error}`);
      }
    }

    const summary = [
      `Message sent!`,
      `✅ Success: ${successCount}`,
      `❌ Failed: ${failCount}`,
      `⏱️ Delay: ${delay/1000}s`,
      `🎭 Anonymous: ${anonymous}`
    ].join('\n');

    await interaction.editReply({
      content: summary,
      ephemeral: true
    });
  },
};
