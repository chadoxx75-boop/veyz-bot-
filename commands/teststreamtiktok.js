const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("teststreamtiktok")
        .setDescription("Teste l'affichage de l'alerte TikTok de Veyz avec le logo local"),
        
    async execute(interaction, client) {
        try {
            const TIKTOK_USERNAME = "3n20zhl";

            // 1. On charge l'image locale depuis ton dossier assets
            // Le chemin part de la racine de ton projet (là où est ton index.js)
            const logoImage = new AttachmentBuilder('./assets/logo.png');

            // 2. On crée l'embed
            const embed = new EmbedBuilder()
                .setColor('#EAE0C8') // Beige premium et clean
                .setAuthor({ 
                    name: 'Veyz est en direct sur TikTok', 
                    iconURL: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', 
                    url: `https://www.tiktok.com/@${TIKTOK_USERNAME}/live` 
                })
                .setTitle("💎 [TEST] Le stream vient de commencer !")
                .setURL(`https://www.tiktok.com/@${TIKTOK_USERNAME}/live`)
                .setDescription(
                    "💎 **Bande de monocouilles !**\n\n" +
                    "Le GOAT Veyz a lancé son live 🔥\n" +
                    "Rejoignez le direct pour ne rien manquer."
                )
                .addFields(
                    { name: "📡 Statut", value: "`⚫ EN DIRECT`", inline: true }
                )
                // 3. On utilise l'image attachée comme miniature (PP)
                .setThumbnail('attachment://logo.png')
                // Image factice de couverture enlevée pour laisser toute la place au design clean et à ton logo
                .setFooter({ text: "Veyz Live System (Mode Test)", iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("📱 Rejoindre le Live")
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://www.tiktok.com/@${TIKTOK_USERNAME}/live`)
                );

            // 4. On envoie la réponse en incluant le fichier local
            await interaction.reply({
                content: `🛠️ **[TEST]** Simulation de l'alerte TikTok :`,
                embeds: [embed],
                components: [row],
                files: [logoImage] // TRÈS IMPORTANT : c'est ça qui upload l'image vers Discord
            });

        } catch (err) {
            console.error("❌ [Commande teststreamtiktok] Erreur :", err);
            
            const errorMessage = "⚠️ Eh bande de monocouilles, la commande de test TikTok a foiré ! Regardez la console.";
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage });
            }
        }
    }
};