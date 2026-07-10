// ===== ELEMENTS =====
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const sectionsWrapper = document.getElementById('sectionsWrapper');
const contactBtn = document.getElementById('contactBtn');
const contactClose = document.getElementById('contactClose');
const contactOverlay = document.getElementById('contactOverlay');
const mainContainer = document.getElementById('mainContainer');
const progressFill = document.getElementById('progressFill');
const progressCurrent = document.getElementById('progressCurrent');

const TOTAL_SECTIONS = sections.length;
let currentSection = 0;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== PRELOADER =====
const preloader = document.getElementById('preloader');
const preloaderCounter = document.getElementById('preloaderCounter');
const homeSection = sections[0];

// Reveals wait for the preloader; re-added when it finishes.
homeSection.classList.remove('in-view');

(function runPreloader() {
    let finished = false;

    function finish() {
        if (finished) return;
        finished = true;
        preloaderCounter.textContent = '100';
        preloader.classList.add('done');
        homeSection.classList.add('in-view');
        setTimeout(() => preloader.remove(), 1000);
    }

    if (reducedMotion) {
        finish();
        return;
    }

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
        if (finished) return;
        const t = Math.min((now - start) / duration, 1);
        // ease-out so the counter rushes early and settles late
        const eased = 1 - Math.pow(1 - t, 3);
        preloaderCounter.textContent = String(Math.round(eased * 100)).padStart(2, '0');

        if (t < 1) {
            requestAnimationFrame(tick);
        } else {
            finish();
        }
    }
    requestAnimationFrame(tick);

    // rAF is suspended in background tabs — make sure the site
    // still opens if the page loads while not visible.
    setTimeout(finish, duration + 600);
})();

// ===== SECTION NAVIGATION (vertical scroll) =====
function setActiveSection(index) {
    if (index === currentSection) return;
    currentSection = index;

    navButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    progressFill.style.transform = `scaleX(${(index + 1) / TOTAL_SECTIONS})`;
    progressCurrent.textContent = String(index + 1).padStart(2, '0');
}

navButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        sections[index].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        decryptAll(sections[index]);
    });
});

// Reveal animations re-run whenever a section (or the footer) enters the viewport
const revealTargets = [...sections, document.getElementById('footer')].filter(Boolean);

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        // home reveals are triggered by the preloader on first load
        if (entry.target === homeSection && document.getElementById('preloader')) return;

        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        } else {
            entry.target.classList.remove('in-view');
        }
    });
}, { threshold: 0.2 });

revealTargets.forEach((el) => revealObserver.observe(el));

// ===== CONTACT OVERLAY =====
let contactActive = false;

function openContact() {
    contactActive = true;
    contactOverlay.classList.add('active');
    mainContainer.classList.add('hidden');
    decryptAll(contactOverlay);
}

function closeContact() {
    contactActive = false;
    contactOverlay.classList.remove('active');
    mainContainer.classList.remove('hidden');
}

contactBtn.addEventListener('click', () => {
    if (!contactActive) openContact();
});

contactClose.addEventListener('click', closeContact);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactActive) closeContact();
});

// ===== SCROLL EFFECTS (progress bar, parallax, marquee skew) =====
(function initScrollEffects() {
    const scrollProgress = document.getElementById('scrollProgress');
    const homeContent = document.querySelector('.home-content');
    const ghosts = document.querySelectorAll('.section-ghost');
    const marquee = document.querySelector('.marquee');

    let lastY = window.scrollY;
    let targetSkew = 0;
    let skew = 0;
    let ticking = false;

    // Fixed header hides when scrolling down, returns on any upward scroll
    const headerEls = [
        document.querySelector('.nav'),
        document.querySelector('.theme-toggle'),
        contactBtn
    ].filter(Boolean);

    function updateHeader(y, prevY) {
        if (y < 120 || y < prevY - 3) {
            headerEls.forEach((el) => el.classList.remove('ui-hidden'));
        } else if (y > prevY + 3) {
            headerEls.forEach((el) => el.classList.add('ui-hidden'));
        }
    }

    function apply() {
        ticking = false;
        const y = window.scrollY;
        const prevY = lastY;
        lastY = y;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollProgress) {
            scrollProgress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        }

        updateHeader(y, prevY);

        // nav + progress follow whichever section covers the viewport center
        // (measured directly so it also works for sections taller than the screen)
        const mid = window.innerHeight / 2;
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= mid && rect.bottom >= mid) setActiveSection(index);
        });

        if (reducedMotion) return;

        // hero drifts up slower than the page and fades out
        homeContent.style.transform = `translateY(${y * 0.18}px)`;
        homeContent.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.9)));

        // ghost titles drift against the scroll
        ghosts.forEach((ghost) => {
            const rect = ghost.parentElement.getBoundingClientRect();
            const p = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
            ghost.style.setProperty('--par', `${(p * 90).toFixed(1)}px`);
        });

        targetSkew = Math.max(-8, Math.min(8, (y - prevY) * 0.35));
    }

    window.addEventListener('scroll', () => {
        // rAF is suspended in hidden tabs; run synchronously there so
        // the ticking flag can't get stuck
        if (document.hidden) {
            apply();
            return;
        }
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(apply);
        }
    }, { passive: true });

    window.addEventListener('resize', apply, { passive: true });

    // marquee leans with the scroll velocity, then settles
    if (!reducedMotion && marquee) {
        (function skewLoop() {
            skew += (targetSkew - skew) * 0.12;
            targetSkew *= 0.88;
            marquee.style.transform = `skewX(${skew.toFixed(3)}deg)`;
            requestAnimationFrame(skewLoop);
        })();
    }

    apply();
})();

// ===== FOOTER =====
const footerContact = document.getElementById('footerContact');
const backToTop = document.getElementById('backToTop');

if (footerContact) {
    footerContact.addEventListener('click', () => {
        if (!contactActive) openContact();
    });
}

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
}

// ===== CUSTOM CURSOR =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

(function initCursor() {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches || reducedMotion) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.body.classList.add('has-cursor');
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }, { passive: true });

    function renderRing() {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(renderRing);
    }
    renderRing();

    const hoverSelector = 'a, button, [data-hover], .project-nav-item';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverSelector)) {
            cursorRing.classList.add('hovering');
            cursorDot.classList.add('hovering');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverSelector)) {
            cursorRing.classList.remove('hovering');
            cursorDot.classList.remove('hovering');
        }
    });
})();

// ===== MAGNETIC ELEMENTS =====
const magneticEnabled = !window.matchMedia('(hover: none), (pointer: coarse)').matches && !reducedMotion;

// Writes --mx/--my custom properties instead of an inline transform so
// state classes like .ui-hidden keep full control of the transform.
function magnetize(el) {
    if (!magneticEnabled || el.dataset.magnetized) return;
    el.dataset.magnetized = 'true';

    const strength = 0.28;

    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - rect.left - rect.width / 2) * strength).toFixed(1)}px`);
        el.style.setProperty('--my', `${((e.clientY - rect.top - rect.height / 2) * strength).toFixed(1)}px`);
    });

    el.addEventListener('mouseleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
    });
}

document.querySelectorAll('[data-magnetic]').forEach(magnetize);

// ===== LIVE CLOCK =====
(function initClock() {
    const clockTime = document.getElementById('clockTime');

    function updateClock() {
        clockTime.textContent = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Sarajevo'
        }).format(new Date());
    }

    updateClock();
    setInterval(updateClock, 10000);
})();

// ===== DECRYPT EFFECT =====
class DecryptEffect {
    constructor(element) {
        this.element = element;
        this.text = element.getAttribute('data-text');
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.running = false;
    }

    decrypt() {
        if (this.running) return;
        this.running = true;
        this.text = this.element.getAttribute('data-text');

        let iteration = 0;
        const interval = setInterval(() => {
            this.element.textContent = this.text
                .split('')
                .map((char, index) => {
                    if (index < iteration) return this.text[index];
                    if (char === ' ') return ' ';
                    return this.chars[Math.floor(Math.random() * this.chars.length)];
                })
                .join('');

            if (iteration >= this.text.length) {
                clearInterval(interval);
                this.element.textContent = this.text;
                this.running = false;
            }
            iteration += 0.5;
        }, 40);
    }
}

const decryptEffects = new Map();

function registerDecrypt(el) {
    if (decryptEffects.has(el)) return decryptEffects.get(el);
    const effect = new DecryptEffect(el);
    decryptEffects.set(el, effect);
    el.addEventListener('mouseenter', () => effect.decrypt());
    return effect;
}

document.querySelectorAll('.decrypt-text').forEach((el) => {
    const effect = registerDecrypt(el);
    setTimeout(() => effect.decrypt(), 1600);
});

// Scramble every decrypt element inside a container (nav clicks, contact open, ...)
function decryptAll(root) {
    (root || document).querySelectorAll('.decrypt-text').forEach((el) => {
        const effect = decryptEffects.get(el);
        if (effect) effect.decrypt();
    });
}

// ===== THEME TOGGLE =====
const themeToggle = document.querySelector('.theme-toggle');
const toggleLabel = document.querySelector('.toggle-label');
const toggleEffect = decryptEffects.get(toggleLabel) || new DecryptEffect(toggleLabel);

function setThemeLabel(theme, animate) {
    const text = theme === 'dark' ? 'DARK MODE' : 'LIGHT MODE';
    toggleLabel.setAttribute('data-text', text);
    if (animate) {
        toggleEffect.decrypt();
    } else {
        toggleLabel.textContent = text;
    }
}

const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
}
setThemeLabel(currentTheme, false);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    setThemeLabel(theme, true);
});

// ===== PROJECT SHOWCASE =====
const projectsSlider = document.getElementById('projectsSlider');
const projectNavTop = document.getElementById('projectNavTop');
const projectCounter = document.getElementById('projectCounter');
const projectShowcase = document.getElementById('projectShowcase');
const prevProjectBtn = document.getElementById('prevProject');
const nextProjectBtn = document.getElementById('nextProject');
const workDescription = document.getElementById('workDescription');
const workProjectTitle = document.getElementById('workProjectTitle');
const workGhost = document.getElementById('workGhost');

let currentProject = 0;

function renderProjects() {
    projectsSlider.innerHTML = '';
    projectNavTop.innerHTML = '';

    PROJECTS.forEach((project, index) => {
        // Slide with a browser-window style card
        const slide = document.createElement('div');
        slide.className = 'project-slide';

        const card = document.createElement('div');
        card.className = 'project-card';

        const bar = document.createElement('div');
        bar.className = 'project-card-bar';

        const dots = document.createElement('span');
        dots.className = 'card-dots';
        dots.innerHTML = '<i></i><i></i><i></i>';

        const file = document.createElement('span');
        file.className = 'card-file';
        file.textContent = project.image.split('/').pop();

        const cardIndex = document.createElement('span');
        cardIndex.className = 'card-index';
        cardIndex.textContent = String(index + 1).padStart(2, '0');

        bar.append(dots, file, cardIndex);

        const media = document.createElement('div');
        media.className = 'project-card-media';

        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.title;
        img.className = 'project-image';
        img.loading = 'lazy';
        img.addEventListener('error', () => {
            media.innerHTML = `<div class="project-placeholder"><span>${project.title}</span><span class="placeholder-note">image not found</span></div>`;
        });

        media.appendChild(img);
        card.append(bar, media);
        slide.appendChild(card);
        projectsSlider.appendChild(slide);

        // Top nav item
        const navItem = document.createElement('span');
        navItem.className = 'project-nav-item decrypt-text';
        navItem.dataset.project = index;
        navItem.textContent = `PROJ ${String(index + 1).padStart(2, '0')}`;
        navItem.dataset.text = navItem.textContent;
        navItem.addEventListener('click', () => {
            if (index !== currentProject) {
                currentProject = index;
                updateProject();
            }
        });
        registerDecrypt(navItem);
        magnetize(navItem);
        projectNavTop.appendChild(navItem);
    });

    if (currentProject >= PROJECTS.length) {
        currentProject = Math.max(0, PROJECTS.length - 1);
    }
    updateProject(true);
}

function updateProject(instant = false) {
    const slides = projectsSlider.querySelectorAll('.project-slide');
    const navItems = projectNavTop.querySelectorAll('.project-nav-item');
    const total = PROJECTS.length;

    projectsSlider.style.transform = `translateX(${-currentProject * 100}%)`;

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentProject);
    });

    navItems.forEach((item, index) => {
        item.classList.toggle('active', index === currentProject);
    });

    // Title + description swap with a small fade
    function setDescription() {
        if (PROJECTS[currentProject]) {
            workProjectTitle.textContent = PROJECTS[currentProject].title;
            workDescription.innerHTML = PROJECTS[currentProject].description;
        }
        workProjectTitle.classList.remove('switching');
        workDescription.classList.remove('switching');
    }

    if (instant || reducedMotion) {
        setDescription();
    } else {
        workProjectTitle.classList.add('switching');
        workDescription.classList.add('switching');
        setTimeout(setDescription, 300);
    }

    // Ghost background number follows the active project
    const ghostText = String(currentProject + 1).padStart(2, '0');
    if (instant || reducedMotion) {
        workGhost.textContent = ghostText;
    } else if (workGhost.textContent !== ghostText) {
        workGhost.classList.add('switching');
        setTimeout(() => {
            workGhost.textContent = ghostText;
            workGhost.classList.remove('switching');
        }, 350);
    }

    projectCounter.textContent = total
        ? `${String(currentProject + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
        : '';

    prevProjectBtn.disabled = currentProject === 0;
    nextProjectBtn.disabled = currentProject >= total - 1;
}

prevProjectBtn.addEventListener('click', () => {
    if (currentProject > 0) {
        currentProject--;
        updateProject();
    }
});

nextProjectBtn.addEventListener('click', () => {
    if (currentProject < PROJECTS.length - 1) {
        currentProject++;
        updateProject();
    }
});

// 3D tilt on the active project image
(function initTilt() {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches || reducedMotion) return;

    projectShowcase.addEventListener('mousemove', (e) => {
        const card = projectsSlider.querySelectorAll('.project-slide')[currentProject]
            ?.querySelector('.project-card');
        if (!card) return;

        const rect = projectShowcase.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });

    projectShowcase.addEventListener('mouseleave', () => {
        const card = projectsSlider.querySelectorAll('.project-slide')[currentProject]
            ?.querySelector('.project-card');
        if (card) card.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
})();

renderProjects();

// ===== ADMIN HELPER PANEL =====
// Hidden helper for adding projects: open the site with #admin in the URL
// or press Ctrl+Shift+A. It only previews locally and generates the
// projects.js content to commit — nothing is persisted for visitors.
const adminPanel = document.getElementById('adminPanel');

function generateProjectsFile() {
    const entries = PROJECTS.map(p =>
        '    {\n' +
        `        title: ${JSON.stringify(p.title)},\n` +
        `        image: ${JSON.stringify(p.image)},\n` +
        `        description: ${JSON.stringify(p.description)}\n` +
        '    }'
    ).join(',\n');

    return '// ===== PROJECT DATA =====\n' +
        '// Single source of truth for the WORK section.\n' +
        '// To add a new project: drop the image into /img and add an entry here\n' +
        '// (or open the site with #admin in the URL and use the helper panel).\n' +
        'const PROJECTS = [\n' + entries + '\n];\n';
}

function toggleAdmin(show) {
    adminPanel.hidden = !show;
    if (show) {
        document.getElementById('adminOutput').value = generateProjectsFile();
    }
}

if (adminPanel) {
    if (window.location.hash === '#admin') toggleAdmin(true);

    window.addEventListener('hashchange', () => {
        toggleAdmin(window.location.hash === '#admin');
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            toggleAdmin(adminPanel.hidden);
        }
    });

    document.getElementById('adminClose').addEventListener('click', () => toggleAdmin(false));

    document.getElementById('adminPreviewBtn').addEventListener('click', () => {
        const title = document.getElementById('adminProjTitle').value.trim();
        const image = document.getElementById('adminProjImage').value.trim();
        const description = document.getElementById('adminProjDesc').value.trim();

        if (!title || !image || !description) {
            alert('Fill in title, image path and description first.');
            return;
        }

        PROJECTS.push({ title, image, description });
        currentProject = PROJECTS.length - 1;
        renderProjects();
        document.getElementById('adminOutput').value = generateProjectsFile();
    });

    document.getElementById('adminCopyBtn').addEventListener('click', async () => {
        const output = document.getElementById('adminOutput');
        output.value = generateProjectsFile();
        output.select();
        try {
            await navigator.clipboard.writeText(output.value);
        } catch (_) {
            document.execCommand('copy');
        }
    });
}
