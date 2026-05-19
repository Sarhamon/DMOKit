import { loadTheme, toggleTheme } from '../theme.js';
import { summons } from './summonData.js';
import {
    addItems, getTotalCount, getPity, incrementPity, resetPity, subscribe,
} from './inventory.js';
import { flipCardWrap, revealAllRowHTML, setupFlip } from './flipCard.js';

const GRADE_ORDER = ['U', 'SSS+', 'SSS', 'SS+', 'SS', 'S+', 'S', 'A+', 'A', 'N'];

const summonSelect = document.getElementById('summonSelect');
const summonMeta = document.getElementById('summonMeta');
const summon1Btn = document.getElementById('summon1Btn');
const summon10Btn = document.getElementById('summon10Btn');
const resetBtn = document.getElementById('resetBtn');
const statTotal = document.getElementById('statTotal');
const statGradeList = document.getElementById('statGradeList');
const resultGrid = document.getElementById('resultGrid');
const resultCount = document.getElementById('resultCount');
const pityDisplay = document.getElementById('summonPityDisplay');

let currentSummon = null;
let stats = { tickets: 0, total: 0, byGrade: {} };

function gradeRank(g) {
    const idx = GRADE_ORDER.indexOf(g);
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

function pullOne(items) {
    const roll = Math.random() * 100;
    let acc = 0;
    for (const item of items) {
        acc += item.probability;
        if (roll < acc) return item;
    }
    return items[items.length - 1];
}

function populateSelector() {
    summonSelect.innerHTML = summons.map((s, i) =>
        `<option value="${i}">${escapeHtml(s.name)}</option>`
    ).join('');
}

function updateMeta() {
    if (!currentSummon) { summonMeta.textContent = '—'; return; }
    const byGrade = {};
    for (const it of currentSummon.items) {
        byGrade[it.grade] = (byGrade[it.grade] || 0) + 1;
    }
    const grades = Object.keys(byGrade).sort((a, b) => gradeRank(a) - gradeRank(b));
    const parts = grades.map(g => `${g} ${byGrade[g]}`);
    const pityInfo = currentSummon.pity
        ? ` · 천장 ${currentSummon.pity.every}회`
        : '';
    summonMeta.textContent = `총 ${currentSummon.items.length}종 · ${parts.join(' / ')}${pityInfo}`;
}

function resetStats() {
    stats = { tickets: 0, total: 0, byGrade: {} };
    renderStats();
    renderResults([]);
}

function renderStats() {
    statTotal.textContent = `${stats.total.toLocaleString()}개 (${stats.tickets.toLocaleString()}회 소환)`;
    const grades = Object.keys(stats.byGrade).sort((a, b) => gradeRank(a) - gradeRank(b));
    if (grades.length === 0) {
        statGradeList.innerHTML = stats.total > 0
            ? '<span class="empty-msg-inline">카드를 공개하면 등급이 표시됩니다.</span>'
            : '<span class="empty-msg-inline">아직 소환한 결과가 없습니다.</span>';
        return;
    }
    const revealedTotal = Object.values(stats.byGrade).reduce((s, v) => s + v, 0);
    statGradeList.innerHTML = grades.map(g => {
        const count = stats.byGrade[g];
        const pct = ((count / revealedTotal) * 100).toFixed(2);
        return `<span class="stat-grade ${gradeClass(g)}">
            <span class="g-label">${escapeHtml(g)}</span>
            <span class="g-count">${count}</span>
            <span class="g-pct">${pct}%</span>
        </span>`;
    }).join('');
}

function renderResults(items) {
    resultCount.textContent = items.length ? `(${items.length}개)` : '';
    if (!items.length) {
        resultGrid.innerHTML = '<div class="empty-msg">소환 버튼을 눌러주세요.</div>';
        return;
    }
    const parts = [];
    if (items.length > 1) parts.push(revealAllRowHTML());
    for (const it of items) {
        const pityLabel = it._isPity
            ? `<span class="pity-tag">천장 보장</span>`
            : '';
        const back = `<span class="r-grade">${escapeHtml(it.grade)}</span>
            <span class="r-name">${escapeHtml(it.name)}</span>${pityLabel}`;
        const extraClass = it._isPity ? 'pity-card' : '';
        parts.push(flipCardWrap(back, gradeClass(it.grade), extraClass, { grade: escapeHtml(it.grade) }));
    }
    resultGrid.innerHTML = parts.join('');
    setupFlip(resultGrid, onCardReveal);
}

function onCardReveal(card) {
    const grade = card.dataset.grade;
    if (!grade) return;
    stats.byGrade[grade] = (stats.byGrade[grade] || 0) + 1;
    renderStats();
}

function renderPity() {
    if (!currentSummon || !currentSummon.pity) {
        pityDisplay.innerHTML = '';
        return;
    }
    const cur = getPity(currentSummon.name);
    const max = currentSummon.pity.every;
    const pct = Math.min(100, (cur / max) * 100);
    pityDisplay.innerHTML = `<div class="pity-row">
        <span class="pity-label">천장 (${escapeHtml(currentSummon.pity.reward.name)})</span>
        <div class="pity-bar"><div class="pity-bar-fill" style="width:${pct}%"></div></div>
        <span class="pity-num">${cur} / ${max}</span>
    </div>`;
}

function summon(tickets) {
    if (!currentSummon) return;
    const results = [];
    for (let i = 0; i < tickets; i++) {
        const item = pullOne(currentSummon.items);
        results.push({ ...item, _isPity: false });

        if (currentSummon.pity) {
            const counter = incrementPity(currentSummon.name);
            if (counter >= currentSummon.pity.every) {
                const reward = currentSummon.pity.reward;
                results.push({ ...reward, _isPity: true });
                resetPity(currentSummon.name);
            }
        }
    }
    stats.tickets += tickets;
    stats.total += results.length;
    addItems(results.map(r => ({
        name: r.name,
        grade: r.grade,
        category: r.category || 'other',
    })));
    renderStats();
    renderResults(results);
    renderPity();
}

function onSummonChange() {
    currentSummon = summons[parseInt(summonSelect.value, 10)];
    updateMeta();
    resetStats();
    renderPity();
}

function updateInvCount() {
    const el = document.getElementById('invCount');
    if (el) el.textContent = `인벤토리: ${getTotalCount().toLocaleString()}개`;
}

summonSelect.addEventListener('change', onSummonChange);
summon1Btn.addEventListener('click', () => summon(1));
summon10Btn.addEventListener('click', () => summon(10));
resetBtn.addEventListener('click', resetStats);
document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
subscribe(() => {
    updateInvCount();
    renderPity();
});

loadTheme();
populateSelector();
onSummonChange();
updateInvCount();
