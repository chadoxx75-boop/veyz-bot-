const { EmbedBuilder } = require("discord.js");

const CRASH_CHANNEL = "1514238836979273739";
const LOG_CHANNEL = "1514239649793572945";

async function sendLog(client, title, description) {

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription("```" + description.slice(0, 3500) + "```")
        .setColor(0x2F3136)
        .setTimestamp();

    try {
        const logCh = await client.channels.fetch(LOG_CHANNEL);
        if (logCh) logCh.send({ embeds: [embed] });

    } catch (err) {
        console.error("Logger error:", err);
    }
}

// crash séparé
async function sendCrash(client, title, description, userId) {

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription("```" + description.slice(0, 3500) + "```")
        .setColor(0xFF0000)
        .setTimestamp();

    try {
        const crashCh = await client.channels.fetch(CRASH_CHANNEL);
        if (crashCh) {
            crashCh.send({
                content: userId ? `<@${userId}>` : "",
                embeds: [embed]
            });
        }

    } catch (err) {
        console.error("Crash logger error:", err);
    }
}

module.exports = { sendLog, sendCrash };