const { joinVoiceChannel } = require("@discordjs/voice");

const VOICE_CHANNEL_ID = "1514240419733573762";

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        const channel = client.channels.cache.get(VOICE_CHANNEL_ID);

        if (!channel) {
            console.log("❌ Salon vocal introuvable");
            return;
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true
        });

        console.log("🎧 Bot connecté en vocal");

        // anti-disconnect
        connection.on("stateChange", (oldState, newState) => {
            if (newState.status === "disconnected") {
                setTimeout(() => {
                    joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                        selfDeaf: true
                    });
                }, 3000);
            }
        });
    }
};