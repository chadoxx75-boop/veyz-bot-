module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error(`[Erreur Commande ${interaction.commandName}]`, err);
            
            const errorMessage = "⚠️ Eh bande de monocouilles, la commande a foiré ! Le système a rencontré une erreur.";
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage });
            }
        }
    }
};