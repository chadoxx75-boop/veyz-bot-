const { SlashCommandBuilder } = require('discord.js');
const { stopMusic } = require('../services/musicService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Arrête la musique et déconnecte le bot'),

    async execute(interaction) {
        stopMusic(interaction);
    }
};