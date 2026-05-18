import { loadTheme, toggleTheme } from '../theme.js';
import { draws } from './drawData.js';
import { addItems, getTotalCount, subscribe } from './inventory.js';
import { flipCardWrap, revealAllRowHTML, setupFlip } from './flipCard.js';

const GRADE_ORDER = ['U', 'SSS+', 'SSS', 'SS+', 'SS', 'S+', 'S', 'A+', 'A', 'N'];

const drawSelect = document.getElementById('drawSelect');
const drawMeta = document.getElementById('drawMeta');
const pull1Btn = document.getElementById('pull1Btn');
const resetBtn = document.getElementById('resetBtn');
const statTotal = document.getElementById('statTotal');
const statGradeList = document.getElementById('statGradeList');
const resultGrid = document.getElementById('resultGrid');
const resultCount = document.getElementById('resultCount');

let currentDraw = null;
let stats = { tickets: 0, total: 0, byGrade: {} };

function gradeRank(grade) {
    const idx = GRADE_ORDER.indexOf(grade);
    return idx === -1 ? 999 : idx;
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function gradeClass(grade) {
    return 'grade-' + grade.replace('+', 'plus');
}

function pullOne(draw) {
    const roll = Math.random() * 100;
    let acc = 0;
    for (const item of draw.items) {
        acc += item.probability;
        if (roll < acc) return item;
    }
    return draw.items[draw.items.length - 1];
}

function populateDrawSelector() {
    drawSelect.innerHTML = draws.map((d, i) =>
        `<option value="${i}">${escapeHtml(d.name)}</option>`
    ).join('');
}

function updateDrawMeta() {
    if (!currentDraw) { drawMeta.textContent = '—'; return; }
    const byGrade = {};
    for (const it of currentDraw.items) {
        byGrade[it.grade] = (byGrade[it.grade] || 0) + 1;
    }
    const grades = Object.keys(byGrade).sort((a, b) => gradeRank(a) - gradeRank(b));
    const parts = grades.map(g => `${g} ${byGrade[g]}`);
    drawMeta.textContent = `1회당 ${currentDraw.pullCount}개 · 총 ${currentDraw.items.length}종 · ${parts.join(' / ')}`;
    pull1Btn.textContent = `1회 뽑기 (${currentDraw.pullCount}개)`;
}

function resetStats() {
    stats = { tickets: 0, total: 0, byGrade: {} };
    renderStats();
    renderResults([]);
}

function renderStats() {
    statTotal.textContent = `${stats.total.toLocaleString()}개 (${stats.tickets.toLocaleString()}회 사용)`;
    const grades = Object.keys(stats.byGrade).sort((a, b) => gradeRank(a) - gradeRank(b));
    if (grades.length === 0) {
        statGradeList.innerHTML = '<span class="empty-msg-inline">아직 뽑은 결과가 없습니다.</span>';
        return;
    }
    statGradeList.innerHTML = grades.map(g => {
        const count = stats.byGrade[g];
        const pct = ((count / stats.total) * 100).toFixed(2);
        return `<span class="stat-grade ${gradeClass(g)}">
            <span class="g-label">${escapeHtml(g)}</span>
            <span class="g-count">${count}</span>
            <span class="g-pct">${pct}%</span>
        </span>`;
    }).join('');
}

function renderResults(items) {
    resultCount.textContent = items.length ? `(${items.length}회)` : '';
    resultGrid.classList.toggle('cols-3', items.length === 6);
    if (!items.length) {
        resultGrid.innerHTML = '<div class="empty-msg">뽑기 버튼을 눌러주세요.</div>';
        return;
    }
    const parts = [];
    if (items.length > 1) parts.push(revealAllRowHTML());
    for (const it of items) {
        const back = `<span class="r-grade">${escapeHtml(it.grade)}</span>
            <span class="r-name">${escapeHtml(it.name)}</span>`;
        parts.push(flipCardWrap(back, gradeClass(it.grade), '', { grade: escapeHtml(it.grade) }));
    }
    resultGrid.innerHTML = parts.join('');
    setupFlip(resultGrid, onCardReveal);
}

function onCardReveal(card) {
    const grade = card.dataset.grade;
    if (!grade) return;
    stats.total++;
    stats.byGrade[grade] = (stats.byGrade[grade] || 0) + 1;
    renderStats();
}

function pull(tickets) {
    if (!currentDraw) return;
    const totalItems = tickets * currentDraw.pullCount;
    const results = [];
    for (let i = 0; i < totalItems; i++) {
        results.push(pullOne(currentDraw));
    }
    stats.tickets += tickets;
    addItems(results);
    renderStats();
    renderResults(results);
}

function onDrawChange() {
    currentDraw = draws[parseInt(drawSelect.value, 10)];
    updateDrawMeta();
    resetStats();
}

function updateInvCount() {
    const el = document.getElementById('invCount');
    if (el) el.textContent = `인벤토리: ${getTotalCount().toLocaleString()}개`;
}

drawSelect.addEventListener('change', onDrawChange);
pull1Btn.addEventListener('click', () => pull(1));
resetBtn.addEventListener('click', resetStats);
document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
subscribe(updateInvCount);

loadTheme();
populateDrawSelector();
onDrawChange();
updateInvCount();
