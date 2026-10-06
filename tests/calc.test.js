// 실행: node --test tests/  (기대값 = episodes/money-scale/*/facts.md 작업 예시)
const test = require("node:test"), assert = require("node:assert");
const C = require("../assets/calc-core.js");

test("실업급여: 별표1 소정급여일수", () => {
  const t = [[30,0.5,120],[30,1,150],[30,3,180],[30,5,210],[30,10,240],[49,10,240],[50,0.5,120],[50,1,180],[50,3,210],[50,5,240],[50,10,270]];
  for (const [a, y, d] of t) assert.equal(C.eiDays(a, y), d, `${a}세 ${y}년`);
  assert.equal(C.eiDays(40, 2, true), 180); // 장애인은 50세 이상으로 간주
});
test("실업급여: 상·하한 68,100 / 66,048, 월 환산, 최대 총액", () => {
  const hi = C.unemployment(55, 12, 200000);
  assert.equal(hi.daily, 68100); assert.equal(hi.days, 270); assert.equal(hi.total, 18387000); assert.equal(hi.month30, 2043000); assert.equal(hi.clamp, "cap");
  const lo = C.unemployment(30, 1, 50000);
  assert.equal(lo.daily, 66048); assert.equal(lo.month30, 1981440); assert.equal(lo.clamp, "floor");
  assert.equal(113500 * 0.6, 68100); assert.equal(10320 * 8 * 0.8, 66048);
  const mid = C.unemployment(35, 4, 100000); // 100,000 x 60% = 60,000 < 하한 -> 66,048
  assert.equal(mid.daily, 66048);
  const mid2 = C.unemployment(35, 4, 110000); // 66,000 < 66,048 -> 하한
  assert.equal(mid2.daily, 66048);
  const mid3 = C.unemployment(35, 4, 112000); // 67,200 구간 내
  assert.equal(mid3.daily, 67200); assert.equal(mid3.total, 67200 * 180);
});
test("퇴직금: 월 300만 원, 근속 1/3/5/10/20년 = 300만 x N", () => {
  for (const N of [1, 3, 5, 10, 20]) {
    const s = C.severance({monthly: 3000000, years: N});
    assert.equal(s.pay, 3000000 * N, `${N}년`);
  }
});
test("퇴직소득세(소득세만): facts.md 1/3/5/10/20년", () => {
  const exp = {1: 32000, 3: 96000, 5: 160000, 10: 200000, 20: 160000};
  for (const N of [1, 3, 5, 10, 20]) {
    const s = C.severance({monthly: 3000000, years: N});
    const t = C.retireTax(s.pay, s.serviceDays);
    assert.equal(t.tax, exp[N], `${N}년`);
  }
  const t1 = C.retireTax(3000000, 365); assert.equal(t1.conv, 24000000); assert.equal(t1.convDeduction, 17600000); assert.equal(t1.base, 6400000);
  const t10 = C.retireTax(30000000, 3650); assert.equal(t10.conv, 18000000); assert.equal(t10.convDeduction, 14000000);
});
test("퇴직금: 상여·연차수당 가산 (연 상여 x3/12)", () => {
  const s = C.severance({monthly: 3000000, bonusYear: 12000000, leaveYear: 0, years: 1});
  assert.equal(s.pay, Math.floor((9000000 + 3000000) / 90 * 30)); // 4,000,000... 월30일 단순화
  assert.equal(s.pay, 4000000);
});
test("로또 세금: facts.md 5/10/16.05/20/30억", () => {
  const e = (p, inc, loc, net) => { const r = C.lotto(p); assert.equal(r.income, inc, p + " inc"); assert.equal(r.local, loc, p + " loc"); assert.equal(r.net, net, p + " net"); };
  e(5e8, 120000000, 12000000, 368000000);
  e(10e8, 270000000, 27000000, 703000000);
  e(20e8, 570000000, 57000000, 1373000000);
  e(30e8, 870000000, 87000000, 2043000000);
  const r = C.lotto(1604686625);
  assert.equal(r.income, 451405980); assert.equal(r.local, 45140590); assert.equal(r.tax, 496546570); assert.equal(r.net, 1108140055);
  assert.ok(Math.abs(r.rate - 0.309) < 0.001);
});
test("로또: 200만 원 이하 비과세, 3억 경계", () => {
  assert.equal(C.lotto(2000000).tax, 0);
  assert.equal(C.lotto(2000001).income, 400000);
  assert.equal(C.lotto(3e8).tax, 66000000);
});
