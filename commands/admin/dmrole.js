
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
        .setDescription('The message to send')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const message = interaction.options.getString('message');
    
    await interaction.deferReply({ ephemeral: true });

    const members = role.members;
    let successCount = 0;
    let failCount = 0;

    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('Anonymous Message')
      .setDescription(message)
      .setTimestamp();

    for (const [, member] of members) {
      try {
        // Add random delay between messages (1-3 seconds)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
        
        await member.send({ embeds: [embed] });
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to send DM to ${member.user.tag}: ${error}`);
      }
    }

    await interaction.editReply({
      content: `Message sent!\nSuccess: ${successCount}\nFailed: ${failCount}`,
      ephemeral: true
    });
  },
};
