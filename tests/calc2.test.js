// 실행: node --test tests/  (상속세·대출·취득세·전월세·건보료. 기대값은 법령 산식·공식 안내 예시)
const test = require("node:test"), assert = require("node:assert");
const C = require("../assets/calc-core.js");

test("상속세: 세율표 경계 (상증세법 제26조) 1/5/10/30/50억", () => {
  const e = {1e8: 1e7, 5e8: 9e7, 1e9: 2.4e8, 3e9: 10.4e8, 5e9: 20.4e8};
  for (const k of Object.keys(e)) assert.equal(C.inhTax(+k), e[k], k);
  assert.equal(C.inhTax(0), 0);
});
test("상속세: 배우자 없이 10억 상속 = 일괄공제 5억 -> 세액 9,000만", () => {
  const r = C.inheritance({estate: 1e9, kids: 2, spouse: false});
  assert.equal(r.personal, 5e8); assert.equal(r.base, 5e8); assert.equal(r.tax, 9e7);
});
test("상속세: 배우자 있으면 최소 10억(일괄 5 + 배우자 5)까지 세금 0", () => {
  const r = C.inheritance({estate: 1e9, kids: 2, spouse: true, spouseMode: "min"});
  assert.equal(r.deduct, 1e9); assert.equal(r.tax, 0);
  assert.equal(C.inheritance({estate: 5e8, kids: 2, spouse: false}).tax, 0);
});
test("상속세: 20억, 배우자+자녀2, 배우자 법정상속분(1.5/3.5)", () => {
  const r = C.inheritance({estate: 2e9, kids: 2, spouse: true, spouseMode: "legal"});
  assert.equal(r.spouseDed, Math.floor(2e9 * 1.5 / 3.5));
  assert.equal(r.base, 2e9 - 5e8 - r.spouseDed);
  assert.equal(r.tax, Math.floor(r.base * 0.3 - 6e7));
});
test("상속세: 배우자 공제 한도 30억, 배우자 단독상속은 일괄공제 배제", () => {
  const big = C.inheritance({estate: 1.2e10, kids: 1, spouse: true, spouseMode: "legal"});
  assert.equal(big.spouseDed, 3e9);
  const only = C.inheritance({estate: 2e9, kids: 0, spouse: true, spouseMode: "legal"});
  assert.equal(only.lumpExcluded, true); assert.equal(only.personal, 2e8);
});
test("상속세: 금융재산공제 구간, 사전증여 합산, 신고세액공제 3%", () => {
  assert.equal(C.finDeduction(1e7), 1e7); assert.equal(C.finDeduction(5e7), 2e7); assert.equal(C.finDeduction(2e8), 4e7); assert.equal(C.finDeduction(5e8), 1e8); assert.equal(C.finDeduction(2e9), 2e8); assert.equal(C.finDeduction(9e7), 2e7);
  const r = C.inheritance({estate: 1e9, preGift: 2e8, debt: 1e8, kids: 2, spouse: false, reportCredit: true});
  assert.equal(r.value, 1.1e9); assert.equal(r.base, 6e8);
  assert.equal(r.tax, 6e8 * 0.3 - 6e7); assert.equal(r.credit, Math.floor(r.tax * 0.03)); assert.equal(r.pay, r.tax - r.credit);
});

test("대출: 1억·연5%·12개월 원리금균등 월 8,560,748원", () => {
  const r = C.loan({principal: 1e8, rate: 0.05, months: 12, method: "pmt"});
  assert.equal(r.pmt, 8560748); assert.equal(r.first, 8560748);
  assert.equal(r.rows[0].interest, 416666); assert.equal(r.rows[11].balance, 0);
  assert.ok(Math.abs(r.totalInterest - (8560748 * 12 - 1e8)) < 20);
});
test("대출: 원금균등·만기일시 (1억·연6%·12개월)", () => {
  const p = C.loan({principal: 1.2e7, rate: 0.06, months: 12, method: "principal"});
  assert.equal(p.rows[0].principal, 1e6); assert.equal(p.rows[0].interest, 60000); assert.equal(p.first, 1060000);
  assert.equal(p.rows[1].interest, 55000); assert.equal(p.rows[11].balance, 0);
  assert.equal(p.totalInterest, 60000 * 6.5); // 평균 잔액 6.5/12
  const b = C.loan({principal: 1e8, rate: 0.06, months: 12, method: "bullet"});
  assert.equal(b.rows[0].pay, 500000); assert.equal(b.rows[11].pay, 1e8 + 500000); assert.equal(b.totalInterest, 6e6);
  const z = C.loan({principal: 1.2e6, rate: 0, months: 12, method: "pmt"}); assert.equal(z.totalInterest, 0);
});

test("전월세 전환율: 상한 = min(10%, 기준금리+2%p) = 3.00%+2 = 5.00%", () => {
  assert.equal(C.RENT.base, 0.03); assert.equal(C.RENT.baseDate, "2026-08-27");
  assert.ok(Math.abs(C.rentCap() - 0.05) < 1e-12);
  assert.ok(Math.abs(C.rentCap(0.0825) - 0.10) < 1e-12); assert.ok(Math.abs(C.rentCap(0.0225) - 0.0425) < 1e-12);
});
test("전월세 전환: 환산 월세/보증금, 실제 전환율", () => {
  assert.equal(C.rentMonthly(2e8, 0.05), 833333);
  assert.equal(C.rentDeposit(1e6, 0.05), 2.4e8);
  assert.ok(Math.abs(C.rentImplied(1e6, 1.5e8) - 0.08) < 1e-12);
});

test("취득세: 구간별 세율 6억 1%, 7.5억 2%, 9억 3% (제11조 제1항 제7호)", () => {
  assert.equal(C.acqBaseRatePct(5e8), 1); assert.equal(C.acqBaseRatePct(6e8), 1);
  assert.equal(C.acqBaseRatePct(7.5e8), 2); assert.equal(C.acqBaseRatePct(9e8), 3); assert.equal(C.acqBaseRatePct(12e8), 3);
  assert.equal(C.acqBaseRatePct(7e8), 1.6667); assert.equal(C.acqBaseRatePct(6.3e8), 1.2);
});
test("취득세: 중과 판정 (조정대상 2주택 8%/3주택 12%, 비조정 3주택 8%/4주택 12%, 일시적 2주택 제외)", () => {
  const h = C.acqHeavy;
  assert.equal(h(1, "adj"), 0); assert.equal(h(2, "adj"), 8); assert.equal(h(3, "adj"), 12); assert.equal(h(4, "adj"), 12);
  assert.equal(h(2, "non"), 0); assert.equal(h(3, "non"), 8); assert.equal(h(4, "non"), 12);
  assert.equal(h(2, "adj", true), 0);
});
test("취득세: 총 부담률 (85㎡ 이하 / 초과) 1주택 6억 이하 1.1%/1.3%, 9억 초과 3.3%/3.5%, 8% -> 8.4%/9.0%, 12% -> 12.4%/13.4%", () => {
  const a = (price, houses, region, area85) => C.acquisition({price, houses, region, area85});
  const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-9, x + " vs " + y);
  near(a(5e8, 1, "non", false).totalPct, 1.1); near(a(5e8, 1, "non", true).totalPct, 1.3);
  near(a(12e8, 1, "non", false).totalPct, 3.3); near(a(12e8, 1, "non", true).totalPct, 3.5);
  near(a(5e8, 2, "adj", false).totalPct, 8.4); near(a(5e8, 2, "adj", true).totalPct, 9.0);
  near(a(5e8, 3, "adj", false).totalPct, 12.4); near(a(5e8, 3, "adj", true).totalPct, 13.4);
  const r = a(5e8, 1, "non", true); assert.equal(r.tax, 5e6); assert.equal(r.edu, 5e5); assert.equal(r.sp, 1e6); assert.equal(r.total, 6.5e6);
});

test("건보료 2026: 월 300만 원 -> 건강 107,850 + 장기요양 14,170 (본인), 요율 7.19%·13.14%", () => {
  const r = C.health(3e6);
  assert.equal(r.total, 215700); assert.equal(r.health, 107850); assert.equal(r.ltcTotal, 28340); assert.equal(r.ltc, 14170); assert.equal(r.mine, 122020);
  assert.equal(C.HI.rate, 0.0719); assert.equal(C.HI.ltc, 0.1314);
});
test("건보료 2026: 상한 월 9,183,480(본인 4,591,740)·하한 20,160", () => {
  const hi = C.health(2e8); assert.equal(hi.total, 9183480); assert.equal(hi.health, 4591740); assert.ok(hi.capped);
  const lo = C.health(100000); assert.equal(lo.total, 20160); assert.ok(lo.floored);
  assert.ok(Math.abs(0.0719 * 0.1314 - 0.009448) < 5e-6); // 소득 대비 장기요양 0.9448%
});
