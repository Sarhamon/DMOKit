// 돌파 옵션 시뮬레이터 데이터
//
// 각 옵션은 10칸 트랙. base[i] = i번째 칸 도달 시 '기본'에 누적되는 값.
// bonus[i] = 해당 칸의 보너스값(있는 칸만). 도달 시 base는 '기본', bonus는 '보너스'에 각각 무조건 누적.
//   → 총 획득 = 기본 + 보너스.
// unit: 'flat' = 정수 스탯 / 'pct' = % 스탯.
// 행 구성: 증가 3행 + 감소 2행 고정. 같은 옵션 중복 허용(랜덤 추첨 시 with replacement).

export const MAX_ATTEMPTS = 40;
export const CELLS = 10;
export const PROB_START = 75;
export const PROB_MIN = 25;
export const PROB_MAX = 75;

// 총 성공확률(%) → [1단계, 2단계, 3단계] 개별 성공확률(%) 룩업표.
// 성공 시 -10 / 실패 시 +10 으로 PROB_MIN~PROB_MAX 사이를 오감.
export const STAGE_TABLE = {
    75: [59, 15, 1],
    65: [54.2, 10, 0.8],
    55: [49.4, 5, 0.6],
    45: [41.6, 3, 0.4],
    35: [32.8, 2, 0.2],
    25: [23.9, 1, 0.1],
};

export const ATTRIBUTES = [
    '언노운', '백신', '데이터', '바이러스', '강철', '전기', '어둠',
    '빛', '나무', '바람', '땅', '불', '물', '얼음',
];

// 감소식 트랙 생성기: 앞 zeros칸 0, 나머지 val 반복 (총 10칸)
const dec = (zeros, val) => Array.from({ length: CELLS }, (_, i) => (i < zeros ? 0 : val));

// 증가식 스탯 옵션 (속성 피해 제외)
const INCREASE_STATS = [
    { name: '최대 생명력',   unit: 'flat', base: [0, 0, 0, 0, 50, 100, 200, 300, 400, 500], bonus: { 8: 500, 9: 600 } },
    { name: '최대 디지소울', unit: 'flat', base: [0, 0, 0, 0, 50, 100, 200, 300, 400, 500], bonus: { 8: 500, 9: 600 } },
    { name: '공격력',       unit: 'flat', base: [0, 0, 0, 0, 30, 50, 100, 300, 150, 200], bonus: { 8: 200, 9: 300 } },
    { name: '치명타',       unit: 'pct',  base: [0, 0, 0, 0, 0.2, 0.3, 0.5, 1.5, 1, 2], bonus: { 8: 0.5, 9: 3 } },
    { name: '방어력',       unit: 'flat', base: [0, 0, 0, 0, 30, 50, 100, 300, 150, 200], bonus: { 8: 200, 9: 300 } },
    { name: '회피율',       unit: 'pct',  base: [0, 0, 0, 0, 0.2, 0.3, 0.5, 1.5, 1, 2], bonus: { 8: 0.5, 9: 3 } },
    { name: '적중도',       unit: 'flat', base: [0, 0, 0, 0, 20, 30, 50, 150, 100, 200], bonus: { 8: 50, 9: 300 } },
    { name: '블럭율',       unit: 'pct',  base: [0, 0, 0, 0, 0.2, 0.3, 0.5, 1.5, 1, 2], bonus: { 8: 0.5, 9: 3 } },
];

// 증가식 속성 피해 (14속성 공통 테이블)
const INCREASE_ATTR = { unit: 'pct', base: [0, 0, 0, 0, 0, 0, 1, 1, 2, 2], bonus: { 9: 1 } };

// 감소식 스탯 옵션 (보너스 없음)
const DECREASE_STATS = [
    { name: '최대 생명력',   unit: 'flat', base: dec(3, -150) },
    { name: '최대 디지소울', unit: 'flat', base: dec(3, -150) },
    { name: '공격력',       unit: 'flat', base: dec(3, -75) },
    { name: '치명타',       unit: 'pct',  base: dec(3, -0.5) },
    { name: '방어력',       unit: 'flat', base: dec(3, -50) },
    { name: '회피율',       unit: 'pct',  base: dec(3, -0.5) },
    { name: '적중도',       unit: 'flat', base: dec(3, -50) },
    { name: '블럭율',       unit: 'pct',  base: dec(3, -0.5) },
];

// 감소식 속성 피해
const DECREASE_ATTR = { unit: 'pct', base: dec(3, -1) };

const attrOptions = (tmpl, kind) =>
    ATTRIBUTES.map(a => ({ ...tmpl, name: `${a} 속성 피해`, kind }));

export const INCREASE_POOL = [
    ...INCREASE_STATS.map(o => ({ ...o, kind: 'inc' })),
    ...attrOptions(INCREASE_ATTR, 'inc'),
];

export const DECREASE_POOL = [
    ...DECREASE_STATS.map(o => ({ ...o, kind: 'dec' })),
    ...attrOptions(DECREASE_ATTR, 'dec'),
];
