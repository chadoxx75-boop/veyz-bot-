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

        // 🛡️ VÉRIFICATION CRITIQUE
        const token = process.env.TOKEN;
        const clientId = process.env.CLIENT_ID;
        const guildId = process.env.GUILD_ID;

        if (!token || !clientId || !guildId) {
            console.error("❌ ERREUR : Manque une variable d'environnement (TOKEN, CLIENT_ID ou GUILD_ID)");
            return; // On arrête tout avant de faire crasher le déploiement
        }

        const rest = new REST({ version: "10" }).setToken(token);

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log("✔ Slash commands déployées automatiquement");

    } catch (err) {
        console.error("❌ Deploy error:", err);
    }
}

module.exports = { deployCommands };