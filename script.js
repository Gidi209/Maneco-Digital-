(function() {
    // ========== THEME TOGGLE ==========
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else {
        html.setAttribute('data-theme', systemTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // ========== CANVAS FUTURISTA (com tema dinâmico) ==========
    const canvas = document.getElementById('futuristic-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let points = [];
        let animationId = null;
        let isTabActive = true;
        const maxDist = 150;
        let mouse = { x: null, y: null };

        function getThemeColors() {
            const isDark = html.getAttribute('data-theme') !== 'light';
            return {
                dot: isDark ? 'rgba(0, 191, 255, 0.8)' : 'rgba(0, 100, 200, 0.7)',
                line: isDark ? '0, 150, 255' : '0, 100, 200'
            };
        }

        function initCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const numPoints = window.innerWidth < 768 ? 50 : 80;
            points = [];
            for (let i = 0; i < numPoints; i++) {
                points.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }
        }

        function updatePoints() {
            for (let p of points) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                if (mouse.x && mouse.y) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const distMouse = Math.hypot(dx, dy);
                    if (distMouse < 100) {
                        p.x -= dx / 25;
                        p.y -= dy / 25;
                    }
                }
            }
        }

        function draw() {
            const colors = getThemeColors();
            for (let i = 0; i < points.length; i++) {
                ctx.beginPath();
                ctx.arc(points[i].x, points[i].y, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = colors.dot;
                ctx.fill();
                for (let j = i + 1; j < points.length; j++) {
                    const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
                    if (dist < maxDist) {
                        ctx.beginPath();
                        ctx.moveTo(points[i].x, points[i].y);
                        ctx.lineTo(points[j].x, points[j].y);
                        ctx.strokeStyle = `rgba(${colors.line}, ${0.15 * (1 - dist / maxDist)})`;
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            if (!isTabActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updatePoints();
            draw();
            animationId = requestAnimationFrame(animate);
        }

        function start() {
            if (animationId) cancelAnimationFrame(animationId);
            isTabActive = true;
            animate();
        }

        function stop() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            isTabActive = false;
        }

        window.addEventListener('resize', () => {
            initCanvas();
        });
        window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else start();
        });

        initCanvas();
        start();

        // Atualiza cores quando o tema mudar (sem recriar canvas)
        const observer = new MutationObserver(() => {
            // Força redraw no próximo frame
            if (animationId) {
                cancelAnimationFrame(animationId);
                animate();
            }
        });
        observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    }

    // ========== NAVBAR SCROLL EFFECT ==========
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ========== MOBILE MENU ==========
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const expanded = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', expanded);
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ========== SCROLL REVEAL ==========
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // ========== SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========== BACK TO TOP BUTTON ==========
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();

