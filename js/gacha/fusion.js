import { loadTheme, toggleTheme } from '../theme.js';
import { fusions } from './fusionData.js';
import {
    addItems, consumeItems, getAll, getByGrade, getCountByGrade,
    getTotalCount, clearAll, getPity, incrementPity, resetPity, subscribe
} from './inventory.js';
import { flipCardWrap, revealAllRowHTML, setupFlip } from './flipCard.js';

const GRADE_ORDER = ['U', 'SSS+', 'SSS', 'SS+', 'SS', 'S+', 'S', 'A+', 'A', 'N'];

const fusionAvail = document.getElementById('fusionAvail');
const fuse1Btn = document.getElementById('fuse1Btn');
const fuseNBtn = document.getElementById('fuseNBtn');
const fuseNInput = document.getElementById('fuseNInput');
const pityDisplay = document.getElementById('pityDisplay');
const fusionResultGrid = document.getElementById('fusionResultGrid');
const fusionResultCount = document.getElementById('fusionResultCount');
const invCount = document.getElementById('invCount');
const invSummary = document.getElementById('invSummary');
const invGrid = document.getElementById('invGrid');
const clearInvBtn = document.getElementById('clearInvBtn');

const sortedFusions = [...fusions].sort((a, b) => gradeRank(b.inputGrade) - gradeRank(a.inputGrade));

let currentMode = 'auto';

function getActiveFusions() {
    if (currentMode === 'auto') return sortedFusions;
    return sortedFusions.filter(g => g.inputGrade === currentMode);
}

function gradeRank(g) {
    const i = GRADE_ORDER.indexOf(g);
    return i === -1 ? 999 : i;
}

function gradeClass(g) { return 'grade-' + g.replace('+', 'plus'); }

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function pullOne(items) {
    const total = items.reduce((s, i) => s + i.probability, 0);
    const roll = Math.random() * total;
    let acc = 0;
    for (const item of items) {
        acc += item.probability;
        if (roll < acc) return item;
    }
    return items[items.length - 1];
}

function pickAutoConsume(grade, count) {
    const itemsCopy = getByGrade(grade).map(it => ({ ...it }))
        .sort((a, b) => b.count - a.count);
    const picked = [];
    for (const item of itemsCopy) {
        while (item.count > 0 && picked.length < count) {
            picked.push(item.name);
            item.count--;
        }
        if (picked.length >= count) break;
    }
    return picked;
}

function fuseOne(group, consumedNames) {
    consumeItems(consumedNames);
    const result = pullOne(group.results);
    addItems([result]);
    let pityResult = null;
    if (group.pity) {
        const counter = incrementPity(group.name);
        if (counter >= group.pity.every) {
            pityResult = pullOne(group.pity.results);
            addItems([pityResult]);
            resetPity(group.name);
        }
    }
    return { result, pityResult };
}

function updateFusionAvail() {
    let totalPossible = 0;
    for (const group of getActiveFusions()) {
        const avail = getByGrade(group.inputGrade).reduce((s, i) => s + i.count, 0);
        totalPossible += Math.floor(avail / group.inputCount);
    }
    const enabled = totalPossible > 0;
    if (fuse1Btn) fuse1Btn.disabled = !enabled;
    if (fuseNBtn) fuseNBtn.disabled = !enabled;
    if (fusionAvail) {
        fusionAvail.textContent = enabled
            ? `총 ${totalPossible}회 합성 가능`
            : '합성 가능한 아이템이 없습니다.';
    }
}

function renderPity() {
    if (!pityDisplay) return;
    const pityGroups = fusions.filter(g => g.pity);
    if (!pityGroups.length) { pityDisplay.innerHTML = ''; return; }
    pityDisplay.innerHTML = pityGroups.map(g => {
        const cur = getPity(g.name);
        const max = g.pity.every;
        const pct = Math.min(100, (cur / max) * 100);
        return `<div class="pity-row">
            <span class="pity-label">${escapeHtml(g.name)} 천장</span>
            <div class="pity-bar"><div class="pity-bar-fill" style="width:${pct}%"></div></div>
            <span class="pity-num">${cur} / ${max}</span>
        </div>`;
    }).join('');
}

function renderInventory() {
    if (!invCount || !invSummary || !invGrid) return;
    const all = getAll();
    invCount.textContent = `인벤토리: ${getTotalCount().toLocaleString()}개`;
    const counts = getCountByGrade();
    const grades = Object.keys(counts).sort((a, b) => gradeRank(a) - gradeRank(b));
    invSummary.innerHTML = grades.length
        ? grades.map(g => `<span class="stat-grade ${gradeClass(g)}"><span class="g-label">${escapeHtml(g)}</span><span class="g-count">${counts[g]}</span></span>`).join('')
        : '<span class="empty-msg-inline">아이템 없음</span>';

    if (!all.length) {
        invGrid.innerHTML = '<div class="empty-msg">드로우 결과가 이곳에 쌓입니다.</div>';
        return;
    }
    const sorted = [...all].sort((a, b) => {
        const r = gradeRank(a.grade) - gradeRank(b.grade);
        if (r !== 0) return r;
        return a.name.localeCompare(b.name);
    });
    
    invGrid.innerHTML = sorted.map(it => {
        const cls = `inv-item ${gradeClass(it.grade)}`;
        return `<div class="${cls}" data-name="${escapeHtml(it.name)}" data-grade="${escapeHtml(it.grade)}">
            <span class="inv-grade">${escapeHtml(it.grade)}</span>
            <span class="inv-name">${escapeHtml(it.name)}</span>
            <span class="inv-num">×${it.count}</span>
        </div>`;
    }).join('');
}

function renderResults(batches, requestedTickets, executedTickets) {
    if (!fusionResultCount || !fusionResultGrid) return;
    const totalResults = batches.reduce((s, b) => s + 1 + (b.pityResult ? 1 : 0), 0);
    let suffix = `(${executedTickets}회 합성, ${totalResults}개 획득)`;
    if (requestedTickets > executedTickets) {
        suffix += ` · 재료 부족으로 ${requestedTickets - executedTickets}회 중단`;
    }
    fusionResultCount.textContent = suffix;

    const flipMode = executedTickets === 1;
    const cards = [];

    if (flipMode && totalResults > 1) cards.push(revealAllRowHTML());

    for (const b of batches) {
        if (flipMode) {
            const back = `<span class="r-grade">${escapeHtml(b.result.grade)}</span>
                <span class="r-name">${escapeHtml(b.result.name)}</span>`;
            cards.push(flipCardWrap(back, gradeClass(b.result.grade)));
            if (b.pityResult) {
                const pityBack = `<span class="r-grade">${escapeHtml(b.pityResult.grade)} ⭐</span>
                    <span class="r-name">${escapeHtml(b.pityResult.name)}</span>
                    <span class="pity-tag">천장 보너스</span>`;
                cards.push(flipCardWrap(pityBack, gradeClass(b.pityResult.grade), 'pity-card'));
            }
        } else {
            cards.push(`<div class="result-card ${gradeClass(b.result.grade)}">
                <span class="r-grade">${escapeHtml(b.result.grade)}</span>
                <span class="r-name">${escapeHtml(b.result.name)}</span>
            </div>`);
            if (b.pityResult) {
                cards.push(`<div class="result-card pity-card ${gradeClass(b.pityResult.grade)}">
                    <span class="r-grade">${escapeHtml(b.pityResult.grade)} ⭐</span>
                    <span class="r-name">${escapeHtml(b.pityResult.name)}</span>
                    <span class="pity-tag">천장 보너스</span>
                </div>`);
            }
        }
    }
    fusionResultGrid.innerHTML = cards.length ? cards.join('') : '<div class="empty-msg">결과 없음</div>';
    if (flipMode) setupFlip(fusionResultGrid);
}

function fuseAuto(tickets) {
    const batches = [];
    let executed = 0;
    const activeFusions = getActiveFusions();

    for (let i = 0; i < tickets; i++) {
        let fusedThisRound = false;

        for (const group of activeFusions) {
            const grade = group.inputGrade;
            const avail = getByGrade(grade).reduce((s, item) => s + item.count, 0);

            if (avail >= group.inputCount) {
                const consumed = pickAutoConsume(grade, group.inputCount);
                const fusion = fuseOne(group, consumed);
                batches.push(fusion);
                executed++;
                fusedThisRound = true;
                break;
            }
        }

        if (!fusedThisRound) break;
    }

    if (executed === 0) {
        alert('합성 가능한 아이템이 부족합니다.');
        return;
    }

    renderResults(batches, tickets, executed);
    updateFusionAvail();
}

function onFuseN() {
    if (!fuseNInput) return;
    let n = parseInt(fuseNInput.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 10000) n = 10000;
    fuseNInput.value = n;
    fuseAuto(n);
}

function onClearInventory() {
    if (!confirm('인벤토리와 천장 카운터를 모두 초기화합니다. 계속하시겠습니까?')) return;
    clearAll();
}

if (fuse1Btn) fuse1Btn.addEventListener('click', () => fuseAuto(1));
if (fuseNBtn) fuseNBtn.addEventListener('click', onFuseN);
if (fuseNInput) fuseNInput.addEventListener('keydown', e => { if (e.key === 'Enter') onFuseN(); });
if (clearInvBtn) clearInvBtn.addEventListener('click', onClearInventory);

const modeButtons = document.querySelectorAll('.mode-btn');
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentMode = btn.dataset.mode;
        modeButtons.forEach(b => b.classList.toggle('active', b === btn));
        updateFusionAvail();
    });
});

const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

subscribe(() => {
    updateFusionAvail();
    renderPity();
    renderInventory();
});

loadTheme();
updateFusionAvail();
renderPity();
renderInventory();