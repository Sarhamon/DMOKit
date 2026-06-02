import { loadTheme, toggleTheme } from '../theme.js';
import { isPiPSupported, isActive, enterPiP, exitPiP } from './pip.js';
import { BUFF_GROUPS, BUFF_BY_ID } from './buffs.js';

document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
loadTheme();

// ── State ─────────────────────────────────────────────────────────────────────

let timers = [];
let rafId  = null;

function remaining(t) {
    if (t.running) return Math.max(0, t.duration - t.elapsed - (Date.now() - t.startTime) / 1000);
    return Math.max(0, t.duration - t.elapsed);
}

function fmtDuration(secs) {
    if (secs >= 3600 && secs % 3600 === 0) return `${secs / 3600}시간`;
    if (secs % 60 === 0) return `${secs / 60}분`;
    return `${secs}초`;
}

// ── Timer actions ──────────────────────────────────────────────────────────────

function addTimerForBuff(def) {
    const t = { id: def.id, name: def.name, duration: def.duration, elapsed: 0, startTime: null, running: false, done: false };
    timers.push(t);
    renderCard(t);
    if (!rafId) rafId = requestAnimationFrame(tick);
}

function removeTimer(id) {
    timers = timers.filter(t => t.id !== id);
    document.getElementById(`tc-${id}`)?.remove();
    if (!timers.length && rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

function startTimer(t) {
    if (t.done) return;
    t.startTime = Date.now();
    t.running = true;
    refresh(t);
}

function pauseTimer(t) {
    if (!t.running) return;
    t.elapsed += (Date.now() - t.startTime) / 1000;
    t.startTime = null;
    t.running = false;
    refresh(t);
}

function resetTimer(t) {
    t.elapsed = 0; t.startTime = null; t.running = false; t.done = false;
    refresh(t);
}

// ── RAF tick ───────────────────────────────────────────────────────────────────

function tick() {
    timers.forEach(t => { if (t.running) refresh(t); });
    rafId = requestAnimationFrame(tick);
}

// ── Card render ────────────────────────────────────────────────────────────────

function renderCard(t) {
    const el = document.createElement('div');
    el.className = 'timer-card card';
    el.id = `tc-${t.id}`;
    el.innerHTML = `
        <div class="timer-header-simple">
            <span class="timer-preset-name">${t.name}</span>
            <div class="timer-display">--:--</div>
        </div>
        <div class="timer-progress"><div class="timer-progress-fill"></div></div>
        <div class="timer-controls">
            <button class="calc-btn timer-start-btn">시작</button>
            <button class="calc-btn secondary timer-reset-btn">초기화</button>
        </div>`;

    el.querySelector('.timer-start-btn').addEventListener('click', () => t.running ? pauseTimer(t) : startTimer(t));
    el.querySelector('.timer-reset-btn').addEventListener('click', () => resetTimer(t));

    document.getElementById('timer-list').appendChild(el);
    refresh(t);
}

function refresh(t) {
    const card = document.getElementById(`tc-${t.id}`);
    if (!card) return;

    const rem = remaining(t);
    const pct = t.duration > 0 ? rem / t.duration : 0;

    if (t.running && rem <= 0) {
        t.elapsed = t.duration; t.startTime = null; t.running = false; t.done = true;
        card.classList.add('timer-just-done');
        card.addEventListener('animationend', () => card.classList.remove('timer-just-done'), { once: true });
    }

    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60);
    card.querySelector('.timer-display').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    const fill = card.querySelector('.timer-progress-fill');
    fill.style.width = `${pct * 100}%`;
    fill.classList.toggle('pct-mid', pct <= 0.5 && pct > 0.25);
    fill.classList.toggle('pct-low', pct <= 0.25 && !t.done);

    card.classList.toggle('timer-running', t.running);
    card.classList.toggle('timer-done',    t.done);
    card.classList.toggle('timer-urgent',  t.running && pct <= 0.25);

    const startBtn = card.querySelector('.timer-start-btn');
    startBtn.textContent = t.done ? '완료' : (t.running ? '일시정지' : '시작');
    startBtn.disabled    = t.done;
}

// ── Buff picker ────────────────────────────────────────────────────────────────

function initBuffPicker() {
    const body = document.getElementById('buff-picker-body');
    BUFF_GROUPS.forEach((group, gi) => {
        const row = document.createElement('div');
        row.className = 'buff-group-row';

        if (group.label) {
            const lbl = document.createElement('span');
            lbl.className = 'buff-group-label-text';
            lbl.textContent = group.label;
            row.appendChild(lbl);
        }

        const btns = document.createElement('div');
        btns.className = 'buff-group-buttons';
        group.buffs.forEach(def => {
            const label = document.createElement('label');
            label.className = 'buff-toggle';

            const input = document.createElement('input');
            input.type      = group.exclusive ? 'radio' : 'checkbox';
            input.value     = def.id;
            input.className = 'buff-check';
            if (group.exclusive) {
                input.name = `excl-${gi}`;
                input.addEventListener('change', () => {
                    group.buffs.forEach(b => {
                        if (b.id !== def.id) removeTimer(b.id);
                    });
                });
            }

            const nameSpan = document.createElement('span');
            nameSpan.className   = 'buff-toggle-name';
            nameSpan.textContent = def.name;

            const durSpan = document.createElement('span');
            durSpan.className   = 'buff-toggle-dur';
            durSpan.textContent = fmtDuration(def.duration);

            label.append(input, nameSpan, durSpan);
            btns.appendChild(label);
        });

        row.appendChild(btns);
        body.appendChild(row);
    });
}

// ── PiP ───────────────────────────────────────────────────────────────────────

const pipBtn = document.getElementById('pip-btn');

if (!isPiPSupported()) {
    pipBtn.disabled = true;
    pipBtn.title    = '이 브라우저는 PiP를 지원하지 않습니다';
} else {
    pipBtn.addEventListener('click', async () => {
        if (isActive()) { exitPiP(); return; }
        pipBtn.disabled = true;
        try {
            await enterPiP(() => timers.map(t => ({
                id: t.id, name: t.name, duration: t.duration,
                remaining: remaining(t), running: t.running, done: t.done,
            })));
        } catch (e) {
            console.error('PiP 오류:', e);
        } finally {
            pipBtn.disabled = false;
        }
    });

    document.addEventListener('pip-enter', () => { pipBtn.textContent = '✕ PiP 종료'; pipBtn.classList.add('pip-active'); });
    document.addEventListener('pip-leave', () => { pipBtn.textContent = '🖼️ PiP 모드'; pipBtn.classList.remove('pip-active'); });
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.getElementById('start-all-btn').addEventListener('click', () => {
    document.querySelectorAll('.buff-check:checked').forEach(input => {
        const def = BUFF_BY_ID[input.value];
        if (!def) return;
        let t = timers.find(t => t.id === def.id);
        if (!t) {
            addTimerForBuff(def);
            t = timers.find(t => t.id === def.id);
        } else if (t.done) {
            resetTimer(t);
        }
        if (t && !t.running) startTimer(t);
    });
});

initBuffPicker();
