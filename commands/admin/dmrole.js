
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
    // Remove default permission restriction to make it visible to all
    ,

  async execute(interaction) {
    // Check if user has exe.bot role or admin permissions
    const exeBotRole = interaction.guild.roles.cache.find(role => role.name === 'exe.bot');
    const hasExeBotRole = exeBotRole && interaction.member.roles.cache.has(exeBotRole.id);
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    
    if (!hasExeBotRole && !isAdmin) {
      return interaction.reply({
        content: '❌ You need the `exe.bot` role or Administrator permissions to use this command.',
        ephemeral: true
      });
    }

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
      `• 🎭 Anonymous: ${anonymous}`
    ].join('\n');

    await interaction.editReply({
      content: summary,
      ephemeral: true
    });
  },
};
