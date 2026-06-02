import { loadTheme, toggleTheme } from '../theme.js';
import { isPiPSupported, isActive, enterPiP, exitPiP } from './pip.js';

document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
loadTheme();

// ── State ─────────────────────────────────────────────────────────────────────

let timers = [];
let nextId = 1;
let rafId  = null;

function mkTimer() {
    return { id: nextId++, name: '버프', duration: 300, elapsed: 0, startTime: null, running: false, done: false, iconImg: null };
}

function remaining(t) {
    if (t.running) return Math.max(0, t.duration - t.elapsed - (Date.now() - t.startTime) / 1000);
    return Math.max(0, t.duration - t.elapsed);
}

// ── Timer actions ──────────────────────────────────────────────────────────────

function addTimer() {
    const t = mkTimer();
    timers.push(t);
    renderCard(t);
    if (!rafId) rafId = requestAnimationFrame(tick);
}

function deleteTimer(id) {
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

function applyDuration(t) {
    const card = document.getElementById(`tc-${t.id}`);
    const mins = Math.max(0, parseInt(card.querySelector('.t-mins').value) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(card.querySelector('.t-secs').value) || 0));
    t.duration = Math.max(1, mins * 60 + secs);
    card.querySelector('.t-mins').value = Math.floor(t.duration / 60);
    card.querySelector('.t-secs').value = String(t.duration % 60).padStart(2, '0');
    resetTimer(t);
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
        <div class="timer-header">
            <button class="timer-icon-btn" title="아이콘 선택"><span class="timer-icon-placeholder">🖼</span></button>
            <input type="file" class="timer-icon-file" accept="image/*" hidden>
            <input class="timer-name-input" type="text" value="${t.name}" placeholder="버프 이름" maxlength="20">
            <button class="timer-delete-btn" aria-label="삭제">✕</button>
        </div>
        <div class="timer-body">
            <div class="timer-duration-wrap">
                <span class="timer-dur-label">설정</span>
                <div class="timer-duration-setting">
                    <input class="timer-dur-input t-mins" type="number" min="0" max="99" value="${Math.floor(t.duration / 60)}">
                    <span class="timer-dur-sep">:</span>
                    <input class="timer-dur-input t-secs" type="number" min="0" max="59" value="${String(t.duration % 60).padStart(2, '0')}">
                </div>
            </div>
            <div class="timer-display">--:--</div>
        </div>
        <div class="timer-progress"><div class="timer-progress-fill"></div></div>
        <div class="timer-controls">
            <button class="calc-btn timer-start-btn">시작</button>
            <button class="calc-btn secondary timer-reset-btn">초기화</button>
        </div>`;

    el.querySelector('.timer-name-input').addEventListener('input', e => { t.name = e.target.value; });
    el.querySelector('.timer-delete-btn').addEventListener('click', () => deleteTimer(t.id));

    const iconBtn  = el.querySelector('.timer-icon-btn');
    const iconFile = el.querySelector('.timer-icon-file');
    iconBtn.addEventListener('click', () => iconFile.click());
    iconFile.addEventListener('change', () => {
        const file = iconFile.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                t.iconImg = img;
                iconBtn.innerHTML = `<img src="${e.target.result}" alt="icon">`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    el.querySelector('.timer-start-btn').addEventListener('click', () => t.running ? pauseTimer(t) : startTimer(t));
    el.querySelector('.timer-reset-btn').addEventListener('click', () => resetTimer(t));

    const onDurBlur = () => applyDuration(t);
    el.querySelector('.t-mins').addEventListener('change', onDurBlur);
    el.querySelector('.t-secs').addEventListener('change', onDurBlur);

    document.getElementById('timer-list').appendChild(el);
    refresh(t);
}

function refresh(t) {
    const card = document.getElementById(`tc-${t.id}`);
    if (!card) return;

    const rem = remaining(t);
    const pct = t.duration > 0 ? rem / t.duration : 0;

    // Completion check
    if (t.running && rem <= 0) {
        t.elapsed   = t.duration;
        t.startTime = null;
        t.running   = false;
        t.done      = true;
        card.classList.add('timer-just-done');
        card.addEventListener('animationend', () => card.classList.remove('timer-just-done'), { once: true });
    }

    // Countdown text
    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60);
    card.querySelector('.timer-display').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    // Progress bar
    const fill = card.querySelector('.timer-progress-fill');
    fill.style.width = `${pct * 100}%`;
    fill.classList.toggle('pct-mid', pct <= 0.5 && pct > 0.25);
    fill.classList.toggle('pct-low', pct <= 0.25 && !t.done);

    // State classes
    card.classList.toggle('timer-running', t.running);
    card.classList.toggle('timer-done',    t.done);
    card.classList.toggle('timer-urgent',  t.running && pct <= 0.25);

    // Start button
    const startBtn = card.querySelector('.timer-start-btn');
    startBtn.textContent = t.done ? '완료' : (t.running ? '일시정지' : '시작');
    startBtn.disabled    = t.done;

    // Disable duration inputs while running
    card.querySelector('.t-mins').disabled = t.running;
    card.querySelector('.t-secs').disabled = t.running;
}

// ── PiP ───────────────────────────────────────────────────────────────────────

const pipBtn = document.getElementById('pip-btn');

if (!isPiPSupported()) {
    pipBtn.disabled = true;
    pipBtn.title    = '이 브라우저는 PiP를 지원하지 않습니다';
} else {
    pipBtn.addEventListener('click', async () => {
        if (isActive()) {
            exitPiP();
            return;
        }
        pipBtn.disabled = true;
        try {
            await enterPiP(() => timers.map(t => ({
                id: t.id, name: t.name, duration: t.duration,
                remaining: remaining(t), running: t.running, done: t.done,
                iconImg: t.iconImg,
            })));
        } catch (e) {
            console.error('PiP 오류:', e);
        } finally {
            pipBtn.disabled = false;
        }
    });

    document.addEventListener('pip-enter', () => {
        pipBtn.textContent = '✕ PiP 종료';
        pipBtn.classList.add('pip-active');
    });
    document.addEventListener('pip-leave', () => {
        pipBtn.textContent = '🖼️ PiP 모드';
        pipBtn.classList.remove('pip-active');
    });
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.getElementById('add-timer-btn').addEventListener('click', addTimer);
addTimer();
