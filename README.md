# Puneeth — Portfolio

Personal portfolio site for Puneeth, a Web Software Developer with ~4.8 years of
experience building enterprise web applications with C#, ASP.NET and SQL Server.

**Live:** https://puneeth-prince.github.io/My-Profile/

## About

A single-page site covering:

- **About** — background and how I approach work
- **Experience** — professional experience timeline
- **Work** — enterprise applications and systems I've built and maintained
- **Skills** — technology depth (core / strong / exploring) and skill breakdown by area
- **Projects** — personal projects, including a local AI workspace (RAG over local
  LLMs) and an in-progress SMS management app
- **Learning** — current focus: modern .NET, ASP.NET Core, APIs, and AI applications
- **Contact** — how to get in touch

## Tech

Plain HTML, CSS and vanilla JavaScript — no build step, no framework, no dependencies.

- Dark/light theme toggle, persisted to `localStorage`, applied before first paint
  to avoid a flash of the wrong theme
- Responsive layout with a mobile nav menu
- Scroll progress bar and scroll-spy navigation
- Scroll-reveal animations, gated behind `prefers-reduced-motion`
- Fully usable with JavaScript disabled — all content is static HTML underneath

## Structure

```
index.html   Markup and content
style.css    Styling and theming
script.js    Theme toggle, nav behaviour, scroll interactions
```

## Running locally

No build tooling required — just serve the folder statically, e.g.:

```bash
npx serve .
```

or open `index.html` directly in a browser.

## Contact

- Email: puneeth.h.dev@gmail.com
- GitHub: [@Puneeth-Prince](https://github.com/Puneeth-Prince)
