const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data file path
const dataDir = path.join(__dirname, 'data');
const subscribersFile = path.join(dataDir, 'subscribers.json');

// Ensure data directory and file exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(subscribersFile)) {
    fs.writeFileSync(subscribersFile, JSON.stringify([], null, 2));
}

// Helper functions
function getSubscribers() {
    try {
        const data = fs.readFileSync(subscribersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveSubscribers(subscribers) {
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
}

// API Routes

// Subscribe - Add new email
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    
    // Validate email
    if (!email || !email.includes('@')) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please enter a valid email address' 
        });
    }
    
    const subscribers = getSubscribers();
    
    // Check if already subscribed
    if (subscribers.some(sub => sub.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ 
            success: false, 
            message: 'This email is already on the waitlist!' 
        });
    }
    
    // Add new subscriber
    const newSubscriber = {
        id: Date.now(),
        email: email.toLowerCase().trim(),
        subscribedAt: new Date().toISOString()
    };
    
    subscribers.push(newSubscriber);
    saveSubscribers(subscribers);
    
    res.json({ 
        success: true, 
        message: 'You\'re on the list! We\'ll be in touch soon.',
        position: subscribers.length
    });
});

// Get all subscribers (for admin)
app.get('/api/subscribers', (req, res) => {
    const subscribers = getSubscribers();
    res.json({ 
        success: true, 
        subscribers: subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt))
    });
});

// Get stats
app.get('/api/stats', (req, res) => {
    const subscribers = getSubscribers();
    const today = new Date().toDateString();
    const todayCount = subscribers.filter(sub => 
        new Date(sub.subscribedAt).toDateString() === today
    ).length;
    
    res.json({ 
        success: true, 
        total: subscribers.length,
        today: todayCount
    });
});

// Delete subscriber (for admin)
app.delete('/api/subscribers/:id', (req, res) => {
    const { id } = req.params;
    let subscribers = getSubscribers();
    
    const initialLength = subscribers.length;
    subscribers = subscribers.filter(sub => sub.id !== parseInt(id));
    
    if (subscribers.length === initialLength) {
        return res.status(404).json({ 
            success: false, 
            message: 'Subscriber not found' 
        });
    }
    
    saveSubscribers(subscribers);
    res.json({ success: true, message: 'Subscriber removed' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🚀 Waitlist Server Running!                        ║
║                                                      ║
║   Landing Page:  http://localhost:${PORT}              ║
║   Admin Panel:   http://localhost:${PORT}/admin.html   ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
    `);
});
