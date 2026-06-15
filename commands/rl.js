const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const ENZO_ID = "1247264549489610897";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rl")
        .setDescription("Gestionnaire de rôles avancé (Accès restreint)"),

    async execute(interaction) {
        // 🔒 SÉCURITÉ : Vérification de ton ID
        if (interaction.user.id !== ENZO_ID) {
            return interaction.reply({ 
                content: "❌ **Accès refusé.** Tu n'as pas l'autorisation d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        let currentPage = 0;
        const ROLES_PER_PAGE = 25;
        let selectedRoleId = null;

        // Fonction pour générer le menu principal avec pagination
        const generateMainMenu = (guild) => {
            // Récupère tous les rôles (sauf @everyone) triés du plus haut au plus bas
            const rolesArray = Array.from(guild.roles.cache.filter(r => r.id !== guild.id).values())
                                    .sort((a, b) => b.position - a.position);
            
            const maxPage = Math.ceil(rolesArray.length / ROLES_PER_PAGE) - 1;
            const currentRoles = rolesArray.slice(currentPage * ROLES_PER_PAGE, (currentPage + 1) * ROLES_PER_PAGE);

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🛠️ Interface de Gestion des Rôles')
                .setDescription(`Sélectionne un rôle à gérer. \n*Page ${currentPage + 1} sur ${maxPage + 1}*`)
                .setFooter({ text: "Panneau Administrateur Exclusif" });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_role')
                .setPlaceholder('Choisir un rôle à gérer...')
                .addOptions(
                    currentRoles.map(role => ({
                        label: role.name.substring(0, 100),
                        value: role.id,
                        description: `Position: ${role.position} | Membres: ${role.members.size}`
                    }))
                );

            const rowMenu = new ActionRowBuilder().addComponents(selectMenu);
            
            const rowButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_page')
                    .setLabel('◀️ Précédent')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('create_role')
                    .setLabel('➕ Créer un rôle')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel('Suivant ▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage >= maxPage)
            );

            return {
                embeds: [embed],
                components: [rowMenu, rowButtons],
                ephemeral: true
            };
        };

        // Fonction pour générer le menu d'un rôle spécifique
        const generateRoleMenu = (role) => {
            const embedRole = new EmbedBuilder()
                .setColor(role.color || '#2b2d31')
                .setTitle(`Gestion du rôle : ${role.name}`)
                .setDescription(`**Position :** ${role.position}\n**Membres :** ${role.members.size}\n**ID :** \`${role.id}\``)
                .setFooter({ text: "Actions disponibles ci-dessous" });

            const rowActions1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('move_up').setLabel('🔼 Monter').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('move_down').setLabel('🔽 Descendre').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('edit_role').setLabel('✏️ Modifier').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('delete_role').setLabel('🗑️ Supprimer').setStyle(ButtonStyle.Danger)
            );

            const rowActions2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('view_members').setLabel('👤 Voir membres').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('toggle_member').setLabel('👤 Assigner/Retirer (ID)').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('back_menu').setLabel('🔙 Retour Menu').setStyle(ButtonStyle.Secondary)
            );

            return { embeds: [embedRole], components: [rowActions1, rowActions2], ephemeral: true };
        };

        // Envoi du message initial éphémère
        const response = await interaction.reply(generateMainMenu(interaction.guild));

        // 🎯 COLLECTEUR D'ÉVÉNEMENTS (Dure 10 minutes pour te laisser le temps)
        const collector = response.createMessageComponentCollector({ 
            filter: i => i.user.id === ENZO_ID, 
            time: 600000 
        });

        collector.on('collect', async i => {
            try {
                // --- PAGINATION ---
                if (i.customId === 'prev_page') {
                    currentPage--;
                    return await i.update(generateMainMenu(interaction.guild));
                }
                if (i.customId === 'next_page') {
                    currentPage++;
                    return await i.update(generateMainMenu(interaction.guild));
                }

                // --- CRÉATION DE RÔLE ---
                if (i.customId === 'create_role') {
                    const modal = new ModalBuilder().setCustomId('modal_create_role').setTitle('Créer un rôle');
                    const roleNameInput = new TextInputBuilder().setCustomId('role_name').setLabel('Nom du rôle').setStyle(TextInputStyle.Short).setRequired(true);
                    modal.addComponents(new ActionRowBuilder().addComponents(roleNameInput));
                    
                    await i.showModal(modal);
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
                    if (!role) return i.reply({ content: "❌ Le rôle n'existe plus.", ephemeral: true });
                    return await i.update(generateRoleMenu(role));
                }

                // --- ACTIONS SUR LE RÔLE SÉLECTIONNÉ ---
                const role = interaction.guild.roles.cache.get(selectedRoleId);

                if (i.customId === 'back_menu') {
                    selectedRoleId = null;
                    return await i.update(generateMainMenu(interaction.guild));
                }

                if (!role && i.customId !== 'back_menu') {
                    return i.reply({ content: "❌ Le rôle est introuvable ou a été supprimé.", ephemeral: true });
                }

                // Monter
                if (i.customId === 'move_up') {
                    await role.setPosition(role.position + 1);
                    await i.reply({ content: `✅ Rôle **${role.name}** monté !`, ephemeral: true });
                    await interaction.editReply(generateRoleMenu(role)); 
                }

                // Descendre
                if (i.customId === 'move_down') {
                    await role.setPosition(role.position - 1);
                    await i.reply({ content: `✅ Rôle **${role.name}** descendu !`, ephemeral: true });
                    await interaction.editReply(generateRoleMenu(role));
                }

                // Supprimer
                if (i.customId === 'delete_role') {
                    const roleName = role.name;
                    await role.delete('Supprimé via le panel /rl par Enzo');
                    selectedRoleId = null;
                    await i.update(generateMainMenu(interaction.guild));
                    await i.followUp({ content: `🗑️ Le rôle **${roleName}** a été supprimé.`, ephemeral: true });
                }

                // Voir Membres
                if (i.customId === 'view_members') {
                    const membersList = role.members.map(m => `${m.user.tag}`).join('\n') || "Aucun membre.";
                    const content = membersList.length > 1900 ? membersList.substring(0, 1900) + "\n... (trop long)" : membersList;
                    return i.reply({ content: `👤 **Membres ayant le rôle ${role.name} :**\n${content}`, ephemeral: true });
                }

                // Modifier (Nom / Couleur)
                if (i.customId === 'edit_role') {
                    const modal = new ModalBuilder().setCustomId('modal_edit_role').setTitle('Modifier le rôle');
                    const nameInput = new TextInputBuilder().setCustomId('edit_name').setLabel('Nouveau nom (laisser vide pour garder)').setStyle(TextInputStyle.Short).setRequired(false).setValue(role.name);
                    const colorInput = new TextInputBuilder().setCustomId('edit_color').setLabel('Couleur Hex (ex: #FF0000) (optionnel)').setStyle(TextInputStyle.Short).setRequired(false).setValue(role.hexColor !== '#000000' ? role.hexColor : '');
                    
                    modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(colorInput));
                    await i.showModal(modal);

                    const modalSubmit = await i.awaitModalSubmit({ time: 60000, filter: mi => mi.user.id === ENZO_ID }).catch(() => null);
                    if (modalSubmit) {
                        const newName = modalSubmit.fields.getTextInputValue('edit_name') || role.name;
                        let newColor = modalSubmit.fields.getTextInputValue('edit_color') || role.color;
                        
                        // Validation simple de la couleur
                        if (typeof newColor === 'string' && !newColor.startsWith('#')) newColor = `#${newColor}`;

                        await role.edit({ name: newName, color: newColor });
                        await modalSubmit.update(generateRoleMenu(role));
                        await modalSubmit.followUp({ content: `✅ Le rôle a été modifié avec succès !`, ephemeral: true });
                    }
                }

                // Assigner / Retirer à un membre
                if (i.customId === 'toggle_member') {
                    const modal = new ModalBuilder().setCustomId('modal_toggle_member').setTitle('Assigner / Retirer le rôle');
                    const idInput = new TextInputBuilder().setCustomId('target_id').setLabel('ID Discord du membre').setStyle(TextInputStyle.Short).setRequired(true);
                    
                    modal.addComponents(new ActionRowBuilder().addComponents(idInput));
                    await i.showModal(modal);

                    const modalSubmit = await i.awaitModalSubmit({ time: 60000, filter: mi => mi.user.id === ENZO_ID }).catch(() => null);
                    if (modalSubmit) {
                        const targetId = modalSubmit.fields.getTextInputValue('target_id');
                        const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);

                        if (!targetMember) {
                            return modalSubmit.reply({ content: `❌ Impossible de trouver le membre avec l'ID \`${targetId}\` sur le serveur.`, ephemeral: true });
                        }

                        if (targetMember.roles.cache.has(role.id)) {
                            await targetMember.roles.remove(role);
                            await modalSubmit.reply({ content: `➖ Le rôle **${role.name}** a été retiré à <@${targetId}>.`, ephemeral: true });
                        } else {
                            await targetMember.roles.add(role);
                            await modalSubmit.reply({ content: `➕ Le rôle **${role.name}** a été ajouté à <@${targetId}>.`, ephemeral: true });
                        }
                        
                        await interaction.editReply(generateRoleMenu(role));
                    }
                }

            } catch (error) {
                console.error("Erreur commande rl:", error);
                if (!i.replied && !i.deferred) {
                    await i.reply({ content: "❌ Erreur : Le bot manque probablement de permissions (rôle trop bas) ou l'action est invalide.", ephemeral: true });
                } else {
                    await i.followUp({ content: "❌ Une erreur s'est produite (Permissions).", ephemeral: true });
                }
            }
        });
    }
};