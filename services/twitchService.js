async function getStreamInfo(username = "chadoxx__") {
    try {
        const liveRes = await fetch(`https://decapi.me/twitch/live/${username}`);

        // 🛡️ PROTECTION 1 : Si l'API plante (Cloudflare, 502, etc.), on annule
        if (!liveRes.ok) {
            return { isLive: false };
        }

        const liveText = await liveRes.text();

        // 🛡️ PROTECTION 2 : On vérifie si c'est bien offline ou une erreur API classique
        if (!liveText || liveText.toLowerCase().includes("offline") || liveText.includes("User not found")) {
            return { isLive: false };
        }

        // Si on arrive ici, l'API dit que tu es en live. On récupère le reste.
        const [titleRes, gameRes] = await Promise.all([
            fetch(`https://decapi.me/twitch/title/${username}`),
            fetch(`https://decapi.me/twitch/game/${username}`)
        ]);

        let title = titleRes.ok ? await titleRes.text() : "🔴 Live en cours !";
        let game = gameRes.ok ? await gameRes.text() : "Jeu inconnu";

        // 🛡️ PROTECTION 3 : Anti-Crash Discord (Les embeds ont des limites strictes)
        // Si decapi renvoie du HTML par erreur, on le coupe avant de l'envoyer à Discord
        if (title.length > 250) title = title.substring(0, 250) + "...";
        if (game.length > 100) game = game.substring(0, 100) + "...";

        return {
            isLive: true,
            title: title && !title.includes("Error") ? title : "🔴 Live en cours !",
            game: game && !game.includes("Error") ? game : "Jeu inconnu"
        };
    } catch (error) {
        // Cette erreur s'affichera proprement dans ta console Railway sans faire planter la boucle
        console.error("❌ Erreur silencieuse API DecAPI:", error.message);
        return { isLive: false };
    }
}

module.exports = { getStreamInfo };