// 정적 페이지 생성기: node scripts/build_pages.mjs  (계산기 해설/FAQ/소개/문의/방침/신규 페이지를 만들고 기존 페이지에 주입)
import fs from "node:fs"; import path from "node:path"; import {createRequire} from "node:module";
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SITE = fs.readFileSync(path.join(root, ".site_url"), "utf8").trim(); const BASE = "https://" + SITE;
const EMAIL = "scienceydsus+github-moneyscale@gmail.com";
const TODAY = "2026-10-05";
const {calc} = require(path.join(root, "assets/takehome-core.js"));
const J = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const sal = J("data/salary-percentile.json"), apt = J("data/apartment.json"), tax = J("data/simplified-tax-2026.json"), civ = J("data/civil-pay.json");
const nf = (n, d = 0) => Number(n).toLocaleString("ko-KR", {maximumFractionDigits: d, minimumFractionDigits: d});
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* ---------- 공통 조각 ---------- */
const pre = (depth) => depth ? "../".repeat(depth) : "";
const FOOT = (d) => `<footer><nav aria-label="사이트 정보"><a href="${pre(d)}">계산기 목록</a><a href="${pre(d)}about/">소개</a><a href="${pre(d)}contact/">문의</a><a href="${pre(d)}privacy/">개인정보처리방침</a><a href="https://www.youtube.com/@돈의스케일" rel="noopener">YouTube</a><a href="https://www.instagram.com/money.scale.kr/" rel="noopener">Instagram</a></nav>
<p>참고용 정보예요. 세법·보험요율·통계는 바뀔 수 있고, 투자·대출·보험 등 금융상품을 권유하지 않아요. 중요한 결정 전에는 국세청·공단·전문가에게 확인하세요.</p>
<p>&copy; 2026 돈의 스케일 편집팀 · <a href="mailto:${EMAIL}">${EMAIL}</a></p></footer>`;
const HEAD_EXTRA = `<!-- 사이트 소유확인(발급 후 주석 해제하고 content 채우기)
<meta name="google-site-verification" content="GOOGLE_VERIFICATION_CODE">
<meta name="naver-site-verification" content="NAVER_VERIFICATION_CODE">
-->
<!-- ADSENSE(승인 후 주석 해제): <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script> -->`;
function jsonld(o) { return `<script type="application/ld+json">${JSON.stringify(o)}</script>`; }
const crumbs = (items) => jsonld({"@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([n, u], i) => ({"@type": "ListItem", position: i + 1, name: n, item: BASE + u}))});
const faqLd = (faq) => jsonld({"@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({"@type": "Question", name: q, acceptedAnswer: {"@type": "Answer", text: a.replace(/<[^>]+>/g, "")}}))});
const faqHtml = (faq) => `<section class="doc"><h2>자주 묻는 질문</h2>${faq.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join("")}</section>`;
const srcHtml = (list, asof) => `<section class="doc"><h2>출처와 기준</h2><ul class="srcs">${list.map(([n, u, y]) => `<li>${u ? `<a href="${u}" rel="noopener nofollow">${n}</a>` : n} <span>(${y})</span></li>`).join("")}</ul><p class="note">숫자는 위 공개 자료를 바탕으로 편집팀이 계산했어요. 최종 업데이트 ${asof}.</p></section>`;
const DISC = (extra = "") => `<div class="disc" role="note"><b>꼭 읽어주세요</b> 이 페이지의 결과는 <b>참고용 추정치</b>예요. 세법·4대보험 요율·통계 기준은 바뀔 수 있고 개인 상황(부양가족, 공제, 상여, 소득 종류 등)에 따라 실제와 달라요. ${extra}특정 금융상품·투자에 대한 권유나 세무·법률 자문이 아니에요.</div>`;
const table = (head, rows, cap) => `<div class="tw"><table class="t ex">${cap ? `<caption>${cap}</caption>` : ""}<thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

function page({p, depth, title, desc, body, ld = [], og = "assets/og-home.png", scripts = "", type = "website"}) {
  const url = BASE + "/" + p;
  return `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0b0b0f">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="돈의 스케일">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}/${og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${pre(depth)}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Black+Han+Sans&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${pre(depth)}assets/style.css">
${HEAD_EXTRA}
<!-- ANALYTICS: 아직 없음. 도입하면 개인정보처리방침(/privacy/)도 함께 갱신 -->
${ld.join("\n")}
</head><body><div class="wrap">
<div class="top"><a class="brand" href="${pre(depth)}">돈의 스케일<i>.</i></a><a href="${pre(depth)}" style="font-size:13px">계산기 목록</a></div>
${body}
${scripts}
${FOOT(depth)}
</div>
</body></html>
`;
}
const write = (rel, s) => { fs.mkdirSync(path.dirname(path.join(root, rel)), {recursive: true}); fs.writeFileSync(path.join(root, rel), s); };

/* 결과 영역 공통 마크업 */
const RESULT = (extra = "") => `<section class="res" id="res" hidden aria-live="polite">
 <div class="big" id="big"></div><div class="spicy" id="spicy"></div>
 <div class="bar"><b id="bar"></b></div>
 <ul class="cmp" id="cmp"></ul>
 <table class="t" id="tbl"></table>${extra}
 <canvas id="card" class="cardprev" width="1080" height="1350" aria-label="공유용 결과 카드"></canvas>
 <div class="btns"><button class="btn" id="btn-share">카드 공유</button><button class="btn alt" id="btn-save">PNG 저장</button><button class="btn alt" id="btn-copy">링크 복사</button></div>
 <div class="toast" id="toast" role="status"></div>
</section>`;

/* ---------- 1) 연봉 상위 % 해설 ---------- */
const pts = sal.points;
const pct = (s) => { if (s >= pts[0][1]) return pts[0][0] * 2; if (s <= pts[pts.length - 1][1]) return 100;
  for (let i = 0; i < pts.length - 1; i++) { const [p0, a0] = pts[i], [p1, a1] = pts[i + 1]; if (a0 >= s && s >= a1) return p0 + (a0 - s) / (a0 - a1) * (p1 - p0); } };
const thr = (p) => { for (let i = 0; i < pts.length - 1; i++) { const [p0, a0] = pts[i], [p1, a1] = pts[i + 1]; if (p0 <= p && p <= p1) return a0 + (p - p0) / (p1 - p0) * (a1 - a0); } };
const lab = (p) => p < 10 ? p.toFixed(1) : String(Math.round(p));
const salEx = [2400, 3000, 4000, 5000, 6000, 7000, 10000, 15000].map((m) => [`${nf(m)}만 원`, `상위 약 ${lab(pct(m * 1e4))}%`]);
const salThr = [1, 5, 10, 20, 30, 50].map((p) => [`상위 ${p}%`, `약 ${nf(Math.round(thr(p) / 1e6) * 100)}만 원`]);
const SALARY_DOC = `<article class="doc"><h2>연봉 상위 %, 이렇게 계산하고 이렇게 읽어요</h2>
<p>국세청은 매년 연말정산을 한 근로소득자를 총급여 순서로 줄 세운 뒤 1%(상·하위 끝은 0.1%) 단위로 나누고, 구간마다 평균 총급여를 공개해요. 이 계산기는 그 구간 평균을 구간의 한가운데 백분위에 놓고 점 사이를 직선으로 이어서, 입력한 연봉이 줄 서기의 어디쯤인지 추정해요. 2024년 귀속 자료 기준 대상자는 약 ${nf(Math.round(sal.people / 1e4))}만 명이고, 전체 평균은 ${nf(Math.round(sal.mean_won / 1e4))}만 원, 가운데 값(중위)은 약 ${nf(Math.round(sal.median_won / 1e4))}만 원이에요.</p>
<p>여기서 말하는 연봉은 세전 <b>총급여</b>예요. 상여금·성과급·각종 수당은 들어가고, 식대(월 20만 원 한도) 같은 비과세 소득은 빠져요. 그래서 연봉 계약서의 숫자와 연말정산 서류의 총급여가 다를 수 있어요. 통장에 찍히는 실수령액이 궁금하면 <a href="../take-home/">실수령액 계산기</a>를 이용해 보세요.</p>
<p>해석할 때 알아둘 점이 있어요. 첫째, 대상은 근로소득자뿐이라 자영업자·프리랜서·임대·금융소득은 들어 있지 않아요. 둘째, 한 해 중간에 입사·퇴사한 사람과 단기 근로자도 한 명으로 세기 때문에 풀타임 환산 연봉보다 분포가 낮게 나와요. 셋째, 개인 기준이라 가구 소득이나 소비 여력과는 별개예요. 넷째, 구간 안의 분포는 모르기 때문에 보간 결과는 몇 퍼센트포인트 정도의 오차가 날 수 있어요(특히 최상위 구간). 상위 몇 %라는 숫자는 삶의 성적표가 아니라 통계상의 위치일 뿐이에요.</p>
<h3>이 숫자를 쓰는 법</h3><p>평균 연봉이 중위 연봉보다 높은 건 소수의 고연봉자가 평균을 끌어올리기 때문이에요. 그래서 &ldquo;나는 평균보다 낮다&rdquo;보다 &ldquo;중위의 몇 배인가&rdquo;가 내 위치를 더 잘 보여줘요. 이직·연봉 협상을 준비한다면 같은 연차·직무의 시장 데이터와 함께 보고, 성과급이 큰 직군은 세전 총급여를 기준으로 비교하세요. 연봉이 올라도 4대보험과 세금이 함께 늘어서 손에 쥐는 돈의 증가폭은 더 작아요. 이 통계는 해마다 갱신되므로 작년 위치와 비교할 때는 같은 기준(귀속연도)인지 확인하는 것이 좋아요. 또 근로소득자만 모은 통계라서 가구 단위의 생활 수준이나 자산 규모와는 직접 연결하지 않는 편이 안전해요.</p><h3>연봉별 상위 % 예시 (추정)</h3>${table(["연봉(세전)", "상위 위치"], salEx, "기준: 국세청 2024년 귀속 근로소득 백분위 자료")}
<h3>상위 구간의 연봉 문턱 (추정)</h3>${table(["위치", "연봉 문턱"], salThr)}
${DISC("1억 원이 약 상위 7%라는 식의 표현은 구간 평균을 이어 붙인 추정이에요. ")}</article>`;
const SALARY_FAQ = [
  ["연봉에 성과급과 비과세 식대는 포함하나요?", "성과급·상여금은 총급여에 포함돼 연봉에 넣어 계산하고, 식대(월 20만 원 한도) 같은 비과세 소득은 총급여에서 빠져요. 세전 총급여 기준으로 입력하세요."],
  ["실수령액을 넣어도 되나요?", "아니요. 이 계산기는 세전 총급여 기준이에요. 실수령액은 4대보험과 세금이 빠진 금액이라 순위가 실제보다 낮게 나와요. 월급만 알면 실수령액 계산기에서 세전 금액을 먼저 확인할 수 있어요."],
  ["국세청이 발표한 숫자와 왜 조금 달라요?", "국세청은 구간별 평균만 공개해서 이 계산기는 구간 사이를 직선으로 이어 추정해요. 구간 안의 실제 분포를 모르기 때문에 조금씩 차이가 날 수 있어요."],
  ["프리랜서나 자영업자도 비교할 수 있나요?", "아니요. 근로소득 연말정산 대상자만 포함한 통계예요. 사업소득·금융소득·임대소득은 반영되지 않아요."],
  ["상위 10%는 연봉이 얼마인가요?", `이 통계로 추정하면 상위 10%의 문턱은 약 ${nf(Math.round(thr(10) / 1e6) * 100)}만 원이에요. 통계가 새로 공개되면 숫자는 바뀔 수 있어요.`]];
const SALARY_SRC = [["국세청 국세통계 「근로소득 백분위(천분위) 자료」(공공데이터포털 15082063)", "https://www.data.go.kr/data/15050747/fileData.do".replace("15050747", "15082063"), "2024년 귀속, 2025.12 공개"],
  ["국가데이터처(구 통계청) 「임금근로일자리 소득(보수) 결과」(참고 비교)", "https://mods.go.kr/", "2024년 12월 기준, 2026.2 발표"]];

/* ---------- 2) 아파트 몇 년 해설 ---------- */
const R = Object.fromEntries(apt.regions.map((r) => [r.id, r]));
const yrs = (price, m, sv) => price / (m * sv / 100 * 12); const fy = (y) => y < 10 ? y.toFixed(1) : String(Math.round(y));
const aptEx = [250, 300, 400, 500, 700].map((m) => [`${nf(m)}만 원`, `${nf(m * .3, 1)}만 원`, ...apt.regions.map((r) => `${fy(yrs(r.price_man, m, 30))}년`)]);
const APT_DOC = `<article class="doc"><h2>집값 ÷ 저축액, 가장 단순한 계산이에요</h2>
<p>이 계산기의 식은 하나예요. <b>집값 ÷ (월급 × 저축률 × 12)</b>. 월급 300만 원을 받아 30%를 매달 모으면 연 1,080만 원이 쌓이고, 서울 아파트 중위 매매가격 약 ${nf(Math.round(R.med.price_man / 1e4 * 10) / 10, 1)}억 원까지는 ${fy(yrs(R.med.price_man, 300, 30))}년이 걸려요. 숫자를 크게 만든 이유는 자극이 아니라 규모감이에요. 한 달에 모을 수 있는 돈과 집값이 몇 배 차이 나는지 한눈에 보자는 거예요.</p>
<p>집값은 KB부동산 「월간 주택가격동향」의 서울 아파트 중위·평균 매매가격과 한강 이남 11개 구 평균을 썼어요(${apt.price_asof}). 월급은 직접 입력하고, 칩으로 국가데이터처의 임금근로자 월 중위(${apt.income.median_man}만 원)·평균(${apt.income.mean_man}만 원, 세전)을 바로 넣을 수 있어요. 저축률의 기본값 30%는 가구 흑자율(${apt.surplus_rate.pct}%, 가계동향조사 ${apt.surplus_rate.asof})을 참고했지만, 가구 기준이라 1인 직장인에게는 높거나 낮을 수 있어요.</p>
<p>이 계산은 의도적으로 단순해요. 이자 수익, 대출(레버리지), 집값 변동, 취득세·중개비, 월세·전세 선택, 소득 증가는 모두 빠져 있어요. 그래서 &ldquo;이 속도로 모으면 집을 살 수 있다/없다&rdquo;를 예측하는 도구가 아니라, 월급과 집값의 규모 차이를 가늠하는 도구예요. 실제 주거 계획은 소득 상승, 대출 한도, 정책 변화에 크게 좌우돼요. 월급을 세전으로 넣으면 실제 저축 여력보다 크게 나올 수 있으니 <a href="../take-home/">실수령액 계산기</a>로 세후 금액을 확인한 뒤 &ldquo;실수령&rdquo; 버튼으로 계산해 보세요.</p>
<h3>결과를 보는 요령</h3><p>저축률을 10%p만 올려도 걸리는 시간이 크게 줄어드는지 슬라이더로 직접 움직여 보세요. 지역을 바꿔 보면 중위와 평균, 강남 11개 구의 격차가 얼마나 큰지 보여요. 평균 가격은 고가 아파트가 끌어올려 중위보다 높아요. 실제로는 전세·월세로 사는 기간, 청약·대출 같은 제도, 소득 성장, 부모 지원 여부에 따라 계획이 모두 달라서 이 숫자는 출발점일 뿐이에요. 목표를 정할 때는 시나리오를 여러 개 놓고 비교하고, 구체적인 대출·세금 문제는 공식 기관 안내나 전문가에게 확인하세요.</p><h3>월급·지역별 걸리는 시간 (저축률 30%, 세전 월급 기준 예시)</h3>${table(["월급", "월 저축", ...apt.regions.map((r) => r.label)], aptEx, `집값: KB부동산 ${apt.price_asof}`)}
${DISC("집값 전망이나 매수 시점에 대한 조언이 아니에요. ")}</article>`;
const APT_FAQ = [
  ["대출을 받으면 얼마나 줄어드나요?", "이 계산기는 대출을 반영하지 않아요. 대출 가능 금액과 금리는 소득·담보·정책에 따라 개인마다 크게 달라서 단순 평균으로 넣으면 오해를 줄 수 있어요. 대출 상담은 금융기관과 공식 안내를 확인하세요."],
  ["집값은 어디서 가져오나요?", `KB부동산 「월간 주택가격동향」의 서울 아파트 중위·평균 매매가격이에요(${apt.price_asof}). 실거래가와는 정의와 시점이 달라 차이가 있을 수 있어요.`],
  ["저축률 30%는 어떻게 정했나요?", `가계동향조사의 가구 흑자율(${apt.surplus_rate.pct}%, ${apt.surplus_rate.asof})을 참고한 기본값이에요. 슬라이더로 5%~100% 사이에서 바꿀 수 있어요.`],
  ["세전 월급과 실수령 중 무엇을 넣어야 하나요?", "실제로 모을 수 있는 돈은 실수령에서 나오니 가능하면 실수령을 넣으세요. 세전을 넣으면 걸리는 시간이 실제보다 짧게 나와요."],
  ["집값이 오르면 결과도 바뀌나요?", "네. 집값 데이터는 월 단위로 갱신돼요. 이 계산기는 미래 집값 변동을 반영하지 않고 현재 가격이 유지된다고 가정해요."]];
const APT_SRC = [["KB부동산 「월간 주택가격동향」", "https://data.kbland.kr", apt.price_asof], ["국가데이터처(구 통계청) 「임금근로일자리 소득(보수) 결과」", apt.income.url, apt.income.asof], ["국가데이터처 「가계동향조사」(가구 흑자율)", "https://kostat.go.kr/", apt.surplus_rate.asof]];

/* ---------- 기존 페이지에 주입 ---------- */
function inject(rel, depth, doc, faq, srcs, asof, desc, title, crumbName) {
  const f = path.join(root, rel); let h = fs.readFileSync(f, "utf8");
  h = h.replace(/<!--DOC-->[\s\S]*?<!--\/DOC-->/g, "").replace(/<!--LD-->[\s\S]*?<!--\/LD-->/g, "").replace(/<!--HX-->[\s\S]*?<!--\/HX-->/g, "");
  h = h.replace("</head>", `<!--HX-->${HEAD_EXTRA}<!--/HX--><!--LD-->${crumbs([["홈", "/"], [crumbName, "/" + rel.replace("index.html", "")]])}\n${faqLd(faq)}<!--/LD-->\n</head>`);
  h = h.replace('<div class="src" id="src"></div>', `<div class="src" id="src"></div>\n<!--DOC-->${doc}${faqHtml(faq)}${srcHtml(srcs, asof)}<!--/DOC-->`);
  h = h.replace(/<footer>[\s\S]*?<\/footer>/, FOOT(depth));
  h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`);
  fs.writeFileSync(f, h);
}
inject("salary-rank/index.html", 1, SALARY_DOC, SALARY_FAQ, SALARY_SRC, TODAY, "연봉(세전)을 넣으면 국세청 2024년 귀속 근로소득 통계로 상위 몇 %인지 계산해요. 연봉별 위치 예시표, 계산 방법, FAQ, 출처까지 한 페이지에.", "", "내 연봉 상위 몇 %");
inject("apartment-years/index.html", 1, APT_DOC, APT_FAQ, APT_SRC, TODAY, "월급과 저축률을 넣으면 KB 시세 기준 서울 아파트까지 몇 년 걸리는지 계산해요. 지역별 예시표, 계산식, FAQ, 출처를 함께 보여줘요.", "", "내 월급 서울 아파트 몇 년");

/* ---------- 3) 실수령액 ---------- */
const ex = (g, nt = 200000, fam = 1) => calc({gross: g, nontax: nt, family: fam, kids: 0}, tax);
const thEx = [2500000, 3000000, 3500000, 4000000, 5000000, 7000000].map((g) => { const r = ex(g); return [`${nf(g / 1e4)}만 원`, nf(r.pension + r.health + r.ltc + r.employ) + "원", nf(r.incomeTax + r.localTax) + "원", `<b>${nf(r.net)}원</b>`]; });
const TH_DOC = `<article class="doc"><h2>월급에서 무엇이 얼마나 빠지나요</h2>
<p>월급명세서의 &ldquo;공제&rdquo; 항목은 크게 4대보험(국민연금·건강보험·장기요양보험·고용보험)과 세금(소득세·지방소득세)으로 나뉘어요. 이 계산기는 세전 월 급여에서 비과세 식대를 뺀 금액을 기준으로 각 항목을 계산하고, 남는 금액을 예상 실수령액으로 보여줘요. 산재보험은 사업주가 전액 부담해서 근로자 공제에 없어요.</p>
<p>2026년 근로자 부담 요율은 국민연금 4.75%(보험료율 9.5%를 노사가 절반씩, 기준소득월액 하한 41만 원·상한 659만 원), 건강보험 3.595%(7.19%의 절반), 장기요양보험은 건강보험료의 13.14%, 고용보험(실업급여) 0.9%예요. 소득세는 국세청 「근로소득 간이세액표」(소득세법 시행령 별표 2, 2026.2.27 개정)의 월급여·공제대상가족 수별 금액을 그대로 쓰고, 8~20세 자녀가 있으면 표 안내대로 자녀 수에 따른 금액을 빼요. 지방소득세는 소득세의 10%예요. 각 보험료는 10원 미만을 절사했어요.</p>
<p>이 값은 매달 회사가 <b>원천징수하는 금액</b>과 비슷하도록 만든 추정치예요. 실제 명세서와 다를 수 있는 이유는 여러 가지예요. 회사가 건강보험 보수월액을 전년 기준으로 정산하는 경우, 식대 외 비과세(차량유지비, 육아수당 등), 상여금·성과급이 있는 달의 세액 정산, 4대보험 요율 변경 시점, 연금·건보료 상·하한, 연말정산 결과(환급·추가납부)가 그래요. 간이세액표는 연말정산 때 정산을 전제로 미리 떼는 금액이라, 이 계산기의 소득세는 최종 결정세액과 같지 않아요.</p>
<h3>이직·협상 때 쓰는 법</h3><p>연봉 협상이나 이직 제안을 비교할 때 세전 금액만 보면 실제 생활비와 거리가 생겨요. 식대 같은 비과세 항목이 많은 회사는 같은 세전 금액이라도 보험료와 세금이 적어 실수령이 더 높을 수 있어요. 4대보험은 직장가입자 기준이라 프리랜서나 지역가입자는 보험료 계산이 달라요. 연말정산에서 신용카드·의료비·교육비 공제를 받으면 이미 낸 소득세가 환급될 수도 있어요. 가족 수를 바꾸면 소득세가 크게 달라지는 점도 직접 확인해 보세요.</p><h3>월 급여별 예상 실수령 예시 (본인 1명, 비과세 식대 20만 원)</h3>${table(["월 급여(세전)", "4대보험", "소득세·지방세", "예상 실수령"], thEx, "2026년 요율, 간이세액표(2026.2.27 개정) 기준 추정")}
<p class="note">연봉으로 입력하면 12로 나눈 월 급여로 계산해요(상여금이 따로 있으면 달마다 달라져요). 공무원은 국민연금 대신 공무원연금 기여금을 내므로 이 계산기 대상이 아니에요. 공무원 보수는 <a href="../civil-pay/">공무원 월급 조회</a>를 참고하세요.</p>
${DISC("이 계산기는 간이세액표 기반 근사치예요. ")}</article>`;
const TH_FAQ = [
  ["실수령액이 명세서와 다른 이유는 무엇인가요?", "회사별 비과세 항목, 건강보험 정산, 상여금 달의 세액 정산, 요율 적용 시점 차이 때문이에요. 이 계산기는 월 고정급 기준의 근사치예요."],
  ["2026년 4대보험 요율은 얼마인가요?", "근로자 부담 기준으로 국민연금 4.75%, 건강보험 3.595%, 장기요양보험은 건강보험료의 13.14%, 고용보험 0.9%예요. 국민연금 기준소득월액은 2026년 7월부터 하한 41만 원, 상한 659만 원이에요."],
  ["간이세액표는 무엇인가요?", "회사가 매달 월급에서 소득세를 미리 떼는 기준표예요(소득세법 시행령 별표 2). 연말정산에서 실제 세금과 비교해 환급하거나 더 내요. 그래서 한 해 총세금이 아니라 매달 떼는 금액의 기준이에요."],
  ["비과세 식대는 얼마까지인가요?", "월 20만 원까지 비과세예요(소득세법 시행령 제12조). 회사가 식대를 따로 지급하지 않으면 0원으로 입력하세요."],
  ["8~20세 자녀가 있으면 어떻게 계산하나요?", "간이세액표 안내에 따라 자녀 1명 20,830원, 2명 45,830원, 3명 이상은 45,830원에 2명 초과 자녀 1명당 33,330원을 소득세에서 빼요. 이 금액은 2026년 3월 1일 이후 원천징수분부터 적용돼요."]];
const TH_SRC = [["국세청 근로소득 원천징수방법(간이세액표) / 소득세법 시행령 별표 2 <개정 2026.2.27>", tax.source_url, "2026-03-01 이후 원천징수분"],
  ["국민연금공단 연금보험료 안내(보험료율 9.5%, 기준소득월액 상·하한)", "https://www.nps.or.kr/", "2026년, 상·하한은 2026.7~2027.6"],
  ["국민건강보험공단 보험료율(건강보험 7.19%, 장기요양 13.14%)", "https://www.nhis.or.kr/", "2026년"],
  ["근로복지공단 고용·산재보험 안내(고용보험 실업급여 근로자 0.9%)", "https://www.comwel.or.kr/", "2026년"]];
const TH_BODY = `<h1>월급 <em>실수령액</em><br>얼마일까?</h1>
<p class="sub">2026 4대보험 + 간이세액표 기준 추정. 세전 월급만 넣으면 돼요.</p>
<div class="seg" id="mode" style="margin-bottom:6px"><button type="button" data-v="m" aria-pressed="true">월 급여</button><button type="button" data-v="y" aria-pressed="false">연봉</button></div>
<label for="sal" id="lab">월 급여 (세전)</label>
<div class="field"><input id="sal" inputmode="numeric" autocomplete="off" placeholder="300" aria-label="세전 금액 만원"><span>만 원</span></div>
<div class="chips" id="chips"></div>
<label for="nt">비과세 (식대 등, 월)</label>
<div class="field"><input id="nt" inputmode="numeric" autocomplete="off" placeholder="20" aria-label="비과세 금액 만원"><span>만 원</span></div>
<div class="two"><div><label for="fam">공제대상가족 (본인 포함)</label><select id="fam"></select></div><div><label for="kid">8~20세 자녀</label><select id="kid"></select></div></div>
${RESULT()}
<div class="src"><b>출처</b> 국세청 근로소득 간이세액표(소득세법 시행령 별표 2, 2026.2.27 개정), 국민연금·건강보험·고용보험 2026년 요율.
<div class="warn"><b>근사치예요.</b> 회사별 비과세·정산·연말정산에 따라 실제 명세서와 다를 수 있어요. 참고용이며 세법·요율 변경 가능.</div></div>
${TH_DOC}${faqHtml(TH_FAQ)}${srcHtml(TH_SRC, TODAY)}`;
write("take-home/index.html", page({p: "take-home/", depth: 1, title: "월급 실수령액 계산기 2026 (4대보험·간이세액표) | 돈의 스케일", desc: "세전 월급·연봉을 넣으면 2026년 4대보험과 소득세(간이세액표)를 뺀 예상 실수령액을 계산해요. 요율 출처와 근사치 안내, 예시표, FAQ 포함.", body: TH_BODY,
  ld: [crumbs([["홈", "/"], ["월급 실수령액 계산기", "/take-home/"]]), faqLd(TH_FAQ)], scripts: `<script src="../assets/common.js"></script><script src="../assets/takehome-core.js"></script><script src="../assets/takehome.js"></script>`}));

/* ---------- 4) 공무원 월급 ---------- */
const cg = (g, h) => civ.grades[g].pay[h - 1] + civ.allow[g] + civ.meal;
const CIV_EX = ["9", "8", "7", "6", "5"].map((g) => [`${g}급`, ...[1, 10, 20].map((h) => `${nf(civ.grades[g].pay[h - 1])}원<br><small>합계 ${nf(cg(g, h))}원</small>`)]);
const CIV_DOC = `<article class="doc"><h2>공무원 월급, 봉급표를 어떻게 읽나요</h2>
<p>일반직공무원의 기본급인 봉급은 인사혁신처가 공개하는 「공무원봉급표」(공무원보수규정 별표 3)에서 <b>직급과 호봉</b>으로 정해져요. 2026년 표는 2026년 1월 1일부터 적용되고, 정부는 2026년 공무원 보수를 3.5% 인상했으며 7~9급 저연차 봉급은 추가로 올렸어요. 이 페이지의 조회기는 5~9급의 모든 호봉을 담고 있어요.</p>
<p>월급은 봉급만이 아니에요. 매달 고정으로 붙는 수당 중 <b>직급보조비</b>(5급 25만 원, 6급 18.5만 원, 7급 18만 원, 8·9급 17.5만 원, 공무원수당 등에 관한 규정 별표 15)와 <b>정액급식비</b>(월 16만 원, 2026년 14만 원에서 인상)를 더한 값이 &ldquo;매달 고정분&rdquo;이에요. 여기에는 명절휴가비(설·추석), 정근수당(1·7월), 시간외근무수당, 가족수당, 성과상여금, 직무별 특수업무수당이 들어 있지 않아요. 그래서 실제 연간 보수는 이 숫자 &times; 12보다 많을 수 있어요.</p>
<p>표의 금액은 전부 <b>세전</b>이에요. 통장에 들어오는 금액은 공무원연금 기여금(기준소득월액의 9%, 공무원연금법 제67조), 건강보험·장기요양보험료, 소득세·지방소득세를 뺀 값이라 개인별로 달라요. 정액급식비는 식대 비과세 한도 안에 있어서 소득세 계산이 달라질 수 있어요. 호봉은 봉급표의 칸일 뿐이고, 실제 임용 때의 첫 호봉은 군 복무·경력 인정에 따라 1호봉보다 높을 수 있어요. 이 페이지는 일반직 기준이라 경찰·소방·교사·군인은 봉급표가 달라요.</p>
<h3>비교할 때 주의할 점</h3><p>공무원은 호봉이 매년 오르는 연공형 구조라 같은 직급이라도 연차에 따라 월급이 크게 달라요. 민간 연봉과 비교하려면 이 페이지의 월 고정분에 명절휴가비·정근수당·성과상여금 같은 연간 수당을 더하고, 반대로 공무원연금 기여금 같은 공제를 빼서 같은 기준으로 맞춰야 해요. 승진, 수당 체계, 근무지(예: 특수지 수당)도 보수에 영향을 줘요. 이 조회기는 일반직 5~9급의 &ldquo;기본 구조&rdquo;를 보여주는 용도이니, 실제 지급액은 소속 기관의 급여명세서로 확인하세요. 봉급표는 매년 보수 인상에 맞춰 바뀌므로 연도가 다른 표를 섞어 비교하지 마세요.</p><h3>직급·호봉별 봉급과 매달 고정분 (세전)</h3>${table(["직급", "1호봉", "10호봉", "20호봉"], CIV_EX, "봉급(월) / 합계=봉급+직급보조비+정액급식비")}
<details class="faq"><summary>5~9급 전체 봉급표 보기 (봉급만, 원)</summary><div class="tw"><table class="t ex" id="full"></table></div></details>
${DISC("공무원보수규정과 수당 규정은 개정될 수 있어요. 2027년 인상안(정부안 3.9%)은 국회 의결 전이라 반영하지 않았어요. ")}</article>`;
const CIV_FAQ = [
  ["공무원 월급 표의 금액은 세전인가요, 세후인가요?", "전부 세전이에요. 공무원연금 기여금, 건강보험료, 소득세 등이 빠진 실수령액은 기준소득월액과 가족 상황에 따라 달라서 이 페이지에 단일 값으로 쓰지 않았어요."],
  ["&ldquo;매달 고정분&rdquo;에는 무엇이 포함되나요?", "봉급 + 직급보조비 + 정액급식비예요. 명절휴가비, 정근수당, 시간외근무수당, 가족수당, 성과상여금, 특수업무수당은 별도예요."],
  ["내 호봉은 어떻게 알 수 있나요?", "임용 때 경력·군 복무 인정으로 정해지고 보통 매년 1호봉씩 올라가요. 정확한 호봉은 소속 기관의 인사 부서나 급여명세서에서 확인하세요."],
  ["경찰·소방·교사·군인도 같은 표인가요?", "아니요. 이 페이지는 일반직공무원(별표 3) 기준이에요. 다른 직종은 별도 봉급표를 써요."],
  ["2027년에는 얼마나 오르나요?", "정부 2027년 예산안에서 공무원 보수 3.9% 인상이 언론에 보도됐지만 국회 의결 전이라 확정이 아니에요. 확정되면 이 페이지를 갱신할 예정이에요."]];
const CIV_SRC = [["인사혁신처 「2026년 공무원봉급표」 = 공무원보수규정 [별표 3]", civ.source_url, civ.asof],
  ["공무원수당 등에 관한 규정 [별표 15] 직급보조비 지급 구분표", civ.allow_url, "2026.1.2 개정"],
  ["인사혁신처 보도자료 「2026년 공무원 보수 3.5% 인상」(정액급식비 월 16만 원)", "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156737453", "2025-12-30"],
  ["공무원연금법 제67조 (기여금 9%)", "https://www.law.go.kr/법령/공무원연금법", "현행"]];
const CIV_BODY = `<h1>공무원 <em>월급</em><br>직급·호봉 조회</h1>
<p class="sub">2026 공무원봉급표 5~9급. 매달 고정분(봉급+직급보조비+정액급식비), 세전.</p>
<label>직급</label><div class="seg" id="g"></div>
<label for="h">호봉</label><select id="h"></select>
${RESULT()}
<div class="src"><b>출처</b> 인사혁신처 2026 공무원보수규정 별표 3, 공무원수당 등에 관한 규정 별표 15.
<div class="warn">세전 · 명절휴가비·정근수당·시간외수당·가족수당 별도 · 참고용, 규정 변경 가능</div></div>
${CIV_DOC}${faqHtml(CIV_FAQ)}${srcHtml(CIV_SRC, TODAY)}`;
write("civil-pay/index.html", page({p: "civil-pay/", depth: 1, title: "2026 공무원 월급 봉급표 (9급~5급) 직급·호봉 조회 | 돈의 스케일", desc: "2026년 공무원 봉급표(5~9급)로 내 직급·호봉의 월급을 조회해요. 봉급+직급보조비+정액급식비 합계, 포함·미포함 항목, 출처 안내.", body: CIV_BODY,
  ld: [crumbs([["홈", "/"], ["공무원 월급 조회", "/civil-pay/"]]), faqLd(CIV_FAQ)], scripts: `<script src="../assets/common.js"></script><script src="../assets/civilpay.js"></script>`}));

/* ---------- 5) 다운로드(E2) ---------- */
const DL_BODY = `<h1>월급 관리 엑셀 <em>lite</em><br>무료로 받기</h1>
<p class="sub">실수령액을 넣으면 고정비·생활비·저축·투자 비율이 자동 계산돼요. 가입 없이 바로 다운로드.</p>
<a class="btn" style="display:block;text-align:center;text-decoration:none;margin:14px 0" href="money-scale-salary-lite.xlsx" download>엑셀 lite 다운로드 (.xlsx, 무료)</a>
<article class="doc"><h2>구성 (시트 3개)</h2>
<ul class="srcs"><li><b>1_월급배분</b> 월 실수령액과 내 목표 비율(기본 50/20/20/10)을 넣으면 항목별 금액·6개월 누적·1억 원까지 걸리는 기간이 나와요.</li>
<li><b>2_고정비_저축목록</b> 항목을 적으면 분류별 합계가 목표 금액과 자동 비교돼요.</li>
<li><b>3_12개월기록</b> 매달 실제 금액을 적으면 남은 돈과 고정비·저축 비중이 계산돼요.</li></ul>
<h2>사용법</h2>
<p>노란 칸(파란 글씨)만 수정하세요. 월 실수령액은 <a href="../take-home/">실수령액 계산기</a>로 먼저 확인하면 편해요. 비율은 예시일 뿐이고 투자 권유가 아니에요. 엑셀·구글 스프레드시트·LibreOffice에서 열 수 있어요. 구글 스프레드시트는 구글 드라이브에 올려 &ldquo;Google 스프레드시트로 열기&rdquo;를 선택하세요.</p>
${DISC("특정 금융상품을 추천하지 않는 가계 정리용 서식이에요. ")}</article>
<article class="doc"><h2>풀 버전 대기 신청</h2>
<p>풀 버전은 4대보험·간이세액 기반 실수령 자동 계산과 연말정산 체크 시트를 포함할 계획이에요. 수요를 확인하는 중이라 아직 판매 전이고, 대기 신청을 해주시면 출시 때 한 번 알려드려요.</p>
<form id="wl" onsubmit="return false"><label class="chk"><input type="checkbox" id="wl-ok"> <span><b>[필수]</b> 개인정보 수집·이용에 동의합니다. 수집 항목: 이메일 주소 / 목적: 풀 버전 출시 안내 / 보유: 출시 안내 후 즉시 또는 최대 1년 후 파기. 동의를 거부할 수 있으며 이 경우 대기 신청이 어려워요. <a href="../privacy/">자세히</a></span></label>
<div class="btns" style="margin-top:12px"><a class="btn" id="wl-mail" href="#" role="button" aria-disabled="true">메일로 대기 신청하기</a><a class="btn alt" id="wl-form" href="#" hidden style="text-align:center;text-decoration:none" rel="noopener">구글 폼으로 신청하기</a></div>
<p class="note" id="wl-msg">동의 체크 후 눌러주세요. 메일 앱이 열리면 그대로 보내시면 돼요. 광고성 정보 수신은 별도로 묻지 않고, 출시 안내 외에는 쓰지 않아요.</p></form></article>
<script>
/* 구글 폼을 만들었다면 아래 주소를 채우세요 (비워두면 메일 신청만 보여요) */
var GOOGLE_FORM_URL = "";
var EMAIL = "${EMAIL}";
(function(){var ok=document.getElementById("wl-ok"),a=document.getElementById("wl-mail"),f=document.getElementById("wl-form");
 if(GOOGLE_FORM_URL){f.hidden=false;f.href=GOOGLE_FORM_URL;}
 var s="[돈의 스케일] 월급 관리 엑셀 풀 버전 대기 신청",b="풀 버전 출시 안내를 받고 싶어요.\\n(개인정보 수집·이용에 동의합니다. 이메일: 보내는 주소로 회신해 주세요.)";
 a.addEventListener("click",function(e){e.preventDefault();if(!ok.checked){document.getElementById("wl-msg").textContent="개인정보 수집·이용 동의에 체크해 주세요.";return;}
  location.href="mailto:"+EMAIL+"?subject="+encodeURIComponent(s)+"&body="+encodeURIComponent(b);});
 ok.addEventListener("change",function(){a.setAttribute("aria-disabled",ok.checked?"false":"true");});})();
</script>`;
write("downloads/index.html", page({p: "downloads/", depth: 1, title: "월급 관리 엑셀 lite 무료 다운로드 | 돈의 스케일", desc: "실수령액만 넣으면 고정비·저축·투자 비율이 자동 계산되는 무료 월급 관리 엑셀(xlsx). 풀 버전 대기 신청 안내.", body: DL_BODY, ld: [crumbs([["홈", "/"], ["월급 관리 엑셀 lite", "/downloads/"]])]}));

/* ---------- 6) about / contact / privacy ---------- */
write("about/index.html", page({p: "about/", depth: 1, title: "돈의 스케일 소개 | 돈의 스케일", desc: "돈의 스케일은 공식 통계로 월급·연봉·집값을 규모감 있게 보여주는 계산기 사이트예요. 데이터 원칙, 운영 방식, 수익 구조를 밝혀요.", ld: [crumbs([["홈", "/"], ["소개", "/about/"]])],
 body: `<h1>돈의 스케일<br><em>소개</em></h1>
<article class="doc"><h2>무엇을 하는 곳인가요</h2>
<p>돈의 스케일은 내 월급·연봉·집값을 한국 전체의 숫자와 견주어 보여주는 계산기 사이트예요. YouTube(@돈의스케일), Instagram(@money.scale.kr)의 짧은 영상에서 소개한 숫자를 직접 넣어 계산할 수 있도록 만들었어요. 운영은 &ldquo;돈의 스케일 편집팀&rdquo;이 해요.</p>
<h2>데이터 원칙</h2>
<ul class="srcs"><li>국세청, 국가데이터처(구 통계청), 국민연금공단, 국민건강보험공단, 인사혁신처, KB부동산 등 <b>공개된 1차 자료</b>만 써요. 블로그나 커뮤니티 숫자는 쓰지 않아요.</li>
<li>모든 계산기에 <b>출처와 기준 연도</b>, 계산 방법, 한계를 적어요. 추정치는 추정이라고 적어요.</li>
<li>세법·요율·통계가 바뀌면 갱신하고 페이지에 최종 업데이트 날짜를 남겨요.</li></ul>
<h2>하지 않는 것</h2>
<ul class="srcs"><li>특정 금융상품(카드·대출·보험·증권·펀드)을 추천하거나 신청 링크·추천인 코드를 싣지 않아요.</li>
<li>투자 권유, 종목 추천, 유료 리딩방을 하지 않아요.</li>
<li>계산기에 입력한 값은 서버로 보내지 않고 내 브라우저에서만 처리해요.</li></ul>
<h2>수익 구조</h2>
<p>사이트 유지는 향후 광고(Google AdSense)와 직접 만든 디지털 템플릿(예: 월급 관리 엑셀) 판매로 충당할 계획이에요. 광고가 붙더라도 계산 결과나 내용에는 영향을 주지 않아요.</p>
<h2>오류 제보</h2>
<p>숫자가 이상하거나 최신 자료와 다르면 <a href="../contact/">문의</a>로 알려주세요. 확인 후 정정하고 기록해요.</p></article>`}));
write("contact/index.html", page({p: "contact/", depth: 1, title: "문의하기 | 돈의 스케일", desc: "돈의 스케일 문의·오류 제보·제휴(금융상품 제외) 연락처 안내.", ld: [crumbs([["홈", "/"], ["문의", "/contact/"]])],
 body: `<h1>문의<em>하기</em></h1>
<article class="doc"><h2>연락처</h2>
<p>이메일: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
<p>영업일 기준 3~5일 안에 답하려고 노력하지만 늦어질 수 있어요. 개인 재무 상담, 세무·법률 자문, 투자 상담은 드리지 않아요.</p>
<h2>이런 내용을 보내주세요</h2>
<ul class="srcs"><li><b>오류 제보</b> 어느 페이지의 어느 숫자가 왜 틀렸는지, 근거 자료 링크와 함께 보내주시면 확인해요.</li>
<li><b>계산기 제안</b> 공식 통계로 만들 수 있는 계산기 아이디어를 환영해요.</li>
<li><b>개인정보 문의</b> 대기 신청 등으로 보낸 이메일의 삭제·열람 요청은 <a href="../privacy/">개인정보처리방침</a>의 절차에 따라 처리해요.</li>
<li><b>제휴·협찬</b> 금융상품(카드·대출·보험·증권) 광고·제휴는 받지 않아요.</li></ul>
<h2>채널</h2><p><a href="https://www.youtube.com/@돈의스케일" rel="noopener">YouTube @돈의스케일</a> · <a href="https://www.instagram.com/money.scale.kr/" rel="noopener">Instagram @money.scale.kr</a></p></article>`}));
write("privacy/index.html", page({p: "privacy/", depth: 1, title: "개인정보처리방침 | 돈의 스케일", desc: "돈의 스케일의 개인정보처리방침: 수집 항목, 쿠키, Google AdSense·분석도구 사용, 보유 기간, 이용자 권리 안내.", ld: [crumbs([["홈", "/"], ["개인정보처리방침", "/privacy/"]])],
 body: `<h1>개인정보<em>처리방침</em></h1>
<article class="doc"><p class="note">시행일 2026-10-05 · 돈의 스케일 편집팀(이하 &ldquo;운영팀&rdquo;)은 「개인정보 보호법」 등 관련 법령을 지켜요.</p>
<h2>1. 수집하는 정보와 목적</h2>
<ul class="srcs"><li><b>계산기 입력값</b>(연봉, 월급, 저축률 등): 서버로 전송·저장하지 않고 이용자의 브라우저에서만 처리해요. 결과 공유 링크에는 입력값이 주소(URL)에 포함되니, 링크를 공유할 때 유의하세요.</li>
<li><b>대기 신청·문의 이메일</b>(이용자가 직접 메일을 보낸 경우): 수집 항목은 이메일 주소와 메일 내용이에요. 이용 목적은 풀 버전 출시 안내 및 문의 답변이에요.</li>
<li><b>자동 수집 정보</b>: 접속 IP, 브라우저 종류, 방문 시각, 참조 주소 등이 호스팅 사업자(GitHub Pages)의 서버 로그로 처리될 수 있어요. 운영팀은 이를 직접 열람·저장하지 않아요.</li></ul>
<h2>2. 보유 및 이용 기간</h2>
<p>대기 신청 이메일은 출시 안내 후 즉시, 안내가 없는 경우 수집일로부터 최대 1년 뒤에 파기해요. 문의 메일은 답변 완료 후 최대 1년 보관 뒤 파기해요. 관련 법령에 따라 보관이 필요한 경우는 그 기간을 따라요.</p>
<h2>3. 쿠키와 광고(Google AdSense)</h2>
<p>이 사이트는 현재 광고를 게재하지 않아요. <b>Google AdSense 등 광고를 게재하게 되면</b> 다음이 적용돼요.</p>
<ul class="srcs"><li>Google을 포함한 제3자 광고 사업자가 쿠키(및 광고 ID 등 유사 기술)를 사용해 이용자의 이 사이트 및 다른 사이트 방문 기록을 바탕으로 광고를 게재할 수 있어요.</li>
<li>이용자는 <a href="https://adssettings.google.com/" rel="noopener nofollow">Google 광고 설정</a>에서 맞춤 광고를 끄거나, <a href="https://www.aboutads.info/choices/" rel="noopener nofollow">aboutads.info</a>에서 제3자 맞춤 광고 쿠키를 거부할 수 있어요.</li>
<li>Google의 광고 쿠키 사용에 관한 자세한 내용은 <a href="https://policies.google.com/technologies/ads?hl=ko" rel="noopener nofollow">Google 광고 정책</a>을 참고하세요.</li>
<li>브라우저 설정에서 쿠키 저장을 거부·삭제할 수 있어요. 다만 일부 기능(공유 등)에는 영향이 없지만 광고 개인화는 달라질 수 있어요.</li></ul>
<h2>4. 웹 분석 도구</h2>
<p>현재 방문 통계 도구를 사용하지 않아요. Google Analytics 등 분석 도구를 도입하게 되면 쿠키로 방문 횟수, 페이지 조회, 유입 경로 같은 비식별 통계를 수집하며, 이 방침을 먼저 갱신해요. 이용자는 <a href="https://tools.google.com/dlpage/gaoptout?hl=ko" rel="noopener nofollow">Google Analytics 차단 부가기능</a>으로 수집을 거부할 수 있어요.</p>
<h2>5. 폰트 등 외부 서비스</h2>
<p>사이트 글꼴은 Google Fonts에서 불러와요. 이 과정에서 이용자의 IP 주소가 Google에 전달될 수 있어요.</p>
<h2>6. 제3자 제공과 처리 위탁</h2>
<p>운영팀은 이용자의 개인정보를 제3자에게 판매하거나 제공하지 않아요. 법령에 따른 요청이 있는 경우는 예외예요. 사이트 호스팅은 GitHub Pages(GitHub, Inc.)를 이용해요.</p>
<h2>7. 이용자의 권리</h2>
<p>이용자는 언제든지 자신의 개인정보 열람·정정·삭제·처리정지를 <a href="mailto:${EMAIL}">${EMAIL}</a>로 요청할 수 있고, 운영팀은 지체 없이 조치해요. 만 14세 미만 아동의 개인정보는 수집하지 않아요.</p>
<h2>8. 안전성 확보 조치</h2>
<p>수집한 이메일은 접근 권한이 있는 운영팀만 열람하며, 불필요해지면 지체 없이 파기해요.</p>
<h2>9. 개인정보 보호책임자</h2>
<p>돈의 스케일 편집팀 · <a href="mailto:${EMAIL}">${EMAIL}</a><br>기타 개인정보 침해 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 118), 개인정보분쟁조정위원회(kopico.go.kr, 1833-6972)에 문의할 수 있어요.</p>
<h2>10. 방침 변경</h2>
<p>이 방침이 바뀌면 이 페이지에 변경 내용과 시행일을 공지해요.</p></article>`}));

/* ---------- 홈 ---------- */
{
  const f = path.join(root, "index.html"); let h = fs.readFileSync(f, "utf8");
  h = h.replace(/<!--HOMECARDS-->[\s\S]*?<!--\/HOMECARDS-->/, "");
  h = h.replace(/<a class="card" href="salary-rank\/">[\s\S]*?<div class="card"><span class="tag soon">[\s\S]*?<\/div>/, `<!--HOMECARDS--><a class="card" href="salary-rank/"><span class="tag">계산기 1</span><h2>내 연봉, 대한민국 상위 몇 %?</h2><p>연봉(세전)을 넣으면 국세청 근로소득 통계로 내 위치를 보여줘요.</p></a>
<a class="card" href="apartment-years/"><span class="tag">계산기 2</span><h2>내 월급으로 서울 아파트까지 몇 년?</h2><p>월급·저축률·지역을 넣으면 KB 시세 기준 걸리는 시간을 계산해요.</p></a>
<a class="card" href="take-home/"><span class="tag">계산기 3</span><h2>월급 실수령액 계산기 (2026)</h2><p>4대보험과 간이세액표를 반영한 예상 실수령액을 보여줘요.</p></a>
<a class="card" href="civil-pay/"><span class="tag">조회</span><h2>2026 공무원 월급 (9급~5급)</h2><p>인사혁신처 봉급표로 내 직급·호봉의 월급을 찾아봐요.</p></a>
<a class="card" href="downloads/"><span class="tag">무료 자료</span><h2>월급 관리 엑셀 lite</h2><p>실수령액으로 고정비·저축 비율을 자동 계산하는 엑셀을 받아가세요.</p></a>
<div class="card"><span class="tag soon">준비 중</span><h2>다음 계산기</h2><p>국민연금, 월세, 최저시급 환산… 구독하면 먼저 알려드려요.</p></div>
<article class="doc"><h2>돈의 스케일은</h2><p>월급·연봉·집값을 한국 전체의 숫자와 견주어 보여주는 계산기 사이트예요. 국세청·국가데이터처·인사혁신처 같은 공개 1차 자료만 쓰고, 계산기마다 출처와 기준 연도를 밝혀요. 금융상품 추천이나 투자 권유는 하지 않아요. <a href="about/">소개 더 보기</a></p></article><!--/HOMECARDS-->`);
  h = h.replace(/<footer>[\s\S]*?<\/footer>/, FOOT(0));
  h = h.replace(/<!--HX-->[\s\S]*?<!--\/HX-->/, "").replace(/<!--LD-->[\s\S]*?<!--\/LD-->/, "");
  h = h.replace("</head>", `<!--HX-->${HEAD_EXTRA}<!--/HX--><!--LD-->${jsonld({"@context": "https://schema.org", "@type": "WebSite", name: "돈의 스케일", url: BASE + "/", inLanguage: "ko-KR"})}<!--/LD-->\n</head>`);
  fs.writeFileSync(f, h);
}

/* ---------- sitemap ---------- */
const urls = ["", "salary-rank/", "apartment-years/", "take-home/", "civil-pay/", "downloads/", "about/", "contact/", "privacy/"];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${BASE}/${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}\n</urlset>\n`);
console.log("built", urls.length, "pages");
