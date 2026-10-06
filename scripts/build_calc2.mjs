// 상속세·대출이자·취득세·전월세전환·건강보험료 계산기 페이지 생성: node scripts/build_calc2.mjs
import fs from "node:fs"; import path from "node:path"; import {createRequire} from "node:module";
const {health} = createRequire(import.meta.url)("../assets/calc-core.js");
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
const LINKS = {unemployment: ["실업급여 계산기", "/unemployment/"], severance: ["퇴직금 계산기", "/severance/"], "lotto-tax": ["로또 세금 계산기", "/lotto-tax/"], "take-home": ["월급 실수령액 계산기", "/take-home/"], "inheritance-tax": ["상속세 계산기", "/inheritance-tax/"], "loan-interest": ["대출 이자 계산기", "/loan-interest/"], "acquisition-tax": ["주택 취득세 계산기", "/acquisition-tax/"], "rent-convert": ["전월세 전환율 계산기", "/rent-convert/"], "health-insurance": ["건강보험료 계산기", "/health-insurance/"]};
const related = (self) => `<section class="doc"><h2>다른 계산기</h2><ul class="srcs">${Object.keys(LINKS).filter((k) => k !== self).map((k) => `<li><a href="../${k}/">${LINKS[k][0]}</a></li>`).join("")}</ul></section>`;

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

const FMT = `const fmtI=e=>{e.value=e.value.replace(/[^\\d]/g,"").replace(/\\B(?=(\\d{3})+(?!\\d))/g,",")};document.querySelectorAll("input.m").forEach(e=>e.addEventListener("input",()=>fmtI(e)));
document.querySelectorAll(".chip").forEach(b=>b.addEventListener("click",()=>{const t=$(b.dataset.t);t.value=W(+b.dataset.v);calc()}));`;
const money = (id, label, v) => `<label for="${id}">${label}</label><div class="field"><input id="${id}" class="m" type="text" inputmode="numeric" value="${v}"><span>원</span></div>`;

/* ============ 1. 상속세 ============ */
const inh = page({
  slug: "inheritance-tax", name: "상속세 계산기 2026", title: "상속세 계산기 2026 (일괄공제 5억·배우자공제, 세율 10~50%) | 돈의 스케일",
  desc: "상속재산·채무·배우자·자녀 수를 넣으면 일괄공제 5억, 배우자 상속공제(5억~30억), 금융재산공제를 반영해 상속세 과세표준과 예상 세액을 계산해요. 세율표·공제 기준·출처 공개.",
  h1: "<em>상속세</em> 계산기<br>2026 공제·세율", sub: "재산, 가족 구성, 금융재산만 넣으면 공제와 세액을 단계별로 보여줘요. 배우자가 있으면 최소 10억까지는 세금이 없어요.",
  form: `${money("est", "상속재산 총액 (부동산·금융 등 시가, 원)", "2,000,000,000")}
<div class="chips"><button class="chip" data-t="est" data-v="1000000000">10억</button><button class="chip" data-t="est" data-v="1500000000">15억</button><button class="chip" data-t="est" data-v="2000000000">20억</button><button class="chip" data-t="est" data-v="3000000000">30억</button><button class="chip" data-t="est" data-v="5000000000">50억</button></div>
${money("debt", "채무·장례비·공과금 (차감, 원)", "0")}
${money("pre", "10년 내 상속인에게 한 사전증여 (합산, 원)", "0")}
${money("fin", "순금융재산 (금융재산 - 금융채무, 원)", "0")}
<div class="two"><div><label for="sp">배우자</label><select id="sp"><option value="1">있음</option><option value="0">없음</option></select></div><div><label for="kids">자녀 수 (명)</label><div class="field"><input id="kids" type="number" inputmode="numeric" min="0" max="20" value="2"><span>명</span></div></div></div>
<label for="sm">배우자 상속분</label><select id="sm"><option value="legal">법정상속분까지 상속 (공제 최대)</option><option value="min">최소 공제 5억만 적용 (배우자가 거의 안 받음)</option></select>
<label class="chk"><input type="checkbox" id="rc"> 기한 내 신고 세액공제 3% 반영 (원문 재확인 전, 선택)</label>`,
  basis: "상속세 및 증여세법 현행 세율표·공제 (2026-10-07 열람)", srcShort: "상증세법 제18~26조, 국세청 세액계산흐름도, 찾기쉬운 생활법령",
  warn: "자녀 외 인적공제(미성년·연로자·장애인), 동거주택·가업상속·영농 공제, 세대생략 할증, 사전증여 증여세액공제는 계산하지 않아요 · 참고용",
  formula: `<ul><li><b>상속세 과세가액</b> = 상속재산 &minus; 채무·장례비·공과금 + 10년 내 상속인 사전증여(5년: 상속인 외)</li><li><b>인적공제</b>: 기초공제 2억 + 자녀 1인당 5천만 원과 <b>일괄공제 5억 원 중 큰 금액</b> (배우자 단독 상속이면 일괄공제 배제)</li><li><b>배우자 상속공제</b> = 실제 상속분, 단 최소 5억 원~최대 30억 원, 한도는 상속재산 &times; 배우자 법정상속분(1.5 &divide; (1.5 + 자녀수))</li><li><b>금융재산공제</b>: 순금융재산 2천만 원 이하 전액, 2천만~1억 원 2천만 원, 1억 원 초과 20%(최소 2천만·최대 2억)</li><li><b>과세표준</b> = 과세가액 &minus; 공제합계, <b>세액</b> = 과세표준 &times; 세율 &minus; 누진공제</li></ul>
<div class="tw"><table class="t ex"><caption>상속세 세율 (상증세법 제26조)</caption><thead><tr><th>과세표준</th><th>세율</th><th>누진공제</th></tr></thead><tbody><tr><td>1억 이하</td><td>10%</td><td>-</td></tr><tr><td>1억 초과~5억</td><td>20%</td><td>1,000만</td></tr><tr><td>5억 초과~10억</td><td>30%</td><td>6,000만</td></tr><tr><td>10억 초과~30억</td><td>40%</td><td>1억 6,000만</td></tr><tr><td>30억 초과</td><td>50%</td><td>4억 6,000만</td></tr></tbody></table></div>`,
  explainTitle: "상속세, 얼마부터 내고 얼마나 나오나요",
  explain: `<p>상속세는 재산이 많다고 바로 내는 세금이 아니에요. 상속재산에서 채무와 장례비를 빼고, <b>일괄공제 5억 원</b>(자녀가 많아도 기본 5억)을 빼고, 배우자가 있으면 <b>배우자 상속공제 최소 5억 원</b>을 더 빼요. 그래서 배우자와 자녀가 함께 상속받는 경우 <b>10억 원까지는 세금이 0원</b>이에요. 배우자가 없으면 일괄공제 5억 원까지만 공제돼요.</p>
<p>예를 들어 배우자 없이 자녀 2명에게 10억 원을 물려주면 과세표준이 5억 원이고 세액은 5억 원 &times; 20% &minus; 1,000만 원 = <b>9,000만 원</b>이에요. 배우자와 자녀 2명이 20억 원을 상속하고 배우자가 법정상속분(3/7, 약 8.57억 원)을 받으면 공제가 약 13.57억 원이라 과세표준은 약 6.43억 원, 세액은 약 1.33억 원이에요. 배우자가 실제로 얼마를 받느냐에 따라 세액이 크게 달라져요.</p>
<p>이 계산기는 개요를 보는 용도예요. 부동산 평가(시가·기준시가), 가업·영농 공제, 동거주택 상속공제, 사전증여 증여세액 공제, 세대를 건너뛴 상속 할증, 연부연납 등은 반영하지 않아요. 상속세는 상속개시일이 속하는 달 말일부터 6개월 안에 신고·납부하고, 신고세액공제 3%는 법 조문을 이번에 재확인하지 못해 선택 항목으로만 두었어요. 증여가 궁금하다면 증여세는 세율표가 같지만 공제가 달라요. 월급 쪽 세금은 <a href="../take-home/">실수령액 계산기</a>를 보세요.</p>`,
  faq: [
    ["상속세는 얼마부터 내나요?", "배우자와 자녀가 함께 상속하면 일괄공제 5억 원과 배우자 상속공제 최소 5억 원으로 10억 원까지는 세금이 없어요. 배우자가 없으면 5억 원부터 과세 대상이에요(금융재산공제 등 다른 공제가 있으면 더 늘어요)."],
    ["상속세 세율은 몇 %인가요?", "과세표준 1억 원 이하 10%, 5억 원 이하 20%, 10억 원 이하 30%, 30억 원 이하 40%, 30억 원 초과 50%의 5단계 누진세율이에요. 구간마다 누진공제액을 빼요."],
    ["일괄공제와 기초공제는 어떻게 다른가요?", "기초공제 2억 원과 그 밖의 인적공제(자녀 1인당 5천만 원 등) 합계액과 일괄공제 5억 원 중 큰 금액을 공제해요. 보통 일괄공제 5억 원이 더 커요. 단 배우자 단독 상속이면 일괄공제를 못 받아요."],
    ["배우자 상속공제는 얼마까지 되나요?", "실제 상속받은 금액을 공제하되 최소 5억 원, 최대 30억 원이에요. 한도는 상속재산에 배우자 법정상속분을 곱한 금액이에요. 배우자가 5억 원보다 적게 받아도 5억 원은 공제돼요."],
    ["10년 내 증여한 재산도 포함되나요?", "상속인에게 한 사전증여는 상속 전 10년, 상속인 외의 사람에게는 5년 분이 상속재산에 합산돼요. 이 계산기는 합산만 하고 이미 낸 증여세의 공제는 반영하지 않아 세액이 과대하게 나올 수 있어요."],
    ["금융재산공제는 얼마인가요?", "순금융재산이 2천만 원 이하면 전액, 2천만 원 초과 1억 원 이하면 2천만 원, 1억 원 초과면 20%(최대 2억 원)예요. 이 기준은 이번 작업에서 조문 원문까지는 재확인하지 못했어요."],
    ["신고하면 세금을 깎아주나요?", "기한 내 신고하면 산출세액의 일정 비율(현재 3%로 안내)을 공제해요. 이 값은 이번에 조문 원문으로 재확인하지 못해서 계산기에서는 선택 항목으로만 제공해요."],
    ["2026년에 상속세 제도가 바뀌었나요?", "2026-10-07 기준으로 세율표(10~50%)와 일괄공제 5억·배우자 공제 5억~30억 체계가 그대로 안내되고 있어요. 개정안이 논의될 수 있으니 신고 전에 국세청에서 최신 내용을 확인하세요."]
  ],
  sources: [["상속세 및 증여세법 제18~26조 (공제·세율)", "https://www.law.go.kr/법령/상속세및증여세법", "열람 2026-10-07"], ["국세청 상속세 세액계산흐름도 (세율 구간, 공제 순서)", "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2326&cntntsId=7720", "열람 2026-10-07"], ["국세청 자주묻는Q&A 배우자 상속공제·상속공제 한도", "https://call.nts.go.kr/call/qna/selectQnaInfo.do?mi=2060&ctgId=CTG11673", "열람 2026-10-07"], ["찾기쉬운 생활법령정보 상속세 계산 및 납부", "https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=255&ccfNo=7&cciNo=2&cnpClsNo=1&menuType=qna", "열람 2026-10-07"]],
  js: `${UI_COMMON}
${FMT}
function calc(){const est=num("est");if(!est){$("res").hidden=true;return}
const r=CalcCore.inheritance({estate:est,debt:num("debt"),preGift:num("pre"),fin:num("fin"),spouse:$("sp").value==="1",kids:num("kids"),spouseMode:$("sm").value,reportCredit:$("rc").checked});
const e=n=>(n/1e8).toFixed(2);
show('<div class="big">'+W(r.pay)+'<small>원</small></div><div class="spicy">'+(r.pay===0?'공제 안에서 세금이 없어요':'과세표준 '+e(r.base)+'억 원 · 실효 '+(r.pay/r.value*100).toFixed(1)+'%')+'</div><ul class="cmp"><li>상속세 과세가액 <b>'+W(r.value)+'원</b></li><li>인적공제('+(r.lumpExcluded?'기초공제만':'일괄공제 5억 또는 기초+자녀 중 큰 금액')+') <b>'+W(r.personal)+'원</b></li>'+($("sp").value==="1"?'<li>배우자 상속공제 <b>'+W(r.spouseDed)+'원</b> (법정상속분 한도 '+W(r.spouseLimit)+'원)</li>':'')+'<li>금융재산공제 <b>'+W(r.fin)+'원</b></li><li>과세표준 <b>'+W(r.base)+'원</b> &rarr; 산출세액 <b>'+W(r.tax)+'원</b>'+(r.credit?' &minus; 신고공제 '+W(r.credit)+'원':'')+'</li></ul><p class="note">자녀 외 인적공제·동거주택·가업 공제·사전증여 세액공제는 제외한 개략치예요. 신고 전 국세청·세무사 확인 필수.</p>')}
bind(["est","debt","pre","fin","sp","kids","sm","rc"],calc);`
});

/* ============ 2. 대출 이자 ============ */
const loan = page({
  slug: "loan-interest", name: "대출 이자 계산기 2026", title: "대출 이자 계산기 (원리금균등·원금균등·만기일시, 월별 상환표) | 돈의 스케일",
  desc: "대출금·금리·기간을 넣으면 원리금균등, 원금균등, 만기일시 세 가지 상환 방식의 월 납입액, 총이자, 월별 상환 스케줄을 계산해요. 계산식과 비교표 공개.",
  h1: "<em>대출 이자</em> 계산기<br>월별 상환표", sub: "원리금균등·원금균등·만기일시를 한 번에 비교하고, 선택한 방식의 월별 원금·이자·잔액을 표로 보여줘요.",
  form: `${money("pr", "대출금 (원)", "300,000,000")}
<div class="chips"><button class="chip" data-t="pr" data-v="100000000">1억</button><button class="chip" data-t="pr" data-v="200000000">2억</button><button class="chip" data-t="pr" data-v="300000000">3억</button><button class="chip" data-t="pr" data-v="500000000">5억</button></div>
<div class="two"><div><label for="rt">연 금리 (%)</label><div class="field"><input id="rt" type="number" inputmode="decimal" step="0.01" min="0" max="30" value="4.5"><span>%</span></div></div><div><label for="yr">기간 (개월)</label><div class="field"><input id="yr" type="number" inputmode="numeric" min="1" max="600" value="360"><span>개월</span></div></div></div>
<div class="chips"><button class="chip" data-mo="12">1년</button><button class="chip" data-mo="60">5년</button><button class="chip" data-mo="120">10년</button><button class="chip" data-mo="240">20년</button><button class="chip" data-mo="360">30년</button></div>
<label for="mt">상환 방식</label><select id="mt"><option value="pmt">원리금균등분할상환</option><option value="principal">원금균등분할상환</option><option value="bullet">만기일시상환 (이자만 내다 만기에 원금)</option></select>`,
  basis: "산식 고정(금리·기간은 입력값) · 2026-10-07 확인", srcShort: "금융감독원 금융소비자 정보포털 파인(대출 상환방식 안내), 소비자 대출 약관 일반 산식",
  warn: "거치기간·변동금리 재산정·중도상환수수료·인지세는 반영하지 않아요 · 은행별 원 단위 절사 방식에 따라 몇 원 차이가 날 수 있어요",
  formula: `<ul><li><b>월 이자</b> = 대출 잔액 &times; 연 금리 &divide; 12 (원 미만 절사, 월 단위 근사)</li><li><b>원리금균등</b>: 월 납입액 = 원금 &times; r &divide; (1 &minus; (1 + r)<sup>&minus;n</sup>), r = 연금리/12, n = 개월 수. 매달 같은 금액, 초반엔 이자 비중이 커요</li><li><b>원금균등</b>: 매달 갚는 원금 = 대출금 &divide; n 고정, 이자는 잔액에 따라 줄어서 첫 달 납입액이 가장 커요</li><li><b>만기일시</b>: 매달 이자만 내고 마지막 달에 원금 전액 상환</li><li>마지막 회차에서 남은 잔액을 정리해 잔액이 정확히 0원이 돼요</li></ul>`,
  explainTitle: "원리금균등·원금균등·만기일시, 뭐가 다르죠",
  explain: `<p>같은 금리·기간이라도 갚는 방식에 따라 총이자가 달라져요. <b>원금균등</b>은 처음부터 원금을 빨리 줄여서 총이자가 가장 적지만 첫 달 부담이 가장 커요. <b>원리금균등</b>은 매달 납입액이 같아서 가계 계획을 세우기 쉽지만 총이자는 원금균등보다 많아요. <b>만기일시</b>는 매달 이자만 내서 월 부담이 가장 작지만 원금은 그대로라 총이자가 가장 많고 만기에 큰돈이 필요해요.</p>
<p>예를 들어 1억 원을 연 5%, 12개월 원리금균등으로 빌리면 월 8,560,748원씩 내고 총이자는 약 273만 원이에요. 3억 원을 연 4.5%, 30년으로 빌리면 원리금균등 월 약 152만 원, 총이자 약 2.47억 원이고 원금균등은 첫 달 약 195만 원에서 시작해 점점 줄어 총이자가 약 2.03억 원이에요. 위 입력값으로 바로 확인할 수 있어요.</p>
<p>이 계산기는 금리가 고정이라고 가정해요. 변동금리 대출은 금리가 바뀔 때마다 남은 원금과 기간으로 다시 계산돼요. 거치기간이 있으면 그동안은 이자만 내고 이후 상환기간이 짧아져 월 납입액이 늘어요. 중도상환수수료, 인지세, 보증료는 별도예요. 대출 가능 금액이나 DSR 한도는 계산하지 않고, 특정 대출상품을 권유하지 않아요. 월급 중 얼마가 남는지는 <a href="../take-home/">실수령액 계산기</a>와 같이 보세요.</p>`,
  faq: [
    ["원리금균등과 원금균등 중 어느 쪽이 이자가 적나요?", "같은 조건이면 원금균등의 총이자가 더 적어요. 원금을 처음부터 일정하게 갚아 잔액이 빨리 줄기 때문이에요. 대신 초기 월 납입액이 더 커요."],
    ["원리금균등 월 납입액은 어떻게 계산하나요?", "월 납입액 = 원금 x r / (1 - (1+r)^-n)이에요. r은 연금리를 12로 나눈 월 이율, n은 개월 수예요. 1억 원, 연 5%, 12개월이면 8,560,748원이에요."],
    ["만기일시상환은 언제 유리한가요?", "월 현금흐름 부담을 낮추고 싶을 때 쓰지만 총이자가 가장 많고 만기에 원금 전체를 갚거나 재약정해야 해요. 유불리는 개인 상황과 상품 조건에 따라 달라요."],
    ["이자는 일할 계산하지 않나요?", "실제 대출은 대출일부터 납입일까지 일수로 이자를 계산하는 경우가 많아요. 이 계산기는 월 이율(연금리/12)로 단순화해서 은행 안내와 소액 차이가 날 수 있어요."],
    ["변동금리도 계산되나요?", "고정금리 기준이에요. 변동금리는 금리가 바뀐 시점의 잔액·잔여기간으로 다시 계산하면 돼요. 이 페이지에서 금리를 바꿔 다시 넣어 보세요."],
    ["거치기간이 있으면 어떻게 되나요?", "거치기간은 반영하지 않아요. 거치 중에는 이자만 내고, 이후 남은 기간으로 원금을 갚기 때문에 월 납입액이 늘어나요."],
    ["총이자를 줄이는 방법이 있나요?", "상환기간을 줄이거나 원금을 중도 상환하면 줄어요. 중도상환수수료 여부는 약관을 확인하세요. 이 페이지는 특정 금융상품을 권유하지 않아요."]
  ],
  sources: [["금융감독원 파인(금융소비자 정보포털) 대출 상환방식 안내", "https://fine.fss.or.kr", "열람 2026-10-07"], ["은행연합회 소비자포털 대출 상환방식·중도상환수수료 안내", "https://www.kfb.or.kr", "열람 2026-10-07"], ["민법 제379조 (법정이율 연 5%)", "https://www.law.go.kr/법령/민법", "시행 현행"], ["이자제한법 및 최고이자율 (연 20%)", "https://www.law.go.kr/법령/이자제한법", "시행 현행"]],
  js: `${UI_COMMON}
${FMT}
document.querySelectorAll("[data-mo]").forEach(b=>b.addEventListener("click",()=>{$("yr").value=b.dataset.mo;calc()}));
function calc(){const P=num("pr"),n=Math.round(num("yr")),rate=parseFloat($("rt").value)||0;if(!P||n<1||n>600){$("res").hidden=true;return}
const o={principal:P,rate:rate/100,months:n},m=$("mt").value,all={pmt:CalcCore.loan({...o,method:"pmt"}),principal:CalcCore.loan({...o,method:"principal"}),bullet:CalcCore.loan({...o,method:"bullet"})};
const r=all[m],nm={pmt:"원리금균등",principal:"원금균등",bullet:"만기일시"};
const rows=r.rows.map(x=>'<tr><td>'+x.n+'</td><td>'+W(x.pay)+'</td><td>'+W(x.principal)+'</td><td>'+W(x.interest)+'</td><td>'+W(x.balance)+'</td></tr>').join("");
const cmp=["pmt","principal","bullet"].map(k=>'<tr><td>'+nm[k]+(k===m?' *':'')+'</td><td>'+W(all[k].first)+'</td><td>'+W(all[k].totalInterest)+'</td></tr>').join("");
show('<div class="big">'+W(r.first)+'<small>원 / 첫 달</small></div><div class="spicy">'+nm[m]+' · 총이자 '+W(r.totalInterest)+'원'+(m==="pmt"?'':' · 마지막 달 '+W(r.last)+'원')+'</div><div class="tw"><table class="t"><caption>방식별 비교</caption><thead><tr><th>방식</th><th>첫 달 납입</th><th>총이자</th></tr></thead><tbody>'+cmp+'</tbody></table></div><h3>월별 상환 스케줄</h3><div class="tw" style="max-height:420px;overflow:auto"><table class="t"><thead><tr><th>회차</th><th>납입액</th><th>원금</th><th>이자</th><th>잔액</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="note">고정금리·월 이율(연/12) 단순화 · 거치기간·수수료 제외 · 참고용. 금리를 바꿔 변동금리 시나리오도 비교해 보세요.</p>')}
bind(["pr","rt","yr","mt"],calc);`
});

/* ============ 3. 취득세 ============ */
const acq = page({
  slug: "acquisition-tax", name: "주택 취득세 계산기 2026", title: "주택 취득세 계산기 2026 (가격·주택 수·조정대상지역, 교육세·농특세 포함) | 돈의 스케일",
  desc: "주택 매매가격, 취득 후 보유 주택 수, 조정대상지역 여부, 전용면적을 넣으면 취득세·지방교육세·농어촌특별세를 합산해 계산해요. 6억 이하 1%, 9억 초과 3%, 다주택 8%·12% 중과 반영.",
  h1: "<em>주택 취득세</em> 계산기<br>2026 세율·중과", sub: "집값, 몇 번째 집인지, 지역 유형, 평형만 고르면 취득세와 부가세금(교육세·농특세)까지 합산해 줘요.",
  form: `${money("pc", "주택 취득가격 (매매가, 원)", "700,000,000")}
<div class="chips"><button class="chip" data-t="pc" data-v="500000000">5억</button><button class="chip" data-t="pc" data-v="700000000">7억</button><button class="chip" data-t="pc" data-v="900000000">9억</button><button class="chip" data-t="pc" data-v="1200000000">12억</button><button class="chip" data-t="pc" data-v="2000000000">20억</button></div>
<label for="hs">취득 후 보유하게 되는 주택 수 (이번에 사는 집 포함)</label><select id="hs"><option value="1">1주택 (무주택 또는 기존 집 처분)</option><option value="2">2주택</option><option value="3">3주택</option><option value="4">4주택 이상</option></select>
<label for="rg">취득 주택 소재지</label><select id="rg"><option value="adj">조정대상지역</option><option value="non">조정대상지역 아님</option></select>
<label for="ar">전용면적</label><select id="ar"><option value="0">85㎡ 이하 (농어촌특별세 없음)</option><option value="1">85㎡ 초과 (농어촌특별세 있음)</option></select>
<label class="chk"><input type="checkbox" id="t2"> 일시적 2주택 (새 집 취득 후 정해진 기간 안에 종전 주택 처분, 중과 제외)</label>`,
  basis: "지방세법 시행 2026-01-01 (법률 제21308호, 2025-12-31 개정) 세율", srcShort: "지방세법 제11조·제13조의2·제151조, 지방세법 시행령 제28조의2·제28조의5",
  warn: "생애최초·신혼 감면, 비수도권 저가주택, 시가표준액 1억 원 이하 등 중과 제외·감면, 증여·상속·법인 취득은 계산하지 않아요 · 조정대상지역 지정 여부는 국토교통부 고시로 직접 확인하세요 · 참고용",
  formula: `<ul><li><b>1주택 유상취득 취득세율</b>: 6억 원 이하 1%, 6억 초과~9억 이하 <b>(취득가액 &times; 2/3억 &minus; 3) %</b> (소수 다섯째 자리 반올림), 9억 초과 3%</li><li><b>다주택 중과</b>: 조정대상지역 2주택 8%, 3주택 이상 12% / 조정대상지역 아님 3주택 8%, 4주택 이상 12% (일시적 2주택은 제외)</li><li><b>지방교육세</b>: 일반세율은 취득세의 10%(=가격 &times; 세율의 절반 &times; 20%), 중과(8%·12%)는 가격의 0.4%</li><li><b>농어촌특별세</b>: 전용 85㎡ 이하 면제, 초과 시 일반 0.2%, 8% 중과 0.6%, 12% 중과 1.0%</li><li>세액은 10원 미만 절사</li></ul>
<div class="tw"><table class="t ex"><caption>85㎡ 초과 기준 총 부담률</caption><thead><tr><th>구분</th><th>취득세</th><th>교육세</th><th>농특세</th><th>합계</th></tr></thead><tbody><tr><td>6억 이하</td><td>1%</td><td>0.1%</td><td>0.2%</td><td>1.3%</td></tr><tr><td>9억 초과</td><td>3%</td><td>0.3%</td><td>0.2%</td><td>3.5%</td></tr><tr><td>8% 중과</td><td>8%</td><td>0.4%</td><td>0.6%</td><td>9.0%</td></tr><tr><td>12% 중과</td><td>12%</td><td>0.4%</td><td>1.0%</td><td>13.4%</td></tr></tbody></table></div>`,
  explainTitle: "주택 취득세, 얼마나 나오고 언제 중과되나요",
  explain: `<p>집을 살 때 내는 취득세는 가격과 <b>몇 번째 집이냐</b>에 따라 정해져요. 1주택자(또는 무주택자)가 6억 원 이하 집을 사면 1%, 9억 원을 넘으면 3%이고, 6억~9억 원 사이는 가격에 따라 1~3%로 연속해서 올라가요. 예를 들어 7억 원이면 약 1.6667%, 7억 5천만 원이면 정확히 2%예요. 여기에 지방교육세가 붙고, 전용 85㎡를 넘으면 농어촌특별세가 더해져요.</p>
<p>다주택은 지역에 따라 중과돼요. 조정대상지역에서 집을 사서 <b>2주택</b>이 되면 8%, <b>3주택 이상</b>이 되면 12%예요. 조정대상지역이 아니면 3주택이 8%, 4주택 이상이 12%이고 2주택까지는 일반세율이에요. 새 집을 사고 정해진 기간 안에 종전 집을 파는 <b>일시적 2주택</b>은 중과에서 빠져요. 이 계산기의 주택 수는 &ldquo;이번에 취득한 뒤&rdquo; 기준이에요. 이미 1채가 있고 한 채를 더 산다면 &ldquo;2주택&rdquo;을 고르세요.</p>
<p>이 계산기는 매매 같은 유상취득만 다뤄요. 증여로 받으면 세율이 달라지고(조정대상지역 3억 원 이상 12% 등), 생애최초 주택 감면·신혼부부·다자녀 감면, 공시가격이 낮은 비수도권 주택의 중과 제외, 분양권·입주권 주택 수 산정은 반영하지 않았어요. 조정대상지역 지정은 수시로 바뀌어서 이 페이지에 목록을 싣지 않았고, 국토교통부 고시 확인이 필요해요. 취득 후 60일 안에 신고·납부해야 해요. 대출 이자는 <a href="../loan-interest/">대출 이자 계산기</a>로 함께 보세요.</p>`,
  faq: [
    ["주택 취득세율은 몇 %인가요?", "1주택 유상취득은 6억 원 이하 1%, 6억 원 초과 9억 원 이하 1~3%(가격에 따라 연속), 9억 원 초과 3%예요. 여기에 지방교육세와 85㎡ 초과 시 농어촌특별세가 더해져요."],
    ["6억~9억 원 구간 세율은 어떻게 계산하나요?", "(취득가액 x 2/3억 - 3)%예요. 소수점 다섯째 자리에서 반올림해 넷째 자리까지 계산해요. 예를 들어 7억 원은 1.6667%, 7억 5천만 원은 2%예요."],
    ["다주택 중과세율은 얼마인가요?", "조정대상지역은 2주택 8%, 3주택 이상 12%, 조정대상지역이 아니면 3주택 8%, 4주택 이상 12%예요. 일시적 2주택 등 예외가 있어요."],
    ["일시적 2주택은 무엇인가요?", "이사 등을 위해 종전 주택을 보유한 채 새 주택을 취득한 뒤 정해진 기간(시행령 제28조의5) 안에 종전 주택을 처분하는 경우로, 중과하지 않고 1주택 세율을 적용해요. 요건과 기간은 시행령에서 직접 확인하세요."],
    ["지방교육세와 농어촌특별세는 얼마인가요?", "지방교육세는 일반세율에서 취득세의 10%, 중과 시 가격의 0.4%예요. 농어촌특별세는 전용 85㎡ 이하 면제, 초과 시 0.2%(8% 중과 0.6%, 12% 중과 1.0%)예요."],
    ["생애최초 감면은 반영되나요?", "아니요. 감면은 소득·가격 요건과 한도가 있고 연도별 연장 여부가 달라서 이 계산기에서는 제외했어요. 위택스·지자체 안내를 확인하세요."],
    ["조정대상지역은 어디인가요?", "국토교통부가 고시하고 수시로 바뀌어서 이 페이지에 목록을 싣지 않아요. 취득 시점의 지정 여부를 국토교통부 고시나 지자체에서 확인하세요."],
    ["언제까지 신고·납부하나요?", "유상취득은 취득일(잔금일 또는 등기일 중 빠른 날)부터 60일 안에 신고·납부해야 해요. 이 계산기는 세액 계산만 해요."]
  ],
  sources: [["지방세법 제11조(부동산 취득의 세율)·제13조의2(법인 등 주택 취득 중과)", "https://www.law.go.kr/법령/지방세법", "시행 2026-01-01"], ["지방세법 시행령 제28조의2(주택 유상거래 중과 예외)·제28조의5(일시적 2주택)", "https://www.law.go.kr/법령/지방세법시행령", "열람 2026-10-07"], ["찾기쉬운 생활법령정보 부동산 매매 취득세", "https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?popMenu=ov&csmSeq=649&ccfNo=4&cciNo=3&cnpClsNo=2", "열람 2026-10-07"], ["위택스(지방세 신고·납부)", "https://www.wetax.go.kr", "열람 2026-10-07"]],
  js: `${UI_COMMON}
${FMT}
function calc(){const p=num("pc");if(!p){$("res").hidden=true;return}
const h=+$("hs").value,t2=$("t2").checked&&h===2;
const r=CalcCore.acquisition({price:p,houses:h,region:$("rg").value,area85:$("ar").value==="1",temp2:t2});
const pct=x=>(Math.round(x*1e4)/1e4)+"%";
show('<div class="big">'+W(r.total)+'<small>원</small></div><div class="spicy">총 부담률 '+pct(r.totalPct)+(r.heavy?' · 다주택 중과 '+r.heavy+'% 적용':' · 일반세율 '+pct(r.basePct))+'</div><ul class="cmp"><li>취득세 <b>'+W(r.tax)+'원</b> ('+pct(r.pct)+')</li><li>지방교육세 <b>'+W(r.edu)+'원</b> ('+pct(r.edPct)+')</li><li>농어촌특별세 <b>'+W(r.sp)+'원</b> ('+(r.spPct?pct(r.spPct):'85㎡ 이하 면제')+')</li></ul><p class="note">감면(생애최초 등)·중과 예외·증여/상속/법인은 제외 · 조정대상지역 지정은 국토교통부 고시로 확인 · 참고용. 이사 비용과 대출은 <a href="../loan-interest/">대출 이자 계산기</a>로.</p>')}
$("hs").addEventListener("change",()=>{$("t2").disabled=$("hs").value!=="2"});$("t2").disabled=true;
bind(["pc","hs","rg","ar","t2"],calc);`
});

/* ============ 4. 전월세 전환율 ============ */
const rent = page({
  slug: "rent-convert", name: "전월세 전환율 계산기 2026", title: "전월세 전환율 계산기 2026 (법정 상한 5.0%, 기준금리 3.00%+2%p) | 돈의 스케일",
  desc: "한국은행 기준금리 3.00%(2026-08-27 기준)에 2%p를 더한 법정 전환율 상한 5.0%로 전세를 월세로, 월세를 전세로 환산하고 내 계약의 전환율이 상한을 넘는지 확인해요.",
  h1: "<em>전월세 전환율</em> 계산기<br>법정 상한 5.0%", sub: "보증금과 월세를 서로 바꿀 때 법이 정한 한도(기준금리 + 2%p)를 기준으로 환산하고, 내 계약이 한도를 넘는지 확인해요.",
  form: `<label for="md">계산 종류</label><select id="md"><option value="a">보증금 일부를 월세로 (전세 -> 반전세·월세)</option><option value="b">월세를 보증금으로 (월세 -> 전세 환산)</option><option value="c">내 계약의 전환율이 한도 이내인지 확인</option></select>
<div id="fa">${money("d0", "현재 보증금 (원)", "300,000,000")}${money("d1", "바꾼 뒤 보증금 (원)", "100,000,000")}</div>
<div id="fb" hidden>${money("mb", "월세 (원)", "1,000,000")}</div>
<div id="fc" hidden>${money("mc", "월세 (원)", "1,000,000")}${money("dc", "월세로 바꾼 보증금 차액 (전세보증금 - 계약 보증금, 원)", "150,000,000")}</div>
<div class="two"><div><label for="bs">한국은행 기준금리 (%)</label><div class="field"><input id="bs" type="number" inputmode="decimal" step="0.25" min="0" max="20" value="3"><span>%</span></div></div><div><label for="rr">적용 전환율 (%)</label><div class="field"><input id="rr" type="number" inputmode="decimal" step="0.1" min="0.1" max="30" value="5"><span>%</span></div></div></div>
<div class="chips"><button class="chip" id="usecap">법정 상한 사용</button></div>`,
  basis: "한국은행 기준금리 3.00% (2026-08-27 결정, 2026-10-07 열람) · 다음 금융통화위원회 2026-10-22 예정", srcShort: "주택임대차보호법 제7조의2, 시행령 제9조, 한국은행 기준금리 추이",
  warn: "기준금리가 바뀌면 상한도 바뀌어요(이 페이지의 3.00%는 열람일 기준) · 월세 증액 한도(5%)와는 별개 · 상가건물 임대차는 기준이 달라요 · 참고용",
  formula: `<ul><li><b>법정 전환율 상한</b> = <b>min( 연 10%, 한국은행 기준금리 + 2%p )</b> (주택임대차보호법 제7조의2, 시행령 제9조 제1항·제2항). 현재 3.00% + 2%p = <b>5.0%</b></li><li><b>월세 환산액</b> = (보증금 감소액) &times; 전환율 &divide; 12</li><li><b>보증금 환산액</b> = 월세 &times; 12 &divide; 전환율</li><li><b>실제 전환율</b> = 월세 &times; 12 &divide; 월세로 돌린 보증금 차액</li></ul>`,
  explainTitle: "전월세 전환율, 상한이 5%라는데 어떻게 계산하나요",
  explain: `<p>전세 보증금의 일부를 월세로 바꾸는 &ldquo;반전세&rdquo; 계약에서 월세가 너무 높지 않도록 법이 <b>전환율 상한</b>을 정해요. 주택임대차보호법 제7조의2에 따라 연 10%와 &ldquo;한국은행 기준금리 + 2%p&rdquo; 중 <b>낮은 비율</b>을 넘으면 안 돼요. 2026-08-27에 기준금리가 3.00%로 결정되어 현재 상한은 3.00 + 2.00 = <b>5.0%</b>예요(한국은행 기준금리 추이 열람, 다음 금융통화위원회는 2026-10-22 예정이라 바뀔 수 있어요).</p>
<p>예를 들어 전세 3억 원 집을 보증금 1억 원으로 바꿔 2억 원을 월세로 돌리면 한도는 2억 원 &times; 5.0% &divide; 12 = <b>월 833,333원</b>이에요. 반대로 월 100만 원을 보증금으로 환산하면 100만 원 &times; 12 &divide; 5.0% = 2.4억 원이에요. 이미 계약한 월세 100만 원이 보증금 1.5억 원을 돌린 것이라면 실제 전환율은 8.0%로 상한 5.0%를 넘으므로 조정 가능한지 확인해야 해요.</p>
<p>이 상한은 보증금을 월세로 바꾸는 &ldquo;전환&rdquo;에 적용돼요. 이미 월세 계약인 집의 월세 증액(연 5% 이내)이나 신규 월세 시세 자체를 제한하는 규정은 아니에요. 이 계산기는 기준금리를 직접 수정할 수 있어서 금리가 바뀌어도 새 상한을 확인할 수 있어요. 집을 살 때 드는 세금은 <a href="../acquisition-tax/">주택 취득세 계산기</a>도 참고하세요.</p>`,
  faq: [
    ["월세 전환율 상한은 얼마인가요?", "연 10%와 한국은행 기준금리 + 2%p 중 낮은 비율이에요. 기준금리가 3.00%(2026-08-27 결정)이면 5.0%예요."],
    ["기준금리가 바뀌면 이미 한 계약도 바뀌나요?", "상한은 계약 당시 기준이에요. 이후 금리 변동이 기존 계약의 월세를 자동으로 바꾸지는 않아요. 신규 계약·갱신 시점에 맞춰 확인하세요."],
    ["전세를 월세로 바꾸면 월세는 얼마가 되나요?", "보증금 감소액 x 전환율 / 12예요. 2억 원을 5.0%로 돌리면 월 약 83만 3천 원이에요."],
    ["월세를 전세로 환산하려면요?", "월세 x 12 / 전환율이에요. 월 100만 원을 5.0%로 환산하면 2.4억 원이에요."],
    ["상한을 넘는 월세를 냈다면요?", "상한을 넘는 부분은 법이 허용하지 않는 금액이라 반환을 다툴 수 있어요. 구체적인 청구 방법은 대한법률구조공단 등 전문 기관에서 상담하세요."],
    ["상가는 전환율이 같은가요?", "아니요. 상가건물임대차보호법은 연 12%와 기준금리 x 4.5배 중 낮은 비율로 따로 정해요. 이 계산기는 주택 기준이에요."],
    ["한국은행 기준금리는 어디서 확인하나요?", "한국은행 홈페이지 기준금리 추이에서 확인해요. 이 페이지는 2026-10-07에 열람한 3.00%(2026-08-27 결정)를 기본값으로 쓰고, 입력칸에서 바꿀 수 있어요."]
  ],
  sources: [["주택임대차보호법 제7조의2 (월차임 전환 시 산정률의 제한)", "https://www.law.go.kr/법령/주택임대차보호법", "열람 2026-10-07"], ["주택임대차보호법 시행령 제9조 (월차임 전환 시 산정률: 연 10%, 기준금리 + 연 2%)", "https://www.law.go.kr/법령/주택임대차보호법시행령", "열람 2026-10-07"], ["한국은행 기준금리 추이 (2026-08-27 3.00%, 2026-07-16 2.75%)", "https://www.bok.or.kr/portal/singl/baseRate/list.do?dataSeCd=01&menuNo=200643", "열람 2026-10-07"]],
  js: `${UI_COMMON}
${FMT}
const cap=()=>CalcCore.rentCap((parseFloat($("bs").value)||0)/100)*100;
function modeUI(){const m=$("md").value;$("fa").hidden=m!=="a";$("fb").hidden=m!=="b";$("fc").hidden=m!=="c";calc()}
$("md").addEventListener("change",modeUI);$("usecap").addEventListener("click",()=>{$("rr").value=+cap().toFixed(2);calc()});
$("bs").addEventListener("input",()=>{});
function calc(){const m=$("md").value,c=cap(),rr=parseFloat($("rr").value)||0,rate=rr/100,hd='<div class="spicy">법정 상한 '+c.toFixed(2)+'% (기준금리 '+(parseFloat($("bs").value)||0).toFixed(2)+'% + 2%p, 최대 10%)</div>';
if(m==="a"){const cv=num("d0")-num("d1");if(cv<=0||rate<=0){show('<div class="spicy">현재 보증금보다 바꾼 보증금이 작아야 해요.</div>');return}
show('<div class="big">'+W(CalcCore.rentMonthly(cv,rate))+'<small>원 / 월</small></div>'+hd+'<ul class="cmp"><li>월세로 돌리는 보증금 <b>'+W(cv)+'원</b></li><li>적용 전환율 <b>'+rr.toFixed(2)+'%</b> '+(rr>c+1e-9?'(상한 초과)':'(상한 이내)')+'</li><li>상한 전환율 적용 시 월세 최대 <b>'+W(CalcCore.rentMonthly(cv,c/100))+'원</b></li></ul>')}
else if(m==="b"){const mb=num("mb");if(!mb||rate<=0){$("res").hidden=true;return}
show('<div class="big">'+W(CalcCore.rentDeposit(mb,rate))+'<small>원 (보증금 환산)</small></div>'+hd+'<ul class="cmp"><li>월세 <b>'+W(mb)+'원</b> x 12 &divide; <b>'+rr.toFixed(2)+'%</b></li><li>상한 전환율로 환산하면 <b>'+W(CalcCore.rentDeposit(mb,c/100))+'원</b></li></ul>')}
else{const mc=num("mc"),dc=num("dc");if(!mc||!dc){$("res").hidden=true;return}const im=CalcCore.rentImplied(mc,dc)*100,over=im>c+1e-9;
show('<div class="big">'+im.toFixed(2)+'<small>% 실제 전환율</small></div>'+hd+'<ul class="cmp"><li>월세 <b>'+W(mc)+'원</b> x 12 &divide; 보증금 차액 <b>'+W(dc)+'원</b></li><li>'+(over?'<b>상한을 '+(im-c).toFixed(2)+'%p 초과</b>했어요. 상한 기준 월세는 최대 <b>'+W(CalcCore.rentMonthly(dc,c/100))+'원</b>':'<b>상한 이내</b>예요 (상한 기준 월세 최대 '+W(CalcCore.rentMonthly(dc,c/100))+'원)')+'</li></ul>')}
show_note()}
function show_note(){$("res").insertAdjacentHTML("beforeend",'<p class="note">전월세 전환(보증금을 월세로 바꾸는 경우)에만 적용 · 기준금리는 한국은행 결정치(2026-08-27 3.00%) · 참고용</p>')}
bind(["md","d0","d1","mb","mc","dc","bs","rr"],calc);`
});

/* ============ 5. 건강보험료 ============ */
const hi = page({
  slug: "health-insurance", name: "건강보험료 계산기 2026 (직장가입자)", title: "건강보험료 계산기 2026 (직장가입자 7.19%·장기요양 13.14%) | 돈의 스케일",
  desc: "월 보수를 넣으면 2026년 직장가입자 건강보험료(요율 7.19%, 본인 3.595%)와 장기요양보험료(건보료의 13.14%) 본인부담액을 계산해요. 월 보험료 상한 9,183,480원·하한 반영, 출처 공개.",
  h1: "<em>건강보험료</em> 계산기<br>2026 직장가입자", sub: "월 보수(세전)만 넣으면 건강보험료와 장기요양보험료의 내 부담액, 회사 부담액을 계산해요.",
  form: `${money("sl", "월 보수 (보수월액, 세전, 비과세 제외, 원)", "3,000,000")}
<div class="chips"><button class="chip" data-t="sl" data-v="2500000">250만</button><button class="chip" data-t="sl" data-v="3000000">300만</button><button class="chip" data-t="sl" data-v="4000000">400만</button><button class="chip" data-t="sl" data-v="5000000">500만</button><button class="chip" data-t="sl" data-v="7000000">700만</button></div>`,
  basis: "2026-01-01 시행 요율 (건강 7.19%, 장기요양 13.14%)", srcShort: "보건복지부 보도자료 2025-08-28(건강)·2025-11-04(장기요양), 국민건강보험법 제73조",
  warn: "월 보험료 상한·하한액은 언론 보도(2026-01) 기준이라 공단 고시 원문을 직접 확인하지 못했어요 · 보수 외 소득(소득월액)·연말정산 정산·지역가입자는 제외 · 참고용",
  formula: `<ul><li><b>건강보험료</b> = 보수월액 &times; <b>7.19%</b>, 근로자와 사용자가 <b>각 50%(3.595%)</b> 부담 (10원 미만 절사)</li><li><b>장기요양보험료</b> = 건강보험료 &times; <b>13.14%</b> (소득 대비 0.9448%), 마찬가지로 각 50%</li><li>본인 부담 월 합계 = 건강보험료 본인분 + 장기요양 본인분</li><li>월 보험료 <b>상한 9,183,480원</b>(본인 4,591,740원), <b>하한 20,160원</b> (2026, 건강보험료 기준)</li></ul>
<div class="tw"><table class="t ex"><caption>월 보수별 본인 부담 (건강 + 장기요양)</caption><thead><tr><th>월 보수</th><th>건강보험</th><th>장기요양</th><th>합계</th></tr></thead><tbody>${[2500000, 3000000, 4000000, 5000000, 7000000].map((v) => { const r = health(v); return `<tr><td>${W(v)}원</td><td>${W(r.health)}원</td><td>${W(r.ltc)}원</td><td>${W(r.mine)}원</td></tr>`; }).join("")}</tbody></table></div>`,
  explainTitle: "직장인 건강보험료, 월급의 몇 %를 내나요",
  explain: `<p>2026년 건강보험료율은 <b>7.19%</b>로 2025년 7.09%보다 0.1%p 올랐어요(보건복지부 2025-08-28 발표). 직장가입자는 이 중 절반인 <b>3.595%</b>만 본인이 내고 나머지는 회사가 내요. 여기에 <b>장기요양보험료</b>가 건강보험료의 13.14%(2025년 12.95%)로 추가돼요. 월 보수 300만 원이면 건강보험료 본인분 107,850원, 장기요양 14,170원으로 합계 약 <b>122,020원</b>이고 월급의 약 4.07%예요.</p>
<p>월 보수가 아무리 높아도 상한이 있어요. 2026년 직장가입자 월 건강보험료 상한은 9,183,480원(본인 4,591,740원)으로 알려져 있고 이는 월 보수 약 1억 2,700만 원 이상이에요. 하한은 월 20,160원이에요. 이 상·하한 숫자는 언론 보도(2026-01)를 바탕으로 했고 공단 고시 원문은 직접 확인하지 못했어요. 보수 외 소득(이자·배당·임대 등)이 연 2천만 원을 넘으면 소득월액 보험료가 추가되는데 계산하지 않아요.</p>
<p>건강보험료는 &ldquo;보수월액&rdquo; 기준이에요. 국민연금의 기준소득월액 상한과 달리 월 보수에서 비과세(식대 20만 원 등)만 빼고 대부분 반영해요. 매년 4월에는 전년도 보수가 확정되어 정산되니 4월 급여에서 추가·환급이 생길 수 있어요. 4대보험과 소득세를 함께 뺀 최종 실수령액은 <a href="../take-home/">월급 실수령액 계산기</a>를, 실직 시 받는 돈은 <a href="../unemployment/">실업급여 계산기</a>를 보세요.</p>`,
  faq: [
    ["2026년 건강보험료율은 몇 %인가요?", "7.19%예요(2025년 7.09%). 직장가입자는 근로자와 사업주가 절반씩 내서 근로자 부담은 3.595%예요. 보건복지부가 2025-08-28에 결정했어요."],
    ["장기요양보험료는 어떻게 계산하나요?", "건강보험료에 13.14%를 곱해요(2026년, 소득 대비 0.9448%). 근로자와 사업주가 각 50%예요. 보건복지부가 2025-11-04에 공표했어요."],
    ["월급 300만 원이면 건강보험료는 얼마인가요?", "건강보험료 본인분 107,850원, 장기요양 14,170원으로 합계 약 122,020원이에요. 회사도 같은 금액을 내요."],
    ["건강보험료 상한과 하한은 얼마인가요?", "2026년 직장가입자 월 보험료 상한은 9,183,480원(본인 4,591,740원), 하한은 20,160원으로 보도됐어요. 공단 고시 원문은 이 페이지에서 직접 확인하지 못했어요."],
    ["건강보험료에 상여금도 포함되나요?", "상여금 등 보수에 해당하면 보수 총액에 포함되어 매년 4월 정산 때 반영돼요. 이 계산기는 월 보수 하나만 받아서 상여는 월 평균으로 넣어 보세요."],
    ["연말정산처럼 환급받나요?", "매년 4월에 전년도 보수총액으로 보험료를 정산해 추가로 내거나 돌려받아요. 이 계산기는 정산은 반영하지 않아요."],
    ["회사가 부담하는 금액은요?", "건강보험료와 장기요양보험료 모두 근로자와 같은 금액을 사용자가 내요. 결과에 회사 부담도 함께 표시해요."],
    ["지역가입자도 계산되나요?", "아니요. 지역가입자는 소득·재산·자동차 점수로 계산하며 이 계산기는 직장가입자만 다뤄요."]
  ],
  sources: [["보건복지부 보도자료 2026년 건강보험료율 7.19%로 결정 (2025-08-28)", "https://www.mohw.go.kr/board.es?act=view&bid=0027&list_no=1487279&mid=a10503000000", "2025-08-28"], ["보건복지부 보도자료 2026년도 장기요양보험료율 0.9448%, 건강보험료 대비 13.14% (2025-11-04)", "https://www.mohw.go.kr/board.es?act=view&bid=0027&list_no=1487817&mid=a10503000000", "2025-11-04"], ["국민건강보험법 제69조·제73조 (보험료·보험료율)", "https://www.law.go.kr/법령/국민건강보험법", "열람 2026-10-07"], ["SBS 뉴스 2026년 초고소득 직장인 건보료 상한액 월 459만 원 (상한·하한 근거, 공단 원문 미확인)", "https://news.sbs.co.kr/amp/news.amp?news_id=N1008391848", "2026-01-05"], ["국민건강보험공단 보험료 안내", "https://www.nhis.or.kr", "열람 2026-10-07"]],
  js: `${UI_COMMON}
${FMT}
function calc(){const s=num("sl");if(!s){$("res").hidden=true;return}
const r=CalcCore.health(s);
show('<div class="big">'+W(r.mine)+'<small>원 / 월 (본인)</small></div><div class="spicy">월 보수의 '+(r.mine/s*100).toFixed(2)+'% · 회사도 '+W(r.boss)+'원</div><ul class="cmp"><li>건강보험료 전체 <b>'+W(r.total)+'원</b> (7.19%) &rarr; 본인 <b>'+W(r.health)+'원</b></li><li>장기요양 전체 <b>'+W(r.ltcTotal)+'원</b> (건보료 x 13.14%) &rarr; 본인 <b>'+W(r.ltc)+'원</b></li><li>본인 + 회사 합계 <b>'+W(r.all)+'원</b>'+(r.capped?' · 상한 적용':'')+(r.floored?' · 하한 적용':'')+'</li></ul><p class="note">보수 외 소득월액·4월 정산·지역가입자 제외 · 상·하한은 언론 보도 기준 · 참고용. 소득세·연금까지 뺀 금액은 <a href="../take-home/">실수령액 계산기</a>.</p>')}
bind(["sl"],calc);`
});


const pages = {"inheritance-tax": inh, "loan-interest": loan, "acquisition-tax": acq, "rent-convert": rent, "health-insurance": hi};
for (const [d, h] of Object.entries(pages)) { fs.mkdirSync(path.join(root, d), {recursive: true}); fs.writeFileSync(path.join(root, d, "index.html"), h); }

/* sitemap */
const smf = path.join(root, "sitemap.xml"); let sm = fs.readFileSync(smf, "utf8");
for (const d of Object.keys(pages)) if (!sm.includes(`/${d}/`)) sm = sm.replace("</urlset>", `<url><loc>${BASE}/${d}/</loc><lastmod>${TODAY}</lastmod></url>\n</urlset>`);
fs.writeFileSync(smf, sm);

/* 홈 카드 + 기존 계산기 페이지 상호 링크 */
const hf = path.join(root, "index.html"); let h = fs.readFileSync(hf, "utf8");
if (!h.includes('href="inheritance-tax/"')) {
  const cards = `<a class="card" href="inheritance-tax/"><span class="tag">신규</span><h2>상속세 계산기 (2026)</h2><p>일괄공제 5억·배우자공제, 세액 단계별 계산.</p></a>
<a class="card" href="loan-interest/"><span class="tag">신규</span><h2>대출 이자 계산기</h2><p>원리금균등·원금균등·만기일시, 월별 상환표.</p></a>
<a class="card" href="acquisition-tax/"><span class="tag">신규</span><h2>주택 취득세 계산기 (2026)</h2><p>가격·주택 수·지역별 세율과 중과, 교육세·농특세.</p></a>
<a class="card" href="rent-convert/"><span class="tag">신규</span><h2>전월세 전환율 계산기</h2><p>법정 상한 5.0%(기준금리 3.00%+2%p)로 환산.</p></a>
<a class="card" href="health-insurance/"><span class="tag">신규</span><h2>건강보험료 계산기 (2026)</h2><p>직장가입자 7.19%·장기요양 13.14% 본인 부담.</p></a>
`;
  h = h.replace('<a class="card" href="civil-pay/">', cards + '<a class="card" href="civil-pay/">');
  fs.writeFileSync(hf, h);
}
for (const d of ["unemployment", "severance", "lotto-tax", "take-home"]) {
  const f = path.join(root, d, "index.html"); let t = fs.readFileSync(f, "utf8");
  if (t.includes('href="../inheritance-tax/"')) continue;
  const add = Object.keys(pages).map((k) => `<li><a href="../${k}/">${LINKS[k][0]}</a></li>`).join("");
  t = t.replace(/(<h2>다른 계산기<\/h2><ul class="srcs">[\s\S]*?)(<\/ul>)/, (m, a, b) => a + add + b);
  fs.writeFileSync(f, t);
}
console.log("ok");
