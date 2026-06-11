const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Supprime un nombre de messages")
        .addIntegerOption(option =>
            option
                .setName("nombre")
                .setDescription("Nombre de messages à supprimer")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {

        const amount = interaction.options.getInteger("nombre");

        if (!interaction.guild) {
            return interaction.reply({
                content: "❌ Commande utilisable uniquement sur un serveur.",
                ephemeral: true
            });
        }

        if (!interaction.channel.permissionsFor(interaction.member).has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: "❌ Tu n’as pas la permission de gérer les messages.",
                ephemeral: true
            });
        }

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);

            return interaction.reply({
                content: `✔ ${deleted.size} messages supprimés.`,
                ephemeral: true
            });

        } catch (err) {
            console.error(err);

            return interaction.reply({
                content: "❌ Impossible de supprimer les messages (trop anciens ou erreur).",
                ephemeral: true
            });
        }
    }
};