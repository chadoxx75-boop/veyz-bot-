const CRASH_CHANNEL_ID = '1514238836979273739';
const ENZO_ID = '1247264549489610897';

function initCrashHandler(client) {
    process.on("uncaughtException", async (err) => {
        console.error("❌ Uncaught Exception:", err);
        try {
            const channel = await client.channels.fetch(CRASH_CHANNEL_ID);
            if (channel) {
                await channel.send(`<@${ENZO_ID}> **[CRASH CRITIQUE]** Bande de monocouilles, le bot a crash :\n\`\`\`js\n${err.message}\n\`\`\``);
            }
        } catch (e) { }
    });

    process.on("unhandledRejection", async (err) => {
        console.error("⚠️ Unhandled Rejection:", err);
        try {
            const channel = await client.channels.fetch(CRASH_CHANNEL_ID);
            if (channel) {
                await channel.send(`<@${ENZO_ID}> **[PROMESSE REJETÉE]** Bande de monocouilles, une erreur non gérée est survenue :\n\`\`\`js\n${err}\n\`\`\``);
            }
        } catch (e) { }
    });
}

// C'est cette ligne qui manquait ou était mal écrite !
module.exports = { initCrashHandler };