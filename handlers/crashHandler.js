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
        // 🛡️ FILTRE ANTI-SPAM : Ignore l'erreur de socket liée à l'IP discovery
        if (err && err.message && err.message.includes("Cannot perform IP discovery")) {
            return;
        }

        console.error("⚠️ Unhandled Rejection:", err);
        try {
            const channel = await client.channels.fetch(CRASH_CHANNEL_ID);
            if (channel) {
                await channel.send(`<@${ENZO_ID}> **[PROMESSE REJETÉE]** Bande de monocouilles, une erreur non gérée est survenue :\n\`\`\`js\n${err}\n\`\`\``);
            }
        } catch (e) { }
    });
}

module.exports = { initCrashHandler };