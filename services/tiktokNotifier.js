const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getTiktokStreamInfo } = require("./tiktokService");

let liveState = false;
let lastSentMessage = null;
let lastAlertTime = 0; 
const ALERT_COOLDOWN = 3600000; // Anti-spam : 1 heure minimum entre deux alertes

const CHANNEL_ID = "1513997825099436173"; // Même salon que Twitch
const ROLE_ID = "1499390064831234131";    // Même rôle que Twitch
const CRASH_CHANNEL_ID = "1514238836979273739"; 
const ENZO_ID = "1247264549489610897";

async function startTiktokLoop(client) {
    
    // Vérification toutes les 3 minutes (pour éviter les blocages TikTok)
    setInterval(async () => {
        try {
            const stream = await getTiktokStreamInfo("3n20zhl");

            // 🔴 OFFLINE → ONLINE (Avec vérification du Cooldown d'1h)
            if (stream && stream.isLive && !liveState && (Date.now() - lastAlertTime > ALERT_COOLDOWN)) {
                liveState = true;
                lastAlertTime = Date.now();

                const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
                
                if (!channel) return;

                const embed = new EmbedBuilder()
                    .setColor('#000000') // Noir TikTok super clean
                    .setAuthor({ 
                        name: 'Veyz est en direct sur TikTok', 
                        iconURL: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', 
                        url: "https://www.tiktok.com/@3n20zhl/live" 
                    })
                    .setTitle(stream.title || "Live en cours")
                    .setURL("https://www.tiktok.com/@3n20zhl/live")
                    .setDescription(
                        "**Bande de monocouilles !**\n\n" +
                        "Le live vient d'être lancé. Rejoignez le stream via le bouton ci-dessous."
                    )
                    .setFooter({ 
                        text: "TikTok System • Riley Bot", 
                        iconURL: client.user.displayAvatarURL() 
                    })
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Regarder le Stream")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://www.tiktok.com/@3n20zhl/live")
                    );

                if (lastSentMessage) {
                    try {
                        await lastSentMessage.delete();
                    } catch {}
                }

                const msg = await channel.send({
                    content: `<@&${ROLE_ID}>`,
                    embeds: [embed],
                    components: [row]
                });

                lastSentMessage = msg;
            }

            // ⚫ ONLINE → OFFLINE
            if (stream && !stream.isLive && liveState) {
                liveState = false;
            }

        } catch (err) {
            console.error("Erreur critique dans la boucle TikTok:", err);
            const crashChannel = client.channels.cache.get(CRASH_CHANNEL_ID);
            if (crashChannel) {
                crashChannel.send(`<@${ENZO_ID}> ⚠️ **[ERREUR LOOP TIKTOK]** La boucle a foiré :\n\`\`\`js\n${err.message}\n\`\`\``).catch(() => {});
            }
        }
    }, 180000); // 3 minutes
}

module.exports = { startTiktokLoop };