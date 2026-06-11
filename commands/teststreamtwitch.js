const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("teststreamtwitch")
        .setDescription("Teste l'affichage de l'alerte Twitch premium de Veyz"),
        
    async execute(interaction, client) {
        try {
            // Création de l'embed identique à celui de twitchNotifier.js
            const embed = new EmbedBuilder()
                .setColor('#9146FF')
                .setAuthor({ 
                    name: 'Veyz est en direct sur Twitch !', 
                    iconURL: 'https://cdn-icons-png.flaticon.com/512/5968/5968819.png', 
                    url: "https://www.twitch.tv/veyz3" 
                })
                .setTitle("🔴 [TEST] Le meilleur stream de la galaxie !")
                .setURL("https://www.twitch.tv/veyz3")
                .setDescription(
                    "💜 **Bande de monocouilles !**\n\n" +
                    "Le GOAT Veyz est en live 🔥\n" +
                    "Venez donner de la force et rejoindre le stream 💪"
                )
                .addFields(
                    { name: "🎮 Jeu", value: "`Just Chatting (Test)`", inline: true },
                    { name: "📡 Statut", value: "`🟣 EN LIGNE`", inline: true }
                )
                .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_veyz3-1280x720.jpg?t=${Date.now()}`)
                .setFooter({ 
                    text: "Veyz Live System • Riley Bot (Mode Test)", 
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            // Création du bouton
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("🎬 Regarder le Live")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://www.twitch.tv/veyz3")
                );

            // Envoi de la réponse (visible par tout le monde)
            await interaction.reply({
                content: `🛠️ **[TEST]** Simulation de l'alerte Twitch :`,
                embeds: [embed],
                components: [row]
            });

        } catch (err) {
            console.error("❌ [Commande teststreamtwitch] Erreur :", err);
            
            // Message d'erreur personnalisé
            const errorMessage = "⚠️ Eh bande de monocouilles, la commande de test a foiré ! Regardez la console.";
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage });
            }
        }
    }
};