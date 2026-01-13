// Get subscribers function - for admin dashboard (Supabase)
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, message: 'Method not allowed' })
        };
    }

    try {
        const { data: subscribers, error } = await supabase
            .from('subscribers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                subscribers: subscribers || []
            })
        };
    } catch (error) {
        console.error('Get subscribers error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Failed to load subscribers'
            })
        };
    }
};
