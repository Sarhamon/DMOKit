const STORAGE_KEY = 'dmokit_inventory';
const PITY_STORAGE_KEY = 'dmokit_pity';

function loadFromStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

let state = loadFromStorage(STORAGE_KEY, { items: {} });
let pityState = loadFromStorage(PITY_STORAGE_KEY, {});
const listeners = new Set();

function notify() {
    saveToStorage(STORAGE_KEY, state);
    saveToStorage(PITY_STORAGE_KEY, pityState);
    for (const fn of listeners) fn();
}

export function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function addItems(items) {
    for (const it of items) {
        const existing = state.items[it.name];
        if (existing) {
            existing.count++;
        } else {
            state.items[it.name] = { name: it.name, grade: it.grade, count: 1 };
        }
    }
    notify();
}

export function consumeItems(names) {
    for (const name of names) {
        const slot = state.items[name];
        if (!slot || slot.count <= 0) {
            throw new Error(`Cannot consume "${name}": not in inventory`);
        }
        slot.count--;
        if (slot.count === 0) delete state.items[name];
    }
    notify();
}

export function getAll() {
    return Object.values(state.items);
}

export function getByGrade(grade) {
    return getAll().filter(it => it.grade === grade);
}

export function getCountByGrade() {
    const counts = {};
    for (const it of getAll()) {
        counts[it.grade] = (counts[it.grade] || 0) + it.count;
    }
    return counts;
}

export function getTotalCount() {
    return getAll().reduce((s, it) => s + it.count, 0);
}

export function clearAll() {
    state = { items: {} };
    pityState = {};
    notify();
}

export function getPity(groupName) {
    return pityState[groupName] || 0;
}

export function incrementPity(groupName) {
    pityState[groupName] = (pityState[groupName] || 0) + 1;
    notify();
    return pityState[groupName];
}

export function resetPity(groupName) {
    delete pityState[groupName];
    notify();
}
