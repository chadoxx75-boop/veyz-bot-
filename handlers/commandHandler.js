const fs = require("fs");
const path = require("path");

function loadCommands(client) {
    const commandsPath = path.join(__dirname, "../commands");

    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(`${commandsPath}/${file}`);

        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
        }
    }
}

module.exports = { loadCommands };