const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');
const scdl = require('soundcloud-downloader').default;
const yts = require('yt-search');
const { EmbedBuilder } = require('discord.js');

let player = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Play }
});

let connection = null;
let currentClient = null; // Pour pouvoir remettre le statut à zéro

// 🔄 Quand la musique se termine, on remet le statut de base
player.on(AudioPlayerStatus.Idle, () => {
    if (currentClient) {
        currentClient.user.setPresence({
            status: "dnd",
            activities: [{ name: "vous surveille bande de monocouilles", type: 3 }] // 3 = Watching
        });
    }
});

player.on('error', error => {
    console.error('❌ [Audio Player Error]:', error.message);
});

async function playMusic(interaction, query) {
    const voiceChannel = interaction.member.voice.channel;
    currentClient = interaction.client; // On sauvegarde le client pour le statut

    if (!voiceChannel) {
        return interaction.editReply({ content: "⚠️ Bande de monocouilles, tu dois être dans un salon vocal pour lancer de la musique !" });
    }

    try {
        connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // 🛠️ FIX RÉSEAU : Empêche la déconnexion vocale automatique au bout de 10/15 secondes
        connection.on('stateChange', (oldState, newState) => {
            const oldNetworking = Reflect.get(oldState, 'networking');
            const newNetworking = Reflect.get(newState, 'networking');
            const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
                const newUdp = Reflect.get(newNetworkState, 'udp');
                clearInterval(newUdp?.keepAliveInterval);
            };
            oldNetworking?.off('stateChange', networkStateChangeHandler);
            newNetworking?.on('stateChange', networkStateChangeHandler);
        });

        connection.subscribe(player);

        let title = "Musique Inconnue";
        let thumbnail = null;
        let finalUrl = "";
        let stream;
        let searchQuery = query;

        // Astuce : On convertit les liens YouTube en recherche texte pour SoundCloud
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            const ytResult = await yts(query); 
            if (ytResult && ytResult.videos.length > 0) {
                searchQuery = ytResult.videos[0].title;
            } else {
                return interaction.editReply({ content: "⚠️ Eh bande de monocouilles, impossible de lire ce lien !" });
            }
        }

        if (scdl.isValidUrl(searchQuery)) {
            const track = await scdl.getInfo(searchQuery);
            title = track.title;
            thumbnail = track.artwork_url || track.user?.avatar_url;
            finalUrl = track.permalink_url;
            stream = await scdl.download(finalUrl);
        } else {
            const searchResults = await scdl.search({ query: searchQuery, resourceType: 'tracks', limit: 1 });
            if (!searchResults.collection || searchResults.collection.length === 0) {
                return interaction.editReply({ content: "⚠️ Je n'ai trouvé aucune musique !" });
            }
            const track = searchResults.collection[0];
            title = track.title;
            thumbnail = track.artwork_url || track.user?.avatar_url;
            finalUrl = track.permalink_url;
            stream = await scdl.download(finalUrl);
        }

        // 🛠️ FIX AUDIO : On force FFmpeg à être permissif avec le stream pour éviter les micro-coupures
        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
            inlineVolume: true // Souvent, activer ça empêche le pipeline de s'effondrer
        });
        resource.volume.setVolume(1.0);

        player.play(resource);

        // 🟢 CHANGEMENT DU STATUT DU BOT
        currentClient.user.setPresence({
            status: "online",
            activities: [{ name: title, type: 2 }] // 2 = Listening
        });

        const embed = new EmbedBuilder()
            .setColor('#FF5500')
            .setAuthor({ name: '☁️ Musique lancée !' })
            .setTitle(title)
            .setURL(finalUrl)
            .setThumbnail(thumbnail)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });

    } catch (err) {
        console.error("❌ [Erreur] :", err.message || err);
        await interaction.editReply({ content: `⚠️ Impossible de lire ça !\n\`\`\`${err.message || err}\`\`\`` });
        if (connection && player.state.status !== AudioPlayerStatus.Playing) {
            connection.destroy();
        }
    }
}

// ⏸️ FONCTION PAUSE
function pauseMusic(interaction) {
    if (player.state.status === AudioPlayerStatus.Playing) {
        player.pause();
        return interaction.reply({ content: "⏸️ **Musique en pause** bande de monocouilles !" });
    }
    return interaction.reply({ content: "⚠️ Aucune musique n'est en cours de lecture sale tdc !", ephemeral: true });
}

// ▶️ FONCTION RESUME
function resumeMusic(interaction) {
    if (player.state.status === AudioPlayerStatus.Paused || player.state.status === AudioPlayerStatus.AutoPaused) {
        player.unpause();
        return interaction.reply({ content: "▶️ **Musique reprise !**" });
    }
    return interaction.reply({ content: "⚠️ La musique n'est pas en pause t'es con ou quoi !", ephemeral: true });
}

// ⏹️ FONCTION STOP 
function stopMusic(interaction) {
    if (player.state.status === AudioPlayerStatus.Idle) {
        return interaction.reply({ content: "⚠️ Aucune musique n'est en cours de lecture !", ephemeral: true });
    }
    
    player.stop(); // Va déclencher l'événement 'Idle' et remettre le statut à zéro
    
    return interaction.reply({ content: "⏹️ **Musique arrêtée !** Je reste dans le coin si besoin, sale monocouille" });
}

module.exports = { playMusic, pauseMusic, resumeMusic, stopMusic };caca