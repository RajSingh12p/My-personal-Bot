
const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const AutoMod = require('../../models/AutoMod');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure the auto moderation system')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Enable or disable auto moderation')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('antispam')
        .setDescription('Configure anti-spam settings')
        .addBooleanOption((option) =>
          option
            .setName('enabled')
            .setDescription('Enable anti-spam')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('messages')
            .setDescription('Max messages in time window')
            .setRequired(false)
            .setMinValue(2)
            .setMaxValue(20)
        )
        .addIntegerOption((option) =>
          option
            .setName('time')
            .setDescription('Time window in seconds')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(60)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('badwords')
        .setDescription('Configure bad words filter')
        .addBooleanOption((option) =>
          option
            .setName('enabled')
            .setDescription('Enable bad words filter')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('words')
            .setDescription('Comma-separated list of bad words')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('antiinvite')
        .setDescription('Configure anti-invite settings')
        .addBooleanOption((option) =>
          option
            .setName('enabled')
            .setDescription('Enable anti-invite')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('anticaps')
        .setDescription('Configure anti-caps settings')
        .addBooleanOption((option) =>
          option
            .setName('enabled')
            .setDescription('Enable anti-caps')
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('percentage')
            .setDescription('Max caps percentage (default: 70)')
            .setRequired(false)
            .setMinValue(10)
            .setMaxValue(100)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('status')
        .setDescription('View current automod configuration')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    let autoMod = await AutoMod.findOne({ guildId });
    if (!autoMod) {
      autoMod = new AutoMod({ guildId });
      await autoMod.save();
    }

    switch (subcommand) {
      case 'toggle':
        autoMod.enabled = !autoMod.enabled;
        await autoMod.save();
        
        const embed = new EmbedBuilder()
          .setColor(autoMod.enabled ? '#00FF00' : '#FF0000')
          .setTitle('Auto Moderation')
          .setDescription(`Auto moderation is now ${autoMod.enabled ? 'enabled' : 'disabled'}`)
          .setTimestamp();
        
        return interaction.reply({ embeds: [embed] });

      case 'antispam':
        const spamEnabled = interaction.options.getBoolean('enabled');
        const maxMessages = interaction.options.getInteger('messages');
        const timeWindow = interaction.options.getInteger('time');
        
        autoMod.antiSpam.enabled = spamEnabled;
        if (maxMessages) autoMod.antiSpam.maxMessages = maxMessages;
        if (timeWindow) autoMod.antiSpam.timeWindow = timeWindow;
        await autoMod.save();
        
        return interaction.reply({
          content: `✅ Anti-spam ${spamEnabled ? 'enabled' : 'disabled'}!`,
          ephemeral: true,
        });

      case 'badwords':
        const wordsEnabled = interaction.options.getBoolean('enabled');
        const words = interaction.options.getString('words');
        
        autoMod.badWords.enabled = wordsEnabled;
        if (words) {
          autoMod.badWords.words = words.split(',').map(w => w.trim().toLowerCase());
        }
        await autoMod.save();
        
        return interaction.reply({
          content: `✅ Bad words filter ${wordsEnabled ? 'enabled' : 'disabled'}!`,
          ephemeral: true,
        });

      case 'antiinvite':
        const inviteEnabled = interaction.options.getBoolean('enabled');
        
        autoMod.antiInvite.enabled = inviteEnabled;
        await autoMod.save();
        
        return interaction.reply({
          content: `✅ Anti-invite ${inviteEnabled ? 'enabled' : 'disabled'}!`,
          ephemeral: true,
        });

      case 'anticaps':
        const capsEnabled = interaction.options.getBoolean('enabled');
        const percentage = interaction.options.getInteger('percentage');
        
        autoMod.antiCaps.enabled = capsEnabled;
        if (percentage) autoMod.antiCaps.percentage = percentage;
        await autoMod.save();
        
        return interaction.reply({
          content: `✅ Anti-caps ${capsEnabled ? 'enabled' : 'disabled'}!`,
          ephemeral: true,
        });

      case 'status':
        const statusEmbed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('AutoMod Configuration')
          .addFields(
            { name: 'Status', value: autoMod.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Anti-Spam', value: autoMod.antiSpam.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Bad Words', value: autoMod.badWords.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Anti-Invite', value: autoMod.antiInvite.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Anti-Caps', value: autoMod.antiCaps.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: 'Spam Settings', value: `${autoMod.antiSpam.maxMessages} msgs/${autoMod.antiSpam.timeWindow}s`, inline: true }
          )
          .setTimestamp();
        
        return interaction.reply({ embeds: [statusEmbed] });
    }
  },
};
