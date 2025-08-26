Sticky Notes PWA
==================

A tiny, installable sticky-notes app that works offline. Drag notes around, edit, recolor, and delete. Notes are stored only on your device.

Quick Start (Desktop -> Phone)
-----------------------------
1) Unzip this folder.
2) Open a terminal in the unzipped folder and run a local server:
   - Python 3: `python -m http.server 8000`
   - Node: `npx http-server -p 8000`
3) On your phone, connect to the same Wi‑Fi and visit: `http://<your-computer-ip>:8000`
4) Install the app:
   - Android (Chrome): ⋮ menu → "Install app" (or "Add to Home screen").
   - iPhone/iPad (Safari): Share → "Add to Home Screen".

Deploy to the Web (HTTPS)
-------------------------
For the best experience, host it with HTTPS (GitHub Pages or Netlify).

GitHub Pages (quick):
- Create a new GitHub repo, name it e.g. sticky-notes.
- Upload all files in this folder to the repo root.
- In repo Settings → Pages → set Source to "main" / root. Wait a minute.
- Visit the URL it shows. Then install to your phone as above.

Files
-----
- index.html ........ App shell
- styles.css ........ Minimal styling
- app.js ............ Note logic, drag/resize, search, localStorage
- manifest.webmanifest .. PWA manifest for install
- sw.js ............. Service worker for offline caching
- icons/*.png ....... App icons

Data
----
Your notes are saved in your browser's localStorage under the key "sticky-notes-v1". Clearing site data will delete notes.

Enjoy!
