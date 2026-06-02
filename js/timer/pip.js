let canvas = null;
let ctx    = null;
let video  = null;
let rafId  = null;
let _getTimers = null;

export function isPiPSupported() {
    return !!document.pictureInPictureEnabled;
}

export function isActive() {
    return !!document.pictureInPictureElement;
}

export async function enterPiP(getTimers) {
    _getTimers = getTimers;

    canvas = document.createElement('canvas');
    canvas.width  = 400;
    canvas.height = 300;
    ctx = canvas.getContext('2d');

    // Draw before captureStream so the stream has a frame immediately.
    // Without this the video readyState stays HAVE_NOTHING and
    // requestPictureInPicture throws InvalidStateError.
    _render(getTimers());

    const stream = canvas.captureStream();
    video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    // Must be in the DOM; detached elements throw NotSupportedError.
    video.style.cssText = 'position:fixed;width:1px;height:1px;top:-2px;left:-2px;opacity:0;pointer-events:none';
    document.body.appendChild(video);

    await video.play();

    // Wait until the browser has decoded at least one frame (readyState >= HAVE_CURRENT_DATA).
    if (video.readyState < 2) {
        await new Promise((resolve, reject) => {
            video.addEventListener('canplay', resolve, { once: true });
            video.addEventListener('error',   reject,  { once: true });
        });
    }

    video.addEventListener('enterpictureinpicture', () => {
        document.dispatchEvent(new CustomEvent('pip-enter'));
    });
    video.addEventListener('leavepictureinpicture', () => {
        _cleanup();
        document.dispatchEvent(new CustomEvent('pip-leave'));
    });

    _startLoop();
    await video.requestPictureInPicture();
}

export function exitPiP() {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    }
}

function _cleanup() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    video?.remove();
    canvas = null;
    ctx    = null;
    video  = null;
    _getTimers = null;
}

function _startLoop() {
    function loop() {
        if (!canvas || !ctx) return;
        _render(_getTimers ? _getTimers() : []);
        rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
}

function _layout(n, W, H) {
    let cols, rows;
    if      (n <= 2) { cols = n; rows = 1; }
    else if (n <= 4) { cols = 2; rows = Math.ceil(n / 2); }
    else             { cols = 3; rows = Math.ceil(n / 3); }
    const cellW = W / cols;
    const cellH = H / rows;
    const r = Math.min(cellW, cellH) * 0.38;
    return Array.from({ length: n }, (_, i) => ({
        cx: cellW * (i % cols) + cellW / 2,
        cy: cellH * Math.floor(i / cols) + cellH / 2,
        r,
    }));
}

function _clip(text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t + '…';
}

function _drawTimer(t, cx, cy, r) {
    const pct  = t.duration > 0 ? Math.max(0, Math.min(1, t.remaining / t.duration)) : 0;
    const sw   = Math.max(5, r * 0.13);
    const TAU  = Math.PI * 2;
    const TOP  = -Math.PI / 2;

    // Track ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.strokeStyle = '#2d333b';
    ctx.lineWidth   = sw;
    ctx.lineCap     = 'butt';
    ctx.stroke();

    // Progress arc
    if (!t.done && pct > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, TOP, TOP + TAU * pct);
        ctx.strokeStyle = pct > 0.5 ? '#3fb950' : pct > 0.25 ? '#d29922' : '#f85149';
        ctx.lineWidth   = sw;
        ctx.lineCap     = 'round';
        ctx.stroke();
    }

    const timeColor = t.done ? '#484f58' : (t.running ? '#58a6ff' : '#c9d1d9');
    const mins      = Math.floor(t.remaining / 60);
    const secs      = Math.floor(t.remaining % 60);
    const timeStr   = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    const timeFontSize = Math.max(10, Math.floor(r * 0.36));
    const nameFontSize = Math.max(8,  Math.floor(r * 0.18));
    const nameColor    = t.done ? '#484f58' : '#6e7681';

    ctx.fillStyle = timeColor;
    ctx.font      = `bold ${timeFontSize}px monospace`;
    ctx.fillText(timeStr, cx, cy - nameFontSize * 0.7);

    ctx.fillStyle = nameColor;
    ctx.font      = `${nameFontSize}px system-ui, sans-serif`;
    ctx.fillText(_clip(t.name || '버프', r * 1.6), cx, cy + timeFontSize * 0.55);
}

function _render(timers) {
    const W = 400, H = 300;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    if (!timers.length) {
        ctx.fillStyle    = '#6e7681';
        ctx.font         = '16px system-ui, sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('타이머를 추가하세요', W / 2, H / 2);
        return;
    }

    const positions = _layout(timers.length, W, H);
    timers.forEach((t, i) => {
        const { cx, cy, r } = positions[i];
        _drawTimer(t, cx, cy, r);
    });
}
