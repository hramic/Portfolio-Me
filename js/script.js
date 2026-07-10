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

// ===== SECTION NAVIGATION =====
function navigateToSection(sectionIndex) {
    if (sectionIndex === currentSection && sections[sectionIndex].classList.contains('in-view')) return;
    currentSection = sectionIndex;

    sectionsWrapper.style.transform = `translateX(${-sectionIndex * 100}vw)`;

    navButtons.forEach((btn, index) => {
        btn.classList.toggle('active', index === sectionIndex);
    });

    // Reset reveals on inactive sections, trigger them on the target mid-slide
    sections.forEach((section, index) => {
        if (index !== sectionIndex) section.classList.remove('in-view');
    });
    setTimeout(() => {
        sections[sectionIndex].classList.add('in-view');
    }, 250);

    // Progress indicator
    progressFill.style.transform = `scaleX(${(sectionIndex + 1) / TOTAL_SECTIONS})`;
    progressCurrent.textContent = String(sectionIndex + 1).padStart(2, '0');
}

navButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => navigateToSection(index));
});

// ===== CONTACT OVERLAY =====
let contactActive = false;

function openContact() {
    contactActive = true;
    contactOverlay.classList.add('active');
    mainContainer.classList.add('hidden');
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

// ===== KEYBOARD / WHEEL / TOUCH NAVIGATION =====
document.addEventListener('keydown', (e) => {
    if (contactActive) return;

    if (e.key === 'ArrowRight' && currentSection < TOTAL_SECTIONS - 1) {
        navigateToSection(currentSection + 1);
    } else if (e.key === 'ArrowLeft' && currentSection > 0) {
        navigateToSection(currentSection - 1);
    }
});

let isScrolling = false;

window.addEventListener('wheel', (e) => {
    if (contactActive || isScrolling) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 50) return;

    isScrolling = true;

    if (delta > 0 && currentSection < TOTAL_SECTIONS - 1) {
        navigateToSection(currentSection + 1);
    } else if (delta < 0 && currentSection > 0) {
        navigateToSection(currentSection - 1);
    }

    setTimeout(() => { isScrolling = false; }, 1200);
});

let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    if (contactActive) return;

    const touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;

    if (touchStartX - touchEndX > swipeThreshold && currentSection < TOTAL_SECTIONS - 1) {
        navigateToSection(currentSection + 1);
    } else if (touchEndX - touchStartX > swipeThreshold && currentSection > 0) {
        navigateToSection(currentSection - 1);
    }
});

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
        if (e.target.closest(hoverSelector)) cursorRing.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverSelector)) cursorRing.classList.remove('hovering');
    });
})();

// ===== MAGNETIC ELEMENTS =====
(function initMagnetic() {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches || reducedMotion) return;

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
        const strength = 0.35;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transition = 'transform 0.1s ease-out';
            el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
            el.style.transform = 'translate(0, 0)';
        });
    });
})();

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

document.querySelectorAll('.decrypt-text').forEach((el) => {
    const effect = new DecryptEffect(el);
    setTimeout(() => effect.decrypt(), 1600);
    el.addEventListener('mouseenter', () => effect.decrypt());
});

// ===== THEME TOGGLE =====
const themeToggle = document.querySelector('.theme-toggle');
const toggleLabel = document.querySelector('.toggle-label');
const toggleEffect = new DecryptEffect(toggleLabel);

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
        navItem.className = 'project-nav-item';
        navItem.dataset.project = index;
        navItem.textContent = `PROJ ${String(index + 1).padStart(2, '0')}`;
        navItem.addEventListener('click', () => {
            if (index !== currentProject) {
                currentProject = index;
                updateProject();
            }
        });
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

// Keyboard navigation for projects (only on WORK section)
document.addEventListener('keydown', (e) => {
    if (currentSection !== 2 || contactActive) return;

    if (e.key === 'ArrowUp' && currentProject > 0) {
        currentProject--;
        updateProject();
    } else if (e.key === 'ArrowDown' && currentProject < PROJECTS.length - 1) {
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
