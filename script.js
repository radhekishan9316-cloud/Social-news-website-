const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
$('#year').textContent = new Date().getFullYear();

const toast = (message) => {
  const el = $('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
};

// Theme toggle
const savedTheme = localStorage.getItem('social-news-theme');
if (savedTheme === 'dark') document.body.classList.add('dark');
$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('social-news-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Search filters the sample stories on this page. Connect a real news API/backend for live news.
function searchNews() {
  const q = $('#searchInput').value.trim().toLocaleLowerCase('hi');
  let shown = 0;
  $$('.news-card').forEach(card => {
    const haystack = (card.dataset.search + ' ' + card.innerText).toLocaleLowerCase('hi');
    const match = !q || haystack.includes(q);
    card.hidden = !match;
    if (match) shown++;
  });
  $('#resultCount').textContent = `${shown} लेख`;
  $('#emptyState').hidden = shown !== 0;
  $('#top-news').scrollIntoView({behavior:'smooth', block:'start'});
}
$('#searchForm').addEventListener('submit', e => { e.preventDefault(); searchNews(); });
$('#searchInput').addEventListener('input', () => {
  if ($('#searchInput').value.trim() === '') {
    $$('.news-card').forEach(card => card.hidden = false);
    $('#resultCount').textContent = `${$$('.news-card').length} लेख`;
    $('#emptyState').hidden = true;
  }
});

// Bookmarks are stored in this browser only. Add user accounts/database for cross-device sync.
const saved = new Set(JSON.parse(localStorage.getItem('social-news-saved') || '[]'));
function updateSaveButtons() {
  $$('[data-save]').forEach(btn => {
    const isSaved = saved.has(btn.dataset.save);
    btn.textContent = isSaved ? '♥ सेव हो गया' : '♡ सेव करें';
    btn.setAttribute('aria-pressed', String(isSaved));
  });
}
$$('[data-save]').forEach(btn => btn.addEventListener('click', () => {
  const id = btn.dataset.save;
  saved.has(id) ? saved.delete(id) : saved.add(id);
  localStorage.setItem('social-news-saved', JSON.stringify([...saved]));
  updateSaveButtons();
  toast(saved.has(id) ? 'खबर सेव कर ली गई।' : 'सेव की गई खबर हटाई गई।');
}));
updateSaveButtons();

// Simple calculator
$('#calculateBtn').addEventListener('click', () => {
  const a = Number($('#calcA').value), b = Number($('#calcB').value), op = $('#calcOp').value;
  if ($('#calcA').value === '' || $('#calcB').value === '') { $('#calcResult').textContent = 'दोनों संख्याएँ भरें।'; return; }
  if (op === '/' && b === 0) { $('#calcResult').textContent = 'शून्य से भाग नहीं कर सकते।'; return; }
  const result = op === '+' ? a+b : op === '-' ? a-b : op === '*' ? a*b : a/b;
  $('#calcResult').textContent = `परिणाम: ${Number(result.toFixed(8))}`;
});

// Demo live video integration:
// For an authorized YouTube live stream, use its official embed URL in an iframe in index.html.
// Do not rebroadcast channels/videos without permission. This static demo does not fetch live news.
