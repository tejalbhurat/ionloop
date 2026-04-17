// IONLOOP Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Special handling for timeline to trigger flow line animation
                if (entry.target.classList.contains('timeline-container')) {
                    triggerTimelineAnimation();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // 2. Timeline Flow Animation
    function triggerTimelineAnimation() {
        const flowProgress = document.querySelector('.flow-progress');
        const steps = document.querySelectorAll('.step');
        
        // Check if mobile (vertical flow) or desktop (horizontal flow)
        const isMobile = window.innerWidth <= 768;
        
        setTimeout(() => {
            if(isMobile) {
                flowProgress.style.height = '100%';
            } else {
                flowProgress.style.width = '100%';
            }
            
            // Activate steps sequentially
            steps.forEach((step, index) => {
                setTimeout(() => {
                    step.classList.add('active');
                }, index * 400 + 300); // Staggered activation
            });
        }, 500);
    }

    // 3. AI Dashboard Switching Logic (Connected to Backend)
    const indicators = ['ind-solar', 'ind-battery', 'ind-h2'];

    async function fetchEnergyStatus() {
        try {
            const response = await fetch('http://localhost:3000/api/energy/status');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            // Update Live Data Grid
            document.getElementById('val-solar').textContent = `${data.solar} kWh`;
            document.getElementById('val-battery').textContent = `${data.battery} %`;
            document.getElementById('val-h2').textContent = `${data.hydrogen} %`;
            document.getElementById('val-demand').textContent = `${data.demand} kW`;
            
            // Update UI based on AI decision
            updateAIIndicator(data.activeEnergySource);
        } catch (error) {
            console.error('Failed to fetch energy status. Is the backend running?');
        }
    }

    async function fetchDashboardSummary() {
        try {
            const response = await fetch('http://localhost:3000/api/dashboard/summary');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            // Update Live Data Grid Highlight values
            document.getElementById('val-total').textContent = `${data.totalEnergyGenerated} kWh`;
            document.getElementById('val-efficiency').textContent = `${data.efficiency} %`;
        } catch (error) {
            console.error('Failed to fetch dashboard summary.');
        }
    }

    async function fetchAlerts() {
        try {
            const response = await fetch('http://localhost:3000/api/alerts');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data.alerts && data.alerts.length > 0) {
                data.alerts.forEach(alert => {
                    showToast(alert.message, alert.type);
                });
            }
        } catch (error) {
            console.error('Failed to fetch alerts.');
        }
    }

    function showToast(message, type) {
        // Prevent duplicate toasts
        const existingToasts = document.querySelectorAll('.toast');
        for(let t of existingToasts) {
            if(t.textContent === message) return;
        }

        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Trigger reflow and show
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    // Contact Form Handler (AJAX for FormSubmit)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    form.classList.add('hidden');
                    const successDiv = document.createElement('div');
                    successDiv.className = 'form-success';
                    successDiv.textContent = 'Message Received! We will contact you shortly.';
                    form.parentNode.appendChild(successDiv);
                }
            } catch (error) {
                console.error('Failed to submit form.');
            }
        });
    }

    function fetchAllBackendData() {
        fetchEnergyStatus();
        fetchDashboardSummary();
        fetchAlerts();
    }

    function updateAIIndicator(activeSource) {
        // Remove active class from all
        indicators.forEach(id => {
            document.getElementById(id).classList.remove('active');
        });

        // Add active class to current source
        if (activeSource === 'solar') document.getElementById('ind-solar').classList.add('active');
        if (activeSource === 'battery') document.getElementById('ind-battery').classList.add('active');
        if (activeSource === 'hydrogen') document.getElementById('ind-h2').classList.add('active');
        if (activeSource === 'combined') {
            document.getElementById('ind-solar').classList.add('active');
            document.getElementById('ind-battery').classList.add('active');
            document.getElementById('ind-h2').classList.add('active');
        }
    }

    // Initialize first fetch
    fetchAllBackendData();
    
    // Poll every 3 seconds
    setInterval(fetchAllBackendData, 3000);

    // 4. Smooth Scrolling for Navbar Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
