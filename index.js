require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");

const { loadCommands } = require("./handlers/commandHandler");
const { loadEvents } = require("./handlers/eventHandler");
// 🔥 On importe le bon nom : initCrashHandler
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
// 🔥 On exécute avec le bon nom
initCrashHandler(client); 

// 🔥 VOICE FIX
process.env.DISCORD_VOICE_NO_IP_DISCOVERY = "1";

// 🚀 LOGIN
client.login(process.env.TOKEN);