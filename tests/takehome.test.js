// 실행: node --test tests/
const test = require("node:test"), assert = require("node:assert");
const fs = require("fs"), path = require("path");
const {simplifiedTax, calc, childCredit} = require("../assets/takehome-core.js");
const T = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/simplified-tax-2026.json"), "utf8"));

// 기대값: 소득세법 시행령 별표 2 <개정 2026. 2. 27.> 근로소득 간이세액표 원문(PDF)에서 직접 옮긴 값
test("간이세액표 원문 값 (공제대상가족 1~11명)", () => {
  const cases = [
    [3000000, [74350, 56850, 31940, 26690, 21440, 17100, 13730, 10350, 6980, 3600, 0]],
    [4000000, [195960, 167950, 109590, 91670, 78550, 65420, 52300, 39170, 33570, 28320, 23070]],
    [5000000, [335470, 306710, 237850, 219100, 200350, 181600, 162850, 144100, 125350, 106600, 87850]],
  ];
  for (const [w, exp] of cases) exp.forEach((e, i) => assert.equal(simplifiedTax(w, i + 1, T), e, `${w} / ${i+1}명`));
});
test("구간 경계: 이상~미만", () => {
  assert.equal(simplifiedTax(3019999, 1, T), 74350);   // 3,000~3,020천원 행
  assert.equal(simplifiedTax(1060000, 1, T), 1040);    // 1,060~1,065천원 행 (원문 1,040원)
  assert.equal(simplifiedTax(769999, 1, T), 0);
  assert.equal(simplifiedTax(1000000, 1, T), 0);
});
test("1,000만 원 이상 산식", () => {
  assert.equal(simplifiedTax(10000000, 1, T), 1507400);
  assert.equal(simplifiedTax(10000000, 3, T), 1200840);
  // 1,200만 원, 1명: 1,507,400 + (2,000천원 x 98% x 35%) + 25,000 = 2,218,400
  assert.equal(simplifiedTax(12000000, 1, T), 2218400);
  // 구간 연속성: 1,400만 원 = 1,507,400 + 1,397,000 = 2,904,400 (두 산식이 같은 값)
  assert.equal(simplifiedTax(14000000, 1, T), 2904400);
  assert.equal(simplifiedTax(14000001, 1, T) >= 2904400, true);
});
test("자녀 세액공제 (8~20세)", () => {
  assert.equal(childCredit(1, T.kids), 20830); assert.equal(childCredit(2, T.kids), 45830); assert.equal(childCredit(4, T.kids), 45830 + 2 * 33330);
  const a = calc({gross: 3000000, nontax: 0, family: 3, kids: 1}, T);
  assert.equal(a.incomeTax, 31940 - 20830);
  assert.equal(calc({gross: 2000000, nontax: 0, family: 4, kids: 2}, T).incomeTax, 0);
});
test("월 300만 원(비과세 0), 1인: 4대보험 + 소득세 합산", () => {
  const r = calc({gross: 3000000, nontax: 0, family: 1, kids: 0}, T);
  assert.equal(r.pension, 142500);          // 300만 x 4.75%
  assert.equal(r.health, 107850);           // 300만 x 3.595%
  assert.equal(r.ltc, 14170);               // 107,850 x 13.14% = 14,172 -> 10원 절사
  assert.equal(r.employ, 27000);            // 0.9%
  assert.equal(r.incomeTax, 74350); assert.equal(r.localTax, 7430);
  assert.equal(r.net, 3000000 - (142500 + 107850 + 14170 + 27000 + 74350 + 7430));
});
test("비과세(식대 20만 원)는 과세·보험 기준에서 제외", () => {
  const r = calc({gross: 3000000, nontax: 200000, family: 1, kids: 0}, T);
  assert.equal(r.taxable, 2800000); assert.equal(r.pension, 133000);
});
test("국민연금 기준소득월액 상한/하한", () => {
  assert.equal(calc({gross: 10000000, nontax: 0, family: 1}, T).pension, Math.floor(6590000 * 0.0475 / 10 + 1e-9) * 10);
  assert.equal(calc({gross: 300000, nontax: 0, family: 1}, T).pension, Math.floor(410000 * 0.0475 / 10 + 1e-9) * 10);
});
