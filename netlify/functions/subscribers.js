// Get subscribers function - for admin dashboard
const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
    // Only allow GET
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

        // Sort by date (newest first)
        subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                subscribers
            })
        };
    } catch (error) {
        console.error('Get subscribers error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: 'Failed to load subscribers'
            })
        };
    }
};
