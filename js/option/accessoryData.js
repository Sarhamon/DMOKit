// 악세사리 옵션 풀 (재화 = 옵션 변경 스톤). 구조 설명은 optionData.js 참고.
// 나중에 부위별로 더 쪼갤 경우 이 파일에서 import 해 합치면 됨.

export const accessorySlots = {
    earring: {
        group: 'accessory',
        lines: 5,
        lockCost: { 0: 1, 1: 2, 2: 5 },
        items: [
            {
                name: '화려한 친절의 귀걸이',
                pool: [
                    { name: '방어력',         min: 100,  max: 200,  dp: 0, cap: 3 },
                    { name: '최대체력',       min: 750,  max: 1500, dp: 0, cap: 2 },
                    { name: '디지소울',       min: 750,  max: 1500, dp: 0, cap: 2 },
                    { name: '스킬피해',       min: 300,  max: 600,  dp: 0, cap: 2 },
                    { name: '기본속성피해',   min: 6,    max: 12,   dp: 0, cap: 2 },
                    { name: '크리티컬',       min: 6,    max: 12,   dp: 0, cap: 2 },
                    { name: '치명피해',       min: 10,   max: 30,   dp: 2, cap: 2 },
                    { name: '회피',           min: 1,    max: 10,   dp: 0, cap: 2 },
                    { name: '블럭',           min: 1,    max: 10,   dp: 0, cap: 2 },
                    { name: '적중도',         min: 500,  max: 1000, dp: 0, cap: 1 },
                    { name: '방어력(%)',      min: 25,   max: 50,   dp: 2, cap: 1 },
                    { name: '최대 HP 증가(%)', min: 15,  max: 30,   dp: 2, cap: 1 },
                    { name: '최대 DS 증가(%)', min: 25,  max: 50,   dp: 2, cap: 1 },
                    { name: '스킬 데미지 증가(%)', min: 5,   max: 10,   dp: 2, cap: 1 },
                ],
            },
            {
                name: '디지털 해저드 이어링',   // 수치 변경 불가 (min=max 고정)
                pool: [
                    { name: '방어력',       min: 100, max: 100, dp: 0, cap: 2 },
                    { name: '최대체력',     min: 800, max: 800, dp: 0, cap: 2 },
                    { name: '디지소울',     min: 800, max: 800, dp: 0, cap: 2 },
                    { name: '스킬피해',     min: 300, max: 300, dp: 0, cap: 2 },
                    { name: '치명피해',     min: 20,  max: 20,  dp: 0, cap: 2 },
                    { name: '기본속성피해', min: 7,   max: 7,   dp: 0, cap: 2 },
                    { name: '크리티컬',     min: 7,   max: 7,   dp: 0, cap: 1 },
                    { name: '회피',         min: 6,   max: 6,   dp: 0, cap: 1 },
                    { name: '블럭',         min: 6,   max: 6,   dp: 0, cap: 1 },
                    { name: '적중도',       min: 500, max: 500, dp: 0, cap: 1 },
                ],
            },
        ],
    },

    necklace: {   // 목걸이
        group: 'accessory',
        lines: 5,
        lockCost: { 0: 1, 1: 2, 2: 5 },
        items: [
            {
                name: '찬란한 기적의 넥클레스',
                pool: [
                    { name: '최대체력',       min: 600, max: 1200, dp: 0, cap: 4 },
                    { name: '디지소울',       min: 600, max: 1200, dp: 0, cap: 4 },
                    { name: '방어력',         min: 50,  max: 100,  dp: 0, cap: 3 },
                    { name: '크리티컬',       min: 5,   max: 10,   dp: 0, cap: 2 },
                    { name: '기본속성피해',   min: 1,   max: 8,    dp: 0, cap: 2 },
                    { name: '공격력',         min: 150, max: 300,  dp: 0, cap: 2 },
                    { name: '공격속도',       min: 15,  max: 15,   dp: 0, cap: 1 },
                    { name: '치명피해',       min: 15,  max: 30,   dp: 2, cap: 1 },
                    { name: '스킬피해',       min: 200, max: 500,  dp: 0, cap: 1 },
                    { name: '공격력(%)',      min: 2.5, max: 5,    dp: 2, cap: 1 },
                    { name: '방어력(%)',      min: 25,  max: 50,   dp: 2, cap: 1 },
                    { name: '최대 HP 증가(%)', min: 5,  max: 15,   dp: 2, cap: 1 },
                    { name: '최대 DS 증가(%)', min: 25, max: 50,   dp: 2, cap: 1 },
                ],
            },
        ],
    },

    belt: {       // 팔찌
        group: 'accessory',
        lines: 5,
        lockCost: { 0: 1, 1: 2, 2: 5 },
        items: [
            {
                name: '바이탈 브레스 디지바이스 -V-',
                pool: [
                    { name: '공격력',            min: 1000, max: 1500, dp: 0, cap: 2 },
                    { name: '방어력',            min: 300,  max: 500,  dp: 0, cap: 2 },
                    { name: '최대체력',          min: 2000, max: 3000, dp: 0, cap: 2 },
                    { name: '디지소울',          min: 1500, max: 2500, dp: 0, cap: 2 },
                    { name: '스킬피해',          min: 2000, max: 2500, dp: 0, cap: 2 },
                    { name: '크리티컬',          min: 5,    max: 10,   dp: 0, cap: 2 },
                    { name: '치명피해',          min: 25,   max: 40,   dp: 2, cap: 2 },
                    { name: '회피',              min: 10,   max: 15,   dp: 0, cap: 2 },
                    { name: '적중도',            min: 800,  max: 1200, dp: 0, cap: 2 },
                    { name: '방어력(%)',         min: 15,   max: 20,   dp: 2, cap: 1 },
                    { name: '최대 DS 증가(%)',    min: 5,    max: 10,   dp: 2, cap: 1 },
                    { name: '최대 HP 증가(%)',    min: 5,    max: 10,   dp: 2, cap: 1 },
                    { name: '스킬 데미지 증가(%)', min: 3,    max: 7,    dp: 2, cap: 1 },
                    { name: '최종 데미지 증가(%)', min: 1,    max: 5,    dp: 2, cap: 1 },
                ],
            },
        ],
    },

    ring: {       // 반지
        group: 'accessory',
        lines: 5,
        lockCost: { 0: 1, 1: 2, 2: 5 },
        items: [
            {
                name: '빛나는 아레나 반지',
                pool: [
                    { name: '최대체력',     min: 200, max: 960, dp: 0, cap: 2 },
                    { name: '디지소울',     min: 200, max: 960, dp: 0, cap: 2 },
                    { name: '방어력',       min: 10,  max: 30,  dp: 0, cap: 2 },
                    { name: '크리티컬',     min: 1,   max: 6,   dp: 0, cap: 2 },
                    { name: '공격력',       min: 100, max: 360, dp: 0, cap: 2 },
                    { name: '스킬피해',     min: 100, max: 480, dp: 0, cap: 2 },
                    { name: '기본속성피해', min: 1,   max: 6,   dp: 0, cap: 2 },
                    { name: '치명피해',     min: 1,   max: 20,  dp: 2, cap: 1 },
                    { name: '적중도',       min: 100, max: 500, dp: 0, cap: 1 },
                ],
            },
        ],
    },

    card: {
        group: 'accessory',      // 재화 = 옵션 변경 스톤
        lines: 2,
        lockCost: { 0: 1 },      // 고정 기능 없음 (최대 고정 0)
        items: [
            {
                name: 'Xros Loader',
                // 14종 속성 피해 균등 확률, 2줄 중복 없음(cap 1).
                pool: [
                    { name: '데이터 속성 피해',   min: 8,  max: 15, dp: 0, cap: 1 },
                    { name: '백신 속성 피해',     min: 8,  max: 15, dp: 0, cap: 1 },
                    { name: '바이러스 속성 피해', min: 8,  max: 15, dp: 0, cap: 1 },
                    { name: '언노운 속성 피해',   min: 7,  max: 12, dp: 0, cap: 1 },
                    { name: '얼음 속성 피해',     min: 10, max: 20, dp: 0, cap: 1 },
                    { name: '물 속성 피해',       min: 10, max: 20, dp: 0, cap: 1 },
                    { name: '불 속성 피해',       min: 10, max: 20, dp: 0, cap: 1 },
                    { name: '땅 속성 피해',       min: 10, max: 20, dp: 0, cap: 1 },
                    { name: '바람 속성 피해',     min: 10, max: 20, dp: 0, cap: 1 },
                    { name: '나무 속성 피해',     min: 10, max: 20, dp: 0, cap: 1 },
                    { name: '빛 속성 피해',       min: 10, max: 20, dp: 0, cap: 1 },
                    { name: '어둠 속성 피해',     min: 10, max: 20, dp: 0, cap: 1 },
                    { name: '번개 속성 피해',     min: 10, max: 20, dp: 0, cap: 1 },
                    { name: '강철 속성 피해',     min: 10, max: 20, dp: 0, cap: 1 },
                ],
            },
        ],
    },

};
