async function getStreamInfo(username = "chadoxx__") {
    try {
        const liveRes = await fetch(`https://decapi.me/twitch/uptime/${username}`);

        if (!liveRes.ok) {
            return { isLive: false };
        }

        const liveText = await liveRes.text();

        if (!liveText || liveText.toLowerCase().includes("offline") || liveText.includes("not found")) {
            return { isLive: false };
        }

        const [titleRes, gameRes] = await Promise.all([
            fetch(`https://decapi.me/twitch/title/${username}`),
            fetch(`https://decapi.me/twitch/game/${username}`)
        ]);

        let title = titleRes.ok ? await titleRes.text() : "Live en cours";
        let game = gameRes.ok ? await gameRes.text() : "Non défini";

        if (title.length > 250) title = title.substring(0, 250) + "...";
        if (game.length > 100) game = game.substring(0, 100) + "...";

        return {
            isLive: true,
            title: title && !title.includes("Error") ? title : "Live en cours",
            game: game && !game.includes("Error") ? game : "Non défini"
        };
    } catch (error) {
        console.error("❌ Erreur silencieuse API DecAPI:", error.message);
        return { isLive: false };
    }
}

module.exports = { getStreamInfo };