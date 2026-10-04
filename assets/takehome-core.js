/* 실수령액 계산 코어 (브라우저 + node 겸용). 2026 4대보험 근로자 부담 요율 + 근로소득 간이세액표(시행령 별표 2) */
(function(root){
const RATES = {
  pension: 0.0475,        // 국민연금 9.5% 중 근로자 4.75% (2026, 연금개혁 반영)
  pensionMin: 410000, pensionMax: 6590000, // 기준소득월액 하한/상한 (2026.7~2027.6)
  health: 0.03595,        // 건강보험 7.19% 중 근로자 3.595% (2026)
  ltc: 0.1314,            // 장기요양 = 건강보험료 x 13.14% (2026)
  employ: 0.009,          // 고용보험(실업급여) 근로자 0.9%
  localTax: 0.10          // 지방소득세 = 소득세 x 10%
};
const cut10 = (x) => Math.floor(x / 10 + 1e-9) * 10;   // 10원 미만 절사 (부동소수 오차 보정)
function simplifiedTax(monthly, family, T){      // monthly: 비과세 제외 월급여(원), family: 본인 포함 1~11
  const k = monthly / 1000, fam = Math.min(Math.max(family|0, 1), 11), i = fam - 1;
  if (k < T.rows[0][0]) return 0;
  if (k < 10000){
    let lo = 0, hi = T.rows.length - 1;
    while (lo < hi){ const mid = (lo + hi) >> 1; if (T.rows[mid][1] <= k) lo = mid + 1; else hi = mid; }
    return T.rows[lo][2][i];
  }
  const base = T.at10000[i];
  if (k === 10000) return base;
  let seg = T.over10000[0]; for (const s of T.over10000) if (k > s[0]) seg = s;
  return cut10(base + seg[1] + (monthly - seg[0] * 1000) * seg[2]);
}
function childCredit(n, K){ if (n <= 0) return 0; if (n === 1) return K["1"]; if (n === 2) return K["2"]; return K["3"] + (n - 2) * K.extra; }
/* in: {gross(월 세전 급여, 원), nontax(월 비과세, 원), family(본인 포함), kids(8~20세 자녀 수)} */
function calc(inp, T){
  const gross = Math.max(0, inp.gross), nontax = Math.min(Math.max(0, inp.nontax || 0), gross);
  const taxable = gross - nontax, R = RATES;
  const pBase = taxable ? Math.min(Math.max(taxable, R.pensionMin), R.pensionMax) : 0;
  const pension = cut10(pBase * R.pension);
  const health = cut10(taxable * R.health);
  const ltc = cut10(health * R.ltc);
  const employ = cut10(taxable * R.employ);
  let tax = simplifiedTax(taxable, inp.family || 1, T);
  tax = Math.max(0, tax - childCredit(inp.kids || 0, T.kids));
  const local = cut10(tax * R.localTax);
  const total = pension + health + ltc + employ + tax + local;
  return {gross, nontax, taxable, pension, health, ltc, employ, incomeTax: tax, localTax: local, total, net: gross - total, rate: gross ? total / gross : 0};
}
const api = {RATES, simplifiedTax, childCredit, calc};
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.MSTax = api;
})(typeof window !== "undefined" ? window : globalThis);
