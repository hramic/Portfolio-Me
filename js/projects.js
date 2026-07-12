// ===== PROJECT DATA =====
// Single source of truth for the WORK section.
// To add a new project: drop the image into /img and add an entry here
// (or open the site with #admin in the URL and use the helper panel).
// `image` shows while the site is in LIGHT mode; optional `imageDarkMode`
// swaps in while the site is in DARK mode (for contrast).
const PROJECTS = [
    {
        title: "Expense tracker app",
        image: "img/project1_dark.png",
        imageDarkMode: "img/project1_light.png",
        description: "a full-stack Next.js app that automates personal finance tracking by parsing Gmail emails with user-defined regex rules, extracting transaction data straight from emails and <strong>eliminating manual entry</strong>. Includes multi-currency budgeting, spending analytics, PDF export, push notifications, and more. \n\nStack: TypeScript, Prisma, PostgreSQL, NextAuth"
    },
    {
        title: "Folio 01 Prototype",
        image: "img/project2_dark.png",
        imageDarkMode: "img/project2_light.png",
        description: "UI/UX concept for a modern portfolio website - from initial wireframes to a <strong>fully functional</strong> prototype, showcasing a clean and intuitive design. Check it out by clicking <strong><a href='https://www.figma.com/design/YqXQvgKa3MQ5CBonHH1XKi/Portfolio?node-id=88-33&t=pKPjNBDBsP1gCH8q-1' target='_blank'>here</a></strong>! \n\nStack: Figma"
    },
    {
        title: "myportfolio.ba",
        image: "img/project4.png",
        description: "full brand identity and UI/UX design for a free CV builder & portfolio platform. <strong>Covers everything</strong> from logo and visual identity to the complete product experience: landing page, the step-by-step CV builder flow, template designs, and the final live portfolio website. <strong>Designed end-to-end in Figma</strong> with a clean, modern visual language."
    },
    {
        title: "Coming Soon",
        image: "",
        description: "A new <strong>project</strong> is in the works - full case study landing here soon."
    }
    //{
    //    title: "Coming Soon",
    //    image: "",
    //    description: "Experimental <strong>motion & interaction</strong> playground - dropping when it's ready."
    //}
];
