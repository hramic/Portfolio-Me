// Navigation functionality
const navButtons = document.querySelectorAll('.nav-btn');
const sectionsWrapper = document.getElementById('sectionsWrapper');
const contactBtn = document.getElementById('contactBtn');
const contactClose = document.getElementById('contactClose');
const contactOverlay = document.getElementById('contactOverlay');
const mainContainer = document.getElementById('mainContainer');

let currentSection = 0;

// Navigate to section
function navigateToSection(sectionIndex) {
    currentSection = sectionIndex;
    const translateX = -sectionIndex * 100;
    sectionsWrapper.style.transform = `translateX(${translateX}vw)`;
    
    // Update active nav button
    navButtons.forEach((btn, index) => {
        if (index === sectionIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Nav button click handlers
navButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        navigateToSection(index);
    });
});

// Contact button functionality
let contactActive = false;

function openContact() {
    contactActive = true;
    contactBtn.classList.add('active');
    contactOverlay.classList.add('active');
    mainContainer.classList.add('hidden');
}

function closeContact() {
    contactActive = false;
    contactBtn.classList.remove('active');
    contactOverlay.classList.remove('active');
    mainContainer.classList.remove('hidden');
}

contactBtn.addEventListener('click', () => {
    if (!contactActive) {
        openContact();
    }
});

contactClose.addEventListener('click', () => {
    closeContact();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (contactActive) return;
    
    if (e.key === 'ArrowRight' && currentSection < 2) {
        navigateToSection(currentSection + 1);
    } else if (e.key === 'ArrowLeft' && currentSection > 0) {
        navigateToSection(currentSection - 1);
    }
});

// Smooth scroll with mouse wheel (optional enhancement)
let isScrolling = false;

window.addEventListener('wheel', (e) => {
    if (contactActive || isScrolling) return;
    
    isScrolling = true;
    
    if (e.deltaX > 50 && currentSection < 2) {
        navigateToSection(currentSection + 1);
    } else if (e.deltaX < -50 && currentSection > 0) {
        navigateToSection(currentSection - 1);
    } else if (e.deltaY > 50 && currentSection < 2) {
        navigateToSection(currentSection + 1);
    } else if (e.deltaY < -50 && currentSection > 0) {
        navigateToSection(currentSection - 1);
    }
    
    setTimeout(() => {
        isScrolling = false;
    }, 800);
});

// Touch swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    if (contactActive) return;
    
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    
    if (touchStartX - touchEndX > swipeThreshold && currentSection < 2) {
        // Swipe left
        navigateToSection(currentSection + 1);
    } else if (touchEndX - touchStartX > swipeThreshold && currentSection > 0) {
        // Swipe right
        navigateToSection(currentSection - 1);
    }
}

// Page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    }, 100);
});





// Decrypt Effect
class DecryptEffect {
    constructor(element) {
        this.element = element;
        this.text = element.getAttribute('data-text');
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        
        this.scramble();
        setTimeout(() => this.decrypt(), 220);
    }

    scramble() {
        let scrambled = '';
        for (let i = 0; i < this.text.length; i++) {
            if (this.text[i] === ' ') {
                scrambled += ' ';
            } else {
                scrambled += this.chars[Math.floor(Math.random() * this.chars.length)];
            }
        }
        this.element.textContent = scrambled;
    }

    decrypt() {
        let iteration = 0;
        const interval = setInterval(() => {
            this.element.textContent = this.text
                .split('')
                .map((char, index) => {
                    if (index < iteration) {
                        return this.text[index];
                    }
                    if (char === ' ') return ' ';
                    return this.chars[Math.floor(Math.random() * this.chars.length)];
                })
                .join('');

            if (iteration >= this.text.length) {
                clearInterval(interval);
                this.element.textContent = this.text;
            }
            iteration += 0.3;
        }, 50);
    }
}

// Pokreni na load
document.addEventListener('DOMContentLoaded', () => {
    const label = document.querySelector('.portfolio-label.auto-decrypt');
    if (label) {
        const effect = new DecryptEffect(label);
        
        // On hover
        label.addEventListener('mouseenter', () => {
            effect.decrypt();
        });
    }
});
/*
document.addEventListener('DOMContentLoaded', () => {
    const label = document.querySelector('.toggle-label.auto-decrypt');
    if (label) new DecryptEffect(label);
});
*/
document.addEventListener('DOMContentLoaded', () => {
    const label = document.querySelector('.title-line.auto-decrypt');
    if (label) new DecryptEffect(label);
});

document.addEventListener('DOMContentLoaded', () => {
    const label = document.querySelector('.year-label.auto-decrypt');
    if (label) {
        const effect = new DecryptEffect(label);
        
        // On load
        effect.scramble();
        setTimeout(() => effect.decrypt(), 300);
        
        // On hover
        label.addEventListener('mouseenter', () => {
            effect.decrypt();
        });
    }
});
