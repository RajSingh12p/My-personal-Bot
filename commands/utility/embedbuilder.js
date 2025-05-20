const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('Create a custom embed using an interactive modal')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new embed')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('save')
        .setDescription('Save the last created embed')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Name to save the embed as')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'save') {
      const name = interaction.options.getString('name');
      const SavedEmbed = require('../../models/SavedEmbed');
      
      // Get the last embed from cache or temporary storage
      const lastEmbed = interaction.client.lastCreatedEmbed?.get(interaction.guildId);
      
      if (!lastEmbed) {
        return interaction.reply({
          content: 'No recent embed found to save. Please create an embed first.',
          ephemeral: true
        });
      }

      await SavedEmbed.create({
        guildId: interaction.guildId,
        name: name,
        embed: lastEmbed
      });

      return interaction.reply({
        content: `Embed saved as "${name}"`,
        ephemeral: true
      });
    }
    const modal = new ModalBuilder()
      .setCustomId('embed_builder')
      .setTitle('Embed Builder');

    const titleInput = new TextInputBuilder()
      .setCustomId('embed_title')
      .setLabel('Title (optional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter the embed title')
      .setRequired(false)
      .setMaxLength(256);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('embed_description')
      .setLabel('Description (required)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter the embed description')
      .setRequired(true)
      .setMaxLength(4000);

    const colorInput = new TextInputBuilder()
      .setCustomId('embed_color')
      .setLabel('Color (optional, hex value)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('#FF0000 for red')
      .setRequired(false)
      .setMaxLength(7);

    const authorInput = new TextInputBuilder()
      .setCustomId('embed_author')
      .setLabel('Author (optional, format: name|url|icon_url)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(
        'John Doe|https://example.com|https://example.com/icon.png'
      )
      .setRequired(false)
      .setMaxLength(300);

    const fieldsInput = new TextInputBuilder()
      .setCustomId('embed_fields')
      .setLabel('Fields (optional, format: name|value|inline)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Field1|Value1|true\nField2|Value2|false')
      .setRequired(false)
      .setMaxLength(1000);

    const rows = [
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descriptionInput),
      new ActionRowBuilder().addComponents(colorInput),
      new ActionRowBuilder().addComponents(authorInput),
      new ActionRowBuilder().addComponents(fieldsInput),
    ];

    modal.addComponents(...rows);
    await interaction.showModal(modal);
  },

  async interactionCreate(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'embed_builder') return;
    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({
        content:
          'You do not have `ManageMessages` permission to use Embed Builder!',
        ephemeral: true,
      });
    }

    try {
      const title = interaction.fields.getTextInputValue('embed_title');
      const description =
        interaction.fields.getTextInputValue('embed_description');
      const color = interaction.fields.getTextInputValue('embed_color');
      const authorInput = interaction.fields.getTextInputValue('embed_author');
      const fieldsInput = interaction.fields.getTextInputValue('embed_fields');

      const embed = new EmbedBuilder()
        .setDescription(description)
        .setTimestamp();

      if (title) embed.setTitle(title);
      if (color) embed.setColor(color);

      if (authorInput) {
        const [authorName, authorUrl, authorIconUrl] = authorInput.split('|');
        embed.setAuthor({
          name: authorName,
          url: authorUrl || null,
          iconURL: authorIconUrl || null,
        });
      }

      if (fieldsInput) {
        const fields = fieldsInput.split('\n').map((field) => {
          const [name, value, inline] = field.split('|');
          return {
            name: name || '\u200b',
            value: value || '\u200b',
            inline: inline || true,
          };
        });
        embed.addFields(fields);
      }

      // Store the embed in client cache before sending
      if (!interaction.client.lastCreatedEmbed) {
        interaction.client.lastCreatedEmbed = new Map();
      }
      interaction.client.lastCreatedEmbed.set(interaction.guildId, embed.toJSON());

      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({
        content: 'Embed created successfully! Use `/embedbuilder save` to save it.',
        ephemeral: true
      });
    } catch (error) {
      console.error('Error creating embed:', error);
      await interaction.reply({
        content: 'Error creating embed. Check your inputs and try again.',
        ephemeral: true,
      });
    }
  },
};
