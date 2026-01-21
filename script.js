// ============================================
// MULTIVERSE PORTFOLIO - INTERACTIVE STARS
// ============================================

// ===== INTERACTIVE STARS SYSTEM =====
class StarField {
    constructor() {
        this.canvas = document.getElementById('starsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.colors = [
            '#a855f7', // Purple
            '#22d3ee', // Cyan
            '#ec4899', // Pink
            '#3b82f6', // Blue
            '#f0f9ff', // White
            '#c084fc', // Light Purple
        ];
        
        this.init();
        this.animate();
        this.addEventListeners();
    }
    
    init() {
        this.resize();
        this.createStars();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createStars() {
        const numberOfStars = Math.floor((this.canvas.width * this.canvas.height) / 8000);
        this.stars = [];
        
        for (let i = 0; i < numberOfStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                baseRadius: Math.random() * 2 + 0.5,
                radius: Math.random() * 2 + 0.5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                velocity: {
                    x: (Math.random() - 0.5) * 0.3,
                    y: (Math.random() - 0.5) * 0.3
                },
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                isHovered: false,
                glowIntensity: 0,
                originalX: 0,
                originalY: 0
            });
            
            // Store original position
            this.stars[i].originalX = this.stars[i].x;
            this.stars[i].originalY = this.stars[i].y;
        }
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createStars();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Touch support
        window.addEventListener('touchmove', (e) => {
            this.mouse.x = e.touches[0].clientX;
            this.mouse.y = e.touches[0].clientY;
        });
        
        window.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    drawStar(star) {
        this.ctx.beginPath();
        
        // Calculate distance from mouse
        if (this.mouse.x !== null && this.mouse.y !== null) {
            const dx = star.x - this.mouse.x;
            const dy = star.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.mouse.radius) {
                // Star is within hover radius
                star.isHovered = true;
                const intensity = 1 - (distance / this.mouse.radius);
                star.glowIntensity = Math.min(star.glowIntensity + 0.1, intensity);
                
                // Expand radius on hover
                star.radius = star.baseRadius + (intensity * 4);
                
                // Push stars away from cursor slightly
                const angle = Math.atan2(dy, dx);
                const pushForce = (this.mouse.radius - distance) * 0.02;
                star.x += Math.cos(angle) * pushForce;
                star.y += Math.sin(angle) * pushForce;
                
                // Draw glow effect
                const gradient = this.ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, star.radius * 8
                );
                gradient.addColorStop(0, star.color);
                gradient.addColorStop(0.3, star.color + '80');
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = gradient;
                this.ctx.arc(star.x, star.y, star.radius * 8, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw connection lines to nearby hovered stars
                this.stars.forEach(otherStar => {
                    if (otherStar !== star && otherStar.isHovered) {
                        const odx = star.x - otherStar.x;
                        const ody = star.y - otherStar.y;
                        const odist = Math.sqrt(odx * odx + ody * ody);
                        
                        if (odist < 150) {
                            this.ctx.beginPath();
                            this.ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 * (1 - odist / 150)})`;
                            this.ctx.lineWidth = 0.5;
                            this.ctx.moveTo(star.x, star.y);
                            this.ctx.lineTo(otherStar.x, otherStar.y);
                            this.ctx.stroke();
                        }
                    }
                });
            } else {
                star.isHovered = false;
                star.glowIntensity = Math.max(star.glowIntensity - 0.05, 0);
                star.radius = star.baseRadius;
                
                // Return to original position slowly
                star.x += (star.originalX - star.x) * 0.02;
                star.y += (star.originalY - star.y) * 0.02;
            }
        } else {
            star.isHovered = false;
            star.glowIntensity = Math.max(star.glowIntensity - 0.05, 0);
            star.radius = star.baseRadius;
            star.x += (star.originalX - star.x) * 0.02;
            star.y += (star.originalY - star.y) * 0.02;
        }
        
        // Twinkle effect
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.5 + 0.5;
        const opacity = 0.3 + twinkle * 0.7;
        
        // Draw the star
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = star.color;
        this.ctx.globalAlpha = opacity;
        this.ctx.fill();
        
        // Add subtle glow for all stars
        if (star.glowIntensity > 0 || star.radius > 1.5) {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color + '40';
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    updateStars() {
        this.stars.forEach(star => {
            // Subtle floating movement
            star.originalX += star.velocity.x;
            star.originalY += star.velocity.y;
            
            // Wrap around edges
            if (star.originalX < 0) star.originalX = this.canvas.width;
            if (star.originalX > this.canvas.width) star.originalX = 0;
            if (star.originalY < 0) star.originalY = this.canvas.height;
            if (star.originalY > this.canvas.height) star.originalY = 0;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateStars();
        this.stars.forEach(star => this.drawStar(star));
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize star field when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new StarField();
});

// ===== ORIGINAL PORTFOLIO SCRIPTS =====

window.addEventListener("load", () => {
    const animations = [
        { selector: ".top-tags", class: "from-top", delay: 0 },
        { selector: ".left h1", class: "from-left", delay: 0.3 },
        { selector: ".desc", class: "from-left", delay: 0.6 },
        { selector: ".live-line", class: "from-bottom", delay: 0.9 },
        { selector: ".buttons", class: "zoom-in", delay: 1.2 },
        { selector: ".site-link", class: "from-bottom", delay: 1.5 },
        { selector: ".right", class: "from-right", delay: 0.6 },
        { selector: ".stats", class: "from-bottom", delay: 1.8 },
    ];

    animations.forEach(item => {
        const el = document.querySelector(item.selector);
        if (el) {
            el.style.animationDelay = `${item.delay}s`;
            el.classList.add(item.class);
        }
    });

    // ===== HIDE INTRO =====
    setTimeout(() => {
        const intro = document.getElementById("intro");
        const site = document.getElementById("real-site");

        intro.classList.add("smooth-out");

        setTimeout(() => {
            intro.style.display = "none";
            site.style.display = "block";
            initScrollAnimations();
        }, 1200);
    }, 3800);
});

// ===============================
// SCROLL REVEAL (SECTIONS)
// ===============================
function initScrollAnimations() {
    const elements = document.querySelectorAll(
        ".slide-in-left, .slide-in-right, .slide-in-up"
    );

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translate(0)";
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );

    elements.forEach(el => observer.observe(el));
}

// ===============================
// ACTIVE NAV HIGHLIGHT
// ===============================
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".ul-list li");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute("id");
        }
    });

    navItems.forEach(item => {
        item.classList.remove("active");

        const link = item.querySelector("a");
        if (link && link.getAttribute("href") === `#${current}`) {
            item.classList.add("active");
        }
    });
});

// ===============================
// SMOOTH SCROLL
// ===============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            window.scrollTo({
                top: target.offsetTop - 120,
                behavior: "smooth"
            });
        }
    });
});

// ===============================
// MULTIVERSE PORTAL EFFECT ON CURSOR
// ===============================
document.addEventListener('mousemove', (e) => {
    const portal = document.querySelector('.multiverse-bg');
    if (portal) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        portal.style.background = `
            radial-gradient(ellipse at ${20 + x * 10}% ${20 + y * 10}%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at ${80 - x * 10}% ${80 - y * 10}%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at ${50 + x * 5}% ${50 + y * 5}%, rgba(236, 72, 153, 0.08) 0%, transparent 60%),
            linear-gradient(180deg, #030014 0%, #0a0020 50%, #030014 100%)
        `;
    }
});