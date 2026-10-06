// 실업급여·퇴직금·로또세금 계산기 페이지 생성: node scripts/build_calc.mjs
import fs from "node:fs"; import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const BASE = "https://moneyscale-kr.github.io", EMAIL = "scienceydsus+github-moneyscale@gmail.com", TODAY = "2026-10-07";
const jsonld = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const faqLd = (f) => jsonld({"@context": "https://schema.org", "@type": "FAQPage", mainEntity: f.map(([q, a]) => ({"@type": "Question", name: q, acceptedAnswer: {"@type": "Answer", text: a}}))});
const crumbs = (n, u) => jsonld({"@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{"@type": "ListItem", position: 1, name: "홈", item: BASE + "/"}, {"@type": "ListItem", position: 2, name: n, item: BASE + u}]});
const webApp = (n, u, d) => jsonld({"@context": "https://schema.org", "@type": "WebApplication", name: n, url: BASE + u, description: d, applicationCategory: "FinanceApplication", operatingSystem: "Any", inLanguage: "ko-KR", offers: {"@type": "Offer", price: "0", priceCurrency: "KRW"}, publisher: {"@type": "Organization", name: "돈의 스케일", url: BASE + "/"}, dateModified: TODAY});
const FOOT = `<footer><nav aria-label="사이트 정보"><a href="../">계산기 목록</a><a href="../about/">소개</a><a href="../contact/">문의</a><a href="../privacy/">개인정보처리방침</a><a href="https://www.youtube.com/@돈의스케일" rel="noopener">YouTube</a><a href="https://www.instagram.com/money.scale.kr/" rel="noopener">Instagram</a></nav>
<p>참고용 정보예요. 세법·보험요율·통계는 바뀔 수 있고, 투자·대출·보험 등 금융상품을 권유하지 않아요. 중요한 결정 전에는 국세청·공단·전문가에게 확인하세요.</p>
<p>&copy; 2026 돈의 스케일 편집팀 · <a href="mailto:${EMAIL}">${EMAIL}</a></p></footer>`;
const HX = `<!-- 사이트 소유확인(발급 후 주석 해제하고 content 채우기)
<meta name="google-site-verification" content="GOOGLE_VERIFICATION_CODE">
<meta name="naver-site-verification" content="NAVER_VERIFICATION_CODE">
-->
<!-- ADSENSE(승인 후 주석 해제): <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script> -->`;
const LINKS = {unemployment: ["실업급여 계산기", "/unemployment/"], severance: ["퇴직금 계산기", "/severance/"], "lotto-tax": ["로또 세금 계산기", "/lotto-tax/"], "take-home": ["월급 실수령액 계산기", "/take-home/"]};
const related = (self, extra) => `<section class="doc"><h2>다른 계산기</h2><ul class="srcs">${["unemployment", "severance", "lotto-tax", "take-home"].filter((k) => k !== self).map((k) => `<li><a href="../${k}/">${LINKS[k][0]}</a></li>`).join("")}</ul></section>`;

function page(c) {
  const title = c.title, url = `/${c.slug}/`;
  return `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${c.desc}">
<meta name="theme-color" content="#0b0b0f">
<link rel="canonical" href="${BASE}${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="돈의 스케일">
<meta property="og:title" content="${title}"><meta property="og:description" content="${c.desc}">
<meta property="og:url" content="${BASE}${url}"><meta property="og:image" content="${BASE}/assets/og-home.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Black+Han+Sans&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/style.css">
${HX}
${crumbs(c.name, url)}
${webApp(c.name, url, c.desc)}
${faqLd(c.faq)}
</head><body><div class="wrap">
<div class="top"><a class="brand" href="../">돈의 스케일<i>.</i></a><a href="../" style="font-size:13px">계산기 목록</a></div>
<h1>${c.h1}</h1>
<p class="sub">${c.sub}</p>
${c.form}
<section class="res" id="res" aria-live="polite" hidden></section>
<div class="src"><b>기준일 ${c.basis}</b> · 출처 ${c.srcShort}
<div class="warn">${c.warn}</div></div>
<article class="doc"><h2>계산식</h2>${c.formula}
<div class="disc" role="note"><b>꼭 읽어주세요</b> 이 페이지의 결과는 <b>참고용 추정치</b>예요. 법령·고시·요율은 바뀔 수 있고 개인 상황에 따라 실제 금액과 달라요. 세무·노무·법률 자문이 아니며 특정 금융상품·복권 구매를 권유하지 않아요. 실제 금액은 고용센터·사업장·국세청·동행복권 등 해당 기관에서 확인하세요.</div></article>
<article class="doc"><h2>${c.explainTitle}</h2>${c.explain}</article>
<section class="doc"><h2>자주 묻는 질문</h2>${c.faq.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join("")}</section>
<section class="doc"><h2>출처와 기준일</h2><ul class="srcs">${c.sources.map(([t, u, d]) => `<li><a href="${u}" rel="noopener nofollow">${t}</a> <span>(${d})</span></li>`).join("")}</ul><p class="note">숫자는 위 공개 자료를 바탕으로 편집팀이 계산했어요. 최종 업데이트 ${TODAY}.</p></section>
${related(c.slug)}
<script src="../assets/calc-core.js"></script>
<script>${c.js}</script>
${FOOT}
</div>
</body></html>
`;
}
const W = (n) => Number(n).toLocaleString("ko-KR");
const UI_COMMON = `const $=id=>document.getElementById(id),W=n=>Math.round(n).toLocaleString("ko-KR"),num=id=>parseFloat(($(id).value||"").replace(/,/g,""))||0;
function show(h){const r=$("res");r.innerHTML=h;r.hidden=false}
function bind(ids,fn){ids.forEach(i=>{$(i).addEventListener("input",fn);$(i).addEventListener("change",fn)});fn()}`;

/* ============ 1. 실업급여 ============ */
const ei = page({
  slug: "unemployment", name: "실업급여 계산기 2026", title: "실업급여 계산기 2026 (구직급여 일수·금액, 상한 68,100원) | 돈의 스케일",
  desc: "나이·고용보험 가입기간·퇴직 전 평균임금(일액)을 넣으면 2026년 구직급여 하루 금액(상한 68,100원·하한 66,048원), 최대 수령일수와 총액을 계산해요. 계산식과 출처 공개.",
  h1: "<em>실업급여</em> 계산기<br>2026 일수·금액", sub: "이직일 나이, 피보험기간, 평균임금(일액)으로 구직급여 하루 금액과 받을 수 있는 최대 일수를 계산해요.",
  form: `<label for="age">이직일 현재 나이 (세)</label><div class="field"><input id="age" type="number" inputmode="numeric" min="15" max="80" value="35"><span>세</span></div>
<label class="chk"><input type="checkbox" id="dis"> 장애인 (50세 이상과 같은 일수 적용)</label>
<label for="yrs">고용보험 가입(피보험)기간 (년)</label><div class="field"><input id="yrs" type="number" inputmode="decimal" min="0" step="0.5" value="4"><span>년</span></div>
<label for="mode">평균임금 입력 방식</label><select id="mode"><option value="m">월급(세전, 퇴직 전 3개월 평균)으로 입력</option><option value="d">1일 평균임금으로 직접 입력</option></select>
<label for="wage" id="wl">월 평균임금 (원)</label><div class="field"><input id="wage" type="text" inputmode="numeric" value="3,000,000"><span>원</span></div>`,
  basis: "법 시행 2026-09-18 · 상·하한(시행령) 시행 2026-01-01", srcShort: "고용보험법 제46조·별표1, 고용노동부 보도자료(2025-10-02, 12-16)",
  warn: "수급 자격(이직 사유 등)은 조건이 있어요 · 최대 일수와 최대 금액이에요 · 참고용",
  formula: `<ul><li><b>구직급여 일액</b> = 평균임금(일액) &times; 60%, 단 <b>하한 66,048원 ~ 상한 68,100원</b> 범위 (고용보험법 제46조)</li><li>상한 68,100원 = 임금일액 상한 113,500원 &times; 60%</li><li>하한 66,048원 = 2026 최저임금 10,320원 &times; 8시간 &times; 80%</li><li><b>총액(최대)</b> = 일액 &times; 소정급여일수 (별표1)</li><li>월 환산 = 일액 &times; 30일 (단순 곱셈, 실제는 실업인정일 기준)</li></ul>
<div class="tw"><table class="t ex"><caption>소정급여일수 (이직일 현재 연령 / 피보험기간)</caption><thead><tr><th>피보험기간</th><th>50세 미만</th><th>50세 이상·장애인</th></tr></thead><tbody><tr><td>1년 미만</td><td>120일</td><td>120일</td></tr><tr><td>1~3년 미만</td><td>150일</td><td>180일</td></tr><tr><td>3~5년 미만</td><td>180일</td><td>210일</td></tr><tr><td>5~10년 미만</td><td>210일</td><td>240일</td></tr><tr><td>10년 이상</td><td>240일</td><td>270일</td></tr></tbody></table></div>`,
  explainTitle: "실업급여(구직급여), 얼마나 받을 수 있나요",
  explain: `<p>실업급여는 정확히는 고용보험의 <b>구직급여</b>예요. 퇴직 전 평균임금의 60%를 하루 금액(일액)으로 하되, 2026년에는 하루 <b>66,048원 이상 68,100원 이하</b>로 정해져요. 2026년 시행령 개정으로 상한이 66,000원에서 68,100원으로 올랐고, 최저임금 인상으로 하한(66,048원)이 옛 상한을 넘었기 때문이에요. 그래서 평균임금이 높아도 하루 68,100원, 낮아도 66,048원이에요.</p>
<p>받는 기간(소정급여일수)은 이직일 현재 <b>나이와 피보험기간</b>으로 정해져요. 50세 미만이고 1년 미만이면 120일, 50세 이상이면서 10년 이상이면 270일까지예요. 이 계산기는 &ldquo;받을 수 있는 최대 일수&rdquo;이고, 실제 지급은 수급자격 인정과 실업인정(구직활동)에 따라 달라져요. 비자발적 퇴사 등 이직 사유 요건을 충족해야 수급할 수 있어요.</p>
<p>이론상 최대 총액은 270일 &times; 68,100원 = <b>18,387,000원</b>이에요. 대부분은 퇴직 전 3개월 평균임금의 60%가 더 작아 이보다 적어요. 월 환산은 일액 &times; 30일로 상한 2,043,000원, 하한 1,981,440원이에요. 2028-01-01 시행 예정인 개편(산정 기준을 평균임금에서 보수로 변경)은 현재 적용되지 않아 이 계산기에 반영하지 않았어요. 퇴직 후 받는 돈이 궁금하면 <a href="../severance/">퇴직금 계산기</a>도 같이 보세요.</p>`,
  faq: [
    ["2026년 실업급여 상한액과 하한액은 얼마인가요?", "하루 기준 상한은 68,100원, 하한은 66,048원이에요. 상한은 임금일액 상한 113,500원의 60%, 하한은 2026년 최저임금 10,320원 x 8시간 x 80%예요."],
    ["실업급여는 최대 며칠, 얼마까지 받나요?", "소정급여일수는 120일~270일이에요. 50세 이상이면서 피보험기간 10년 이상이면 270일이고, 상한 일액이면 이론상 최대 18,387,000원이에요."],
    ["평균임금은 어떻게 계산하나요?", "원칙적으로 이직 전 3개월 동안 받은 임금 총액을 그 기간의 총일수로 나눈 금액이에요. 이 계산기는 월급을 3개월 평균으로 보고 30일로 나눠 근사해요. 상여금·연차수당은 따로 가산돼요."],
    ["하루 금액이 하한보다 적게 나오면 어떻게 되나요?", "평균임금의 60%가 66,048원보다 작아도 하한액 66,048원을 받아요. 단 단시간근로자 등은 별도 규정이 있을 수 있어요."],
    ["나이는 언제 기준인가요?", "이직일 현재 연령이에요. 50세 이상이거나 장애인이면 같은 가입기간에서 더 긴 소정급여일수가 적용돼요."],
    ["자발적으로 퇴사해도 받을 수 있나요?", "원칙적으로 비자발적 이직(권고사직, 계약만료 등)이 대상이고, 자발적 퇴사도 정당한 사유가 인정되는 경우가 있어요. 자격 판단은 고용센터가 해요. 이 페이지는 금액 계산만 해요."],
    ["실업급여에도 세금을 내나요?", "구직급여는 소득세 비과세 대상이에요. 다만 이 페이지는 세금 계산을 하지 않으니 정확한 내용은 고용센터에 확인하세요."]
  ],
  sources: [["고용보험법 [별표 1] 구직급여의 소정급여일수", "https://www.law.go.kr/LSW/lsBylInfoR.do?lsiSeq=284449", "법 시행 2026-09-18"], ["고용보험법 시행령 개정이유 (대통령령 제35934호, 임금일액 상한 113,500원)", "https://www.law.go.kr/법령/고용보험법시행령", "시행 2026-01-01"], ["고용노동부 보도자료 2026년 구직급여 하한액 66,048원", "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18440", "2025-10-02"], ["고용노동부 보도자료 국무회의 의결 (상한 68,100원)", "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18736", "2025-12-16"], ["고용보험법 제45조·제46조 (기초일액, 구직급여일액)", "https://www.law.go.kr/법령/고용보험법", "현행"]],
  js: `${UI_COMMON}
const fmtI=e=>{e.value=e.value.replace(/[^\\d]/g,"").replace(/\\B(?=(\\d{3})+(?!\\d))/g,",")};
$("mode").addEventListener("change",()=>{$("wl").textContent=$("mode").value==="m"?"월 평균임금 (원)":"1일 평균임금 (원)";$("wage").value=$("mode").value==="m"?"3,000,000":"100,000";calc()});
$("wage").addEventListener("input",()=>fmtI($("wage")));
function calc(){const age=num("age"),yrs=num("yrs"),w=num("wage"),daily=$("mode").value==="m"?w/30:w;
if(!w||!age){$("res").hidden=true;return}
const r=CalcCore.unemployment(age,yrs,daily,$("dis").checked);
const note=r.clamp==="cap"?"상한 68,100원이 적용됐어요":r.clamp==="floor"?"하한 66,048원이 적용됐어요":"평균임금 x 60% 그대로예요";
show('<div class="big">'+W(r.daily)+'<small>원/일</small></div><div class="spicy">최대 '+r.days+'일 &middot; 총 '+W(r.total)+'원</div><ul class="cmp"><li>평균임금 일액 '+W(daily)+'원 x 60% = <b>'+W(r.raw)+'원</b> ('+note+')</li><li>구직급여 일액 <b>'+W(r.daily)+'원</b> x 소정급여일수 <b>'+r.days+'일</b> = <b>'+W(r.total)+'원</b></li><li>월 환산(일액 x 30일) 약 <b>'+W(r.month30)+'원</b></li></ul><p class="note">받을 수 있는 최대 일수·금액이에요. 수급자격과 실업인정에 따라 실제 지급은 달라져요. 영상 해설과 함께 <a href="../severance/">퇴직금 계산기</a>도 확인해 보세요.</p>')}
bind(["age","dis","yrs","wage"],calc);`
});

/* ============ 2. 퇴직금 ============ */
const sev = page({
  slug: "severance", name: "퇴직금 계산기 2026 (퇴직소득세 포함)", title: "퇴직금 계산기 2026 (퇴직소득세 예상 포함) | 돈의 스케일",
  desc: "월급·근속기간·상여금·연차수당을 넣으면 법정 퇴직금(1일 평균임금 x 30일 x 근속일수/365)과 퇴직소득세(소득세) 예상액, 세후 금액을 계산해요. 계산식과 출처 공개.",
  h1: "<em>퇴직금</em> 계산기<br>세금까지 한 번에", sub: "월급과 근속기간으로 법정 퇴직금과 퇴직소득세(소득세)를 계산해요. 퇴직금제도 기준.",
  form: `<label for="m">월급 (세전, 퇴직 전 3개월 평균, 원)</label><div class="field"><input id="m" type="text" inputmode="numeric" value="3,000,000"><span>원</span></div>
<div class="two"><div><label for="y">근속 (년)</label><div class="field"><input id="y" type="number" inputmode="numeric" min="0" value="5"><span>년</span></div></div><div><label for="mo">추가 개월</label><div class="field"><input id="mo" type="number" inputmode="numeric" min="0" max="11" value="0"><span>개월</span></div></div></div>
<div class="two"><div><label for="b">연간 상여금 (원)</label><div class="field"><input id="b" type="text" inputmode="numeric" value="0"><span>원</span></div></div><div><label for="l">연차수당 (원, 최근 1년)</label><div class="field"><input id="l" type="text" inputmode="numeric" value="0"><span>원</span></div></div></div>
<label for="d">3개월 총일수 (89~92일, 기본 90일=월 30일 단순화)</label><div class="field"><input id="d" type="number" inputmode="numeric" min="89" max="92" value="90"><span>일</span></div>`,
  basis: "법 시행 2026-09-18 · 소득세법 퇴직소득 규정 2026-01-01 시행분", srcShort: "근로자퇴직급여 보장법 제8조, 근로기준법 제2조, 소득세법 제48·55조, 고용노동부 퇴직금 산정공식",
  warn: "소득세만 계산 · 지방소득세(소득세의 10%) 별도 · DB/DC형·IRP 수령은 다름 · 참고용",
  formula: `<ul><li><b>1일 평균임금</b> = (퇴직 전 3개월 임금총액 + 연간상여금 x 3/12 + 연차수당 x 3/12) &divide; 3개월 총일수</li><li><b>퇴직금</b> = 1일 평균임금 x 30일 x (재직일수 &divide; 365)</li><li><b>퇴직소득세</b>: ① 근속연수공제 (5년 이하 100만 x N, 5~10년 500만+200만 x (N-5), 10~20년 1,500만+250만 x (N-10), 20년 초과 4,000만+300만 x (N-20)) ② 환산급여 = (퇴직금 - 근속연수공제) &divide; N x 12 ③ 환산급여공제 (800만 이하 100%, ~7천만 800만+초과분 60%, ~1억 4,520만+초과분 55%, ~3억 6,170만+초과분 45%, 3억 초과 1억 5,170만+초과분 35%) ④ 과세표준 = 환산급여 - 환산급여공제 ⑤ 기본세율(6~45%) 적용 &times; N &divide; 12</li><li>근속연수 N은 1년 미만 끝수를 1년으로 올려요.</li></ul>`,
  explainTitle: "퇴직금, 어떻게 계산되고 세금은 얼마인가요",
  explain: `<p>법정 퇴직금은 계속근로기간 <b>1년에 30일분 이상의 평균임금</b>이에요(근로자퇴직급여 보장법 제8조). 1년 미만 근무하거나 주 15시간 미만으로 일하면 대상이 아니에요. 평균임금은 퇴직 전 3개월 동안 받은 임금 총액을 그 기간의 총일수로 나눈 금액이고, 상여금과 연차수당은 연간분의 3/12를 더해요. 이 계산기는 기본값 90일(월 30일 단순화)을 쓰는데, 실제로는 3개월 역일수(89~92일)로 나눠서 1년 기준 약 293만~303만 원(월 300만 원 기준)으로 &plusmn;1~2% 차이가 날 수 있어요. 아래 칸에 실제 총일수를 넣으면 더 정확해요.</p>
<p>세금은 소득세법상 <b>퇴직소득세</b>예요. 근속연수가 길수록 공제를 많이 받도록 설계되어 있어서, 월급 300만 원 기준 근속 5년이면 퇴직금 1,500만 원에 세금 16만 원, 10년이면 3,000만 원에 20만 원, 20년이면 6,000만 원에 16만 원이에요(소득세만, 계산 결과 그대로). 근속 20년 세금이 10년보다 적은 건 근속연수공제가 크게 늘어 환산급여가 줄기 때문이에요. 지방소득세는 소득세의 10%가 별도로 붙어요. 퇴직연금(IRP)으로 받으면 과세가 이연돼요.</p>
<p>이 계산기는 일반 직원의 퇴직금제도(법정 퇴직금) 기준이고 2013년 이후 퇴직소득 계산식을 적용해요. DB형·DC형 퇴직연금은 적립 방식이 달라 계산이 다르고, 임원 한도나 2012년 이전 입사분 경과 규정도 반영하지 않았어요. 퇴직 후 실업급여가 궁금하면 <a href="../unemployment/">실업급여 계산기</a>를, 매달 받는 월급의 세후 금액은 <a href="../take-home/">실수령액 계산기</a>를 이용하세요.</p>`,
  faq: [
    ["퇴직금은 어떻게 계산하나요?", "1일 평균임금 x 30일 x (재직일수/365)예요. 평균임금은 퇴직 전 3개월 임금총액을 3개월 총일수로 나누고, 상여금과 연차수당은 연간분의 3/12를 임금총액에 더해요."],
    ["월급 300만 원이면 근속 1년·5년·10년 퇴직금은?", "월 30일 단순화로 1년 300만 원, 5년 1,500만 원, 10년 3,000만 원이에요. 실제 법 계산은 3개월 역일수로 나눠서 1~2% 차이가 날 수 있어요."],
    ["퇴직금 받을 때 세금은 얼마인가요?", "소득세법상 퇴직소득세가 원천징수돼요. 월급 300만 원 기준 근속 5년이면 소득세 약 16만 원이에요. 지방소득세(소득세의 10%)는 별도예요. 계산식은 위 계산식 항목에 있어요."],
    ["퇴직금을 받을 수 없는 경우가 있나요?", "계속근로기간 1년 미만이거나 4주간 평균 주 15시간 미만으로 일한 경우(퇴직급여법 제4조)는 법정 퇴직금 대상이 아니에요."],
    ["상여금이나 연차수당이 있으면 퇴직금이 늘어나나요?", "네. 연간 상여금과 연차수당의 3/12를 3개월 임금총액에 더해 평균임금이 올라가므로 퇴직금도 늘어요. 위 계산기에 입력하면 반영돼요."],
    ["퇴직연금(DB·DC·IRP)은 같은 방식인가요?", "아니요. DB형은 퇴직 직전 임금 기준, DC형은 매년 적립·운용 결과가 퇴직금이에요. 이 계산기는 퇴직금제도 기준이에요. IRP로 받으면 퇴직소득세 과세가 이연돼요."],
    ["퇴직금은 언제까지 받아야 하나요?", "퇴직급여법 제9조에 따라 퇴직한 날부터 14일 이내에 지급해야 해요. 당사자 합의로 연장할 수 있어요."]
  ],
  sources: [["근로자퇴직급여 보장법 제4조·제8조·제9조", "https://www.law.go.kr/법령/근로자퇴직급여보장법", "시행 2026-09-18"], ["근로기준법 제2조 (평균임금)", "https://www.law.go.kr/법령/근로기준법", "시행 2026-10-02"], ["고용노동부 퇴직금 및 평균임금 산정공식", "https://www.moel.go.kr/faq/faqView.do?seqRepeat=89", "열람 2026-10-06"], ["고용노동부 퇴직금 계산", "https://www.moel.go.kr/retirementpayCal.do", "열람 2026-10-06"], ["소득세법 제14조·제22조·제48조·제55조·제146조 (퇴직소득)", "https://www.law.go.kr/법령/소득세법", "시행 2026-01-01 조문"]],
  js: `${UI_COMMON}
const fmtI=e=>{e.value=e.value.replace(/[^\\d]/g,"").replace(/\\B(?=(\\d{3})+(?!\\d))/g,",")};
["m","b","l"].forEach(i=>$(i).addEventListener("input",()=>fmtI($(i))));
function calc(){const m=num("m"),y=num("y"),mo=num("mo");if(!m||(!y&&!mo)){$("res").hidden=true;return}
const s=CalcCore.severance({monthly:m,bonusYear:num("b"),leaveYear:num("l"),years:y,months:mo,days3m:num("d")||90});
const t=CalcCore.retireTax(s.pay,s.serviceDays);
show('<div class="big">'+W(s.pay/1e4)+'<small>만 원</small></div><div class="spicy">세금 약 '+W(t.tax)+'원 (소득세) &rarr; 세후 약 '+W(s.pay-t.tax)+'원</div><ul class="cmp"><li>1일 평균임금 <b>'+W(s.avgDaily)+'원</b> x 30일 x ('+W(s.serviceDays)+'일 / 365) = <b>'+W(s.pay)+'원</b></li><li>근속연수 N = <b>'+t.N+'년</b> · 근속연수공제 '+W(t.tenureDeduction)+'원</li><li>환산급여 '+W(t.conv)+'원 &minus; 환산급여공제 '+W(t.convDeduction)+'원 = 과세표준 <b>'+W(t.base)+'원</b></li><li>퇴직소득세(소득세) <b>'+W(t.tax)+'원</b> + 지방소득세(별도, 약 '+W(t.local)+'원) = '+W(t.tax+t.local)+'원</li></ul><p class="note">퇴직금제도 기준 · 실제 원천징수액은 사업장·금융기관 계산과 다를 수 있어요. 퇴직 후라면 <a href="../unemployment/">실업급여 계산기</a>도 확인하세요.</p>')}
bind(["m","y","mo","b","l","d"],calc);`
});

/* ============ 3. 로또 ============ */
const lt = page({
  slug: "lotto-tax", name: "로또 당첨금 세금 계산기 2026", title: "로또 당첨금 세금 계산기 2026 (1등 실수령액, 22%·33%) | 돈의 스케일",
  desc: "로또 당첨금을 넣으면 소득세·지방소득세와 실제 통장에 들어오는 금액을 계산해요. 3억 원 이하 22%, 초과분 33%, 200만 원 이하 비과세. 제1244회 1등 1인당 당첨금 예시 포함.",
  h1: "<em>로또 당첨금</em><br>세금 계산기", sub: "당첨금을 넣으면 원천징수 세금과 통장 입금액을 계산해요. 3억 원 초과분만 33%.",
  form: `<label for="p">당첨금 (세전, 원)</label><div class="field"><input id="p" type="text" inputmode="numeric" value="1,604,686,625"><span>원</span></div>
<div class="chips"><button class="chip" data-v="500000000">5억</button><button class="chip" data-v="1000000000">10억</button><button class="chip" data-v="1604686625">1244회 1등 1인당</button><button class="chip" data-v="2000000000">20억</button><button class="chip" data-v="3000000000">30억</button></div>`,
  basis: "소득세법 제84·129조 시행 2026-01-01 · 제1244회(2026-10-03) 당첨금", srcShort: "소득세법 제129조, 지방세법 제103조의13, 동행복권 당첨자 가이드",
  warn: "구입비 공제·증여세·종합소득세는 계산하지 않아요 · 5·10·20·30억은 가정 금액 · 구매 권유 아님",
  formula: `<ul><li>당첨금 <b>200만 원 이하</b> (건별): 과세하지 않음 (소득세법 제84조)</li><li><b>소득세</b> = 3억 원 &times; 20% + (당첨금 &minus; 3억 원) &times; 30% &mdash; 3억 원을 넘는 <b>초과분에만</b> 30% (제129조)</li><li><b>지방소득세</b> = 소득세 &times; 10% (지방세법 제103조의13) &rarr; 합치면 22% / 33%</li><li><b>통장 입금액</b> = 당첨금 &minus; 소득세 &minus; 지방소득세 (원 단위는 10원 미만 절사 가정)</li></ul>`,
  explainTitle: "로또 1등 당첨금, 세금 떼고 얼마 받나요",
  explain: `<p>로또6/45 당첨금은 공시된 금액 그대로 받지 못하고 <b>원천징수</b>된 뒤의 금액이 입금돼요. 건별 당첨금이 200만 원을 넘으면 기타소득으로 과세하고, 3억 원까지는 소득세 20%와 지방소득세 2%를 합한 22%, 3억 원을 넘는 <b>초과분</b>은 소득세 30%와 지방소득세 3%를 합한 33%예요. 동행복권 안내표의 &ldquo;3억 원 초과 33%&rdquo;는 표 표현이고 법 문언은 &ldquo;초과하는 분&rdquo;이라 누진(초과분만 33%)으로 계산해요.</p>
<p>예를 들어 제1244회(2026-10-03 추첨)의 1등은 18명, 1인당 1,604,686,625원이었어요. 소득세 451,405,980원과 지방소득세 45,140,590원, 합계 496,546,570원을 떼면 <b>1,108,140,055원(약 11.08억)</b>이 입금되고 실효세율은 약 30.9%예요. 10억 원이면 세금 2.97억 원에 7.03억 원, 20억 원이면 세금 6.27억 원(31.35%)에 13.73억 원이에요. 당첨자가 많으면 1인당 금액이 줄어요.</p>
<p>이 계산기는 원천징수 후 입금액 기준이에요. 복권 구입비 공제 여부, 증여세, 이자 소득, 종합소득세 영향은 계산하지 않아요. 당첨금 청구권은 지급개시일부터 1년이 지나면 소멸시효가 완성돼요(복권 및 복권기금법 제9조). 연금복권은 1등 당첨금의 22%를 원천징수하고 분할 지급이라 별개예요. 월급의 세후 금액은 <a href="../take-home/">실수령액 계산기</a>에서 볼 수 있어요.</p>`,
  faq: [
    ["로또 당첨금 세금은 몇 %인가요?", "200만 원 이하는 비과세, 200만 원 초과~3억 원 이하분은 22%(소득세 20%+지방소득세 2%), 3억 원 초과분은 33%(소득세 30%+지방소득세 3%)예요."],
    ["3억 원이 넘으면 전체에 33%를 내나요?", "아니요. 3억 원을 넘는 초과분에만 30%(+지방소득세)가 적용돼요. 3억 원까지는 20%예요. 법 문언이 \"초과하는 분\"이라 누진 방식이에요."],
    ["제1244회 1등 1인당 당첨금은 세금 떼면 얼마인가요?", "1인당 1,604,686,625원에서 세금 496,546,570원을 떼고 약 1,108,140,055원(11.08억)이 입금돼요. 실효세율은 약 30.9%예요."],
    ["당첨금은 어디로 입금되나요?", "로또6/45 당첨금은 원천징수 후 농협은행 계좌로 지급돼요. 자세한 수령 절차는 동행복권 당첨자 가이드를 확인하세요."],
    ["200만 원 이하 당첨금도 세금을 내나요?", "건별 당첨금이 200만 원 이하면 과세하지 않아요(소득세법 제84조). 200만 원을 1원이라도 넘으면 당첨금 전체에 20%(+지방소득세)가 적용돼요."],
    ["당첨금 청구 기한이 있나요?", "추첨식·온라인복권 당첨금은 지급개시일부터 1년이 지나면 소멸시효가 완성돼요(복권 및 복권기금법 제9조)."],
    ["증여세나 종합소득세는요?", "이 계산기에는 포함되지 않아요. 당첨금을 가족에게 주면 증여세가 별도로 붙을 수 있다고 동행복권이 안내해요. 정확한 내용은 세무 전문가나 국세청에 확인하세요."]
  ],
  sources: [["소득세법 제84조·제129조 (복권 당첨금 비과세 기준·원천징수)", "https://www.law.go.kr/법령/소득세법", "시행 2026-01-01"], ["지방세법 제103조의13 (개인지방소득세 특별징수)", "https://www.law.go.kr/법령/지방세법", "시행 2026-01-01"], ["동행복권 당첨자 가이드 (원천징수 세율·지급 방식)", "https://www.dhlottery.co.kr/guide/wnrGuide", "열람 2026-10-06"], ["동행복권 로또6/45 제1244회 당첨결과", "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchLtEpsd=1244", "추첨 2026-10-03"], ["복권 및 복권기금법 제8조·제9조", "https://www.law.go.kr/법령/복권및복권기금법", "시행 2026-01-02"]],
  js: `${UI_COMMON}
$("p").addEventListener("input",()=>{$("p").value=$("p").value.replace(/[^\\d]/g,"").replace(/\\B(?=(\\d{3})+(?!\\d))/g,",")});
document.querySelectorAll(".chip").forEach(b=>b.addEventListener("click",()=>{$("p").value=W(+b.dataset.v);calc()}));
function calc(){const p=num("p");if(!p){$("res").hidden=true;return}
const r=CalcCore.lotto(p);
if(!r.taxable){show('<div class="big">'+W(r.net)+'<small>원</small></div><div class="spicy">200만 원 이하라 세금이 없어요</div>');return}
show('<div class="big">'+(r.net/1e8).toFixed(2)+'<small>억 원 입금</small></div><div class="spicy">세금 '+(r.tax/1e8).toFixed(2)+'억 원 (실효 '+(r.rate*100).toFixed(1)+'%)</div><ul class="cmp"><li>당첨금 <b>'+W(p)+'원</b></li><li>소득세 <b>'+W(r.income)+'원</b> (3억 이하 20% + 초과분 30%)</li><li>지방소득세 <b>'+W(r.local)+'원</b> (소득세의 10%)</li><li>통장 입금액 <b>'+W(r.net)+'원</b></li></ul><p class="note">원천징수 후 금액 기준 · 구입비·증여세·종합소득세는 계산 제외 · 참고용. 월급 세후는 <a href="../take-home/">실수령액 계산기</a>.</p>')}
calc();`
});
for (const [d, h] of [["unemployment", ei], ["severance", sev], ["lotto-tax", lt]]) { fs.mkdirSync(path.join(root, d), {recursive: true}); fs.writeFileSync(path.join(root, d, "index.html"), h); }

/* sitemap */
const smf = path.join(root, "sitemap.xml"); let sm = fs.readFileSync(smf, "utf8");
for (const d of ["unemployment", "severance", "lotto-tax"]) if (!sm.includes(`/${d}/`)) sm = sm.replace("</urlset>", `<url><loc>${BASE}/${d}/</loc><lastmod>${TODAY}</lastmod></url>\n</urlset>`);
fs.writeFileSync(smf, sm);

/* 홈 카드 */
const hf = path.join(root, "index.html"); let h = fs.readFileSync(hf, "utf8");
h = h.replace(/<!--CALCCARDS-->[\s\S]*?<!--\/CALCCARDS-->/, "");
const cards = `<!--CALCCARDS--><div style="margin-top:22px"><a class="card" href="salary-rank/"><span class="tag">계산기</span><h2>내 연봉, 대한민국 상위 몇 %?</h2><p>국세청 근로소득 통계로 내 위치를 알아봐요.</p></a>
<a class="card" href="apartment-years/"><span class="tag">계산기</span><h2>내 월급으로 서울 아파트까지 몇 년?</h2><p>월급·저축률·지역으로 걸리는 시간을 계산해요.</p></a>
<a class="card" href="take-home/"><span class="tag">계산기</span><h2>월급 실수령액 계산기 (2026)</h2><p>4대보험과 간이세액표를 반영한 예상 실수령액.</p></a>
<a class="card" href="unemployment/"><span class="tag">신규</span><h2>실업급여 계산기 (2026)</h2><p>하루 66,048~68,100원, 최대 일수와 총액.</p></a>
<a class="card" href="severance/"><span class="tag">신규</span><h2>퇴직금 계산기 (세금 포함)</h2><p>법정 퇴직금과 퇴직소득세 예상액.</p></a>
<a class="card" href="lotto-tax/"><span class="tag">신규</span><h2>로또 당첨금 세금 계산기</h2><p>3억 초과분 33%, 실제 입금액 계산.</p></a>
<a class="card" href="civil-pay/"><span class="tag">조회</span><h2>2026 공무원 월급 (9급~5급)</h2><p>인사혁신처 봉급표로 직급·호봉 월급 조회.</p></a></div><!--/CALCCARDS-->`;
h = h.replace('<footer>', cards + '\n<footer>');
fs.writeFileSync(hf, h);
console.log("ok");
