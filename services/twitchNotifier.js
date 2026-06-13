const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getStreamInfo } = require("./twitchService");

let liveState = false;
let lastSentMessage = null;

const CHANNEL_ID = "1513997825099436173";
const ROLE_ID = "1494338640841543783";
const CRASH_CHANNEL_ID = "1514238836979273739"; 
const ENZO_ID = "1247264549489610897";

async function startTwitchLoop(client) {
    
    // 🔥 Boucle accélérée : toutes les 15 secondes
    setInterval(async () => {
        try {
            const stream = await getStreamInfo("chadoxx__");

            // 🛠️ MOUCHARD DE DEBUG 
            console.log(`[DEBUG TWITCH] Statut vu par le bot : ${stream.isLive ? "EN LIGNE 🟢" : "HORS LIGNE 🔴"} (liveState actuel: ${liveState})`);

            // 🔴 OFFLINE → ONLINE
            if (stream && stream.isLive && !liveState) {
                liveState = true;

                const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
                
                if (!channel) {
                    console.error(`❌ [ERREUR CRITIQUE] Le bot ne trouve pas le salon Twitch (ID: ${CHANNEL_ID}).`);
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor('#9146FF')
                    .setAuthor({ 
                        name: 'ChadoxX est en direct sur Twitch !', 
                        iconURL: 'https://cdn-icons-png.flaticon.com/512/5968/5968819.png', 
                        url: "https://www.twitch.tv/chadoxx__" 
                    })
                    .setTitle(stream.title || "Live en cours !")
                    .setURL("https://www.twitch.tv/chadoxx__")
                    .setDescription(
                        "💜 **Bande de monocouilles !**\n\n" +
                        "Le boss ChadoxX est en live 🔥\n" +
                        "Venez donner de la force et rejoindre le stream 💪"
                    )
                    .addFields(
                        { name: "🎮 Jeu", value: `\`${stream.game || 'Non défini'}\``, inline: true },
                        { name: "📡 Statut", value: "`🟣 EN LIGNE`", inline: true }
                    )
                    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_chadoxx__-1280x720.jpg?t=${Date.now()}`)
                    .setFooter({ 
                        text: "Twitch Live System • Riley Bot", 
                        iconURL: client.user.displayAvatarURL() 
                    })
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("🎬 Regarder le Live")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://www.twitch.tv/chadoxx__")
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
                crashChannel.send(`<@${ENZO_ID}> ⚠️ **[ERREUR LOOP TWITCH]** Bande de monocouilles, la boucle Twitch a foiré :\n\`\`\`js\n${err.message}\n\`\`\``).catch(() => {});
            }
        }
    }, 15000); // ⏱️ Changé de 60000 à 15000
}

module.exports = { startTwitchLoop };