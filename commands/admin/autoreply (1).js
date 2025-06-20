
const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const AutoReply = require('../../models/AutoReply');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoreply')
    .setDescription('Manage auto reply system')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a new auto reply')
        .addStringOption((option) =>
          option
            .setName('trigger')
            .setDescription('The trigger word/phrase')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('response')
            .setDescription('The response message')
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName('exact')
            .setDescription('Require exact match (default: false)')
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName('embed')
            .setDescription('Send response as embed (default: false)')
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName('cooldown')
            .setDescription('Cooldown in seconds (default: 0)')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(3600)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove an auto reply')
        .addStringOption((option) =>
          option
            .setName('trigger')
            .setDescription('The trigger to remove')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('List all auto replies')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Enable/disable an auto reply')
        .addStringOption((option) =>
          option
            .setName('trigger')
            .setDescription('The trigger to toggle')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('edit')
        .setDescription('Edit an existing auto reply')
        .addStringOption((option) =>
          option
            .setName('trigger')
            .setDescription('The trigger to edit')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((option) =>
          option
            .setName('response')
            .setDescription('New response message')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    switch (subcommand) {
      case 'add': {
        const trigger = interaction.options.getString('trigger').toLowerCase();
        const response = interaction.options.getString('response');
        const isExact = interaction.options.getBoolean('exact') || false;
        const embedResponse = interaction.options.getBoolean('embed') || false;
        const cooldown = interaction.options.getInteger('cooldown') || 0;

        const existing = await AutoReply.findOne({ guildId, trigger });
        if (existing) {
          return interaction.reply({
            content: '❌ An auto reply with that trigger already exists!',
            ephemeral: true,
          });
        }

        await AutoReply.create({
          guildId,
          trigger,
          response,
          isExact,
          embedResponse,
          cooldown,
          createdBy: interaction.user.id,
        });

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Auto Reply Added')
          .addFields(
            { name: 'Trigger', value: trigger, inline: true },
            { name: 'Response', value: response, inline: true },
            { name: 'Exact Match', value: isExact ? 'Yes' : 'No', inline: true },
            { name: 'Embed Response', value: embedResponse ? 'Yes' : 'No', inline: true },
            { name: 'Cooldown', value: `${cooldown} seconds`, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        break;
      }

      case 'remove': {
        const trigger = interaction.options.getString('trigger').toLowerCase();

        const deleted = await AutoReply.findOneAndDelete({ guildId, trigger });
        if (!deleted) {
          return interaction.reply({
            content: '❌ Auto reply not found!',
            ephemeral: true,
          });
        }

        await interaction.reply({
          content: `✅ Auto reply for "${trigger}" has been removed!`,
          ephemeral: true,
        });
        break;
      }

      case 'list': {
        const autoReplies = await AutoReply.find({ guildId }).sort({ trigger: 1 });

        if (autoReplies.length === 0) {
          return interaction.reply({
            content: '❌ No auto replies configured!',
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('Auto Replies')
          .setDescription(
            autoReplies
              .map((ar, index) => 
                `**${index + 1}.** \`${ar.trigger}\` → ${ar.response.substring(0, 50)}${ar.response.length > 50 ? '...' : ''} ${ar.enabled ? '✅' : '❌'}`
              )
              .join('\n')
          )
          .setFooter({ text: `Total: ${autoReplies.length}` })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        break;
      }

      case 'toggle': {
        const trigger = interaction.options.getString('trigger').toLowerCase();

        const autoReply = await AutoReply.findOne({ guildId, trigger });
        if (!autoReply) {
          return interaction.reply({
            content: '❌ Auto reply not found!',
            ephemeral: true,
          });
        }

        autoReply.enabled = !autoReply.enabled;
        await autoReply.save();

        await interaction.reply({
          content: `✅ Auto reply for "${trigger}" is now ${autoReply.enabled ? 'enabled' : 'disabled'}!`,
          ephemeral: true,
        });
        break;
      }

      case 'edit': {
        const trigger = interaction.options.getString('trigger').toLowerCase();
        const newResponse = interaction.options.getString('response');

        const autoReply = await AutoReply.findOne({ guildId, trigger });
        if (!autoReply) {
          return interaction.reply({
            content: '❌ Auto reply not found!',
            ephemeral: true,
          });
        }

        const oldResponse = autoReply.response;
        autoReply.response = newResponse;
        await autoReply.save();

        const embed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('✅ Auto Reply Updated')
          .addFields(
            { name: 'Trigger', value: trigger, inline: false },
            { name: 'Old Response', value: oldResponse, inline: false },
            { name: 'New Response', value: newResponse, inline: false }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        break;
      }
    }
  },

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const autoReplies = await AutoReply.find({ 
      guildId: interaction.guildId,
      trigger: { $regex: focusedValue, $options: 'i' }
    }).limit(25);

    const choices = autoReplies.map(ar => ({
      name: ar.trigger,
      value: ar.trigger
    }));

    await interaction.respond(choices);
  },
};
