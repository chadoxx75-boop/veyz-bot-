const { SlashCommandBuilder } = require('discord.js');
const { pauseMusic } = require('../services/musicService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Met la musique actuelle en pause'),

    async execute(interaction) {
        pauseMusic(interaction);
    }
};