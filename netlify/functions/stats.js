// Get stats function
const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: 'Method not allowed' })
        };
    }

    try {
        const store = getStore("waitlist");

        let subscribers = [];
        try {
            const data = await store.get("subscribers", { type: "json" });
            if (data) subscribers = data;
        } catch (e) {
            // No existing data
        }

        const today = new Date().toDateString();
        const todayCount = subscribers.filter(sub =>
            new Date(sub.subscribedAt).toDateString() === today
        ).length;

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                total: subscribers.length,
                today: todayCount
            })
        };
    } catch (error) {
        console.error('Stats error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: 'Failed to load stats'
            })
        };
    }
};
