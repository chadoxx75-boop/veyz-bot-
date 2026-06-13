const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType } = require('discord.js');

const ENZO_ID = "1247264549489610897";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rl")
        .setDescription("Gestionnaire de rôles ultra rapide (Accès restreint)"),

    async execute(interaction) {
        // 🔒 SÉCURITÉ : Vérification de ton ID
        if (interaction.user.id !== ENZO_ID) {
            return interaction.reply({ 
                content: "❌ **Accès refusé.** Tu n'as pas l'autorisation d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        // Fonction pour générer le menu principal
        const generateMainMenu = (guild) => {
            // On récupère les 25 rôles les plus hauts (limite de Discord pour le menu déroulant)
            const roles = guild.roles.cache
                .filter(r => r.id !== guild.id) // Exclure @everyone
                .sort((a, b) => b.position - a.position)
                .first(25);

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🛠️ Interface de Gestion des Rôles')
                .setDescription('Sélectionne un rôle existant pour le modifier, ou crées-en un nouveau.')
                .setFooter({ text: "Panneau Administrateur Exclusif" });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_role')
                .setPlaceholder('Choisir un rôle à gérer...')
                .addOptions(
                    roles.map(role => ({
                        label: role.name.substring(0, 100),
                        value: role.id,
                        description: `Position: ${role.position} | Membres: ${role.members.size}`
                    }))
                );

            const btnCreate = new ButtonBuilder()
                .setCustomId('create_role')
                .setLabel('➕ Créer un nouveau rôle')
                .setStyle(ButtonStyle.Success);

            return {
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(selectMenu),
                    new ActionRowBuilder().addComponents(btnCreate)
                ],
                ephemeral: true
            };
        };

        // Envoi du message initial éphémère
        const response = await interaction.reply(generateMainMenu(interaction.guild));

        // 🎯 COLLECTEUR D'ÉVÉNEMENTS (Dure 5 minutes)
        const collector = response.createMessageComponentCollector({ 
            filter: i => i.user.id === ENZO_ID, 
            time: 300000 
        });

        let selectedRoleId = null;

        collector.on('collect', async i => {
            try {
                // --- CRÉATION DE RÔLE ---
                if (i.customId === 'create_role') {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_create_role')
                        .setTitle('Créer un rôle');

                    const roleNameInput = new TextInputBuilder()
                        .setCustomId('role_name')
                        .setLabel('Nom du rôle')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(roleNameInput));
                    await i.showModal(modal);

                    // Attente de la soumission du modal
                    const modalSubmit = await i.awaitModalSubmit({ time: 60000, filter: mi => mi.user.id === ENZO_ID }).catch(() => null);
                    if (modalSubmit) {
                        const newName = modalSubmit.fields.getTextInputValue('role_name');
                        await interaction.guild.roles.create({ name: newName, reason: 'Créé via le panel /rl par Enzo' });
                        await modalSubmit.reply({ content: `✅ Le rôle **${newName}** a été créé !`, ephemeral: true });
                        await interaction.editReply(generateMainMenu(interaction.guild));
                    }
                    return;
                }

                // --- SÉLECTION D'UN RÔLE ---
                if (i.customId === 'select_role') {
                    selectedRoleId = i.values[0];
                    const role = interaction.guild.roles.cache.get(selectedRoleId);

                    if (!role) {
                        return i.reply({ content: "❌ Le rôle n'existe plus.", ephemeral: true });
                    }

                    const embedRole = new EmbedBuilder()
                        .setColor(role.color || '#2b2d31')
                        .setTitle(`Gestion du rôle : ${role.name}`)
                        .setDescription(`**Position :** ${role.position}\n**Membres :** ${role.members.size}\n**ID :** \`${role.id}\``);

                    const rowActions = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('move_up').setLabel('🔼 Monter').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('move_down').setLabel('🔽 Descendre').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('delete_role').setLabel('🗑️ Supprimer').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('back_menu').setLabel('🔙 Retour').setStyle(ButtonStyle.Secondary)
                    );

                    await i.update({ embeds: [embedRole], components: [rowActions] });
                    return;
                }

                // --- ACTIONS SUR LE RÔLE SÉLECTIONNÉ ---
                const role = interaction.guild.roles.cache.get(selectedRoleId);

                if (i.customId === 'back_menu') {
                    selectedRoleId = null;
                    await i.update(generateMainMenu(interaction.guild));
                    return;
                }

                if (!role && i.customId !== 'back_menu') {
                    return i.reply({ content: "❌ Le rôle est introuvable.", ephemeral: true });
                }

                if (i.customId === 'move_up') {
                    await role.setPosition(role.position + 1);
                    await i.reply({ content: `✅ Rôle **${role.name}** monté !`, ephemeral: true });
                    await interaction.editReply(generateMainMenu(interaction.guild)); // Retour au menu pour actualiser
                }

                if (i.customId === 'move_down') {
                    await role.setPosition(role.position - 1);
                    await i.reply({ content: `✅ Rôle **${role.name}** descendu !`, ephemeral: true });
                    await interaction.editReply(generateMainMenu(interaction.guild));
                }

                if (i.customId === 'delete_role') {
                    const roleName = role.name;
                    await role.delete('Supprimé via le panel /rl par Enzo');
                    selectedRoleId = null;
                    await i.update(generateMainMenu(interaction.guild));
                    await i.followUp({ content: `🗑️ Le rôle **${roleName}** a été supprimé.`, ephemeral: true });
                }

            } catch (error) {
                console.error("Erreur commande rl:", error);
                // Si le bot n'a pas les permissions (son rôle est plus bas que celui qu'il essaie de modifier)
                if (!i.replied && !i.deferred) {
                    await i.reply({ content: "❌ Erreur : Le bot n'a probablement pas la permission de modifier ce rôle (vérifie que le rôle de Riley est plus haut dans la hiérarchie).", ephemeral: true });
                } else {
                    await i.followUp({ content: "❌ Erreur de permission.", ephemeral: true });
                }
            }
        });
    }
};