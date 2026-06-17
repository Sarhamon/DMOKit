// 랭킹 던전 보상 데이터
// percentile 기준 구간: tier.max 이하면 해당 구간 (작은 max부터 순서대로 매칭)

export const WEEKLY_TIERS = [
    {
        max: 9, label: '랭킹 0~9%', rewards: [
            { name: 'JMT 백금 바나나[지급용]', qty: 100 },
            { name: '스페셜 치킨 콤보[지급용]', qty: 50 },
            { name: '슈퍼 경험치 부스터 1000%[지급용]', qty: 10 },
            { name: '디지털 에너지 드링크[지급용]', qty: 3 },
            { name: '레어몬 디지몬 알 [5단][지급용]', qty: 1 },
            { name: '영광의 편린', qty: 30 },
        ]
    },
    {
        max: 29, label: '랭킹 10~29%', rewards: [
            { name: 'JMT 백금 바나나[지급용]', qty: 100 },
            { name: '스페셜 치킨 콤보[지급용]', qty: 50 },
            { name: '슈퍼 경험치 부스터 1000%[지급용]', qty: 10 },
            { name: '디지털 에너지 드링크[지급용]', qty: 3 },
            { name: '레어몬 디지몬 알 [5단][지급용]', qty: 1 },
            { name: '영광의 편린', qty: 20 },
        ]
    },
    {
        max: 69, label: '랭킹 30~69%', rewards: [
            { name: '백금 바나나[지급용]', qty: 70 },
            { name: '스페셜 치킨 콤보[지급용]', qty: 50 },
            { name: '슈퍼 경험치 부스터 1000%[지급용]', qty: 10 },
            { name: '디지털 에너지 드링크[지급용]', qty: 3 },
            { name: '영광의 편린', qty: 10 },
        ]
    },
    {
        max: 100, label: '랭킹 70~100%', rewards: [
            { name: '백금 바나나[지급용]', qty: 50 },
            { name: '스페셜 치킨 콤보[지급용]', qty: 10 },
            { name: '슈퍼 경험치 부스터 1000%[지급용]', qty: 3 },
        ]
    },
];

export const SEASON_TIERS = [
    {
        max: 5, label: '랭킹 0~5%', rewards: [
            { name: 'JMT 백금 바나나[지급용]', qty: 200 },
            { name: '스페셜 치킨 콤보[지급용]', qty: 100 },
            { name: '슈퍼 경험치 부스터 1000%[지급용]', qty: 10 },
            { name: '디지털 에너지 드링크[지급용]', qty: 5 },
            { name: '레어몬 디지몬 알 [5단][지급용]', qty: 1 },
            { name: '영광의 편린', qty: 100 },
            { name: '영광의 파편', qty: 50 },
            { name: '영광의 증표', qty: 10 },
        ]
    },
    {
        max: 39, label: '랭킹 6~39%', rewards: [
            { name: 'JMT 백금 바나나[지급용]', qty: 200 },
            { name: '스페셜 치킨 콤보[지급용]', qty: 100 },
            { name: '슈퍼 경험치 부스터 1000%[지급용]', qty: 10 },
            { name: '디지털 에너지 드링크[지급용]', qty: 5 },
            { name: '레어몬 디지몬 알 [5단][지급용]', qty: 1 },
            { name: '영광의 편린', qty: 100 },
            { name: '영광의 파편', qty: 50 },
        ]
    },
    {
        max: 69, label: '랭킹 40~69%', rewards: [
            { name: '백금 바나나[지급용]', qty: 200 },
            { name: '스페셜 치킨 콤보[지급용]', qty: 100 },
            { name: '슈퍼 경험치 부스터 1000%[지급용]', qty: 10 },
            { name: '디지털 에너지 드링크[지급용]', qty: 5 },
            { name: '레어몬 디지몬 알 [5단][지급용]', qty: 1 },
            { name: '영광의 편린', qty: 100 },
        ]
    },
    {
        max: 100, label: '랭킹 70~100%', rewards: [
            { name: '백금 바나나[지급용]', qty: 200 },
            { name: '스페셜 치킨 콤보[지급용]', qty: 100 },
            { name: '슈퍼 경험치 부스터 1000%[지급용]', qty: 10 },
            { name: '디지털 에너지 드링크[지급용]', qty: 5 },
            { name: '레어몬 디지몬 알 [5단][지급용]', qty: 1 },
        ]
    },
];

// 시즌 던전 랭커(절대 순위) 추가 보상. rank <= max 인 첫 구간.
// 랭커는 이 보상과 별개로 랭킹 0~5% 보상을 함께 획득.
export const RANKER_TIERS = [
    {
        max: 3, label: '랭킹 1~3위', rewards: [
            { name: '초월의 증표', qty: 1 },
            { name: '영광의 증표', qty: 50 },
        ]
    },
    {
        max: 10, label: '랭킹 4~10위', rewards: [
            { name: '초월의 증표', qty: 1 },
            { name: '영광의 증표', qty: 30 },
        ]
    },
    {
        max: 100, label: '랭킹 11~100위', rewards: [
            { name: '초월의 증표', qty: 1 },
            { name: '영광의 증표', qty: 20 },
        ]
    },
    {
        max: 200, label: '랭킹 101~200위', rewards: [
            { name: '영광의 증표', qty: 15 },
        ]
    },
];
