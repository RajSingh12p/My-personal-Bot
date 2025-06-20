
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Advanced message deletion with multiple options')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('amount')
        .setDescription('Delete a specific amount of messages')
        .addIntegerOption((option) =>
          option
            .setName('count')
            .setDescription('Number of messages to delete (1-100)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('user')
        .setDescription('Delete messages from a specific user')
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('User whose messages to delete')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('count')
            .setDescription('Number of messages to check (1-100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('keyword')
        .setDescription('Delete messages containing specific keywords')
        .addStringOption((option) =>
          option
            .setName('word')
            .setDescription('Keyword to search for')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('count')
            .setDescription('Number of messages to check (1-100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('bots')
        .setDescription('Delete messages from bots only')
        .addIntegerOption((option) =>
          option
            .setName('count')
            .setDescription('Number of messages to check (1-100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('embeds')
        .setDescription('Delete messages with embeds only')
        .addIntegerOption((option) =>
          option
            .setName('count')
            .setDescription('Number of messages to check (1-100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('attachments')
        .setDescription('Delete messages with attachments only')
        .addIntegerOption((option) =>
          option
            .setName('count')
            .setDescription('Number of messages to check (1-100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('all')
        .setDescription('Delete all messages in channel (DANGEROUS)')
        .addBooleanOption((option) =>
          option
            .setName('confirm')
            .setDescription('Type true to confirm deletion of ALL messages')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ You need the `Manage Messages` permission to use this command!',
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: true });

    let deletedCount = 0;

    try {
      switch (subcommand) {
        case 'amount': {
          const amount = interaction.options.getInteger('count');
          const deleted = await interaction.channel.bulkDelete(amount, true);
          deletedCount = deleted.size;
          break;
        }

        case 'user': {
          const targetUser = interaction.options.getUser('target');
          const count = interaction.options.getInteger('count') || 50;
          
          const messages = await interaction.channel.messages.fetch({ limit: count });
          const userMessages = messages.filter(msg => msg.author.id === targetUser.id);
          
          if (userMessages.size === 0) {
            return interaction.editReply('❌ No messages found from that user!');
          }
          
          const deleted = await interaction.channel.bulkDelete(userMessages, true);
          deletedCount = deleted.size;
          break;
        }

        case 'keyword': {
          const keyword = interaction.options.getString('word').toLowerCase();
          const count = interaction.options.getInteger('count') || 50;
          
          const messages = await interaction.channel.messages.fetch({ limit: count });
          const keywordMessages = messages.filter(msg => 
            msg.content.toLowerCase().includes(keyword)
          );
          
          if (keywordMessages.size === 0) {
            return interaction.editReply('❌ No messages found containing that keyword!');
          }
          
          const deleted = await interaction.channel.bulkDelete(keywordMessages, true);
          deletedCount = deleted.size;
          break;
        }

        case 'bots': {
          const count = interaction.options.getInteger('count') || 50;
          
          const messages = await interaction.channel.messages.fetch({ limit: count });
          const botMessages = messages.filter(msg => msg.author.bot);
          
          if (botMessages.size === 0) {
            return interaction.editReply('❌ No bot messages found!');
          }
          
          const deleted = await interaction.channel.bulkDelete(botMessages, true);
          deletedCount = deleted.size;
          break;
        }

        case 'embeds': {
          const count = interaction.options.getInteger('count') || 50;
          
          const messages = await interaction.channel.messages.fetch({ limit: count });
          const embedMessages = messages.filter(msg => msg.embeds.length > 0);
          
          if (embedMessages.size === 0) {
            return interaction.editReply('❌ No messages with embeds found!');
          }
          
          const deleted = await interaction.channel.bulkDelete(embedMessages, true);
          deletedCount = deleted.size;
          break;
        }

        case 'attachments': {
          const count = interaction.options.getInteger('count') || 50;
          
          const messages = await interaction.channel.messages.fetch({ limit: count });
          const attachmentMessages = messages.filter(msg => msg.attachments.size > 0);
          
          if (attachmentMessages.size === 0) {
            return interaction.editReply('❌ No messages with attachments found!');
          }
          
          const deleted = await interaction.channel.bulkDelete(attachmentMessages, true);
          deletedCount = deleted.size;
          break;
        }

        case 'all': {
          const confirm = interaction.options.getBoolean('confirm');
          if (!confirm) {
            return interaction.editReply('❌ You must confirm to delete all messages!');
          }
          
          if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.editReply('❌ You need Administrator permission to delete all messages!');
          }
          
          // Delete in batches of 100
          let totalDeleted = 0;
          let lastSize = 0;
          
          do {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            lastSize = messages.size;
            if (lastSize > 0) {
              const deleted = await interaction.channel.bulkDelete(messages, true);
              totalDeleted += deleted.size;
            }
          } while (lastSize === 100);
          
          deletedCount = totalDeleted;
          break;
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Messages Cleared')
        .setDescription(`Successfully deleted **${deletedCount}** messages`)
        .addFields({
          name: 'Action',
          value: subcommand,
          inline: true
        })
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Clear command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while deleting messages!',
      });
    }
  },
};
