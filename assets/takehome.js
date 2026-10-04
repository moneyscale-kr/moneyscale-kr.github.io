(async function(){
const $ = (id)=>document.getElementById(id);
const T = await MS.json("../data/simplified-tax-2026.json");
const N = (s)=> +String(s).replace(/[^0-9.]/g,"") || 0;
let mode = "m", cur = null;
$("fam").innerHTML = Array.from({length:11},(_,i)=>`<option value="${i+1}">${i+1}명${i===0?" (본인만)":""}</option>`).join("");
$("kid").innerHTML = Array.from({length:6},(_,i)=>`<option value="${i}">${i}명</option>`).join("");
const chipVals=[[250,"250만"],[300,"300만"],[400,"400만"],[500,"500만"],[700,"700만"]];
$("chips").innerHTML = chipVals.map(([v,l])=>`<button type="button" class="chip" data-v="${v}">${l}</button>`).join("");
$("chips").onclick = (e)=>{ const v=e.target.dataset.v; if(v){ if(mode==="y"){ setMode("m"); } $("sal").value=v; update(true);} };
function setMode(m){ mode=m; [...$("mode").children].forEach(b=>b.setAttribute("aria-pressed", b.dataset.v===m)); $("sal").placeholder = m==="m"?"300":"4200"; $("lab").textContent = m==="m"?"월 급여 (세전)":"연봉 (세전, 12로 나눔)"; }
$("mode").onclick = (e)=>{ if(e.target.dataset.v){ setMode(e.target.dataset.v); update(true);} };
$("sal").addEventListener("input", ()=>{ const el=$("sal"); const d=el.value.replace(/[^0-9]/g,""); el.value = d?MS.nf(+d):""; update(true); });
$("nt").addEventListener("input", ()=>{ const el=$("nt"); const d=el.value.replace(/[^0-9]/g,""); el.value = d?MS.nf(+d):""; update(true); });
$("fam").onchange = $("kid").onchange = ()=>update(true);
const man = (w)=> MS.nf(Math.round(w/1e4)) ;
const row = (n,v,sub)=>`<tr><td>${n}${sub?`<br><small style="color:var(--mute)">${sub}</small>`:""}</td><td>${MS.nf(v)}원</td></tr>`;
function update(push){
  const v = N($("sal").value); if(!v){ $("res").hidden=true; return; }
  const gross = Math.round((mode==="y" ? v/12 : v) * 1e4), nontax = Math.round(N($("nt").value)*1e4);
  const fam = +$("fam").value;
  const r = MSTax.calc({gross, nontax, family:fam, kids:+$("kid").value}, T);
  cur = {r, mode, v, fam, kids:+$("kid").value, nt:N($("nt").value)};
  $("res").hidden=false;
  $("big").innerHTML = `${MS.nf(Math.round(r.net/1e4))}<small>만 원</small>`;
  $("spicy").textContent = `세전 ${man(r.gross)}만 원 중 ${MS.nf(Math.round(r.total/1e4))}만 원(${(r.rate*100).toFixed(1)}%)이 4대보험·세금으로 빠져요`;
  $("bar").style.width = Math.max(2,(r.net/r.gross)*100)+"%";
  $("tbl").innerHTML = `<tr><th>항목</th><th>월 금액</th></tr>`
   + row("월 급여(세전)", r.gross) + (r.nontax?row("- 비과세(식대 등)", r.nontax,"과세·보험 기준에서 제외"):"")
   + row("국민연금 4.75%", r.pension, `기준소득월액 ${MS.nf(Math.min(Math.max(r.taxable,MSTax.RATES.pensionMin),MSTax.RATES.pensionMax))}원`)
   + row("건강보험 3.595%", r.health) + row("장기요양 (건강보험료의 13.14%)", r.ltc) + row("고용보험 0.9%", r.employ)
   + row("소득세 (간이세액표)", r.incomeTax, `공제대상가족 ${fam}명${cur.kids?`, 8~20세 자녀 ${cur.kids}명 공제`:""}`) + row("지방소득세 (소득세의 10%)", r.localTax)
   + `<tr><td><b>공제 합계</b></td><td><b>${MS.nf(r.total)}원</b></td></tr><tr><td><b style="color:var(--lime)">예상 실수령액</b></td><td><b style="color:var(--lime)">${MS.nf(r.net)}원</b></td></tr>`;
  $("cmp").innerHTML = [`연 환산 실수령 약 <b>${MS.nf(Math.round(r.net*12/1e4))}만 원</b>`, `4대보험 합계 <b>${MS.nf(r.pension+r.health+r.ltc+r.employ)}원</b> · 세금 합계 <b>${MS.nf(r.incomeTax+r.localTax)}원</b>`].map(t=>`<li>${t}</li>`).join("");
  draw();
  if(push) history.replaceState(null,"",url());
}
const url = ()=>MS.shareUrl({s: Math.round(cur.v*1e4), m: cur.mode, n: Math.round(cur.nt*1e4), f: cur.fam, k: cur.kids});
function draw(){ const {r} = cur; MS.drawCard($("card"), {
  title: `${cur.mode==="y"?"연봉 "+MS.won(cur.v*1e4):"월 급여 "+MS.won(cur.v*1e4)}(세전) 직장인의 통장에 찍히는 돈`,
  big: MS.nf(Math.round(r.net/1e4)), unit: "만 원", line: `월 ${MS.nf(Math.round(r.total/1e4))}만 원(${(r.rate*100).toFixed(1)}%)은 4대보험·세금`,
  rows: [`4대보험 ${MS.nf(Math.round((r.pension+r.health+r.ltc+r.employ)/1e4*10)/10,1)}만 원`, `소득세·지방세 ${MS.nf(Math.round((r.incomeTax+r.localTax)/1e4*10)/10,1)}만 원`, `공제대상 ${cur.fam}명, 비과세 ${MS.nf(cur.nt)}만 원 기준`],
  source: "출처 2026 4대보험 요율(국민연금·건보·고용), 소득세법 시행령 별표2 간이세액표(2026.2.27 개정). 추정치.",
}); }
MS.bindShare({canvas:$("card"), getUrl:()=>url(), getText:()=>`월 ${MS.won(cur.v*1e4)}(세전) -> 실수령 약 ${MS.nf(Math.round(cur.r.net/1e4))}만 원`+" - 돈의 스케일", filename:"money-scale-takehome.png"});
const q = MS.q(); if (q.get("s")){ if(q.get("m")==="y") setMode("y"); $("sal").value = MS.nf(Math.round(+q.get("s")/1e4)); if(q.get("n")!==null) $("nt").value = MS.nf(Math.round(+q.get("n")/1e4)); if(q.get("f")) $("fam").value=q.get("f"); if(q.get("k")) $("kid").value=q.get("k"); update(false); }
else { $("nt").value = "20"; }
})();
