// 옵션 변경 시뮬레이터 데이터 (집약 파일)
//
// 실제 데이터는 두 파일로 분할:
//   · accessoryData.js → accessorySlots (재화 = 옵션 변경 스톤)
//   · equipData.js     → equipSlots     (재화 = 옵션 변경 재봉틀)
// 여기서 합쳐 slots 로 내보냄. (악세를 부위별로 더 쪼개면 accessoryData.js 쪽만 손보면 됨)
//
// 부위(slot)별 설정 — slots[slotId]:
//   group   : 'equip' | 'accessory'  → 통화 결정 (CURRENCY)
//   lines   : 옵션 줄 수
//   lockCost: 고정 개수별 리롤 비용(재화 개수). 키 = 고정한 줄 수. 최대 고정 수 = 최대 키.
//             예) { 0: 1, 1: 2, 2: 5 } → 고정 0/1/2개일 때 1/2/5개 소모, 최대 2줄 고정.
//             예) { 0: 1 } → 고정 기능 없음.
//   items   : 아이템 목록. 아이템은 두 가지 풀 형태 중 하나를 가짐:
//     · 통짜 풀  { name, pool: [...] }              — 악세. 모든 줄이 같은 풀에서 뽑되 cap(중복 상한) 적용.
//     · 줄별 풀  { name, linePools: [[1줄],...,[N줄]] } — 장비. 풀 = 옵션 등급(첫 풀=하옵 … 마지막 풀=상옵).
//
// 옵션 필드: name / min / max / dp(소수점 자리, 0=정수) / cap(통짜 풀에서만, 한 아이템 최대 중복 수)
// "옵션 변경" 시 고정 안 된 줄의 옵션 *종류*가 다시 뽑힘(수치 롤은 추후).
//   · 악세(통짜 풀): 종류별 균등, cap 적용.
//   · 장비(줄별 풀): 상·중·하 풀을 합친 데서 옵션 단위 균등 추첨. 중·상급은 같은 옵션 1개씩만(중복 금지), 하급은 중복 허용. 잠금한 옵션은 다른 줄에 안 나옴.

import { accessorySlots } from './accessoryData.js';
import { equipSlots } from './equipData.js';

export const CURRENCY = {
    accessory: '옵션 변경 스톤',
    equip: '옵션 변경 재봉틀',
};

export const slots = { ...accessorySlots, ...equipSlots };
