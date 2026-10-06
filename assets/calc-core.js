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
  /* ---- 상속세 (상속세 및 증여세법 제18~26조, 제69조) ---- */
  const INH_BR = [[1e8, .10, 0], [5e8, .20, 1e7], [1e9, .30, 6e7], [3e9, .40, 1.6e8], [Infinity, .50, 4.6e8]];
  function inhTax(b) { for (const [m, r, q] of INH_BR) if (b <= m) return Math.floor(b * r - q); }
  function finDeduction(f) { // 금융재산 상속공제: 2천만 이하 전액, 2천만~1억 2천만 정액, 1억 초과 20%(최소 2천만, 최대 2억)
    if (f <= 0) return 0; if (f <= 2e7) return f; if (f <= 1e8) return 2e7; return Math.min(2e8, Math.max(2e7, Math.floor(f * 0.2)));
  }
  function inheritance(o) { // o: estate, debt, preGift, spouse(bool), kids, fin, spouseMode("legal"|"min"), reportCredit(bool)
    const kids = Math.max(0, o.kids | 0), debt = o.debt || 0, pre = o.preGift || 0;
    const value = Math.max(0, o.estate - debt + pre);
    let personal = Math.max(5e8, 2e8 + kids * 5e7), lumpExcluded = false;
    if (o.spouse && kids === 0) { personal = 2e8 + 0; lumpExcluded = true; } // 배우자 단독 상속: 일괄공제 배제, 기초공제만
    let spouseDed = 0, legalShare = 0, spouseLimit = 0;
    if (o.spouse) {
      legalShare = 1.5 / (1.5 + kids);
      spouseLimit = Math.min(3e9, Math.floor(value * legalShare));
      const actual = (o.spouseMode || "legal") === "legal" ? spouseLimit : 0;
      spouseDed = Math.max(5e8, Math.min(actual, spouseLimit));
    }
    const fin = finDeduction(Math.min(o.fin || 0, value));
    const deduct = Math.min(value, personal + spouseDed + fin);
    const base = Math.max(0, value - deduct);
    const tax = inhTax(base);
    const credit = o.reportCredit ? Math.floor(tax * 0.03) : 0;
    return {value, personal, lumpExcluded, spouseDed, legalShare, spouseLimit, fin, deduct, base, tax, credit, pay: tax - credit};
  }

  /* ---- 대출 이자 상환표 (원 단위 절사, 마지막 회차에서 잔액 정리) ---- */
  function loan(o) { // o: principal, rate(연, 0.05), months, method("pmt"|"principal"|"bullet")
    const P = o.principal, n = o.months, r = o.rate / 12, rows = [];
    let bal = P, tp = 0, ti = 0;
    const pmt = r === 0 ? Math.round(P / n) : Math.round(P * r / (1 - Math.pow(1 + r, -n)));
    const eq = Math.floor(P / n);
    for (let k = 1; k <= n; k++) {
      const interest = Math.floor(bal * r); let prin;
      if (o.method === "bullet") prin = k === n ? bal : 0;
      else if (o.method === "principal") prin = k === n ? bal : eq;
      else prin = k === n ? bal : Math.min(bal, pmt - interest);
      bal -= prin; tp += prin; ti += interest;
      rows.push({n: k, pay: prin + interest, principal: prin, interest, balance: bal});
    }
    return {rows, totalInterest: ti, totalPay: tp + ti, first: rows[0].pay, last: rows[n - 1].pay, pmt};
  }

  /* ---- 전월세 전환율 (주택임대차보호법 제7조의2, 시행령 제9조) ---- */
  const RENT = {base: 0.03, baseDate: "2026-08-27", cap10: 0.10, add: 0.02};
  const rentCap = (base) => Math.min(RENT.cap10, (base == null ? RENT.base : base) + RENT.add);
  const rentMonthly = (converted, rate) => Math.floor(converted * rate / 12);
  const rentDeposit = (monthly, rate) => Math.floor(monthly * 12 / rate);
  const rentImplied = (monthly, converted) => monthly * 12 / converted;

  /* ---- 주택 취득세 (지방세법 제11조·제13조의2·제151조, 농특세법) ---- */
  const round4 = (x) => Math.round(x * 1e4 + 1e-9) / 1e4;
  function acqBaseRatePct(price) { // % 단위
    if (price <= 6e8) return 1; if (price > 9e8) return 3;
    return round4(price * 2 / 3e8 - 3);
  }
  function acqHeavy(houses, region, temp2) { // 중과 세율(%) 또는 0 (취득 후 보유 주택 수 기준)
    if (houses === 2 && temp2) return 0;
    if (region === "adj") return houses >= 3 ? 12 : houses === 2 ? 8 : 0;
    return houses >= 4 ? 12 : houses === 3 ? 8 : 0;
  }
  function acquisition(o) { // o: price, houses(취득 후 주택 수), region("adj"|"non"), area85(bool: 전용 85㎡ 초과), temp2(bool)
    const heavy = acqHeavy(o.houses, o.region, o.temp2), basePct = acqBaseRatePct(o.price);
    const pct = heavy || basePct;
    const edPct = heavy ? 0.4 : pct / 10;
    const spPct = o.area85 ? (heavy === 8 ? 0.6 : heavy === 12 ? 1.0 : 0.2) : 0;
    const tax = floor10(o.price * pct / 100), edu = floor10(o.price * edPct / 100), sp = floor10(o.price * spPct / 100);
    return {heavy, basePct, pct, edPct, spPct, tax, edu, sp, total: tax + edu + sp, totalPct: pct + edPct + spPct};
  }

  /* ---- 직장가입자 건강보험료 + 장기요양 (2026) ---- */
  const HI = {rate: 0.0719, ltc: 0.1314, capTotal: 9183480, floorTotal: 20160};
  function health(monthly) { // monthly: 보수월액(원). 가입자(본인)·사업주 각 50%
    const t = Math.min(HI.capTotal, Math.max(HI.floorTotal, floor10(monthly * HI.rate)));
    const lt = floor10(t * HI.ltc);
    const emp = floor10(t / 2), empL = floor10(lt / 2);
    return {total: t, ltcTotal: lt, health: emp, ltc: empL, mine: emp + empL, boss: emp + empL, all: t + lt, capped: t === HI.capTotal, floored: t === HI.floorTotal};
  }
  return {EI, eiDays, unemployment, severance, tenureDeduction, convDeduction, basicTax, retireTax, lotto, inheritance, inhTax, finDeduction, loan, RENT, rentCap, rentMonthly, rentDeposit, rentImplied, acqBaseRatePct, acqHeavy, acquisition, HI, health};
});
