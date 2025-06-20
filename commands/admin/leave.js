
const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const Leave = require('../../models/Leave');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Configure the leave system')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Enable or disable the leave system')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('setchannel')
        .setDescription('Set the leave channel')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('The channel to send leave messages')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('message')
        .setDescription('Set custom leave message')
        .addStringOption((option) =>
          option
            .setName('text')
            .setDescription('Leave message text (placeholders: {member}, {server}, {duration})')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('embed')
        .setDescription('Configure embed settings')
        .addBooleanOption((option) =>
          option
            .setName('enabled')
            .setDescription('Enable or disable embed')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('color')
            .setDescription('Embed color (hex)')
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName('title')
            .setDescription('Embed title')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('image')
        .setDescription('Configure leave image')
        .addBooleanOption((option) =>
          option
            .setName('enabled')
            .setDescription('Enable or disable image')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('url')
            .setDescription('Image URL')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('test')
        .setDescription('Preview the current leave message')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: 'You need Administrator permission to manage the leave system!',
        ephemeral: true,
      });
    }

    const { options, guild, user } = interaction;
    const serverId = guild.id;
    const subcommand = options.getSubcommand();

    let leave = await Leave.findOne({ serverId });
    if (!leave) {
      leave = new Leave({ serverId });
      await leave.save();
    }

    switch (subcommand) {
      case 'toggle':
        leave.enabled = !leave.enabled;
        await leave.save();
        
        const toggleEmbed = new EmbedBuilder()
          .setColor(leave.enabled ? '#00FF00' : '#FF0000')
          .setTitle('Leave System')
          .setDescription(`Leave system is now ${leave.enabled ? 'enabled' : 'disabled'}`)
          .setTimestamp();
        
        return interaction.reply({ embeds: [toggleEmbed] });

      case 'setchannel':
        if (!leave.enabled) {
          return interaction.reply({
            content: 'Please enable the leave system first!',
            ephemeral: true,
          });
        }
        
        const channel = options.getChannel('channel');
        leave.channelId = channel.id;
        await leave.save();
        
        return interaction.reply({
          content: `✅ Leave channel set to ${channel}`,
          ephemeral: true,
        });

      case 'message':
        const message = options.getString('text');
        leave.message = message;
        await leave.save();
        
        return interaction.reply({
          content: '✅ Leave message updated!',
          ephemeral: true,
        });

      case 'embed':
        const embedEnabled = options.getBoolean('enabled');
        const color = options.getString('color');
        const title = options.getString('title');
        
        leave.embedEnabled = embedEnabled;
        if (color) leave.embedColor = color;
        if (title) leave.embedTitle = title;
        await leave.save();
        
        return interaction.reply({
          content: '✅ Embed settings updated!',
          ephemeral: true,
        });

      case 'image':
        const imageEnabled = options.getBoolean('enabled');
        const imageUrl = options.getString('url');
        
        leave.enableImage = imageEnabled;
        if (imageUrl) leave.imageUrl = imageUrl;
        await leave.save();
        
        return interaction.reply({
          content: '✅ Image settings updated!',
          ephemeral: true,
        });

      case 'test':
        if (!leave.enabled) {
          return interaction.reply({
            content: 'Leave system is not enabled!',
            ephemeral: true,
          });
        }
        
        const joinedAt = interaction.member.joinedAt;
        const duration = Math.floor((Date.now() - joinedAt) / (1000 * 60 * 60 * 24));
        
        let testMessage = leave.message
          .replace(/{member}/g, interaction.user.toString())
          .replace(/{server}/g, guild.name)
          .replace(/{duration}/g, `${duration} days`);

        if (leave.embedEnabled) {
          const testEmbed = new EmbedBuilder()
            .setColor(leave.embedColor)
            .setTitle(leave.embedTitle)
            .setDescription(testMessage)
            .setTimestamp();
          
          if (leave.enableImage && leave.imageUrl) {
            testEmbed.setImage(leave.imageUrl);
          }
          
          if (leave.enableFooter) {
            testEmbed.setFooter({ text: leave.footerText });
          }
          
          return interaction.reply({ embeds: [testEmbed], ephemeral: true });
        } else {
          return interaction.reply({ content: testMessage, ephemeral: true });
        }
    }
  },
};
