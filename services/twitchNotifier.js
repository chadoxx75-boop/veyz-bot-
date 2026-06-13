const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getStreamInfo } = require("./twitchService");

let liveState = false;
let lastSentMessage = null;

const CHANNEL_ID = "1513997825099436173";
const ROLE_ID = "1499390064831234131";
const CRASH_CHANNEL_ID = "1514238836979273739"; 
const ENZO_ID = "1247264549489610897";

async function startTwitchLoop(client) {
    
    // Boucle toutes les 15 secondes
    setInterval(async () => {
        try {
            const stream = await getStreamInfo("veyz3");

            // 🔴 OFFLINE → ONLINE
            if (stream && stream.isLive && !liveState) {
                liveState = true;

                const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
                
                if (!channel) return;

                const embed = new EmbedBuilder()
                    .setColor('#9146FF')
                    .setAuthor({ 
                        name: 'Veyz est en direct sur Twitch', 
                        iconURL: 'https://cdn-icons-png.flaticon.com/512/5968/5968819.png', 
                        url: "https://www.twitch.tv/veyz3" 
                    })
                    .setTitle(stream.title || "Live en cours")
                    .setURL("https://www.twitch.tv/veyz3")
                    .setDescription(
                        "**Bande de monocouilles !**\n\n" +
                        "Le live vient d'être lancé. Rejoignez le stream via le bouton ci-dessous."
                    )
                    .addFields(
                        { name: "Catégorie", value: stream.game || 'Non défini', inline: true }
                    )
                    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_veyz3-1280x720.jpg?t=${Date.now()}`)
                    .setFooter({ 
                        text: "Twitch System • Riley Bot", 
                        iconURL: client.user.displayAvatarURL() 
                    })
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Regarder le Stream")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://www.twitch.tv/veyz3")
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
            console.error("Erreur critique dans la boucle Twitch:", err);
            const crashChannel = client.channels.cache.get(CRASH_CHANNEL_ID);
            if (crashChannel) {
                crashChannel.send(`<@${ENZO_ID}> ⚠️ **[ERREUR LOOP TWITCH]** La boucle a foiré :\n\`\`\`js\n${err.message}\n\`\`\``).catch(() => {});
            }
        }
    }, 15000); 
}

module.exports = { startTwitchLoop };