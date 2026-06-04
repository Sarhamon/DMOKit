// 장비 옵션 풀 (재화 = 옵션 변경 재봉틀). 구조 설명은 optionData.js 참고.
// 모든 장비는 줄별 풀(linePools)이 곧 옵션 등급: 1·2줄 풀=하옵, 3줄 풀=중옵, 4줄(마지막) 풀=상옵.
// 추첨 규칙: 상·중·하 풀을 합친 데서 옵션 단위 균등 추첨(등급 제한 없음, 서로 다른 상옵이면 4줄 전부 상옵도 가능).
//          · 중·상급 옵션은 4줄 통틀어 같은 옵션 1개씩만(중복 금지), 하급은 중복 허용.
//          · 잠금한 줄의 그 옵션은 다른 줄에 안 나옴. 등급이 다르면 동명 옵션 공존 가능(공격력 상옵 + 공격력 중옵).
//
// 데이터 구성: 모든 스피릿 장비가 공유하는 공통옵션(COMMON) + 부위별 고유 시그니처 옵션(SIGNATURE).
// 등급(하/중/상)별로 값 범위가 다르며, spiritSlot()이 [공통옵션 + 시그니처]로 linePools를 만든다.

// 공통옵션 — 모든 스피릿 장비가 공유. 등급별로 값 범위가 커진다.
const COMMON = {
    하: [
        { name: '공격력',        min: 25,  max: 100,  dp: 0 },
        { name: '방어력',        min: 35,  max: 150,  dp: 0 },
        { name: '최대HP증가',    min: 100, max: 300,  dp: 0 },
        { name: '최대DS증가',    min: 100, max: 300,  dp: 0 },
        { name: '스킬데미지 증가', min: 35,  max: 150,  dp: 0 },
        { name: '회피율',        min: 1,   max: 2,    dp: 1, unit: '%' },
        { name: '블럭율',        min: 1,   max: 2,    dp: 1, unit: '%' },
        { name: '방어력(%)',     min: 1,   max: 3,    dp: 1, unit: '%' },
        { name: '최대DS증가(%)', min: 1,   max: 3,    dp: 1, unit: '%' },
    ],
    중: [
        { name: '공격력',        min: 25,  max: 150,  dp: 0 },
        { name: '방어력',        min: 50,  max: 300,  dp: 0 },
        { name: '최대HP증가',    min: 150, max: 600,  dp: 0 },
        { name: '최대DS증가',    min: 150, max: 600,  dp: 0 },
        { name: '스킬데미지 증가', min: 50,  max: 300,  dp: 0 },
        { name: '회피율',        min: 2,   max: 4,    dp: 1, unit: '%' },
        { name: '블럭율',        min: 2,   max: 4,    dp: 1, unit: '%' },
        { name: '방어력(%)',     min: 2,   max: 5,    dp: 1, unit: '%' },
        { name: '최대DS증가(%)', min: 2,   max: 5,    dp: 1, unit: '%' },
        { name: '치명확률',      min: 1,   max: 3,    dp: 1, unit: '%' },
        { name: '적중도',        min: 200, max: 400,  dp: 0 },
    ],
    상: [
        { name: '공격력',        min: 25,  max: 300,  dp: 0 },
        { name: '방어력',        min: 50,  max: 600,  dp: 0 },
        { name: '최대HP증가',    min: 150, max: 1200, dp: 0 },
        { name: '최대DS증가',    min: 150, max: 1200, dp: 0 },
        { name: '스킬데미지 증가', min: 50,  max: 600,  dp: 0 },
        { name: '회피율',        min: 2,   max: 8,    dp: 1, unit: '%' },
        { name: '블럭율',        min: 2,   max: 8,    dp: 1, unit: '%' },
        { name: '방어력(%)',     min: 2,   max: 10,   dp: 1, unit: '%' },
        { name: '최대DS증가(%)', min: 2,   max: 10,   dp: 1, unit: '%' },
        { name: '치명확률',      min: 2,   max: 5,    dp: 1, unit: '%' },
        { name: '적중도',        min: 250, max: 600,  dp: 0 },
    ],
};

// 부위별 시그니처 옵션 — 부위마다 1종, 등급별 [min, max]. (전부 % 옵션, dp: 2)
const SIGNATURE = {
    shoes:   { name: '치명피해(%)',        하: [5, 8.5],    중: [3.75, 11.5], 상: [1.25, 16.5] },
    top:     { name: '최대 HP 증가(%)',    하: [0.7, 0.85], 중: [0.45, 1.3],  상: [0.15, 2.0] },
    emblem:  { name: '공격력(%)',          하: [0.65, 0.9], 중: [0.5, 1.3],   상: [0.15, 1.85] },
    glasses: { name: '최종 데미지 증가(%)', 하: [0.65, 0.9], 중: [0.5, 1.3],   상: [0.15, 1.85] },
    bottom:  { name: '스킬 데미지 증가(%)', 하: [1.3, 1.85], 중: [1, 2.6],     상: [0.4, 3.7] },
    gloves:  { name: '기본 속성 데미지(%)', 하: [1, 2],      중: [1, 3],       상: [1, 5] },
};

const LOCK_COST = { 0: 1, 1: 2, 2: 5 };   // 모든 스피릿 장비 공통

// 한 등급 줄 풀 = 공통옵션 + 그 부위 시그니처(맨 뒤). 시그니처는 전부 % 옵션.
function tierPool(grade, sig) {
    const [min, max] = sig[grade];
    return [...COMMON[grade], { name: sig.name, min, max, dp: 2, unit: '%' }];
}

// 부위 1개 슬롯 빌드. linePools = [하, 하, 중, 상] (1·2줄 동일).
function spiritSlot(slotId, itemName) {
    const sig = SIGNATURE[slotId];
    const ha = tierPool('하', sig);
    return {
        group: 'equip',
        lines: 4,
        lockCost: LOCK_COST,
        items: [{ name: itemName, linePools: [ha, ha, tierPool('중', sig), tierPool('상', sig)] }],
    };
}

export const equipSlots = {
    shoes:   spiritSlot('shoes',   '스피릿의 신발'),
    top:     spiritSlot('top',     '스피릿의 상의'),
    emblem:  spiritSlot('emblem',  '스피릿의 모자'),
    glasses: spiritSlot('glasses', '스피릿의 장신구'),
    bottom:  spiritSlot('bottom',  '스피릿의 하의'),
    gloves:  spiritSlot('gloves',  '스피릿의 장갑'),
};
