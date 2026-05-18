import { formatDuration, formatKoreanNumber, formatSimple } from '../format.js';

let lockedVisible = true;

export function applyLockedVisibility() {
    const tbody = document.getElementById('resultBody');
    const dividerTd = tbody.querySelector('.divider-row td');
    if (!dividerTd) return;
    tbody.querySelectorAll('.locked').forEach(row => {
        row.classList.toggle('locked-hidden', !lockedVisible);
    });
    dividerTd.innerHTML = lockedVisible
        ? '▼ 입장 불가 (레벨 부족) ▼'
        : '▶ 입장 불가 (레벨 부족) ▶';
}

export function toggleLockedVisibility() {
    lockedVisible = !lockedVisible;
    applyLockedVisibility();
}

export function renderComingSoon() {
    document.getElementById('reqExpDisplay').innerHTML = "추가 예정";
    document.getElementById('resultBody').innerHTML =
        `<tr><td class="empty-msg" colspan="9">추가 예정인 레벨입니다.</td></tr>`;
}

export function renderMaxLevel() {
    document.getElementById('reqExpDisplay').innerHTML = "MAX LEVEL";
    document.getElementById('resultBody').innerHTML =
        `<tr><td class="empty-msg" colspan="9">최대 레벨입니다.</td></tr>`;
}

export function renderTargetPlan(plan, currentLevel, targetLevel) {
    document.getElementById('targetSummary').innerHTML = `Lv.${currentLevel} → Lv.${targetLevel}`;

    const body = document.getElementById('targetResultBody');
    if (plan.segments.length === 0) {
        body.innerHTML = `<tr><td class="empty-msg" colspan="4">유효한 목표를 입력하세요.</td></tr>`;
        return;
    }

    const segmentRows = plan.segments.map(seg => `<tr>
        <td>Lv.${seg.startLevel} → ${seg.endLevel}</td>
        <td class="col-name">${seg.placeName}</td>
        <td><span class="runs-badge">${seg.runs}회</span></td>
        <td>${formatDuration(seg.timeMinutes)}</td>
    </tr>`).join('');

    const totalRow = `<tr class="total-row">
        <td><b>합계</b></td>
        <td>—</td>
        <td><b>${plan.totalRuns}회</b></td>
        <td><b>${formatDuration(plan.totalMinutes)}</b></td>
    </tr>`;

    body.innerHTML = segmentRows + totalRow;
}

function buildAfterRunCell(afterRun) {
    if (afterRun.maxLevel) return "<b>MAX LEVEL</b>";
    const pctSuffix = afterRun.pct !== null ? ` <small>(${afterRun.pct.toFixed(2)}%)</small>` : '';
    if (afterRun.levelsGained > 1) {
        return `<b>+${afterRun.levelsGained}레벨</b>${pctSuffix}`;
    }
    if (afterRun.levelsGained === 1) {
        return `<b>LEVEL UP</b>${pctSuffix}`;
    }
    return afterRun.pct.toFixed(4) + "%";
}

function buildRow(item, index, isFirstUnlocked) {
    const hour = Math.floor(item.time / 60);
    const rankDisplay = item.isLocked ? "-" : index + 1;
    const rowClass = isFirstUnlocked ? 'rank-1' : (item.isLocked ? 'locked' : '');

    let percentStr, endPercentStr, runsStr, totalTimeStr;
    if (item.isLocked) {
        percentStr = "탐험불가";
        endPercentStr = "-";
        runsStr = "-";
        totalTimeStr = "-";
    } else {
        percentStr = item.percent < 0.0001 ? "0.0001%↓" : item.percent.toFixed(4) + "%";
        endPercentStr = buildAfterRunCell(item.afterRun);
        runsStr = `<span class="runs-badge">${item.runsNeeded}회</span>`;
        totalTimeStr = formatDuration(item.runsNeeded * item.time);
    }

    return `<tr class="${rowClass}">
        <td>${rankDisplay}</td>
        <td class="col-name">${item.name}</td>
        <td><span class="req-badge">Lv.${item.level}↑</span></td>
        <td>${hour}시간</td>
        <td class="col-percent">${percentStr}</td>
        <td>${endPercentStr}</td>
        <td>${runsStr}</td>
        <td>${formatSimple(Math.floor(item.expPerHour))}/h</td>
        <td>${totalTimeStr}</td>
    </tr>`;
}

export function renderResults(results, requiredExp) {
    document.getElementById('reqExpDisplay').innerHTML = formatKoreanNumber(requiredExp);

    const rows = [];
    let dividerAdded = false;

    results.forEach((item, index) => {
        if (item.isLocked && !dividerAdded) {
            rows.push(`<tr class="divider-row"><td colspan="9">▼ 입장 불가 (레벨 부족) ▼</td></tr>`);
            dividerAdded = true;
        }
        rows.push(buildRow(item, index, index === 0 && !item.isLocked));
    });

    document.getElementById('resultBody').innerHTML = rows.join('');
    applyLockedVisibility();
}
