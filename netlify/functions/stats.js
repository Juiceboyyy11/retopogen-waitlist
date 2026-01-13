// Get stats function - uses Supabase
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
        // Get total count
        const { count: total } = await supabase
            .from('subscribers')
            .select('*', { count: 'exact', head: true });

        // Get today's count
        const today = new Date().toISOString().split('T')[0];
        const { count: todayCount } = await supabase
            .from('subscribers')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                total: total || 0,
                today: todayCount || 0
            })
        };
    } catch (error) {
        console.error('Stats error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Failed to load stats'
            })
        };
    }
};
