const { SlashCommandBuilder } = require('discord.js');
const { resumeMusic } = require('../services/musicService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Reprend la lecture de la musique en pause'),

    async execute(interaction) {
        resumeMusic(interaction);
    }
};