// 전역 최적 가치표를 백그라운드에서 빌드하는 모듈 워커. (~0.2~0.5s, 7.7MB)
// 메인 스레드 프리징 방지용. 옵션셋이 바뀔 때만 호출됨.

import { buildDP } from './dpCore.js';

self.onmessage = ({ data: { sig, opts } }) => {
    const V = buildDP(opts);
    self.postMessage({ sig, buffer: V.buffer }, [V.buffer]); // 버퍼 소유권 이전
};
