# Puneeth — Portfolio

Personal portfolio site for Puneeth, a Web Software Developer with ~5 years of
experience building database-driven enterprise web applications with C#, ASP.NET
and SQL Server.

**Live:** https://puneeth-prince.github.io/My-Profile/

## About

A multi-page site:

- **Home** (`index.html`) — hero, about, technical expertise, an experience teaser,
  featured projects, engineering philosophy, career growth and CTAs into the deeper pages
- **Experience** (`experience.html`) — full breakdown: responsibilities, engineering
  problems, solutions and impact
- **Projects** (`projects.html` + `projects/*.html`) — four professional projects,
  each with its own Problem → Solution → Engineering → Result page, plus personal
  projects (a local AI workspace and an in-progress SMS management app)
- **Case Studies** (`case-studies.html` + `case-studies/*.html`) — deeper engineering
  walkthroughs (database performance, workflow development, reporting)
- **Résumé** (`resume.html`) — the complete professional background as a page (no
  PDF is published yet)
- **Contact** (`contact.html`) — how to get in touch

## Tech

Plain HTML, CSS and vanilla JavaScript — no build step, no framework, no
third-party dependencies, no backend.

- Shared nav and footer are single HTML partials (`partials/nav.html`,
  `partials/footer.html`) fetched and injected by `partials.js` on every page, so
  there's one nav/footer to maintain instead of one per file
- Dark/light theme toggle, persisted to `localStorage`, applied before first paint
  via a small inline script in every page's `<head>` to avoid a flash of the wrong theme
- Responsive layout with a mobile nav menu
- Scroll progress bar, per-page active nav state
- Scroll-reveal animations, gated behind `prefers-reduced-motion`
- Fully usable with JavaScript disabled — all content is static HTML underneath;
  only the shared nav/footer chrome and the motion/interaction polish need JS

## Structure

```
index.html                              Home
experience.html                         Full experience breakdown
projects.html                           Projects index
projects/*.html                         Individual project pages
case-studies.html                       Case studies index
case-studies/*.html                     Individual case study pages
resume.html                             Résumé page
contact.html                            Contact page
partials/nav.html, partials/footer.html Shared nav/footer markup
partials.js                             Fetches and injects the partials above
style.css                               Styling and theming
script.js                               Theme toggle, nav behaviour, scroll interactions
```

## Running locally

The nav/footer partials are loaded with `fetch()`, which browsers block over the
`file://` protocol — so this now needs a static server rather than opening
`index.html` directly:

```bash
npx serve .
```

## Contact

- Email: puneeth.h.dev@gmail.com
- GitHub: [@Puneeth-Prince](https://github.com/Puneeth-Prince)
