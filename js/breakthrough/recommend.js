// 돌파 추천기: 현재 보드에서 "기대값상 어느 행을 누르는 게 전역 최적인지" 알려준다.
//
// 전역 최적 DP(dpCore)의 가치표 V를 옵션셋당 1회 빌드(Web Worker, ~0.3s)하고 캐시.
// 이후 모든 클릭은 V를 1-스텝 조회하는 O(1) 연산 → 즉시 추천.
// 옵션 변경(리롤/드롭다운)으로 옵션셋이 바뀌면 자동 재빌드.

import { MAX_ATTEMPTS } from './breakthroughData.js';
import { makeInfos, bestAction } from './dpCore.js';

let worker = null;
let dp = { sig: null, V: null };   // 준비된 가치표
let building = null;               // 현재 빌드 중인 sig
let onReady = null;                // 빌드 완료 시 호출(보통 render)

// 옵션셋 식별자: 행 순서대로 종류+이름. (같은 옵션 중복 허용이므로 순서 포함)
const sigOf = rows => rows.map(r => r.opt.kind + ':' + r.opt.name).join('|');

function getWorker() {
    if (!worker) {
        worker = new Worker(new URL('./dpWorker.js', import.meta.url), { type: 'module' });
        worker.onmessage = ({ data: { sig, buffer } }) => {
            if (sig !== building) return; // 더 최신 요청이 있으면 무시
            dp = { sig, V: new Float64Array(buffer) };
            building = null;
            onReady?.();
        };
    }
    return worker;
}

// 옵션셋이 바뀌었으면 워커에 가치표 빌드를 요청. 준비되면 cb() 호출(재렌더용).
export function ensureDP(rows, cb) {
    onReady = cb;
    const sig = sigOf(rows);
    if (dp.sig === sig || building === sig) return;
    building = sig;
    const opts = rows.map(r => ({ base: r.opt.base, bonus: r.opt.bonus ?? null, kind: r.opt.kind }));
    getWorker().postMessage({ sig, opts });
}

// 현재 보드 추천. 반환 { best: 행 index | -1, stop, qs, ready }.
// ready=false → 아직 이 옵션셋의 가치표 빌드 중(추천 보류).
export function recommend(rows, prob, count) {
    const sig = sigOf(rows);
    if (dp.sig !== sig || !dp.V) return { best: -1, stop: false, qs: rows.map(() => null), ready: false };
    if (count >= MAX_ATTEMPTS) return { best: -1, stop: true, qs: rows.map(() => null), ready: true };
    const infos = makeInfos(rows.map(r => r.opt));
    const pos = rows.map(r => r.pos);
    return { ...bestAction(dp.V, infos, pos, prob), ready: true };
}
