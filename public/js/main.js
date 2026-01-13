// Main landing page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('waitlist-form');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');
    const subscriberCount = document.getElementById('subscriber-count');

    // Load initial stats
    loadStats();

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email) return;

        // SECRET: Type "admin" to access admin panel
        if (email.toLowerCase() === 'admin') {
            window.location.href = '/admin.html';
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        formMessage.textContent = '';
        formMessage.className = 'form-message';

        try {
            const response = await fetch('/.netlify/functions/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                formMessage.textContent = data.message;
                formMessage.className = 'form-message success';
                emailInput.value = '';

                // Update counter with animation
                animateCounter(subscriberCount, data.position);

                // Show confetti effect
                celebrateSuccess();
            } else {
                formMessage.textContent = data.message;
                formMessage.className = 'form-message error';
            }
        } catch (error) {
            formMessage.textContent = 'Something went wrong. Please try again.';
            formMessage.className = 'form-message error';
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    // Load stats from API
    async function loadStats() {
        try {
            const response = await fetch('/.netlify/functions/stats');
            const data = await response.json();

            if (data.success) {
                animateCounter(subscriberCount, data.total);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
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

    // Simple celebration effect
    function celebrateSuccess() {
        const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#22c55e'];

        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                top: 50%;
                left: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confetti-fall 1.5s ease-out forwards;
            `;

            const angle = (Math.PI * 2 * i) / 30;
            const velocity = 100 + Math.random() * 200;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - 200;

            confetti.style.setProperty('--tx', `${tx}px`);
            confetti.style.setProperty('--ty', `${ty}px`);

            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 1500);
        }
    }

    // Add confetti animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti-fall {
            0% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translate(var(--tx), var(--ty)) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
