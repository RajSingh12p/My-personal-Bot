
const mongoose = require('mongoose');

const savedEmbedSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  embed: {
    title: String,
    description: String,
    color: String,
    author: {
      name: String,
      url: String,
      iconURL: String
    },
    fields: [{
      name: String,
      value: String,
      inline: Boolean
    }]
  }
});

module.exports = mongoose.model('SavedEmbed', savedEmbedSchema);
