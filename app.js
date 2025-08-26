// Sticky Notes PWA - vanilla JS
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const board = $("#board");
const addBtn = $("#addBtn");
const clearAllBtn = $("#clearAllBtn");
const search = $("#search");
const installBtn = $("#installBtn");

const STATE_KEY = "sticky-notes-v1";
let notes = [];
let zCounter = 1;
let deferredPrompt;

const colors = ["lemon","mint","sky","blossom","lavender"];

function save() {
  localStorage.setItem(STATE_KEY, JSON.stringify(notes));
}
function load() {
  try {
    notes = JSON.parse(localStorage.getItem(STATE_KEY) || "[]");
  } catch (e) { notes = []; }
  if (!Array.isArray(notes)) notes = [];
  zCounter = Math.max(1, ...notes.map(n => n.z || 1));
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function spawnNote(props={}) {
  const n = Object.assign({
    id: uid(),
    text: "",
    x: 18 + Math.random()*40,
    y: 18 + Math.random()*40,
    color: colors[Math.floor(Math.random()*colors.length)],
    z: ++zCounter,
    w: 220, h: 180,
  }, props);

  notes.push(n);
  renderNote(n);
  save();
  return n;
}

function renderNote(n) {
  let el = document.createElement("div");
  el.className = "note";
  el.dataset.id = n.id;
  el.dataset.color = n.color;
  el.style.left = n.x + "px";
  el.style.top = n.y + "px";
  el.style.zIndex = n.z;
  el.style.width = (n.w || 220) + "px";
  el.style.height = (n.h || 180) + "px";

  const header = document.createElement("div");
  header.className = "note-header";
  header.innerHTML = \`
    <div class="title" aria-hidden="true">📝</div>
    <div class="note-actions">
      <button class="colorBtn" title="Change color">🎨</button>
      <button class="delBtn" title="Delete">❌</button>
    </div>\`;

  const ta = document.createElement("textarea");
  ta.value = n.text;
  ta.placeholder = "Type your note…";

  el.appendChild(header);
  el.appendChild(ta);
  board.appendChild(el);

  // Editing
  ta.addEventListener("input", () => { 
    n.text = ta.value; n.updatedAt = Date.now(); save();
  });

  // Color cycle
  header.querySelector(".colorBtn").addEventListener("click", () => {
    const idx = colors.indexOf(n.color);
    n.color = colors[(idx+1) % colors.length];
    el.dataset.color = n.color; save();
  });

  // Delete (with long-press safety)
  let delTimeout;
  const delBtn = header.querySelector(".delBtn");
  const confirmDel = () => {
    if (!confirm("Delete this note?")) return;
    notes = notes.filter(x => x.id !== n.id);
    el.remove();
    save();
  };
  delBtn.addEventListener("click", confirmDel);
  delBtn.addEventListener("touchstart", () => { delTimeout = setTimeout(confirmDel, 550); });
  delBtn.addEventListener("touchend", () => clearTimeout(delTimeout));

  // Dragging with Pointer Events
  let startX=0, startY=0, noteX=0, noteY=0, dragging=false;
  header.addEventListener("pointerdown", (ev) => {
    dragging = true; el.setPointerCapture(ev.pointerId);
    startX = ev.clientX; startY = ev.clientY;
    noteX = n.x; noteY = n.y;
    n.z = ++zCounter; el.style.zIndex = n.z;
  });
  header.addEventListener("pointermove", (ev) => {
    if (!dragging) return;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    n.x = Math.max(4, noteX + dx);
    n.y = Math.max(4, noteY + dy);
    el.style.left = n.x + "px";
    el.style.top = n.y + "px";
  });
  header.addEventListener("pointerup", () => { dragging=false; save(); });
  header.addEventListener("pointercancel", () => { dragging=false; save(); });

  // Resize via bottom-right corner drag (simple)
  el.style.resize = "both";
  el.style.overflow = "hidden";
  const resizeObserver = new ResizeObserver(() => {
    const rect = el.getBoundingClientRect();
    n.w = Math.max(160, rect.width);
    n.h = Math.max(120, rect.height);
    save();
  });
  resizeObserver.observe(el);

  // Filter by search
  applySearchFilterToNote(el, n);
}

function clearBoard() { board.innerHTML = ""; }

function renderAll() {
  clearBoard();
  notes.forEach(renderNote);
}

function applySearchFilterToNote(el, n) {
  const q = (search.value || "").toLowerCase().trim();
  if (!q) { el.style.opacity = "1"; el.style.filter = "none"; return; }
  const hit = (n.text || "").toLowerCase().includes(q);
  el.style.opacity = hit ? "1" : ".25";
  el.style.filter = hit ? "none" : "grayscale(100%)";
}

search.addEventListener("input", () => {
  $$(".note", board).forEach(el => {
    const n = notes.find(x => x.id === el.dataset.id);
    if (n) applySearchFilterToNote(el, n);
  });
});

addBtn.addEventListener("click", () => {
  const n = spawnNote({});
  // Slight cascade for new note
  n.x += notes.length*6; n.y += notes.length*6;
  save();
});

clearAllBtn.addEventListener("click", () => {
  if (!notes.length) return;
  if (confirm("Delete ALL notes? This cannot be undone.")) {
    notes = []; save(); renderAll();
  }
});

// PWA: install button handling
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  });
}

// Init
load();
renderAll();
