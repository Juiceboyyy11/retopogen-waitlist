// Subscribe function - stores emails in Netlify Blobs
const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: 'Method not allowed' })
        };
    }

    try {
        const { email } = JSON.parse(event.body);

        // Validate email
        if (!email || !email.includes('@')) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: 'Please enter a valid email address'
                })
            };
        }

        // Get the blob store
        const store = getStore("waitlist");

        // Get existing subscribers
        let subscribers = [];
        try {
            const data = await store.get("subscribers", { type: "json" });
            if (data) subscribers = data;
        } catch (e) {
            // No existing data
        }

        // Check if already subscribed
        if (subscribers.some(sub => sub.email.toLowerCase() === email.toLowerCase())) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: 'This email is already on the waitlist!'
                })
            };
        }

        // Add new subscriber
        const newSubscriber = {
            id: Date.now(),
            email: email.toLowerCase().trim(),
            subscribedAt: new Date().toISOString()
        };

        subscribers.push(newSubscriber);

        // Save to blob store
        await store.setJSON("subscribers", subscribers);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: "You're on the list! We'll be in touch soon.",
                position: subscribers.length
            })
        };
    } catch (error) {
        console.error('Subscribe error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: 'Something went wrong. Please try again.'
            })
        };
    }
};
