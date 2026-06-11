const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

async function deployCommands() {
    try {
        const commands = [];

        const commandsPath = path.join(__dirname, "../commands");
        const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

        for (const file of files) {
            const cmd = require(path.join(commandsPath, file));

            if (!cmd.data) {
                console.log(`❌ Command ignorée (pas de data): ${file}`);
                continue;
            }

            commands.push(cmd.data.toJSON());
            console.log(`✔ Command loaded: ${file}`);
        }

        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log("✔ Slash commands déployées automatiquement");

    } catch (err) {
        console.error("❌ Deploy error:", err);
    }
}

module.exports = { deployCommands };