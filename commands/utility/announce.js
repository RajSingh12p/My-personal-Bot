
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Repost a message from one channel to another with optional mentions.')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('The ID of the message to repost')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('source_channel')
        .setDescription('The channel to fetch the message from')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('target_channel')
        .setDescription('The channel to repost the message to')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addUserOption(option =>
      option.setName('mention_user')
        .setDescription('Mention a user in the reposted message')
        .setRequired(false))
    .addRoleOption(option =>
      option.setName('mention_role')
        .setDescription('Mention a role in the reposted message')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    // Check if user has exe.bot role or admin permissions
    const exeBotRole = interaction.guild.roles.cache.find(role => role.name === 'exe.bot');
    const hasExeBotRole = exeBotRole && interaction.member.roles.cache.has(exeBotRole.id);
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    
    if (!hasExeBotRole && !isAdmin) {
      return interaction.editReply({
        content: '❌ You need the `exe.bot` role or Administrator permissions to use this command.',
        ephemeral: true
      });
    }

    const messageId = interaction.options.getString('message_id');
    const sourceChannel = interaction.options.getChannel('source_channel');
    const targetChannel = interaction.options.getChannel('target_channel');
    const mentionUser = interaction.options.getUser('mention_user');
    const mentionRole = interaction.options.getRole('mention_role');

    try {
      const msg = await sourceChannel.messages.fetch(messageId);

      // Rebuild embeds
      const embeds = msg.embeds.map(embed => {
        return {
          title: embed.title ?? null,
          description: embed.description ?? null,
          url: embed.url ?? null,
          color: embed.color ?? 0x2b2d31,
          fields: embed.fields ?? [],
          image: embed.image ? { url: embed.image.url } : null,
          thumbnail: embed.thumbnail ? { url: embed.thumbnail.url } : null,
          footer: embed.footer ? { text: embed.footer.text, icon_url: embed.footer.iconURL } : null,
          author: embed.author ? { name: embed.author.name, icon_url: embed.author.iconURL } : null,
          timestamp: embed.timestamp ?? null
        };
      });

      // Prepare files
      const files = [];
      for (const attachment of msg.attachments.values()) {
        files.push(await attachment.toFile());
      }

      // Build content with mentions and original message content
      const mentions = [];
      if (mentionUser) mentions.push(mentionUser.toString());
      if (mentionRole) mentions.push(mentionRole.toString());
      
      const content = [
        mentions.join(' '),
        msg.content
      ].filter(Boolean).join('\n');

      await targetChannel.send({
        content: content || null,
        embeds,
        files
      });

      await interaction.editReply({ 
        content: `✅ Message reposted successfully from ${sourceChannel} to ${targetChannel}!` 
      });
      
    } catch (err) {
      console.error('Error in announce command:', err);
      await interaction.editReply({ 
        content: '❌ Failed to fetch or resend the message. Make sure the message ID and channels are correct.' 
      });
    }
  }
};
