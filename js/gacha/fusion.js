import { loadTheme, toggleTheme } from '../theme.js';
import { fusions } from './fusionData.js';
import {
    addItems, consumeItems, getAll, getByGrade, getCountByGrade,
    getTotalCount, clearAll, getPity, incrementPity, resetPity, subscribe
} from './inventory.js';

const GRADE_ORDER = ['U', 'SSS+', 'SSS', 'SS+', 'SS', 'S+', 'S', 'A+', 'A', 'N'];

const fusionSelect = document.getElementById('fusionSelect');
const fusionAvail = document.getElementById('fusionAvail');
const fuse1Btn = document.getElementById('fuse1Btn');
const fuseNBtn = document.getElementById('fuseNBtn');
const fuseNInput = document.getElementById('fuseNInput');
const autoPane = document.getElementById('autoPane');
const manualPane = document.getElementById('manualPane');
const manualSlots = document.getElementById('manualSlots');
const manualHint = document.getElementById('manualHint');
const fuseManualBtn = document.getElementById('fuseManualBtn');
const clearSelBtn = document.getElementById('clearSelBtn');
const pityDisplay = document.getElementById('pityDisplay');
const fusionResultGrid = document.getElementById('fusionResultGrid');
const fusionResultCount = document.getElementById('fusionResultCount');
const invCount = document.getElementById('invCount');
const invSummary = document.getElementById('invSummary');
const invGrid = document.getElementById('invGrid');
const clearInvBtn = document.getElementById('clearInvBtn');
const modeButtons = document.querySelectorAll('.mode-btn');

let currentGroup = null;
let mode = 'auto';
let selectedSlots = [];

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

function populateFusionSelector() {
    fusionSelect.innerHTML = fusions.map((g, i) =>
        `<option value="${i}">${escapeHtml(g.name)} (${escapeHtml(g.inputGrade)}×${g.inputCount})</option>`
    ).join('');
}

function updateFusionAvail() {
    if (!currentGroup) { fusionAvail.textContent = '—'; return; }
    const grade = currentGroup.inputGrade;
    const avail = getByGrade(grade).reduce((s, i) => s + i.count, 0);
    const maxFusions = Math.floor(avail / currentGroup.inputCount);
    fusionAvail.textContent = `보유 ${grade}: ${avail}개 → 최대 ${maxFusions}회 합성 가능`;
    fuse1Btn.disabled = maxFusions === 0;
    fuse1Btn.textContent = `1회 합성 (${grade}×4)`;
}

function renderPity() {
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
    const selectableGrade = mode === 'manual' && currentGroup ? currentGroup.inputGrade : null;
    invGrid.innerHTML = sorted.map(it => {
        const selectable = selectableGrade === it.grade;
        const cls = `inv-item ${gradeClass(it.grade)}${selectable ? ' selectable' : ''}`;
        return `<div class="${cls}" data-name="${escapeHtml(it.name)}" data-grade="${escapeHtml(it.grade)}">
            <span class="inv-grade">${escapeHtml(it.grade)}</span>
            <span class="inv-name">${escapeHtml(it.name)}</span>
            <span class="inv-num">×${it.count}</span>
        </div>`;
    }).join('');
}

function renderResults(batches, requestedTickets, executedTickets) {
    const totalResults = batches.reduce((s, b) => s + 1 + (b.pityResult ? 1 : 0), 0);
    let suffix = `(${executedTickets}회 합성, ${totalResults}개 획득)`;
    if (requestedTickets > executedTickets) {
        suffix += ` · 재료 부족으로 ${requestedTickets - executedTickets}회 중단`;
    }
    fusionResultCount.textContent = suffix;

    const cards = [];
    for (const b of batches) {
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
    fusionResultGrid.innerHTML = cards.length ? cards.join('') : '<div class="empty-msg">결과 없음</div>';
}

function fuseAuto(tickets) {
    if (!currentGroup) return;
    const grade = currentGroup.inputGrade;
    const avail = getByGrade(grade).reduce((s, i) => s + i.count, 0);
    const maxFusions = Math.floor(avail / currentGroup.inputCount);
    const actual = Math.min(tickets, maxFusions);
    if (actual === 0) {
        alert(`${grade} 등급 아이템이 ${currentGroup.inputCount}개 미만입니다.`);
        return;
    }
    const batches = [];
    for (let i = 0; i < actual; i++) {
        const consumed = pickAutoConsume(grade, currentGroup.inputCount);
        const fusion = fuseOne(currentGroup, consumed);
        batches.push(fusion);
    }
    renderResults(batches, tickets, actual);
}

function fuseManual() {
    if (!currentGroup || selectedSlots.length !== currentGroup.inputCount) return;
    const consumed = [...selectedSlots];
    const fusion = fuseOne(currentGroup, consumed);
    selectedSlots = [];
    renderManualSlots();
    renderResults([fusion], 1, 1);
}

function renderManualSlots() {
    const cnt = currentGroup ? currentGroup.inputCount : 4;
    const grade = currentGroup ? currentGroup.inputGrade : '';
    const slots = [];
    for (let i = 0; i < cnt; i++) {
        const name = selectedSlots[i];
        slots.push(name
            ? `<div class="manual-slot filled" data-idx="${i}"><span class="r-name">${escapeHtml(name)}</span><span class="slot-remove">×</span></div>`
            : `<div class="manual-slot empty">${escapeHtml(grade)} 슬롯 ${i + 1}</div>`
        );
    }
    manualSlots.innerHTML = slots.join('');
    fuseManualBtn.disabled = selectedSlots.length !== cnt;
    fuseManualBtn.textContent = `합성 (${selectedSlots.length}/${cnt})`;
    manualHint.textContent = `아래 인벤토리에서 ${grade} 등급 아이템 ${cnt}개를 클릭하세요.`;
}

function onSelectItem(name, grade) {
    if (mode !== 'manual' || !currentGroup) return;
    if (grade !== currentGroup.inputGrade) return;
    if (selectedSlots.length >= currentGroup.inputCount) return;
    // Check we still have inventory count (subtract already-selected occurrences)
    const all = getAll();
    const inv = all.find(it => it.name === name);
    if (!inv) return;
    const alreadySelected = selectedSlots.filter(n => n === name).length;
    if (inv.count - alreadySelected <= 0) return;
    selectedSlots.push(name);
    renderManualSlots();
}

function onUnselectSlot(idx) {
    selectedSlots.splice(idx, 1);
    renderManualSlots();
}

function onGroupChange() {
    currentGroup = fusions[parseInt(fusionSelect.value, 10)];
    selectedSlots = [];
    updateFusionAvail();
    renderManualSlots();
    renderInventory();
}

function onModeChange(newMode) {
    mode = newMode;
    modeButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === newMode));
    autoPane.classList.toggle('hidden', newMode !== 'auto');
    manualPane.classList.toggle('hidden', newMode !== 'manual');
    if (newMode === 'manual') renderManualSlots();
    selectedSlots = [];
    renderInventory();
}

function onFuseN() {
    let n = parseInt(fuseNInput.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 10000) n = 10000;
    fuseNInput.value = n;
    fuseAuto(n);
}

function onClearInventory() {
    if (!confirm('인벤토리와 천장 카운터를 모두 초기화합니다. 계속하시겠습니까?')) return;
    clearAll();
    selectedSlots = [];
    renderManualSlots();
}

// Event wiring
fusionSelect.addEventListener('change', onGroupChange);
modeButtons.forEach(b => b.addEventListener('click', () => onModeChange(b.dataset.mode)));
fuse1Btn.addEventListener('click', () => fuseAuto(1));
fuseNBtn.addEventListener('click', onFuseN);
fuseNInput.addEventListener('keydown', e => { if (e.key === 'Enter') onFuseN(); });
fuseManualBtn.addEventListener('click', fuseManual);
clearSelBtn.addEventListener('click', () => { selectedSlots = []; renderManualSlots(); });
clearInvBtn.addEventListener('click', onClearInventory);

invGrid.addEventListener('click', e => {
    const el = e.target.closest('.inv-item');
    if (!el || !el.classList.contains('selectable')) return;
    onSelectItem(el.dataset.name, el.dataset.grade);
});

manualSlots.addEventListener('click', e => {
    const el = e.target.closest('.manual-slot.filled');
    if (!el) return;
    onUnselectSlot(parseInt(el.dataset.idx, 10));
});

document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

subscribe(() => {
    updateFusionAvail();
    renderPity();
    renderInventory();
});

loadTheme();
populateFusionSelector();
onGroupChange();
renderPity();
renderInventory();
