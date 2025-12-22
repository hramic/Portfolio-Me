const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  theme: "dark",
  projects: [
    {
      title: "Task Tracker",
      description: "A simple to-do app with localStorage and filters.",
      tags: ["JavaScript", "UI", "localStorage"],
      live: "#",
      code: "#",
    },
    {
      title: "Weather Dashboard",
      description: "Search cities and show forecast (hook up any API).",
      tags: ["API", "JavaScript", "Responsive"],
      live: "#",
      code: "#",
    },
    {
      title: "Swift macOS Utility",
      description: "A macOS app concept—describe what it does and why it’s useful.",
      tags: ["Swift", "macOS", "Productivity"],
      live: "#",
      code: "#",
    },
  ],
  skills: ["HTML", "CSS", "JavaScript", "Git", "Responsive Design", "Swift", "SwiftUI"],
};

// Small helper to avoid HTML injection
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setYear() {
  $("#year").textContent = new Date().getFullYear();
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  state.theme = saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.dataset.theme = state.theme;

  $("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = state.theme;
    localStorage.setItem("theme", state.theme);
  });
}

function initMobileNav() {
  const btn = $("#navToggle");
  const menu = $("#navMenu");

  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });

  $$(".nav-link").forEach((a) =>
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    })
  );

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    const within = menu.contains(e.target) || btn.contains(e.target);
    if (!within) {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

function renderSkills() {
  const wrap = $("#skillsList");
  wrap.innerHTML = "";
  state.skills.forEach((s) => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = s;
    wrap.appendChild(el);
  });
}

function projectCard(p, index = 0) {
  const tags = p.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  return `
    <article class="card project reveal" style="--i:${index}">
      <div>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description)}</p>
      </div>
      <div class="chips">${tags}</div>
      <div class="actions">
        <a class="btn" href="${p.live}" target="_blank" rel="noreferrer">Live</a>
        <a class="btn ghost" href="${p.code}" target="_blank" rel="noreferrer">Code</a>
      </div>
    </article>
  `;
}

function renderProjects(list) {
  const grid = $("#projectGrid");
  grid.innerHTML = list.map((p, i) => projectCard(p, i)).join("");

  // New cards were injected; observe them so they can animate in
  refreshRevealObservers();
}

function initProjectFilters() {
  const filter = $("#projectFilter");
  const search = $("#projectSearch");

  const uniqueTags = [...new Set(state.projects.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));
  uniqueTags.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    filter.appendChild(opt);
  });

  function apply() {
    const q = search.value.trim().toLowerCase();
    const tag = filter.value;

    const filtered = state.projects.filter((p) => {
      const matchTag = tag === "all" || p.tags.includes(tag);
      const hay = `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase();
      const matchQ = !q || hay.includes(q);
      return matchTag && matchQ;
    });

    renderProjects(filtered);
  }

  filter.addEventListener("change", apply);
  search.addEventListener("input", apply);

  renderProjects(state.projects);
}

function initActiveNav() {
  const links = $$(".nav-link");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = `#${e.target.id}`;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
  );

  sections.forEach((s) => obs.observe(s));
}

function initContactForm() {
  const form = $("#contactForm");
  const note = $("#formNote");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    note.textContent = "";

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (name.length < 2) return (note.textContent = "Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return (note.textContent = "Please enter a valid email.");
    if (message.length < 10) return (note.textContent = "Message should be at least 10 characters.");

    note.textContent = "Message ready to send (connect this to Formspree/EmailJS/server to deliver).";
    form.reset();
  });
}

/* ===== Reveal on scroll (IntersectionObserver) ===== */
let revealObserver = null;

function refreshRevealObservers() {
  if (!revealObserver) return;

  const elements = document.querySelectorAll(".reveal:not(.in-view)");
  elements.forEach((el) => revealObserver.observe(el));
}

function initRevealOnScroll() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    // show everything immediately
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  refreshRevealObservers();
}

/* ===== Typewriter (typing + deleting) ===== */
function initTypewriter() {
  const el = $("#typeTarget");
  if (!el) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; // respect user preference [web:79]
  const words = ["developer", "graphic designer", "giving instructions in math", "programming"];

  if (reduceMotion) {
    el.textContent = words.join(", ");
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const typeSpeed = 65;
  const deleteSpeed = 42;
  const holdAfterType = 900;
  const holdAfterDelete = 220;

  function tick() {
    const word = words[wordIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = word.slice(0, charIndex);

      if (charIndex === word.length) {
        deleting = true;
        return setTimeout(tick, holdAfterType); // schedule next step [web:88]
      }
      return setTimeout(tick, typeSpeed); // schedule next step [web:88]
    } else {
      charIndex--;
      el.textContent = word.slice(0, Math.max(0, charIndex));

      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        return setTimeout(tick, holdAfterDelete); // schedule next step [web:88]
      }
      return setTimeout(tick, deleteSpeed); // schedule next step [web:88]
    }
  }

  tick();
}

/* ===== Init ===== */
setYear();
initTheme();
initMobileNav();
renderSkills();
initProjectFilters();
initActiveNav();
initContactForm();
initRevealOnScroll();
initTypewriter();