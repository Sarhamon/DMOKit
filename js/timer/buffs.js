export const BUFF_GROUPS = [
    {
        buffs: [
            { id: 'exp_challenge', name: '도전의 가호[EXP]', duration: 7200 },
        ],
    },
    {
        label: '증폭 (택 1)',
        exclusive: true,
        buffs: [
            { id: 'super_amp', name: '슈퍼증폭부스터', duration: 3600 },
            { id: 'amp',       name: '증폭부스터',     duration: 1800 },
        ],
    },
    {
        buffs: [
            { id: 'spicy', name: '매운 고추', duration: 1800 },
        ],
    },
];

export const BUFF_BY_ID = Object.fromEntries(
    BUFF_GROUPS.flatMap(g => g.buffs).map(b => [b.id, b])
);
