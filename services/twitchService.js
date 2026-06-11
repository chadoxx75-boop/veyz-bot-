async function getStreamInfo(username = "veyz3") {
    try {
        // 1. On vérifie d'abord si la chaîne est en ligne
        const liveRes = await fetch(`https://decapi.me/twitch/live/${username}`);
        const liveText = await liveRes.text();

        // Si le texte contient "offline" ou est vide, il n'est pas en live
        if (!liveText || liveText.toLowerCase().includes("offline")) {
            return { isLive: false };
        }

        // 2. S'il est en live, on récupère le titre et le jeu pour l'embed premium
        const [titleRes, gameRes] = await Promise.all([
            fetch(`https://decapi.me/twitch/title/${username}`),
            fetch(`https://decapi.me/twitch/game/${username}`)
        ]);

        const title = await titleRes.text();
        const game = await gameRes.text();

        return {
            isLive: true,
            title: title && !title.includes("Error") ? title : "🔴 Live en cours !",
            game: game && !game.includes("Error") ? game : "Jeu inconnu"
        };
    } catch (error) {
        console.error("❌ Erreur API DecAPI:", error);
        return { isLive: false };
    }
}

module.exports = { getStreamInfo };