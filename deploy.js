require("dotenv").config();
const fs = require("fs");
const { REST, Routes } = require("discord.js");

async function deployCommands() {

    const commands = [];

    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

    for (const file of files) {
        const cmd = require(`./commands/${file}`);
        commands.push(cmd.data.toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
    );

    console.log("✔ Commands auto-déployées");
}

module.exports = { deployCommands };