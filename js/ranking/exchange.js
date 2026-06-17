// 무한의 투기장 교환 리스트 (우가몬)
// 모든 교환 비용은 영광 시리즈 재료로, 아래 환산값으로 영광의 편린 기준 통일.
// (편린 → 파편 → 증표 → 초월의 증표가 각 10:1로 위로만 교환되므로 성립)

export const EQUIV = {
    '영광의 편린': 1,
    '영광의 파편': 10,
    '영광의 증표': 100,
    '초월의 증표': 1000,
};

// out: 1회 교환 시 나오는 결과물 수량, mats: 소모 재료, tradable: 거래 가능 여부
export const EXCHANGE_GROUPS = [
    {
        currency: '영광의 편린',
        items: [
            { name: '영광의 파편', out: 1, mats: [{ name: '영광의 편린', qty: 10 }], tradable: false },
            { name: '백금바나나[지급용]', out: 10, mats: [{ name: '영광의 편린', qty: 1 }], tradable: false },
            { name: 'JMT 백금바나나[지급용]', out: 5, mats: [{ name: '영광의 편린', qty: 1 }], tradable: false },
            { name: '스페셜 치킨 콤보[지급용]', out: 5, mats: [{ name: '영광의 편린', qty: 1 }], tradable: false },
            { name: '디지털 에너지 드링크 [지급용]', out: 3, mats: [{ name: '영광의 편린', qty: 10 }], tradable: false },
            { name: '옵션 변경 스톤 [지급용]', out: 5, mats: [{ name: '영광의 편린', qty: 10 }], tradable: false },
            { name: '수치 변경 스톤 [지급용]', out: 5, mats: [{ name: '영광의 편린', qty: 10 }], tradable: false },
            { name: '도전의 가호 버프 선택 상자 [지급용]', out: 2, mats: [{ name: '영광의 편린', qty: 3 }], tradable: false },
            { name: '강화 해킹 툴 [지급용]', out: 3, mats: [{ name: '영광의 편린', qty: 10 }], tradable: false },
            { name: '강화 백업 칩 [지급용]', out: 1, mats: [{ name: '영광의 편린', qty: 25 }], tradable: false },
            { name: '명찰 강화 해킹 툴 [지급용]', out: 1, mats: [{ name: '영광의 편린', qty: 10 }], tradable: false },
            { name: '명찰 강화 백업 칩 [지급용]', out: 1, mats: [{ name: '영광의 편린', qty: 25 }], tradable: false },
            { name: '장비 강화 재료 상자 [지급용]', out: 1, mats: [{ name: '영광의 편린', qty: 20 }], tradable: false },
            { name: '5단 디지몬 알 선택권', out: 1, mats: [{ name: '영광의 편린', qty: 50 }], tradable: false },
            { name: '카영 장비 선택 상자', out: 1, mats: [{ name: '영광의 편린', qty: 150 }], tradable: false },
            { name: '카영 진 장비 선택 상자', out: 1, mats: [{ name: '영광의 편린', qty: 300 }, { name: '영광의 파편', qty: 1 }], tradable: false },
        ],
    },
    {
        currency: '영광의 파편',
        items: [
            { name: '영광의 증표', out: 1, mats: [{ name: '영광의 파편', qty: 10 }], tradable: false },
            { name: '패밀리 속성 버프교환권', out: 10, mats: [{ name: '영광의 파편', qty: 5 }], tradable: false },
            { name: '진화의 정점 버프교환권', out: 10, mats: [{ name: '영광의 파편', qty: 5 }], tradable: false },
            { name: '改 장비 데이터 상자', out: 1, mats: [{ name: '영광의 파편', qty: 5 }], tradable: true },
            { name: '옵션 변경 재봉틀', out: 5, mats: [{ name: '영광의 파편', qty: 5 }], tradable: true },
            { name: '수치 변경 재봉틀', out: 5, mats: [{ name: '영광의 파편', qty: 5 }], tradable: true },
            { name: '씰 마스터 패키지', out: 1, mats: [{ name: '영광의 파편', qty: 30 }, { name: '영광의 증표', qty: 2 }], tradable: true },
            { name: '크로스로더 선택 상자', out: 1, mats: [{ name: '영광의 파편', qty: 40 }, { name: '영광의 증표', qty: 2 }], tradable: true },
            { name: '마그네틱 카드 선택 상자', out: 1, mats: [{ name: '영광의 파편', qty: 20 }], tradable: true },
            { name: '랜덤 고스트 키링 상자', out: 1, mats: [{ name: '영광의 파편', qty: 30 }], tradable: true },
            { name: '랜덤 프론티어 장비 상자', out: 1, mats: [{ name: '영광의 파편', qty: 50 }, { name: '영광의 증표', qty: 5 }], tradable: true },
            { name: '얼티밋 데이터 소환 티켓', out: 2, mats: [{ name: '영광의 파편', qty: 40 }, { name: '영광의 증표', qty: 1 }], tradable: true },
            { name: 'SSS+ 디지몬 선택 상자', out: 1, mats: [{ name: '영광의 파편', qty: 40 }], tradable: true },
        ],
    },
    {
        currency: '영광의 증표',
        items: [
            { name: '초월의 증표', out: 1, mats: [{ name: '영광의 증표', qty: 10 }], tradable: false },
            { name: 'X 에너지', out: 5, mats: [{ name: '영광의 증표', qty: 20 }], tradable: true },
            { name: '스킬 메모리 Lv.4 선택 상자', out: 1, mats: [{ name: '영광의 증표', qty: 30 }], tradable: true },
            { name: '최상급 스킬 메모리 선택 상자', out: 1, mats: [{ name: '영광의 증표', qty: 30 }], tradable: true },
            { name: '진화 데이터 추출 키트 [지급용]', out: 1, mats: [{ name: '영광의 증표', qty: 40 }], tradable: false },
            { name: '진화 데이터 추출 키트 (증표 80)', out: 1, mats: [{ name: '영광의 증표', qty: 80 }], tradable: true },
            { name: '진화 데이터 추출 키트 (증표 50 + 초월 1)', out: 1, mats: [{ name: '영광의 증표', qty: 50 }, { name: '초월의 증표', qty: 1 }], tradable: true },
            { name: 'U등급 디지몬 선택 상자', out: 1, mats: [{ name: '영광의 증표', qty: 80 }, { name: '초월의 증표', qty: 1 }], tradable: true },
        ],
    },
];
