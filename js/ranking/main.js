import { WEEKLY_TIERS, SEASON_TIERS, RANKER_TIERS } from './data.js';
import { EXCHANGE_GROUPS, EQUIV } from './exchange.js';
import { loadTheme, toggleTheme } from '../theme.js';

// 영광 재료만 영광의 편린 기준으로 환산해 합산
function listEquiv(rewards) {
    return rewards.reduce((s, { name, qty }) => s + (EQUIV[name] ?? 0) * qty, 0);
}

// 교환 아이템의 영광의 편린 환산 단가
function unitCost(item) {
    const cost = item.mats.reduce((s, m) => s + EQUIV[m.name] * m.qty, 0);
    return cost / item.out;
}

// 시즌 수 → 년·개월 (시즌=8주, 1년=52주, 1개월≈4.33주)
function formatYearMonth(seasons) {
    const totalWeeks = seasons * 8;
    let years = Math.floor(totalWeeks / 52);
    let months = Math.round((totalWeeks % 52) / (52 / 12));
    if (months >= 12) { years += 1; months -= 12; }
    const parts = [];
    if (years > 0) parts.push(`${years}년`);
    if (months > 0) parts.push(`${months}개월`);
    return parts.length ? parts.join(' ') : '1개월 미만';
}

function buildExchangeUI() {
    // 등급 라디오 그룹 채우기
    const radio = (group, label, value, checked) =>
        `<label class="radio-option"><span class="label-text">${label}</span><input type="radio" name="${group}" value="${value}"${checked ? ' checked' : ''}></label>`;
    const shortLabel = t => t.label.replace('랭킹 ', '');

    document.getElementById('expWeekly').innerHTML =
        WEEKLY_TIERS.map((t, i) => radio('expWeekly', shortLabel(t), i, i === 0)).join('');
    document.getElementById('expSeason').innerHTML =
        SEASON_TIERS.map((t, i) => radio('expSeason', shortLabel(t), i, i === 0)).join('');
    document.getElementById('expRanker').innerHTML =
        radio('expRanker', '없음', -1, true) +
        RANKER_TIERS.map((t, i) => radio('expRanker', shortLabel(t), i, false)).join('');

    // 교환 목록: 재료별 카드 3열
    const cols = EXCHANGE_GROUPS.map((group, gi) => {
        const items = group.items.map((item, ii) => {
            const outText = item.out > 1 ? ` [${item.out}개]` : '';
            return `<label class="ex-item"><input type="radio" name="exTarget" data-ex="${gi}-${ii}"> ${item.name}${outText}</label>`;
        }).join('');
        return `<details class="ex-group"><summary>${group.currency} 교환</summary>${items}</details>`;
    }).join('');

    document.getElementById('exchangeList').innerHTML =
        `<div class="result-grid cols-3">${cols}</div>`;
}

function calculateExchange() {
    const result = document.getElementById('exchangeResult');

    const checked = document.querySelector('input[data-ex]:checked');
    if (!checked) {
        result.innerHTML = '<span class="ex-float-hint">목표 아이템을 선택하세요</span>';
        return;
    }
    const [gi, ii] = checked.dataset.ex.split('-').map(Number);
    const item = EXCHANGE_GROUPS[gi].items[ii];

    const totalCost = unitCost(item);
    const owned =
        (parseInt(document.getElementById('ownPyeonrin').value) || 0) * 1 +
        (parseInt(document.getElementById('ownPapyeon').value) || 0) * 10 +
        (parseInt(document.getElementById('ownJeungpyo').value) || 0) * 100 +
        (parseInt(document.getElementById('ownChowol').value) || 0) * 1000;
    const remaining = Math.max(0, totalCost - owned);

    const wi = parseInt(document.querySelector('input[name="expWeekly"]:checked').value);
    const si = parseInt(document.querySelector('input[name="expSeason"]:checked').value);
    const ri = parseInt(document.querySelector('input[name="expRanker"]:checked').value);
    const income =
        listEquiv(WEEKLY_TIERS[wi].rewards) * 6 +
        listEquiv(SEASON_TIERS[si].rewards) +
        (ri >= 0 ? listEquiv(RANKER_TIERS[ri].rewards) : 0);

    let timeText;
    if (remaining <= 0) {
        timeText = '✅ 바로 제작 가능';
    } else if (income <= 0) {
        timeText = '⚠️ 수급 불가';
    } else {
        const seasons = Math.ceil(remaining / income);
        const fmt = document.querySelector('input[name="viewFmt"]:checked').value;
        timeText = fmt === 'ws'
            ? `${seasons * 8}주 / ${seasons}시즌`
            : `${formatYearMonth(seasons)} [${seasons}시즌]`;
    }

    result.innerHTML =
        `<span class="ex-float-item">${item.name}</span><span class="ex-float-time">${timeText}</span>`;
}

const STORE_KEY = 'dmo_ranking_exchange';
const OWN_IDS = ['ownPyeonrin', 'ownPapyeon', 'ownJeungpyo', 'ownChowol'];

function saveState() {
    const checked = document.querySelector('input[data-ex]:checked');
    const state = {
        fmt: document.querySelector('input[name="viewFmt"]:checked').value,
        target: checked ? checked.dataset.ex : null,
        own: OWN_IDS.map(id => document.getElementById(id).value),
        weekly: document.querySelector('input[name="expWeekly"]:checked').value,
        season: document.querySelector('input[name="expSeason"]:checked').value,
        ranker: document.querySelector('input[name="expRanker"]:checked').value,
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function loadState() {
    let state;
    try { state = JSON.parse(localStorage.getItem(STORE_KEY)); } catch { state = null; }
    if (!state) return;

    const setRadio = (name, value) => {
        const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (el) el.checked = true;
    };
    setRadio('viewFmt', state.fmt);
    setRadio('expWeekly', state.weekly);
    setRadio('expSeason', state.season);
    setRadio('expRanker', state.ranker);

    if (Array.isArray(state.own)) {
        OWN_IDS.forEach((id, i) => {
            if (state.own[i] !== undefined) document.getElementById(id).value = state.own[i];
        });
    }
    if (state.target) {
        const t = document.querySelector(`input[data-ex="${state.target}"]`);
        if (t) {
            t.checked = true;
            t.closest('details')?.setAttribute('open', '');
        }
    }
}

function update() {
    calculateExchange();
    saveState();
}

document.getElementById('exchangeList').addEventListener('change', update);
OWN_IDS.forEach(id => {
    document.getElementById(id).addEventListener('input', update);
});
['expWeekly', 'expSeason', 'expRanker'].forEach(id => {
    document.getElementById(id).addEventListener('change', update);
});
document.querySelector('input[name="viewFmt"]').closest('.journal-radios').addEventListener('change', update);
document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

buildExchangeUI();
loadState();
calculateExchange();
loadTheme();
