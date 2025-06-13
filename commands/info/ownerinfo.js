
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ownerinfo')
    .setDescription('Displays information about the bot owner.'),

  async execute(interaction) {
    const { client } = interaction;
    
    // Owner information - you can customize these details
    const ownerUsername = '_do_or_die_1';
    const ownerDisplayName = '! ᴅᴏ ᴏʀ ᴅɪᴇ';
    const ownerDescription = 'The creator and developer of this bot.';
    
    const botCreationDate = client.user.createdAt;
    
    try {
      // Try to fetch the actual owner user from Discord
      const ownerId = '1369150620602204201'; // Your Discord user ID
      const owner = await client.users.fetch(ownerId).catch(() => null);
      
      const ownerInfoEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('👑 Bot Owner Information')
        .setThumbnail(owner?.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: '👤 Username',
            value: `\`\`\`${owner?.username || ownerUsername}\`\`\``,
            inline: true,
          },
          {
            name: '🏷️ Display Name',
            value: `\`\`\`${owner?.globalName || ownerDisplayName}\`\`\``,
            inline: true,
          },
          {
            name: '🆔 User ID',
            value: `\`\`\`${owner?.id || '1369150620602204201'}\`\`\``,
            inline: true,
          },
          {
            name: '📝 Description',
            value: ownerDescription,
            inline: false,
          },
          {
            name: '🤖 Bot Created',
            value: `<t:${Math.floor(botCreationDate.getTime() / 1000)}:F>`,
            inline: true,
          },
          {
            name: '📅 Account Created',
            value: owner ? `<t:${Math.floor(owner.createdTimestamp / 1000)}:F>` : 'Not Available',
            inline: true,
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [ownerInfoEmbed] });
    } catch (error) {
      console.error('Error in ownerinfo command:', error);
      
      // Fallback embed if there's an error fetching owner info
      const fallbackEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('👑 Bot Owner Information')
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: '👤 Username',
            value: `\`\`\`${ownerUsername}\`\`\``,
            inline: true,
          },
          {
            name: '🏷️ Display Name',
            value: `\`\`\`${ownerDisplayName}\`\`\``,
            inline: true,
          },
          {
            name: '📝 Description',
            value: ownerDescription,
            inline: false,
          },
          {
            name: '🤖 Bot Created',
            value: `<t:${Math.floor(botCreationDate.getTime() / 1000)}:F>`,
            inline: true,
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [fallbackEmbed] });
    }
  },
};
