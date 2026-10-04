(async function(){
const $ = (id)=>document.getElementById(id);
const D = await MS.json("../data/civil-pay.json");
let g = "9", h = 1;
const GL = {"5":"5급","6":"6급","7":"7급","8":"8급","9":"9급"};
$("g").innerHTML = Object.keys(GL).reverse().map(k=>`<button type="button" data-v="${k}" aria-pressed="${k===g}">${GL[k]}</button>`).join("");
function fillH(){ const mx = D.grades[g].max; if(h>mx) h=mx; $("h").innerHTML = Array.from({length:mx},(_,i)=>`<option value="${i+1}" ${i+1===h?"selected":""}>${i+1}호봉</option>`).join(""); }
$("g").onclick = (e)=>{ if(e.target.dataset.v){ g=e.target.dataset.v; [...$("g").children].forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===g)); fillH(); update(true);} };
$("h").onchange = ()=>{ h=+$("h").value; update(true); };
let cur;
const fy = (w)=>MS.nf(Math.round(w/1e4));
function update(push){
  const base = D.grades[g].pay[h-1], allow = D.allow[g], meal = D.meal, tot = base+allow+meal;
  cur = {g,h,base,allow,meal,tot};
  $("res").hidden=false;
  $("big").innerHTML = `${fy(tot)}<small>만 원</small>`;
  $("spicy").textContent = `${GL[g]} ${h}호봉, 매달 고정으로 붙는 세전 월급`;
  $("bar").style.width = Math.min(100, tot/6e6*100)+"%";
  $("tbl").innerHTML = `<tr><th>항목</th><th>월 금액(세전)</th></tr><tr><td>봉급 (${GL[g]} ${h}호봉)</td><td>${MS.nf(base)}원</td></tr><tr><td>직급보조비</td><td>${MS.nf(allow)}원</td></tr><tr><td>정액급식비</td><td>${MS.nf(meal)}원</td></tr><tr><td><b style="color:var(--lime)">매달 고정분 합계</b></td><td><b style="color:var(--lime)">${MS.nf(tot)}원</b></td></tr>`;
  $("cmp").innerHTML = [`연 환산(고정분 x 12) 약 <b>${MS.nf(Math.round(tot*12/1e4))}만 원</b>`, `명절휴가비·정근수당·시간외수당·가족수당은 별도예요`].map(t=>`<li>${t}</li>`).join("");
  MS.drawCard($("card"), {title:`2026 공무원 ${GL[g]} ${h}호봉 월급 (세전, 매달 고정분)`, big: fy(tot), unit:"만 원",
    line:"봉급 + 직급보조비 + 정액급식비", rows:[`봉급 ${MS.nf(base)}원`, `직급보조비 ${MS.nf(allow)}원 + 정액급식비 ${MS.nf(meal)}원`, "명절휴가비·정근수당·초과근무수당은 별도"],
    source:"출처 인사혁신처 2026 공무원보수규정 별표3, 공무원수당 등에 관한 규정 별표15. 세전."});
  if(push) history.replaceState(null,"",MS.shareUrl({g,h}));
}
const q = MS.q(); if (GL[q.get("g")]) g=q.get("g"); if (+q.get("h")>0) h=+q.get("h");
[...$("g").children].forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===g)); fillH(); update(false);
MS.bindShare({canvas:$("card"), getUrl:()=>MS.shareUrl({g:cur.g,h:cur.h}), getText:()=>`2026 공무원 ${GL[cur.g]} ${cur.h}호봉 월급(세전 고정분) 약 ${fy(cur.tot)}만 원 - 돈의 스케일`, filename:"money-scale-civil-pay.png"});
// 전체표
const mx = Math.max(...Object.values(D.grades).map(x=>x.max));
let t = `<tr><th>호봉</th>${Object.keys(GL).reverse().map(k=>`<th>${GL[k]}</th>`).join("")}</tr>`;
for(let i=1;i<=mx;i++) t += `<tr><td>${i}</td>${Object.keys(GL).reverse().map(k=>`<td>${D.grades[k].pay[i-1]?MS.nf(D.grades[k].pay[i-1]):"-"}</td>`).join("")}</tr>`;
$("full").innerHTML = t;
})();
