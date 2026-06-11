const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

const ALLOWED_ROLE_ID = "1494338640841543783";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("movevc")
        .setDescription("Déplace le bot dans un salon vocal")
        .addStringOption(option =>
            option
                .setName("channelid")
                .setDescription("ID du salon vocal")
                .setRequired(true)
        ),

    async execute(interaction) {

        // 🔒 CHECK RÔLE
        const hasRole = interaction.member.roles.cache.has(ALLOWED_ROLE_ID);

        if (!hasRole) {
            return interaction.reply({
                content: "❌ Tu n’as pas la permission d’utiliser cette commande.",
                ephemeral: true
            });
        }

        const channelId = interaction.options.getString("channelid");
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel || channel.type !== 2) {
            return interaction.reply({
                content: "❌ Salon vocal invalide.",
                ephemeral: true
            });
        }

        const connection = getVoiceConnection(interaction.guild.id);

        if (connection) {
            connection.destroy();
        }

        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true
        });

        return interaction.reply({
            content: `✔ Déplacé dans <#${channel.id}>`
        });
    }
};