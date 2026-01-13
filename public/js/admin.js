// Admin dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const totalSubscribers = document.getElementById('total-subscribers');
    const todaySubscribers = document.getElementById('today-subscribers');
    const subscribersBody = document.getElementById('subscribers-body');
    const tableCount = document.getElementById('table-count');
    const emptyState = document.getElementById('empty-state');
    const refreshBtn = document.getElementById('refresh-btn');
    const exportBtn = document.getElementById('export-btn');
    const tableWrapper = document.querySelector('.table-wrapper');

    // Load data on page load
    loadData();

    // Refresh button
    refreshBtn.addEventListener('click', () => {
        refreshBtn.querySelector('span').style.animation = 'spin 0.5s linear';
        loadData();
        setTimeout(() => {
            refreshBtn.querySelector('span').style.animation = '';
        }, 500);
    });

    // Export button
    exportBtn.addEventListener('click', exportToCSV);

    // Load all data
    async function loadData() {
        await Promise.all([loadStats(), loadSubscribers()]);
    }

    // Load stats
    async function loadStats() {
        try {
            const response = await fetch('/.netlify/functions/stats');
            const data = await response.json();

            if (data.success) {
                animateCounter(totalSubscribers, data.total);
                animateCounter(todaySubscribers, data.today);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    // Load subscribers
    async function loadSubscribers() {
        try {
            const response = await fetch('/.netlify/functions/subscribers');
            const data = await response.json();

            if (data.success) {
                renderSubscribers(data.subscribers);
            }
        } catch (error) {
            console.error('Failed to load subscribers:', error);
        }
    }

    // Render subscribers table
    function renderSubscribers(subscribers) {
        if (subscribers.length === 0) {
            tableWrapper.style.display = 'none';
            emptyState.style.display = 'block';
            tableCount.textContent = '0 subscribers';
            return;
        }

        tableWrapper.style.display = 'block';
        emptyState.style.display = 'none';
        tableCount.textContent = `${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''}`;

        subscribersBody.innerHTML = subscribers.map((sub, index) => `
            <tr>
                <td>${subscribers.length - index}</td>
                <td class="email-cell">${escapeHtml(sub.email)}</td>
                <td class="date-cell">${formatDate(sub.subscribedAt)}</td>
                <td>
                    <button class="copy-btn" data-email="${escapeHtml(sub.email)}" title="Copy email">
                        📋 Copy
                    </button>
                </td>
            </tr>
        `).join('');

        // Add copy handlers
        subscribersBody.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const email = e.target.dataset.email;
                try {
                    await navigator.clipboard.writeText(email);
                    e.target.textContent = '✓ Copied!';
                    setTimeout(() => {
                        e.target.textContent = '📋 Copy';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            });
        });
    }

    // Export to CSV
    async function exportToCSV() {
        try {
            const response = await fetch('/.netlify/functions/subscribers');
            const data = await response.json();

            if (!data.success || data.subscribers.length === 0) {
                alert('No subscribers to export');
                return;
            }

            const csv = [
                ['Email', 'Subscribed At'],
                ...data.subscribers.map(sub => [
                    sub.email,
                    new Date(sub.subscribedAt).toLocaleString()
                ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export:', error);
            alert('Failed to export subscribers');
        }
    }

    // Animate counter
    function animateCounter(element, target) {
        const current = parseInt(element.textContent) || 0;
        const increment = target > current ? 1 : -1;
        const duration = 500;
        const steps = Math.abs(target - current);
        const stepTime = steps > 0 ? duration / steps : 0;

        if (steps === 0) {
            element.textContent = target;
            return;
        }

        let count = current;
        const timer = setInterval(() => {
            count += increment;
            element.textContent = count;

            if (count === target) {
                clearInterval(timer);
            }
        }, Math.max(stepTime, 20));
    }

    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // Less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }
        // Less than 1 hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins} min${mins !== 1 ? 's' : ''} ago`;
        }
        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }
        // Otherwise show full date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
