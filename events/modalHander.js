const { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const SavedEmbed = require('../models/saved-embed');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'embed_builder') return;

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

      if (fieldsInput && fieldsInput.trim()) {
        const fields = fieldsInput.split('\n').map((field) => {
          const [name, value, inline] = field.split('|');
          return {
            name: name || '\u200b',
            value: value || '\u200b',
            inline: inline === 'true',
          };
        });
        embed.addFields(fields);
      }

      const saveModal = new ModalBuilder()
        .setCustomId('embed_save')
        .setTitle('Save Embed');

      const nameInput = new TextInputBuilder()
        .setCustomId('embed_name')
        .setLabel('Name to save the embed as')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter a name for this embed')
        .setRequired(true)
        .setMaxLength(50);

      const row = new ActionRowBuilder().addComponents(nameInput);
      saveModal.addComponents(row);

      await interaction.showModal(saveModal);

      try {
        const saveModalSubmit = await interaction.awaitModalSubmit({
          time: 60000,
          filter: i => i.customId === 'embed_save'
        });

        const name = saveModalSubmit.fields.getTextInputValue('embed_name');

        await SavedEmbed.create({
          guildId: interaction.guildId,
          name: name,
          embed: embed.toJSON()
        });

        await interaction.channel.send({ embeds: [embed] });
        await saveModalSubmit.reply({
          content: `Embed created and saved as "${name}"!`,
          ephemeral: true
        });
      } catch (error) {
        if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
          await interaction.channel.send({ embeds: [embed] });
          await interaction.followUp({
            content: 'Embed created but not saved (save dialog timed out)',
            ephemeral: true
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error creating embed:', error);
      await interaction.reply({
        content: 'Error creating embed. Check your inputs and try again.',
        ephemeral: true,
      });
    }
  },
};
