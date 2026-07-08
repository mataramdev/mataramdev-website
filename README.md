# <img src="assets/images/logo-dark.svg" width="125" style="vertical-align: middle;" /> Mataram Dev Community Profile

## 🛠️ Built on HTML, CSS, JS and BITCoder AI Assistant
>
<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

<p align="center">
  <a href="https://github.com/mataramdevcom/mataramdev-website/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License MIT" />
  </a>
  <a href="https://github.com/mataramdevcom/mataramdev-website/issues">
    <img src="https://img.shields.io/github/issues/mataramdevcom/mataramdev-website?style=flat-square" alt="Open Issues" />
  </a>
  <a href="https://github.com/mataramdevcom/mataramdev-website/pulls">
    <img src="https://img.shields.io/github/issues-pr/mataramdevcom/mataramdev-website?style=flat-square" alt="Open PRs" />
  </a>
  <a href="https://github.com/mataramdevcom/mataramdev-website/commits/main">
    <img src="https://img.shields.io/github/last-commit/mataramdevcom/mataramdev-website?style=flat-square" alt="Last Commit" />
  </a>
</p>

<p align="center">
  <a href="https://discord.gg/mataramdev" target="_blank">
    <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" alt="Discord" />
  </a>
  <a href="https://t.me/mataramdevcom" target="_blank">
    <img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
  </a>
  <a href="https://instagram.com/mataramdevcom" target="_blank">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" />
  </a>
  <a href="https://youtube.com/@mataramdevcom" target="_blank">
    <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" />
  </a>
</p>

The official community website for **Mataram Dev**, a tech community of makers, designers, and developers based in Mataram, Lombok, Indonesia.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Internationalization](#internationalization)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Mataram Dev is a growing community of tech enthusiasts, ranging from students to professional developers, who meet regularly to share knowledge, build projects, and support one another. This repository contains the source code for the community website.

---

## Features

- **About:** Community background, mission, and statistics
- **Activities:** Overview of recurring programs (WFC, meetups, bootcamps, etc.)
- **Projects:** Showcase of member-built open-source projects
- **Resources:** Curated learning materials and developer toolkits
- **Events:** Upcoming and past event listings with RSVP support
- **Articles:** Community blog for sharing knowledge and stories
- **Contributors:** Profiles of active community contributors
- **Join Form:** Membership registration form backed by Supabase
- **Dark / Light Mode:** System-aware theme toggle
- **Bilingual Support:** English and Indonesian via JSON translation files

---

## Project Structure

```
mataramdev-website/
|-- assets/
|   |-- images/          # Photos, logos, and SVG icons
|   |-- lang/
|   |   |-- en.json      # English translations
|   |   |-- id.json      # Indonesian translations
|   |-- script.js        # Main application logic
|   |-- style.css        # Global stylesheet
|-- .env                 # Local environment variables (not committed)
|-- .env.example         # Template for required environment variables
|-- .gitignore
|-- database-schema.md   # Supabase table documentation
|-- index.html           # Main HTML entry point
|-- CONTRIBUTING.md
|-- CODE_OF_CONDUCT.md
|-- SECURITY.md
|-- LICENSE
|-- README.md
```

---

## Getting Started

No build tools are required. The project is plain HTML, CSS, and JavaScript.

**Option 1: Python HTTP Server**

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

**Option 2: VS Code Live Server**

Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click "Go Live" from the status bar.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials before running locally.

```bash
cp .env.example .env
```

| Variable            | Description                     |
| ------------------- | ------------------------------- |
| `SUPABASE_URL`      | Your Supabase project URL       |
| `SUPABASE_ANON_KEY` | Your Supabase public (anon) key |

> The `.env` file is excluded from version control via `.gitignore`. Never commit real credentials.

---

## Internationalization

Translation strings are stored in `assets/lang/`.

| File      | Language   |
| --------- | ---------- |
| `en.json` | English    |
| `id.json` | Indonesian |

To add a new language, create a new JSON file following the same key structure and register it in `assets/script.js`.

---

## Contributing

Contributions are welcome and appreciated. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for full terms.

> **Why MIT?** It is permissive, widely recognized, and allows community members to freely fork, modify, and build on the project while retaining attribution.

_Let's Learn & Grow Together_ 🚀
