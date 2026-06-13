const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("teststreamtwitch")
        .setDescription("Affiche un test de la nouvelle alerte Twitch Veyz3 (Visuel uniquement)"),

    async execute(interaction) {
        // Embed identique au notifier avec des données fictives pour le test
        const embed = new EmbedBuilder()
            .setColor('#9146FF')
            .setAuthor({ 
                name: 'Veyz est en direct sur Twitch', 
                iconURL: 'https://cdn-icons-png.flaticon.com/512/5968/5968819.png', 
                url: "https://www.twitch.tv/veyz3" 
            })
            .setTitle("🔴 TEST - Titre de ton live ici !")
            .setURL("https://www.twitch.tv/veyz3")
            .setDescription(
                "**Bande de monocouilles !**\n\n" +
                "Le live vient d'être lancé. Rejoignez le stream via le bouton ci-dessous."
            )
            .addFields(
                { name: "Catégorie", value: "VALORANT", inline: true }
            )
            // L'image tentera de charger la miniature actuelle de veyz3
            .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_veyz3-1280x720.jpg?t=${Date.now()}`)
            .setFooter({ 
                text: "Twitch System • Riley Bot", 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Regarder le Stream")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://www.twitch.tv/veyz3")
            );

        // Envoi public du test
        await interaction.reply({
            content: "🛠️ **Test d'affichage Twitch :** (Le rôle mentionné apparaîtra au-dessus en situation réelle)",
            embeds: [embed],
            components: [row]
        });
    }
};