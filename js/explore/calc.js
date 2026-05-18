import { places, MAX_LEVEL } from './data.js';
import { expTable } from './expTable.js';

export function simulateExpGain(startLevel, startPct, expGain) {
    let level = startLevel;
    let currentExp = Math.round(expTable[level] * (startPct / 100)) + expGain;
    let levelsGained = 0;

    while (level < MAX_LEVEL && expTable[level] > 0 && currentExp >= expTable[level]) {
        currentExp -= expTable[level];
        level++;
        levelsGained++;
    }

    if (level >= MAX_LEVEL) {
        return { level, pct: 0, levelsGained, maxLevel: true };
    }
    if (expTable[level] === 0) {
        return { level, pct: null, levelsGained, maxLevel: false };
    }
    return { level, pct: (currentExp / expTable[level]) * 100, levelsGained, maxLevel: false };
}

function bestPlaceFor(level) {
    let best = null;
    for (const p of places) {
        if (p.level > level) continue;
        if (!best || (p.exp / p.time) > (best.exp / best.time)) best = p;
    }
    return best;
}

export function computeTargetPlan(currentLevel, currentPct, targetLevel, multiplier) {
    let level = currentLevel;
    let exp = Math.round(expTable[level] * (currentPct / 100));

    const segments = [];
    let segment = null;
    const SAFETY = 1000000;
    let i = 0;

    while (level < targetLevel && expTable[level] > 0 && i++ < SAFETY) {
        const place = bestPlaceFor(level);
        if (!place) break;

        if (!segment || segment.placeId !== place.id) {
            if (segment) segments.push(segment);
            segment = {
                placeId: place.id,
                placeName: place.name,
                startLevel: level,
                endLevel: level,
                runs: 0,
                timeMinutes: 0,
            };
        }

        exp += place.exp * multiplier;
        segment.runs++;
        segment.timeMinutes += place.time;

        while (level < targetLevel && expTable[level] > 0 && exp >= expTable[level]) {
            exp -= expTable[level];
            level++;
        }
        segment.endLevel = level;
    }
    if (segment) segments.push(segment);

    const totalRuns = segments.reduce((s, x) => s + x.runs, 0);
    const totalMinutes = segments.reduce((s, x) => s + x.timeMinutes, 0);

    return { segments, totalRuns, totalMinutes, reachedLevel: level };
}

export function computeResults(level, currentPct, expMultiplier) {
    const requiredExp = expTable[level];

    return places.map(p => {
        const gainedExp = p.exp * expMultiplier;
        const expPerHour = (gainedExp / p.time) * 60;
        const percent = (gainedExp / requiredExp) * 100;
        const isLocked = level < p.level;

        let runsNeeded = 0;
        if (!isLocked && percent > 0) {
            const remaining = 100 - currentPct;
            runsNeeded = Math.ceil(remaining / percent);
        }

        const afterRun = isLocked ? null : simulateExpGain(level, currentPct, gainedExp);

        return { ...p, expPerHour, percent, isLocked, runsNeeded, afterRun };
    }).sort((a, b) => {
        if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1;
        return b.expPerHour - a.expPerHour;
    });
}
