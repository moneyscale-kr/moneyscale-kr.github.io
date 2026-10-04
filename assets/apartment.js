(async function(){
const $ = (id)=>document.getElementById(id);
const D = await MS.json("../data/apartment.json");
const R = D.regions, thisYear = new Date().getFullYear();
let region = "med", tax = "g";
$("reg").innerHTML = R.map(r=>`<button type="button" data-v="${r.id}" aria-pressed="${r.id===region}">${r.label}</button>`).join("");
$("chips").innerHTML = `<button type="button" class="chip" data-v="${D.income.median_man}">중위 ${D.income.median_man}만</button><button type="button" class="chip" data-v="${D.income.mean_man}">평균 ${D.income.mean_man}만</button><button type="button" class="chip" data-v="400">400만</button><button type="button" class="chip" data-v="600">600만</button>`;
$("chips").onclick = (e)=>{ const v=e.target.dataset.v; if(v){ $("inc").value=v; setTax("g"); update(true);} };
function setTax(t){ tax=t; [...$("tax").children].forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===t)); }
$("tax").onclick = (e)=>{ if(e.target.dataset.v){ setTax(e.target.dataset.v); update(true);} };
$("reg").onclick = (e)=>{ if(e.target.dataset.v){ region=e.target.dataset.v; [...$("reg").children].forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===region)); update(true);} };
$("inc").addEventListener("input", ()=>{ const el=$("inc"); const d=el.value.replace(/[^0-9]/g,""); el.value=d?MS.nf(+d):""; update(true); });
$("sv").addEventListener("input", ()=>update(true));
const years = (price_man, m, sv)=> price_man/(m*sv/100*12);
const fy = (y)=> y<10 ? y.toFixed(1) : String(Math.round(y));
const spicy = (y)=> y<=10 ? "이 정도면 현실적인 계획이에요" : y<=25 ? "한 세대의 절반, 길지만 가능한 숫자예요" : y<=40 ? "직장 생활 전부를 넣어야 해요" : y<=80 ? "혼자 모으기엔 평생이 모자라요" : y<=150 ? "숫자만 보면 조선 말기부터 모아야 해요" : "다음 생에서도 모아야 해요";
let cur=null;
function update(push){
  const m = +$("inc").value.replace(/[^0-9]/g,""); if(!m){ $("res").hidden=true; return; }
  const sv = +$("sv").value; $("svv").textContent = sv+"%";
  const rg = R.find(r=>r.id===region), y = years(rg.price_man, m, sv), mon = Math.round(y*12);
  const yAll = years(rg.price_man, m, 100);
  cur = {m, sv, region, tax, y, mon, rg};
  $("res").hidden=false;
  $("big").innerHTML = `${fy(y)}<small>년</small>`;
  $("spicy").textContent = spicy(y);
  const LIFE = 40; $("bar").style.width = Math.min(100, y/LIFE*100)+"%";
  $("barend").textContent = y>LIFE ? `근로 40년의 ${(y/LIFE).toFixed(1)}배` : "근로 40년(25~65세)";
  const buy = thisYear + Math.ceil(y), past = Math.round(thisYear - y);
  const saveMan = m*sv/100;
  const cmp = [
    `집을 사는 해는 <b>${buy}년</b> (${MS.nf(mon)}개월 모은 뒤)`,
    `매달 <b>${MS.nf(saveMan,1)}만 원</b>씩 저축 · 월급 전부를 모으면 <b>${fy(yAll)}년</b>`,
    `한 달 저축은 ${rg.label} 집값의 <b>${(saveMan/rg.price_man*100).toFixed(2)}%</b>`,
    y>=40 ? `${thisYear}년에서 ${fy(y)}년 거꾸로 가면 ${past}년${past>=1897&&past<=1910?" (대한제국 시절)":""}` : `근로 40년 중 <b>${(y/40*100).toFixed(0)}%</b>를 집 한 채에 써요`];
  $("cmp").innerHTML = cmp.map(t=>`<li>${t}</li>`).join("");
  $("tbl").innerHTML = `<tr><th>지역</th><th>집값</th><th>걸리는 시간</th></tr>` + R.map(r=>`<tr><td>${r.label}</td><td>${MS.won(r.price_man*1e4)}</td><td>${fy(years(r.price_man,m,sv))}년</td></tr>`).join("");
  const i = D.income;
  $("src").innerHTML = `<b>출처</b> 집값: ${D.price_source}, ${D.price_asof}<br>소득 참고: ${i.source} — 월 중위 ${i.median_man}만 · 평균 ${i.mean_man}만, ${i.asof}<br>저축률 참고: 가구 흑자율 ${D.surplus_rate.pct}% (${D.surplus_rate.source}, ${D.surplus_rate.asof})
   <details><summary>계산 방법</summary>${D.calc} 강남 11개 구는 KB 분류의 한강 이남 11개 구예요. ${tax==="n"?"실수령 기준으로 입력한 값이라 중위·평균(세전)과 직접 비교는 어려워요.":""}</details>
   <div class="warn">${MS.DISCLAIMER} · 월급·저축률은 가정이에요. 집값 전망이 아니에요.</div>`;
  draw();
  if (push) history.replaceState(null,"", url());
}
const url = ()=>MS.shareUrl({m: cur.m*1e4, t: cur.tax, sv: cur.sv, a: cur.region});
function draw(){ const x=cur; MS.drawCard($("card"), {
  title: `월급 ${MS.nf(x.m)}만 원(${x.tax==="n"?"실수령":"세전"}), 저축 ${x.sv}%로 ${x.rg.label} 아파트까지`,
  big: fy(x.y), unit: "년", line: spicy(x.y),
  rows: [`${thisYear + Math.ceil(x.y)}년에 내 집, ${MS.nf(x.mon)}개월 저축`, `${x.rg.label} ${MS.won(x.rg.price_man*1e4)}`, `월급 전부 모으면 ${fy(years(x.rg.price_man,x.m,100))}년`],
  source: `출처 ${D.price_source} ${D.price_asof}. 이자·대출·집값 변동 미반영 단순 계산.`,
}); }
MS.bindShare({canvas:$("card"), getUrl:()=>url(), getText:()=>`월급 ${MS.nf(cur.m)}만 원으로 ${cur.rg.label} 아파트까지 ${fy(cur.y)}년 - 돈의 스케일`, filename:"money-scale-apartment.png"});
const q = MS.q(), m0 = +q.get("m");
if (m0>0){ $("inc").value = MS.nf(Math.round(m0/1e4)); if(q.get("sv")) $("sv").value = Math.min(100,Math.max(5,+q.get("sv")));
  if (R.some(r=>r.id===q.get("a"))){ region=q.get("a"); [...$("reg").children].forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===region)); }
  if (q.get("t")==="n") setTax("n"); update(false); }
})();
