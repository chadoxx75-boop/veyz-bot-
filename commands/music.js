const { SlashCommandBuilder } = require('discord.js');
const { playMusic } = require('../services/musicService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Joue une musique (Lien YT/SC ou Recherche par nom)')
        .addStringOption(option =>
            option.setName('recherche') // On change le nom ici !
                .setDescription('Le nom de la musique ou le lien')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const query = interaction.options.getString('recherche');
            
            if (!query) {
                return interaction.editReply({ 
                    content: "⚠️ Bande de monocouilles, tu as oublié de me dire quoi chercher !" 
                });
            }
            
            await playMusic(interaction, query);

        } catch (err) {
            console.error("❌ [Commande music] Erreur :", err);
            await interaction.editReply({ 
                content: "⚠️ Eh bande de monocouilles, la commande musique a foiré ! Regardez la console." 
            });
        }
    }
};