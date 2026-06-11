const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require('fs');
const path = require('path');

// 🔄 Chargement "intelligent" : local (tokens.js) ou Railway (process.env)
const tokensPath = path.join(__dirname, 'tokens.js');
const tokens = fs.existsSync(tokensPath) ? require('./tokens.js') : process.env;

const { loadCommands } = require("./handlers/commandHandler");
const { loadEvents } = require("./handlers/eventHandler");
const { initCrashHandler } = require("./handlers/crashHandler"); 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// 🧠 LOAD SYSTEMS
loadCommands(client);
loadEvents(client);
initCrashHandler(client); 

// 🔥 VOICE FIX
process.env.DISCORD_VOICE_NO_IP_DISCOVERY = "1";

// 🚀 LOGIN SÉCURISÉ
const loginToken = tokens.TOKEN_VEYZ || process.env.TOKEN || process.env.DISCORD_TOKEN;

if (loginToken) {
    client.login(loginToken).catch(err => {
        console.error("❌ Erreur lors du login du bot Veyz :", err);
    });
} else {
    console.error("❌ ERREUR FATALE : Aucun token trouvé pour Veyz !");
}