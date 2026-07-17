/* ================================================================
   GAME.JS — Aswad Muntasir Portfolio Quest Engine
   Optimized for speed + back navigation
   ================================================================ */
(function () {
    'use strict';

    /* ============================================================
       STATE
       ============================================================ */
    const STATE = {
        currentLevel: 0,
        maxLevel: 6,
        xp: 0,
        xpPerLevel: 100,
        soundOn: true,
        mapOpen: false,
        gameStarted: false,
        transitioning: false,
    };

    const LEVEL_NAMES = [
        'START', 'THE IDENTITY', 'THE JOURNEY', 'THE ARSENAL',
        'QUEST LOG', 'THE GALLERY', 'OPEN COMMS'
    ];

    /* ============================================================
       DOM REFS
       ============================================================ */
    const $ = (s, ctx) => (ctx || document).querySelector(s);
    const $$ = (s, ctx) => [...(ctx || document).querySelectorAll(s)];

    const dom = {
        hud: $('#hud'),
        xpBar: $('#xpBar'),
        xpLabel: $('#xpLabel'),
        levelBadge: $('#levelBadge'),
        backBtn: $('#backBtn'),
        soundToggle: $('#soundToggle'),
        mapToggle: $('#mapToggle'),
        mapClose: $('#mapClose'),
        minimap: $('#minimap'),
        levelUpOverlay: $('#levelUpOverlay'),
        levelUpSub: $('#levelUpSub'),
        lockOverlay: $('#lockOverlay'),
        scrollPrompt: $('#scrollPrompt'),
        startBtn: $('#startBtn'),
        backToStart: $('#backToStart'),
        scenes: $('#scenes'),
        canvas: $('#particles'),
    };

    const scenes = $$('.scene');

    /* ============================================================
       SOUND ENGINE (Web Audio API) — lazy init
       ============================================================ */
    let audioCtx;

    function ensureAudio() {
        if (!audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) audioCtx = new AC();
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playTone(freq, duration, type, vol) {
        if (!STATE.soundOn || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol || 0.06, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    const sfx = {
        click: () => playTone(800, 0.06, 'square', 0.04),
        start: () => {
            ensureAudio();
            playTone(440, 0.08, 'sine', 0.05);
            setTimeout(() => playTone(660, 0.08, 'sine', 0.05), 80);
            setTimeout(() => playTone(880, 0.1, 'sine', 0.05), 160);
        },
        levelUp: () => {
            playTone(523, 0.08, 'sine', 0.06);
            setTimeout(() => playTone(659, 0.08, 'sine', 0.06), 80);
            setTimeout(() => playTone(784, 0.08, 'sine', 0.06), 160);
            setTimeout(() => playTone(1047, 0.12, 'sine', 0.06), 240);
        },
        unlock: () => {
            playTone(600, 0.06, 'triangle', 0.04);
            setTimeout(() => playTone(900, 0.08, 'triangle', 0.04), 60);
        },
        back: () => playTone(400, 0.08, 'sine', 0.04),
        deny: () => playTone(200, 0.1, 'sawtooth', 0.03),
        hover: () => playTone(1200, 0.03, 'sine', 0.02),
    };

    /* ============================================================
       CUSTOM CURSOR
       ============================================================ */
    const dot = $('.c-dot');
    const ring = $('.c-ring');
    let mx = -100, my = -100, rx = -100, ry = -100;

    if (window.innerWidth > 768 && dot && ring) {
        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
        }, { passive: true });

        let ringRunning = true;
        function animRing() {
            if (!ringRunning) return;
            rx += (mx - rx) * 0.15;
            ry += (my - ry) * 0.15;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(animRing);
        }
        animRing();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                ringRunning = false;
            } else {
                ringRunning = true;
                animRing();
            }
        });

        const hoverTargets = 'a, button, .id-card, .weapon-card, .quest-card, .gallery-item, .comms-card, .extra-tag, .start-press, .hud-btn';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(hoverTargets)) ring.classList.add('hover');
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest(hoverTargets)) ring.classList.remove('hover');
        });
    }

    /* ============================================================
       PARTICLE CANVAS — Optimized
       ============================================================ */
    const canvas = dom.canvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let cW, cH;
    let particleCount = window.innerWidth < 768 ? 30 : 50;
    let resizeRaf = null;

    function resizeCanvas() {
        if (resizeRaf) return;
        resizeRaf = requestAnimationFrame(() => {
            cW = canvas.width = window.innerWidth;
            cH = canvas.height = window.innerHeight;
            resizeRaf = null;
        });
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createParticle() {
        return {
            x: Math.random() * cW,
            y: Math.random() * cH,
            size: Math.random() * 1.5 + 0.3,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.3 + 0.05,
        };
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) particles.push(createParticle());
    }

    initParticles();

    let particlesRunning = false;

    function animParticles() {
        if (!particlesRunning) return;
        ctx.clearRect(0, 0, cW, cH);
        const len = particles.length;
        const maxDist = 100;

        for (let i = 0; i < len; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > cW || p.y < 0 || p.y > cH) {
                p.x = Math.random() * cW;
                p.y = Math.random() * cH;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, 6.283);
            ctx.fillStyle = 'rgba(0,255,136,' + p.opacity + ')';
            ctx.fill();

            for (let j = i + 1; j < len; j++) {
                const dx = p.x - particles[j].x;
                const dy = p.y - particles[j].y;
                const dist = dx * dx + dy * dy;
                if (dist < maxDist * maxDist) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(0,255,136,' + (0.03 * (1 - Math.sqrt(dist) / maxDist)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animParticles);
    }

    function startParticles() {
        if (particlesRunning) return;
        particlesRunning = true;
        animParticles();
    }

    function stopParticles() {
        particlesRunning = false;
    }

    /* Pause/resume on tab visibility */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopParticles();
        } else {
            startParticles();
        }
    });

    /* ============================================================
       HUD UPDATE
       ============================================================ */
    function updateHUD() {
        const totalXP = STATE.maxLevel * STATE.xpPerLevel;
        const pct = Math.min((STATE.xp / totalXP) * 100, 100);
        dom.xpBar.style.width = pct + '%';
        dom.xpLabel.textContent = STATE.xp + ' / ' + totalXP + ' XP';
        dom.levelBadge.textContent = 'LV ' + STATE.currentLevel;

        $$('.mm-item').forEach(item => {
            const lvl = parseInt(item.dataset.level);
            item.classList.remove('active', 'visited');
            if (lvl === STATE.currentLevel) item.classList.add('active');
            else if (lvl < STATE.currentLevel) item.classList.add('visited');
        });
    }

    /* ============================================================
       LEVEL UP / LOCK
       ============================================================ */
    function showLevelUp(level) {
        STATE.transitioning = true;
        dom.levelUpSub.textContent = LEVEL_NAMES[level] || '';
        dom.levelUpOverlay.classList.add('show');
        sfx.levelUp();
        setTimeout(() => {
            dom.levelUpOverlay.classList.remove('show');
            STATE.transitioning = false;
        }, 800);
    }

    function showLock() {
        dom.lockOverlay.classList.add('show');
        sfx.deny();
        setTimeout(() => dom.lockOverlay.classList.remove('show'), 800);
    }

    /* ============================================================
       SCENE NAVIGATION
       ============================================================ */
    function goToScene(level, isBack) {
        if (STATE.transitioning) return;
        if (level < 0 || level > STATE.maxLevel) return;
        if (!isBack && level > STATE.currentLevel + 1) { showLock(); return; }

        const prevLevel = STATE.currentLevel;
        STATE.currentLevel = level;
        STATE.xp = level * STATE.xpPerLevel;

        scenes.forEach(s => s.classList.remove('active'));
        if (scenes[level]) scenes[level].classList.add('active');

        if (level > 0) dom.hud.classList.add('visible');
        else dom.hud.classList.remove('visible');

        if (level > 0 && level < STATE.maxLevel) dom.scrollPrompt.classList.add('visible');
        else dom.scrollPrompt.classList.remove('visible');

        if (level > prevLevel) showLevelUp(level);
        else if (isBack) sfx.back();

        updateHUD();
        if (level === 3) initArsenal();
    }

    function advanceLevel() {
        if (STATE.currentLevel < STATE.maxLevel) {
            goToScene(STATE.currentLevel + 1, false);
        }
    }

    function goBackLevel() {
        if (STATE.currentLevel > 0) {
            goToScene(STATE.currentLevel - 1, true);
        }
    }

    function restartQuest() {
        STATE.currentLevel = 0;
        STATE.xp = 0;
        STATE.gameStarted = false;
        STATE.transitioning = false;
        scenes.forEach(s => s.classList.remove('active'));
        scenes[0].classList.add('active');
        dom.hud.classList.remove('visible');
        dom.scrollPrompt.classList.remove('visible');
        stopParticles();
        updateHUD();
        sfx.back();
    }

    /* ============================================================
       SCENE 0: START
       ============================================================ */
    function startGame() {
        if (STATE.gameStarted) return;
        STATE.gameStarted = true;
        ensureAudio();
        sfx.start();
        startParticles();
        advanceLevel();
    }

    dom.startBtn.addEventListener('click', startGame);

    /* ============================================================
       SCENE 1: IDENTITY — Card flips
       ============================================================ */
    $$('.id-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('revealed');
            sfx.click();
        });
    });

    $('#scene1Check').addEventListener('click', () => {
        sfx.unlock();
        advanceLevel();
    });

    /* ============================================================
       SCENE 2: JOURNEY — Click nodes to unlock
       ============================================================ */
    const journeyNodes = $$('.journey-node');
    let nodesUnlocked = 0;

    journeyNodes.forEach(node => {
        node.addEventListener('click', () => {
            if (node.dataset.unlocked === 'true') return;
            node.dataset.unlocked = 'true';
            node.querySelector('.node-dot').classList.add('active');
            nodesUnlocked++;
            sfx.unlock();
            if (nodesUnlocked >= journeyNodes.length - 1) {
                $('#scene2Check').style.display = 'block';
            }
        });
    });

    $('#scene2Check').addEventListener('click', () => {
        sfx.unlock();
        advanceLevel();
    });

    /* ============================================================
       SCENE 3: ARSENAL — Animate skill bars
       ============================================================ */
    function initArsenal() {
        setTimeout(() => {
            $$('.weapon-card').forEach((card, i) => {
                setTimeout(() => card.classList.add('revealed'), i * 80);
            });
        }, 200);
    }

    $$('.weapon-card').forEach(card => {
        card.addEventListener('mouseenter', () => sfx.hover());
    });

    $('#scene3Check').addEventListener('click', () => {
        sfx.unlock();
        advanceLevel();
    });

    /* ============================================================
       SCENE 4: QUEST LOG — Click to expand
       ============================================================ */
    $$('.quest-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('active');
            sfx.click();
        });
    });

    $('#scene4Check').addEventListener('click', () => {
        sfx.unlock();
        advanceLevel();
    });

    /* ============================================================
       SCENE 5: GALLERY — Click effects
       ============================================================ */
    $$('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            sfx.click();
        });
    });

    $('#scene5Check').addEventListener('click', () => {
        sfx.unlock();
        advanceLevel();
    });

    /* ============================================================
       RESTART BUTTON
       ============================================================ */
    if (dom.backToStart) {
        dom.backToStart.addEventListener('click', () => {
            restartQuest();
        });
    }

    /* ============================================================
       BACK BUTTON
       ============================================================ */
    dom.backBtn.addEventListener('click', () => {
        goBackLevel();
    });

    /* ============================================================
       KEYBOARD CONTROLS
       ============================================================ */
    document.addEventListener('keydown', e => {
        if (STATE.transitioning) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (STATE.currentLevel === 0) startGame();
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            advanceLevel();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            goBackLevel();
        }
        if (e.key === 'Escape') {
            if (STATE.mapOpen) {
                STATE.mapOpen = false;
                dom.minimap.classList.remove('open');
            }
        }
    });

    /* ============================================================
       SCROLL TO ADVANCE / GO BACK
       ============================================================ */
    let scrollCooldown = false;

    window.addEventListener('wheel', e => {
        if (scrollCooldown || STATE.transitioning) return;
        if (e.deltaY > 20) {
            scrollCooldown = true;
            advanceLevel();
            setTimeout(() => scrollCooldown = false, 900);
        } else if (e.deltaY < -20) {
            scrollCooldown = true;
            goBackLevel();
            setTimeout(() => scrollCooldown = false, 900);
        }
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', e => {
        if (scrollCooldown || STATE.transitioning) return;
        const diff = touchStartY - e.changedTouches[0].clientY;
        if (diff > 40) {
            scrollCooldown = true;
            advanceLevel();
            setTimeout(() => scrollCooldown = false, 900);
        } else if (diff < -40) {
            scrollCooldown = true;
            goBackLevel();
            setTimeout(() => scrollCooldown = false, 900);
        }
    }, { passive: true });

    /* ============================================================
       MINIMAP
       ============================================================ */
    dom.mapToggle.addEventListener('click', () => {
        STATE.mapOpen = !STATE.mapOpen;
        dom.minimap.classList.toggle('open', STATE.mapOpen);
        sfx.click();
    });
    dom.mapClose.addEventListener('click', () => {
        STATE.mapOpen = false;
        dom.minimap.classList.remove('open');
        sfx.click();
    });

    /* Minimap level click to jump */
    $$('.mm-item').forEach(item => {
        item.addEventListener('click', () => {
            const lvl = parseInt(item.dataset.level);
            if (lvl <= STATE.currentLevel + 1) {
                goToScene(lvl, lvl < STATE.currentLevel);
                STATE.mapOpen = false;
                dom.minimap.classList.remove('open');
            } else {
                showLock();
            }
        });
    });

    /* ============================================================
       SOUND TOGGLE
       ============================================================ */
    dom.soundToggle.addEventListener('click', () => {
        STATE.soundOn = !STATE.soundOn;
        dom.soundToggle.innerHTML = STATE.soundOn
            ? '<i class="fas fa-volume-up"></i>'
            : '<i class="fas fa-volume-mute"></i>';
        if (STATE.soundOn) { ensureAudio(); sfx.click(); }
    });

    /* ============================================================
       INIT
       ============================================================ */
    goToScene(0, false);
    updateHUD();

})();
