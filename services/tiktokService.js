const axios = require('axios');

function findLiveTitleInJson(obj) {
    if (typeof obj !== 'object' || obj === null) return null;
    
    if (obj.title && obj.roomId) {
        return obj.title;
    }
    
    for (const key in obj) {
        const result = findLiveTitleInJson(obj[key]);
        if (result) return result;
    }
    
    return null;
}

async function getTiktokStreamInfo(username = "3n20zhl") {
    try {
        const response = await axios.get(`https://www.tiktok.com/@${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;
        const isLive = html.includes('"roomId":"') && !html.includes('"roomId":""') && !html.includes('"roomId":"0"');

        let title = "Live en cours";

        if (isLive) {
            try {
                const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || [];
                
                for (const scriptContent of scripts) {
                    const content = scriptContent.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)?.[1];
                    
                    if (content) {
                        try {
                            const jsonData = JSON.parse(content);
                            const foundTitle = findLiveTitleInJson(jsonData);
                            if (foundTitle) {
                                title = decodeURIComponent(JSON.parse('"' + foundTitle.replace(/\"/g, '\\"') + '"'));
                                break; 
                            }
                        } catch (e) {}
                    }
                }
            } catch (error) {
                console.error(`Erreur d'extraction du titre TikTok:`, error.message);
            }
        }

        return { isLive, title };

    } catch (error) {
        // En cas d'erreur réseau (ex: blocage TikTok), on échoue silencieusement
        return { isLive: false };
    }
}

module.exports = { getTiktokStreamInfo };