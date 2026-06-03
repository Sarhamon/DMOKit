// 수집 효과 데이터 — tools/srcimg/ 스크린샷에서 추출.
// 각 항목: { name, size, effects }
//   name    : 초록색 사다리꼴 탭의 디지몬(수집) 이름
//   size    : 수집 구성 디지몬 수(마리)
//   effects : 수집 효과 4종. 사용자가 인게임 완료 여부를 체크하면 보너스를 합산한다.
//     cond   : 효과 발동 조건(표시용, 원문 그대로)
//     target : 보너스 대상(EXP / HP / DS / EV / DE / HT / SCD / "○○ 속성 ..." 등)
//     value  : 수치
//     unit   : "%" | "" (플랫 수치는 빈 문자열)

export const collections = [
    {
        name: "텐타몬",
        size: 5,
        effects: [
            { cond: "5마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 550 시", target: "EXP", value: 20, unit: "%" },
            { cond: "초월 디지몬 5마리 보유 시", target: "EXP", value: 30, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 700 시", target: "어둠 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "길몬[카오스듀크몬]",
        size: 5,
        effects: [
            { cond: "5마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 550 시", target: "EXP", value: 20, unit: "%" },
            { cond: "초월 디지몬 5마리 보유 시", target: "EXP", value: 30, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 700 시", target: "불 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "돌몬[돌가몬]",
        size: 4,
        effects: [
            { cond: "4마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 440 시", target: "EXP", value: 30, unit: "%" },
            { cond: "초월 디지몬 4마리 보유 시", target: "EXP", value: 50, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 560 시", target: "강철 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "로프몬",
        size: 7,
        effects: [
            { cond: "7마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 770 시", target: "EXP", value: 20, unit: "%" },
            { cond: "초월 디지몬 7마리 보유 시", target: "EXP", value: 30, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 980 시", target: "얼음 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "고부리몬",
        size: 5,
        effects: [
            { cond: "5마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 550 시", target: "EXP", value: 30, unit: "%" },
            { cond: "초월 디지몬 5마리 보유 시", target: "EXP", value: 50, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 700 시", target: "바이러스 속성 스킬 공격력", value: 1, unit: "%" },
        ],
    },
    {
        name: "원시고부리몬",
        size: 4,
        effects: [
            { cond: "4마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 440 시", target: "EXP", value: 20, unit: "%" },
            { cond: "초월 디지몬 4마리 보유 시", target: "EXP", value: 30, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 560 시", target: "얼음 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "헉몬",
        size: 4,
        effects: [
            { cond: "4마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 440 시", target: "EXP", value: 30, unit: "%" },
            { cond: "초월 디지몬 4마리 보유 시", target: "EXP", value: 50, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 560 시", target: "데이터 속성 스킬 공격력", value: 1, unit: "%" },
        ],
    },
    {
        name: "쿠네몬",
        size: 4,
        effects: [
            { cond: "4마리 보유 시", target: "DS", value: 50, unit: "" },
            { cond: "디지몬 레벨의 총 합이 440 시", target: "EV", value: 30, unit: "" },
            { cond: "초월 디지몬 4마리 보유 시", target: "DE", value: 30, unit: "" },
            { cond: "디지몬 레벨의 총 합이 560 시", target: "EXP", value: 20, unit: "%" },
        ],
    },
    {
        name: "팔몬[오리지널]",
        size: 9,
        effects: [
            { cond: "9마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 990 시", target: "나무 속성 스킬 데미지", value: 1, unit: "%" },
            { cond: "초월 디지몬 9마리 보유 시", target: "데이터 속성 스킬 공격력", value: 1, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 1260 시", target: "HP", value: 100, unit: "" },
        ],
    },
    {
        name: "츄츄몬",
        size: 5,
        effects: [
            { cond: "5마리 보유 시", target: "DE", value: 30, unit: "" },
            { cond: "디지몬 레벨의 총 합이 550 시", target: "EXP", value: 20, unit: "%" },
            { cond: "초월 디지몬 5마리 보유 시", target: "바이러스 속성 스킬 공격력", value: 1, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 700 시", target: "얼음 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "베어몬",
        size: 7,
        effects: [
            { cond: "7마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 770 시", target: "EXP", value: 20, unit: "%" },
            { cond: "초월 디지몬 7마리 보유 시", target: "백신 속성 스킬 공격력", value: 1, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 980 시", target: "데이터 속성 스킬 공격력", value: 1, unit: "%" },
        ],
    },
    {
        name: "아기벌몬",
        size: 8,
        effects: [
            { cond: "8마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 880 시", target: "바람 속성 스킬 데미지", value: 1, unit: "%" },
            { cond: "초월 디지몬 8마리 보유 시", target: "EXP", value: 30, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 1120 시", target: "EXP", value: 50, unit: "%" },
        ],
    },
    {
        name: "Butter-Fly",
        size: 8,
        effects: [
            { cond: "8마리 보유 시", target: "EXP", value: 50, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 880 시", target: "SCD", value: 1, unit: "%" },
            { cond: "초월 디지몬 8마리 보유 시", target: "바이러스 속성 스킬 공격력", value: 1, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 1120 시", target: "어둠 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "고스트게임",
        size: 3,
        effects: [
            { cond: "3마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 330 시", target: "EXP", value: 30, unit: "%" },
            { cond: "초월 디지몬 3마리 보유 시", target: "EXP", value: 50, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 420 시", target: "바람 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "파워 디지몬",
        size: 8,
        effects: [
            { cond: "8마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 880 시", target: "EXP", value: 30, unit: "%" },
            { cond: "초월 디지몬 8마리 보유 시", target: "EXP", value: 50, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 1120 시", target: "나무 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "암흑진화",
        size: 6,
        effects: [
            { cond: "6마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 660 시", target: "EXP", value: 30, unit: "%" },
            { cond: "초월 디지몬 6마리 보유 시", target: "EXP", value: 50, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 840 시", target: "어둠 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "나만 고양이 없어",
        size: 3,
        effects: [
            { cond: "3마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 330 시", target: "EXP", value: 30, unit: "%" },
            { cond: "초월 디지몬 3마리 보유 시", target: "EXP", value: 50, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 420 시", target: "언노운 속성 스킬 공격력", value: 1, unit: "%" },
        ],
    },
    {
        name: "초월 궁극의 날개 II",
        size: 3,
        effects: [
            { cond: "3마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 330 시", target: "EXP", value: 20, unit: "%" },
            { cond: "초월 디지몬 3마리 보유 시", target: "EXP", value: 30, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 420 시", target: "백신 속성 스킬 공격력", value: 1, unit: "%" },
        ],
    },
    {
        name: "레지스탕스",
        size: 3,
        effects: [
            { cond: "3마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 330 시", target: "EXP", value: 20, unit: "%" },
            { cond: "초월 디지몬 3마리 보유 시", target: "EXP", value: 30, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 420 시", target: "바람 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "암흑의 사념체",
        size: 4,
        effects: [
            { cond: "4마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 440 시", target: "EXP", value: 20, unit: "%" },
            { cond: "초월 디지몬 4마리 보유 시", target: "EXP", value: 30, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 560 시", target: "언노운 속성 스킬 공격력", value: 1, unit: "%" },
        ],
    },
    {
        name: "Under the Sea",
        size: 7,
        effects: [
            { cond: "7마리 보유 시", target: "EXP", value: 20, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 770 시", target: "EXP", value: 30, unit: "%" },
            { cond: "초월 디지몬 7마리 보유 시", target: "EXP", value: 50, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 980 시", target: "물 속성 스킬 데미지", value: 1, unit: "%" },
        ],
    },
    {
        name: "기적이여 일어나라",
        size: 4,
        effects: [
            { cond: "4마리 보유 시", target: "EXP", value: 30, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 460 시", target: "HT", value: 30, unit: "" },
            { cond: "초월 디지몬 4마리 보유 시", target: "데이터 속성 스킬 공격력", value: 1, unit: "%" },
            { cond: "디지몬 레벨의 총 합이 580 시", target: "백신 속성 스킬 공격력", value: 1, unit: "%" },
        ],
    },
];
