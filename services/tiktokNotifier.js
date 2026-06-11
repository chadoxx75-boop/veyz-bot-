const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const { WebcastPushConnection } = require("tiktok-live-connector");

let isTiktokLive = false;
let lastSentTiktokMessage = null;

const TIKTOK_USERNAME = "3n20zhl";
const CHANNEL_ID = "1513997825099436173";
const ROLE_ID = "1514045793252933734";
const CRASH_CHANNEL_ID = "1514238836979273739";
const ENZO_ID = "1247264549489610897";

async function checkTikTokLive(client) {
    const tiktokConnection = new WebcastPushConnection(TIKTOK_USERNAME);

    try {
        const roomInfo = await tiktokConnection.connect();
        
        if (!isTiktokLive) {
            isTiktokLive = true;

            const channel = client.channels.cache.get(CHANNEL_ID);
            if (!channel) return;

            const title = roomInfo.title || "En direct sur TikTok !";
            const coverUrl = roomInfo.roomInfo?.cover?.url_list?.[0];

            // 1. On charge l'image locale pour le vrai live
            const logoImage = new AttachmentBuilder('./assets/logo.png');

            const embed = new EmbedBuilder()
                .setColor('#EAE0C8') // Beige premium
                .setAuthor({ 
                    name: 'Veyz est en direct sur TikTok', 
                    iconURL: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', 
                    url: `https://www.tiktok.com/@${TIKTOK_USERNAME}/live` 
                })
                .setTitle(title) // Titre réel du live
                .setURL(`https://www.tiktok.com/@${TIKTOK_USERNAME}/live`)
                .setDescription(
                    "💎 **Bande de monocouilles !**\n\n" +
                    "Le GOAT Veyz a lancé son live 🔥\n" +
                    "Rejoignez le direct pour ne rien manquer."
                )
                .addFields(
                    { name: "📡 Statut", value: "`⚫ EN DIRECT`", inline: true }
                )
                // 2. On met ton logo local en miniature
                .setThumbnail('attachment://logo.png')
                .setFooter({ text: "Veyz Live System", iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            // Si TikTok fournit une image du live, on l'ajoute en grand en bas
            if (coverUrl) {
                embed.setImage(coverUrl);
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("📱 Rejoindre le Live")
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://www.tiktok.com/@${TIKTOK_USERNAME}/live`)
                );

            if (lastSentTiktokMessage) {
                try { await lastSentTiktokMessage.delete(); } catch {}
            }

            // 3. On envoie le message avec le fichier logo
            const msg = await channel.send({
                content: `<@&${ROLE_ID}>`,
                embeds: [embed],
                components: [row],
                files: [logoImage] // Envoi de l'image locale
            });

            lastSentTiktokMessage = msg;
        }

        tiktokConnection.disconnect();

    } catch (err) {
        const errorMessage = err.message || "";
        
        if (errorMessage.includes("not live") || errorMessage.includes("not found")) {
            if (isTiktokLive) {
                isTiktokLive = false;
            }
        } else {
            console.error("❌ [TikTok] Erreur inattendue :", err);
            if (!errorMessage.includes("fetch") && !errorMessage.includes("timeout")) {
                const crashChannel = client.channels.cache.get(CRASH_CHANNEL_ID);
                if (crashChannel) {
                    crashChannel.send(`<@${ENZO_ID}> ⚠️ **[ERREUR TIKTOK]** Bande de monocouilles, le module TikTok a foiré :\n\`\`\`js\n${errorMessage}\n\`\`\``).catch(() => {});
                }
            }
        }
    }
}

function startTiktokLoop(client) {
    setInterval(() => checkTikTokLive(client), 60000);
}

module.exports = { startTiktokLoop };