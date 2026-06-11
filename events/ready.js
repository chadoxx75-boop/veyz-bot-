const { Events } = require("discord.js");
const { deployCommands } = require("../handlers/deployHandler");
const { startTwitchLoop } = require("../services/twitchNotifier");
const { startTiktokLoop } = require("../services/tiktokNotifier");

module.exports = {
    name: "clientReady", 
    once: true,

    async execute(client) {
        console.log(`✔ Connecté en tant que ${client.user.tag}`);

        // 🔥 DEPLOY AUTO
        await deployCommands(client);

        // 📡 PRESENCE
        client.user.setPresence({
            status: "dnd",
            activities: [
                {
                    name: "vous surveille bande de monocouilles",
                    type: 3 // 3 = Watching (Regarde)
                }
            ]
        });

        // 🟣 LANCEMENT DU SYSTÈME TWITCH
        //startTwitchLoop(client);
        //console.log("🟣 Système de notification Twitch lancé.");

        // ⚫ LANCEMENT DU SYSTÈME TIKTOK
        //startTiktokLoop(client);
        //console.log("⚫ Système de notification TikTok lancé.");
    }
};