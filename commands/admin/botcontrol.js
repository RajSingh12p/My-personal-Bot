
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botcontrol')
    .setDescription('Control the bot remotely (Owner only)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('Get bot statistics')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('servers')
        .setDescription('List all servers the bot is in')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('leave')
        .setDescription('Leave a specific server')
        .addStringOption(option =>
          option
            .setName('server_id')
            .setDescription('Server ID to leave')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('serverinfo')
        .setDescription('Get information about a specific server')
        .addStringOption(option =>
          option
            .setName('server_id')
            .setDescription('Server ID to get info about')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('broadcast')
        .setDescription('Send a message to all servers (use carefully)')
        .addStringOption(option =>
          option
            .setName('message')
            .setDescription('Message to broadcast')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('shutdown')
        .setDescription('Shutdown the bot (emergency only)')
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Reason for shutdown')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('blacklist')
        .setDescription('Blacklist a server from using the bot')
        .addStringOption(option =>
          option
            .setName('server_id')
            .setDescription('Server ID to blacklist')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Reason for blacklist')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    // Check if user is the authorized bot owner
    const authorizedUsername = '_do_or_die_1';
    
    if (interaction.user.username !== authorizedUsername) {
      return interaction.reply({
        content: '❌ You are not authorized to use this command. Only the bot owner can control the bot remotely.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();
    
    await interaction.deferReply({ ephemeral: true });

    try {
      switch (subcommand) {
        case 'stats':
          await handleStats(interaction);
          break;
        case 'servers':
          await handleServers(interaction);
          break;
        case 'leave':
          await handleLeave(interaction);
          break;
        case 'serverinfo':
          await handleServerInfo(interaction);
          break;
        case 'broadcast':
          await handleBroadcast(interaction);
          break;
        case 'shutdown':
          await handleShutdown(interaction);
          break;
        case 'blacklist':
          await handleBlacklist(interaction);
          break;
      }
    } catch (error) {
      console.error('Bot control error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while executing the command.',
        ephemeral: true
      });
    }
  },
};

async function handleStats(interaction) {
  const client = interaction.client;
  const guilds = client.guilds.cache;
  const totalUsers = guilds.reduce((acc, guild) => acc + guild.memberCount, 0);
  const uptime = process.uptime();
  const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);
  const uptimeSeconds = Math.floor(uptime % 60);

  const statsEmbed = new EmbedBuilder()
    .setTitle('🤖 Bot Statistics')
    .setColor(0x5865f2)
    .addFields(
      { name: '🌍 Servers', value: guilds.size.toString(), inline: true },
      { name: '👥 Total Users', value: totalUsers.toString(), inline: true },
      { name: '💾 Memory Usage', value: `${memoryUsage} MB`, inline: true },
      { name: '⏱️ Uptime', value: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`, inline: true },
      { name: '🔧 Node.js Version', value: process.version, inline: true },
      { name: '📦 Discord.js Version', value: require('discord.js').version, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [statsEmbed] });
}

async function handleServers(interaction) {
  const client = interaction.client;
  const guilds = client.guilds.cache;
  
  const serverList = guilds.map(guild => 
    `**${guild.name}** (${guild.id})\n👥 ${guild.memberCount} members\n🏠 Owner: ${guild.ownerId}`
  ).slice(0, 10);

  const embed = new EmbedBuilder()
    .setTitle(`🌍 Server List (${guilds.size} total)`)
    .setDescription(serverList.join('\n\n') + (guilds.size > 10 ? `\n\n...and ${guilds.size - 10} more servers` : ''))
    .setColor(0x5865f2)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleLeave(interaction) {
  const serverId = interaction.options.getString('server_id');
  const guild = interaction.client.guilds.cache.get(serverId);

  if (!guild) {
    return await interaction.editReply({
      content: '❌ Bot is not in a server with that ID.',
    });
  }

  const guildName = guild.name;
  
  try {
    await guild.leave();
    await interaction.editReply({
      content: `✅ Successfully left server: **${guildName}** (${serverId})`,
    });
  } catch (error) {
    console.error('Error leaving guild:', error);
    await interaction.editReply({
      content: `❌ Failed to leave server: **${guildName}** (${serverId})`,
    });
  }
}

async function handleServerInfo(interaction) {
  const serverId = interaction.options.getString('server_id');
  const guild = interaction.client.guilds.cache.get(serverId);

  if (!guild) {
    return await interaction.editReply({
      content: '❌ Bot is not in a server with that ID.',
    });
  }

  const owner = await guild.fetchOwner().catch(() => null);
  
  const embed = new EmbedBuilder()
    .setTitle(`📊 Server Information: ${guild.name}`)
    .setThumbnail(guild.iconURL())
    .setColor(0x5865f2)
    .addFields(
      { name: '🆔 Server ID', value: guild.id, inline: true },
      { name: '👑 Owner', value: owner ? `${owner.user.tag} (${owner.id})` : 'Unknown', inline: true },
      { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
      { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
      { name: '🤖 Joined', value: `<t:${Math.floor(guild.joinedTimestamp / 1000)}:F>`, inline: true },
      { name: '📊 Channels', value: guild.channels.cache.size.toString(), inline: true },
      { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
      { name: '😀 Emojis', value: guild.emojis.cache.size.toString(), inline: true },
      { name: '🚀 Boost Level', value: guild.premiumTier.toString(), inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleBroadcast(interaction) {
  const message = interaction.options.getString('message');
  const client = interaction.client;
  
  await interaction.editReply({
    content: '⚠️ **WARNING**: You are about to broadcast a message to all servers. This action cannot be undone. React with ✅ to confirm or ❌ to cancel.',
  });

  const confirmMsg = await interaction.followUp({
    content: `**Preview of broadcast message:**\n\n${message}`,
    ephemeral: true
  });

  await confirmMsg.react('✅');
  await confirmMsg.react('❌');

  const filter = (reaction, user) => {
    return ['✅', '❌'].includes(reaction.emoji.name) && user.username === '_do_or_die_1';
  };

  try {
    const collected = await confirmMsg.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] });
    const reaction = collected.first();

    if (reaction.emoji.name === '✅') {
      let successCount = 0;
      let failCount = 0;

      for (const [, guild] of client.guilds.cache) {
        try {
          const systemChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'));
          if (systemChannel) {
            await systemChannel.send(`📢 **Bot Owner Announcement:**\n\n${message}`);
            successCount++;
          } else {
            failCount++;
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        } catch (error) {
          failCount++;
        }
      }

      await interaction.followUp({
        content: `✅ Broadcast completed!\n📤 Sent to: ${successCount} servers\n❌ Failed: ${failCount} servers`,
        ephemeral: true
      });
    } else {
      await interaction.followUp({
        content: '❌ Broadcast cancelled.',
        ephemeral: true
      });
    }
  } catch (error) {
    await interaction.followUp({
      content: '❌ Broadcast timed out or failed.',
      ephemeral: true
    });
  }
}

async function handleShutdown(interaction) {
  const reason = interaction.options.getString('reason') || 'No reason provided';
  
  await interaction.editReply({
    content: `⚠️ **EMERGENCY SHUTDOWN INITIATED**\nReason: ${reason}\n\nShutting down in 10 seconds...`,
  });

  setTimeout(() => {
    console.log(`Bot shutdown initiated by ${interaction.user.tag}. Reason: ${reason}`);
    process.exit(0);
  }, 10000);
}

async function handleBlacklist(interaction) {
  const serverId = interaction.options.getString('server_id');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const guild = interaction.client.guilds.cache.get(serverId);

  if (!guild) {
    return await interaction.editReply({
      content: '❌ Bot is not in a server with that ID.',
    });
  }

  const guildName = guild.name;
  
  try {
    // Send warning message to the server before leaving
    const systemChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'));
    if (systemChannel) {
      await systemChannel.send(`⚠️ **This server has been blacklisted by the bot owner.**\nReason: ${reason}\n\nThe bot will now leave this server.`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
    await guild.leave();
    
    await interaction.editReply({
      content: `✅ Successfully blacklisted and left server: **${guildName}** (${serverId})\nReason: ${reason}`,
    });
  } catch (error) {
    console.error('Error blacklisting guild:', error);
    await interaction.editReply({
      content: `❌ Failed to blacklist server: **${guildName}** (${serverId})`,
    });
  }
}
