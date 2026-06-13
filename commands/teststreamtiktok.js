const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("teststreamtiktok")
        .setDescription("Affiche un test de la nouvelle alerte TikTok Veyz (Visuel uniquement)"),

    async execute(interaction) {
        // Embed identique au notifier TikTok avec des données fictives pour le test
        const embed = new EmbedBuilder()
            .setColor('#000000') // Le noir caractéristique de TikTok
            .setAuthor({ 
                name: 'Veyz est en direct sur TikTok', 
                iconURL: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', 
                url: "https://www.tiktok.com/@3n20zhl/live" 
            })
            .setTitle("🔴 TEST - Titre de ton live TikTok ici !")
            .setURL("https://www.tiktok.com/@3n20zhl/live")
            .setDescription(
                "**Bande de monocouilles !**\n\n" +
                "Le live vient d'être lancé. Rejoignez le stream via le bouton ci-dessous."
            )
            .setFooter({ 
                text: "TikTok System • Riley Bot", 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Regarder le Stream")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://www.tiktok.com/@3n20zhl/live")
            );

        // Envoi public du test
        await interaction.reply({
            content: "🛠️ **Test d'affichage TikTok :** (Le rôle mentionné apparaîtra au-dessus en situation réelle)",
            embeds: [embed],
            components: [row]
        });
    }
};