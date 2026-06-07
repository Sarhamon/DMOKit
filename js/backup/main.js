import { loadTheme, toggleTheme } from '../theme.js';

document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
loadTheme();

// ── 데이터 백업 / 복원 ──
// DMOKit이 쓰는 localStorage 키(dmo*)만 대상. (github.io는 origin 공유라 다른 키는 건드리지 않음)
// 파이프라인: JSON → gzip(미지원 시 raw) → base64url → URL(#d=) / QR
const isAppKey = k => k.startsWith('dmo');

const textArea = document.getElementById('backupText');
const msgEl = document.getElementById('backupMsg');
const qrBox = document.getElementById('backupQr');

function setMsg(text, ok = true) {
    msgEl.textContent = text;
    msgEl.className = `backup-msg ${ok ? 'ok' : 'err'}`;
}

// ── base64url (URL fragment 안전) ──
function b64urlEncode(bytes) {
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

// ── gzip (CompressionStream 미지원 브라우저는 raw 폴백) ──
const canGzip = typeof CompressionStream === 'function';
const canGunzip = typeof DecompressionStream === 'function';

async function gzipBytes(str) {
    const cs = new CompressionStream('gzip');
    const w = cs.writable.getWriter();
    w.write(new TextEncoder().encode(str));
    w.close();
    return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}
async function gunzipBytes(bytes) {
    const ds = new DecompressionStream('gzip');
    const w = ds.writable.getWriter();
    w.write(bytes);
    w.close();
    return new TextDecoder().decode(await new Response(ds.readable).arrayBuffer());
}

// 스킴 표기: 'c'=압축 / 'r'=무압축
async function encode(json) {
    if (canGzip) return 'c.' + b64urlEncode(await gzipBytes(json));
    return 'r.' + b64urlEncode(new TextEncoder().encode(json));
}
async function decode(code) {
    const dot = code.indexOf('.');
    const scheme = dot > 0 ? code.slice(0, dot) : 'r';
    const bytes = b64urlDecode(dot > 0 ? code.slice(dot + 1) : code);
    if (scheme === 'c') {
        if (!canGunzip) throw new Error('no-gunzip');
        return gunzipBytes(bytes);
    }
    return new TextDecoder().decode(bytes);
}

const buildUrl = code => `${location.origin}${location.pathname}#d=${code}`;

function renderQr(url) {
    qrBox.innerHTML = '';
    if (typeof window.qrcode !== 'function') {
        qrBox.innerHTML = '<p class="backup-qr-note">QR 라이브러리를 불러오지 못했습니다.</p>';
        return;
    }
    try {
        const qr = window.qrcode(0, 'L'); // 0=자동 버전, L=최대 용량
        qr.addData(url);
        qr.make();
        qrBox.innerHTML = `<img class="backup-qr-img" src="${qr.createDataURL(4)}" alt="복원 QR 코드">`
            + '<p class="backup-qr-note">폰 카메라로 스캔하면 그 기기에서 바로 복원됩니다.</p>';
    } catch {
        qrBox.innerHTML = '<p class="backup-qr-note">데이터가 커서 QR로 만들 수 없습니다. 위 링크/코드를 사용하세요.</p>';
    }
}

function collect() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (isAppKey(k)) data[k] = localStorage.getItem(k);
    }
    return data;
}

async function exportData() {
    const data = collect();
    const count = Object.keys(data).length;
    if (count === 0) { setMsg('내보낼 저장 데이터가 없습니다.', false); return; }

    const url = buildUrl(await encode(JSON.stringify({ v: 1, data })));
    textArea.value = url;
    textArea.focus();
    textArea.select();
    renderQr(url);
    navigator.clipboard?.writeText(url)
        .then(() => setMsg(`${count}개 항목을 링크로 내보내 복사했습니다. QR로도 옮길 수 있어요.`))
        .catch(() => setMsg(`${count}개 항목을 내보냈습니다. 위 링크를 직접 복사하세요.`));
}

// 링크 전체 또는 코드만 붙여넣어도 동작
function extractCode(input) {
    input = input.trim();
    const i = input.indexOf('#d=');
    return i >= 0 ? input.slice(i + 3).split('&')[0].trim() : input;
}

async function applyImport(code, fromUrl = false) {
    let parsed;
    try {
        parsed = JSON.parse(await decode(code));
    } catch (e) {
        setMsg(e.message === 'no-gunzip'
            ? '이 브라우저는 압축 해제를 지원하지 않습니다.'
            : '코드를 해석할 수 없습니다. 링크/코드 전체를 정확히 붙여넣었는지 확인하세요.', false);
        return;
    }

    const data = parsed?.data;
    const keys = data && typeof data === 'object' ? Object.keys(data).filter(isAppKey) : [];
    if (keys.length === 0) { setMsg('복원할 DMOKit 데이터가 없습니다.', false); return; }

    if (!confirm(`${keys.length}개 항목을 복원합니다.\n현재 저장된 데이터는 덮어쓰여집니다. 계속할까요?`)) return;

    keys.forEach(k => localStorage.setItem(k, data[k]));
    if (fromUrl) history.replaceState(null, '', location.pathname); // #d= 제거 → 재실행 방지
    setMsg(`${keys.length}개 항목을 복원했습니다. 새로고침합니다…`);
    setTimeout(() => location.reload(), 800);
}

function importData() {
    if (!textArea.value.trim()) { setMsg('가져올 링크나 코드를 붙여넣어 주세요.', false); return; }
    applyImport(extractCode(textArea.value));
}

document.getElementById('exportBtn').addEventListener('click', exportData);
document.getElementById('importBtn').addEventListener('click', importData);

// 공유 링크(#d=)로 들어온 경우 자동 복원 제안
if (location.hash.startsWith('#d=')) {
    const code = location.hash.slice(3).split('&')[0];
    textArea.value = buildUrl(code);
    applyImport(code, true);
}
