
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Create and send an announcement embed to a specific channel')
    .addSubcommand(subcommand =>
      subcommand
        .setName('custom')
        .setDescription('Create a custom announcement')
        .addChannelOption(option => 
          option
            .setName('channel')
            .setDescription('The channel to send the announcement to')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
          option
            .setName('title')
            .setDescription('The title of the announcement')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('description')
            .setDescription('The main content of the announcement')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('color')
            .setDescription('The color of the embed (hex code)')
        )
        .addStringOption(option =>
          option
            .setName('thumbnail')
            .setDescription('URL of the thumbnail image')
        )
        .addStringOption(option =>
          option
            .setName('image')
            .setDescription('URL of the main image')
        )
        .addStringOption(option =>
          option
            .setName('footer')
            .setDescription('Footer text for the announcement')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('saved')
        .setDescription('Use a saved embed for announcement')
        .addChannelOption(option => 
          option
            .setName('channel')
            .setDescription('The channel to send the announcement to')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Name of the saved embed')
            .setRequired(true)
        )
    )
    .addChannelOption(option => 
      option
        .setName('channel')
        .setDescription('The channel to send the announcement to')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('The title of the announcement')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('The main content of the announcement')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('color')
        .setDescription('The color of the embed (hex code)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('thumbnail')
        .setDescription('URL of the thumbnail image')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('image')
        .setDescription('URL of the main image')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('footer')
        .setDescription('Footer text for the announcement')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const channel = interaction.options.getChannel('channel');

      if (subcommand === 'saved') {
        const name = interaction.options.getString('name');
        const SavedEmbed = require('../../models/SavedEmbed');
        
        const savedEmbed = await SavedEmbed.findOne({
          guildId: interaction.guildId,
          name: name
        });

        if (!savedEmbed) {
          return interaction.reply({
            content: `No saved embed found with name "${name}"`,
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder(savedEmbed.embed)
          .setTimestamp();

        await channel.send({ embeds: [embed] });
        
        return interaction.reply({
          content: `Announcement successfully sent to ${channel}!`,
          ephemeral: true
        });
      }
      const channel = interaction.options.getChannel('channel');
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color') || '#2F3136';
      const thumbnail = interaction.options.getString('thumbnail');
      const image = interaction.options.getString('image');
      const footer = interaction.options.getString('footer');

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();

      if (thumbnail) embed.setThumbnail(thumbnail);
      if (image) embed.setImage(image);
      if (footer) embed.setFooter({ text: footer });

      await channel.send({ embeds: [embed] });
      
      await interaction.reply({
        content: `Announcement successfully sent to ${channel}!`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error sending announcement:', error);
      await interaction.reply({
        content: 'There was an error sending the announcement. Please check your inputs and try again.',
        ephemeral: true
      });
    }
  },
};
