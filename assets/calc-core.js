/* 실업급여·퇴직금·로또세금 계산 코어 (브라우저 + node 공용). 기준일은 각 페이지·facts.md 참고 */
(function (root, f) { if (typeof module === "object" && module.exports) module.exports = f(); else root.CalcCore = f(); })(this, function () {
  const floor10 = (n) => Math.floor(n / 10) * 10;

  /* ---- 실업급여 (고용보험법 제46조·별표1, 시행령 2026.1.1) ---- */
  const EI = {cap: 68100, floor: 66048, wageCap: 113500, minWage: 10320};
  const EI_DAYS = [[1, 120, 120], [3, 150, 180], [5, 180, 210], [10, 210, 240], [Infinity, 240, 270]]; // [미만 연수, 50세 미만, 50세 이상/장애인]
  function eiDays(age, years, disabled) {
    const senior = age >= 50 || !!disabled;
    for (const [lt, a, b] of EI_DAYS) if (years < lt) return senior ? b : a;
  }
  function unemployment(age, years, avgDaily, disabled) {
    const raw = avgDaily * 0.6;
    const daily = Math.min(EI.cap, Math.max(EI.floor, Math.floor(raw)));
    const days = eiDays(age, years, disabled);
    const clamp = raw > EI.cap ? "cap" : raw < EI.floor ? "floor" : "none";
    return {raw: Math.floor(raw), daily, days, total: daily * days, month30: daily * 30, clamp};
  }

  /* ---- 퇴직금·퇴직소득세 (퇴직급여법 제8조, 근로기준법 제2조, 소득세법 제48·55조) ---- */
  function severance(o) { // o: monthly, bonusYear, leaveYear, years, months, days3m
    const d3 = o.days3m || 90;
    const wage3 = 3 * o.monthly + (o.bonusYear || 0) * 3 / 12 + (o.leaveYear || 0) * 3 / 12;
    const avgDaily = wage3 / d3;
    const serviceDays = Math.round(((o.years || 0) * 12 + (o.months || 0)) / 12 * 365);
    const pay = Math.floor(avgDaily * 30 * serviceDays / 365);
    return {avgDaily, serviceDays, pay};
  }
  function tenureDeduction(N) {
    const M = 1e4;
    if (N <= 5) return 100 * M * N;
    if (N <= 10) return 500 * M + 200 * M * (N - 5);
    if (N <= 20) return 1500 * M + 250 * M * (N - 10);
    return 4000 * M + 300 * M * (N - 20);
  }
  function convDeduction(x) {
    const M = 1e4;
    if (x <= 800 * M) return x;
    if (x <= 7000 * M) return 800 * M + (x - 800 * M) * 0.6;
    if (x <= 10000 * M) return 4520 * M + (x - 7000 * M) * 0.55;
    if (x <= 30000 * M) return 6170 * M + (x - 10000 * M) * 0.45;
    return 15170 * M + (x - 30000 * M) * 0.35;
  }
  const BR = [[14e6, .06, 0], [50e6, .15, 1.26e6], [88e6, .24, 5.76e6], [150e6, .35, 15.44e6], [300e6, .38, 19.94e6], [500e6, .40, 25.94e6], [1e9, .42, 35.94e6], [Infinity, .45, 65.94e6]];
  function basicTax(b) { for (const [m, r, q] of BR) if (b <= m) return b * r - q; }
  function retireTax(pay, serviceDays) { // 근속연수: 1년 미만 끝수는 1년으로 올림
    const N = Math.max(1, Math.ceil(serviceDays / 365 - 1e-9));
    const td = tenureDeduction(N);
    const conv = Math.max(0, (pay - td) / N * 12);
    const cd = convDeduction(conv);
    const base = Math.max(0, conv - cd);
    const tax = Math.floor(basicTax(base) / 12 * N);
    return {N, tenureDeduction: td, conv, convDeduction: cd, base, tax, local: Math.floor(tax * 0.1)};
  }

  /* ---- 로또 당첨금 세금 (소득세법 제84·129조, 지방세법 제103조의13) ---- */
  function lotto(prize) {
    if (prize <= 2e6) return {taxable: false, income: 0, local: 0, tax: 0, net: prize, rate: 0};
    const income = floor10(Math.min(prize, 3e8) * 0.2 + Math.max(0, prize - 3e8) * 0.3);
    const local = floor10(income * 0.1);
    const tax = income + local;
    return {taxable: true, income, local, tax, net: prize - tax, rate: tax / prize};
  }
  return {EI, eiDays, unemployment, severance, tenureDeduction, convDeduction, basicTax, retireTax, lotto};
});
