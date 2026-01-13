// Subscribe function - stores emails in Supabase
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, message: 'Method not allowed' })
        };
    }

    try {
        const { email } = JSON.parse(event.body);

        // Validate email
        if (!email || !email.includes('@')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Please enter a valid email address'
                })
            };
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if already subscribed
        const { data: existing } = await supabase
            .from('subscribers')
            .select('email')
            .eq('email', normalizedEmail)
            .single();

        if (existing) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'This email is already on the waitlist!'
                })
            };
        }

        // Add new subscriber
        const { error: insertError } = await supabase
            .from('subscribers')
            .insert([{ email: normalizedEmail }]);

        if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
        }

        // Get total count for position
        const { count } = await supabase
            .from('subscribers')
            .select('*', { count: 'exact', head: true });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: "You're on the list! We'll be in touch soon.",
                position: count || 1
            })
        };
    } catch (error) {
        console.error('Subscribe error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Something went wrong. Please try again.'
            })
        };
    }
};
