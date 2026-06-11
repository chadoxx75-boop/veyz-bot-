const play = require("play-dl");

(async () => {
    try {
        const stream = await play.stream("https://www.youtube.com/watch?v=GpwMwZVXWCc");
        console.log("OK STREAM");
    } catch (e) {
        console.error("FAIL:", e);
    }
})();