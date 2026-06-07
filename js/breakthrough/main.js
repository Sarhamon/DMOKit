import { loadTheme, toggleTheme } from '../theme.js';
import {
    MAX_ATTEMPTS, CELLS, PROB_START, PROB_MIN, PROB_MAX,
    STAGE_TABLE, INCREASE_POOL, DECREASE_POOL,
} from './breakthroughData.js';

// 5행 = 증가 3 + 감소 2 고정
const ROW_KINDS = ['inc', 'inc', 'inc', 'dec', 'dec'];

const rowsEl = document.getElementById('btRows');
const optListEl = document.getElementById('btOptList');
const totalEl = document.getElementById('btTotal');
const hintEl = document.getElementById('btHint');
const probEl = document.getElementById('btProb');
const countEl = document.getElementById('btCount');
const stageEls = [document.getElementById('btS1'), document.getElementById('btS2'), document.getElementById('btS3')];

// 시뮬 상태: { count(공유), prob(공유), rows: [{ opt, pos, base, bonus }] }
let sim;

// 상태(시뮬 진행 + 주사위 + 가격)를 localStorage에 저장해 새로고침해도 유지.
// 1 랜덤 능력치 = 주사위 1개. 가격은 비트 단위.
const STORAGE_KEY = 'dmo_breakthrough';

function loadStore() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
        return {};
    }
}
const store = loadStore();

let dice = store.dice ?? 0;
let price = { t: store.price?.t ?? 0, m: store.price?.m ?? 0, b: store.price?.b ?? 0 };

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        price,
        dice,
        sim: sim && {
            count: sim.count,
            prob: sim.prob,
            // opt는 kind+name으로만 저장 → 로딩 시 풀에서 재연결
            rows: sim.rows.map(r => ({
                kind: r.opt.kind, name: r.opt.name,
                pos: r.pos, base: r.base, bonus: r.bonus, status: r.status,
            })),
        },
    }));
}

// 저장된 시뮬 복원. 형식/옵션이 안 맞으면 false(새로 시작).
function restoreSim(saved) {
    if (!saved?.rows || saved.rows.length !== ROW_KINDS.length) return false;
    const rows = saved.rows.map(r => {
        const opt = poolOf(r.kind).find(o => o.name === r.name);
        return opt ? { opt, pos: r.pos, base: r.base, bonus: r.bonus, status: r.status ?? [] } : null;
    });
    if (rows.some(r => !r)) return false;
    sim = { count: saved.count ?? 0, prob: saved.prob ?? PROB_START, rows };
    render();
    return true;
}

// 비트 단위: 1T = 1000M, 1M = 1000B. (옵션 시뮬과 동일 규칙)
const priceBits = () => price.t * 1_000_000 + price.m * 1000 + price.b;
function fmtBits(bits) {
    const b = bits % 1000;
    const m = Math.floor(bits / 1000) % 1000;
    const t = Math.floor(bits / 1_000_000);
    const parts = [];
    if (t) parts.push(`${t}T`);
    if (t || m) parts.push(`${m}M`);
    parts.push(`${b}B`);
    return parts.join(' ');
}
function updateCost() {
    document.getElementById('btDice').textContent = dice;
    document.getElementById('btCostTotal').textContent = fmtBits(dice * priceBits());
}

const poolOf = kind => (kind === 'inc' ? INCREASE_POOL : DECREASE_POOL);
const pick = pool => pool[Math.floor(Math.random() * pool.length)];

// 표시용 숫자 포맷 (부동소수 보정 + 부호 + 단위)
const round = v => Math.round(v * 100) / 100;
function signed(v, unit) {
    const n = round(v);
    const suffix = unit === 'pct' ? '%' : '';
    if (n > 0) return `+${n}${suffix}`;
    if (n < 0) return `${n}${suffix}`;
    return `0${suffix}`;
}

const rowMax = row =>
    row.opt.base.reduce((a, b) => a + b, 0) +
    Object.values(row.opt.bonus ?? {}).reduce((a, b) => a + b, 0);

function newSim(randomize) {
    const rows = ROW_KINDS.map((kind, i) => {
        // randomize=false면 기존 옵션 유지, 진행도만 초기화
        const opt = !randomize && sim ? sim.rows[i].opt : pick(poolOf(kind));
        return { opt, pos: 0, base: 0, bonus: 0, status: [] };
    });
    sim = { count: 0, prob: PROB_START, rows };
    render();
}

// 한 행 1회 돌파 시도 (공유 카운트 1 소모, 공유 확률로 롤)
function attempt(i) {
    const row = sim.rows[i];
    if (sim.count >= MAX_ATTEMPTS || row.pos >= CELLS) return;

    sim.count++;
    const [s1, s2, s3] = STAGE_TABLE[sim.prob];
    const r = Math.random() * 100;
    let adv = 0;
    if (r < s1) adv = 1;
    else if (r < s1 + s2) adv = 2;
    else if (r < s1 + s2 + s3) adv = 3;

    if (adv > 0) {
        // 성공: 단계만큼 전진, 각 칸 녹색(값 획득)
        for (let k = 0; k < adv && row.pos < CELLS; k++) {
            row.base += row.opt.base[row.pos];
            const b = row.opt.bonus?.[row.pos];
            if (b != null) row.bonus += b;
            row.status[row.pos] = 'ok';
            row.pos++;
        }
        sim.prob = Math.max(PROB_MIN, sim.prob - 10);
    } else {
        // 실패: 현재 칸 빨강(값 미획득) + 다음 칸으로 전진
        row.status[row.pos] = 'fail';
        row.pos++;
        sim.prob = Math.min(PROB_MAX, sim.prob + 10);
    }
    render();
}

function renderRow(row, i) {
    // 행 전체가 탭 영역 (모바일 터치 편의). 활성 = 시도 가능 행.
    const rowActive = sim.count < MAX_ATTEMPTS && row.pos < CELLS;

    const el = document.createElement('div');
    el.className = `bt-row bt-row--${row.opt.kind}`;
    if (rowActive) {
        el.classList.add('bt-row--active');
        el.title = '눌러서 돌파 시도';
        el.onclick = () => attempt(i);
    }

    const arrow = document.createElement('div');
    arrow.className = 'bt-arrow';
    arrow.textContent = row.opt.kind === 'inc' ? '▲' : '▼';
    el.appendChild(arrow);

    // 옵션명: 데스크톱에선 숨김(사이드 선택), 모바일에서만 표시
    const name = document.createElement('div');
    name.className = 'bt-row-name';
    name.textContent = row.opt.name;
    el.appendChild(name);

    const cells = document.createElement('div');
    cells.className = 'bt-cells';
    for (let c = 0; c < CELLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'bt-cell';
        if (c < row.pos) cell.classList.add(row.status[c] === 'fail' ? 'failed' : 'filled');
        else if (c === row.pos) cell.classList.add('next');

        cell.innerHTML = `<span class="bt-cell-v">${signed(row.opt.base[c], row.opt.unit)}</span>`;
        const b = row.opt.bonus?.[c];
        if (b != null) cell.innerHTML += `<span class="bt-cell-b">${signed(b, row.opt.unit)}</span>`;
        cells.appendChild(cell);
    }
    el.appendChild(cells);

    el.appendChild(accBox('기본', row.base, row.opt.unit, 'base'));
    el.appendChild(accBox('보너스', row.bonus, row.opt.unit, 'bonus'));
    return el;
}

// 사이드 패널: 행 순서대로 옵션 선택 드롭다운 (▲증가 / ▼감소)
function renderOptList() {
    optListEl.innerHTML = '';
    sim.rows.forEach(row => {
        const wrap = document.createElement('div');
        wrap.className = `bt-opt-row bt-row--${row.opt.kind}`;

        const arrow = document.createElement('span');
        arrow.className = 'bt-arrow';
        arrow.textContent = row.opt.kind === 'inc' ? '▲' : '▼';
        wrap.appendChild(arrow);

        const sel = document.createElement('select');
        sel.className = 'bt-opt';
        const pool = poolOf(row.opt.kind);
        pool.forEach((o, idx) => {
            const op = document.createElement('option');
            op.value = idx;
            op.textContent = o.name;
            if (o.name === row.opt.name) op.selected = true;
            sel.appendChild(op);
        });
        sel.onchange = () => {
            // 옵션 변경 시 해당 행 진행도만 초기화 (공유 카운트/확률 유지)
            Object.assign(row, { opt: pool[+sel.value], pos: 0, base: 0, bonus: 0, status: [] });
            render();
        };
        wrap.appendChild(sel);

        optListEl.appendChild(wrap);
    });
}

function accBox(label, val, unit, cls) {
    const box = document.createElement('div');
    box.className = `bt-acc ${cls}`;
    box.innerHTML = `<span>${label}</span><b>${signed(val, unit)}</b>`;
    return box;
}

function render() {
    countEl.textContent = sim.count;
    probEl.textContent = `${sim.prob}%`;
    STAGE_TABLE[sim.prob].forEach((p, i) => { stageEls[i].textContent = `${p}%`; });

    rowsEl.innerHTML = '';
    sim.rows.forEach((row, i) => rowsEl.appendChild(renderRow(row, i)));

    renderOptList();

    totalEl.innerHTML = '';
    sim.rows.forEach(row => {
        const item = document.createElement('div');
        item.className = 'bt-total-item';
        const cur = signed(row.base + row.bonus, row.opt.unit);
        const max = signed(rowMax(row), row.opt.unit);
        item.innerHTML = `<span class="t-name">${row.opt.name}</span>` +
            `<span class="t-val"><b>${cur}</b> / ${max}</span>`;
        totalEl.appendChild(item);
    });

    updateCost();
    save();

    const allDone = sim.rows.every(r => r.pos >= CELLS);
    hintEl.textContent = sim.count >= MAX_ATTEMPTS
        ? '돌파 시도 횟수를 모두 사용했습니다. (다시시도/랜덤 능력치로 초기화)'
        : allDone
            ? '모든 행이 완성되었습니다.'
            : '강조된 칸을 클릭하면 해당 행을 1회 돌파 시도합니다.';
}

// 랜덤 능력치 = 주사위 1개 소모 후 옵션 재추첨
document.getElementById('btRandom').onclick = () => { dice++; newSim(true); };
document.getElementById('btRetry').onclick = () => newSim(false);
document.getElementById('btDiceReset').onclick = () => { dice = 0; save(); updateCost(); };

// 가격 입력 (정적 요소라 1회 바인딩) — 변경 시 저장 + 비용만 갱신
const priceInputs = { t: 'btPriceT', m: 'btPriceM', b: 'btPriceB' };
for (const [key, id] of Object.entries(priceInputs)) {
    const el = document.getElementById(id);
    el.value = price[key];
    el.addEventListener('input', () => {
        price[key] = Math.max(0, parseInt(el.value, 10) || 0);
        save();
        updateCost();
    });
}

document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

loadTheme();
// 저장된 상태가 있으면 복원, 없으면 새로 추첨 (새로고침 시 리롤 방지)
if (!restoreSim(store.sim)) newSim(true);
