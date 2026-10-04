(async function(){
const $ = (id)=>document.getElementById(id);
const D = await MS.json("../data/salary-percentile.json");
const pts = D.points; // [mid pct, avg won], pct 오름차순 = 연봉 내림차순
function percentile(s){
  if (s >= pts[0][1]) return {p:pts[0][0]*2, top:true};      // 0.1% 구간 평균 이상 -> 상위 0.1% 이내
  if (s <= pts[pts.length-1][1]) return {p:100};
  for (let i=0;i<pts.length-1;i++){ const [p0,a0]=pts[i],[p1,a1]=pts[i+1];
    if (a0>=s && s>=a1) return {p: p0 + (a0-s)/(a0-a1)*(p1-p0)}; }
}
MS.percentile = percentile;
const chipVals=[[3000,"3천"],[5000,"5천"],[7000,"7천"],[10000,"1억"],[20000,"2억"]];
$("chips").innerHTML = chipVals.map(([v,l])=>`<button type="button" class="chip" data-v="${v}">${l}</button>`).join("");
$("chips").onclick = (e)=>{ const v=e.target.dataset.v; if(v){ $("sal").value=v; update(true);} };
$("sal").addEventListener("input", ()=>{ const el=$("sal"); const d=el.value.replace(/[^0-9]/g,""); el.value = d? MS.nf(+d):""; update(true); });
const spicyFor = (p)=> p<=1 ? "이건 평균이 아니라 꼭대기예요" : p<=3 ? "친구들 사이에서도 손에 꼽혀요" : p<=10 ? "억대 문턱 근처, 상위 10%예요" : p<=30 ? "상위권, 근데 위에 아직 많아요" : p<=50 ? "딱 가운데보다 위예요" : p<=65 ? "평균엔 못 미치지만 절반은 넘겨요" : "숫자는 숫자일 뿐, 월급은 오르니까요";
let cur=null;
function compute(sal){
  const r = percentile(sal), p = r.p;
  const label = r.top ? "0.1" : (p<10 ? p.toFixed(1) : String(Math.round(p)));
  const above = Math.round(D.people * p/100 / 1e4);
  return {sal,p,label,top:!!r.top,above, mult: sal/D.median_won, vsMean: sal/D.mean_won};
}
function update(push){
  const raw = +$("sal").value.replace(/[^0-9]/g,"")*1e4; if (!raw){ $("res").hidden=true; return; }
  const s = Math.min(raw, 1e12); cur = compute(s);
  $("res").hidden=false;
  const x = cur;
  $("big").innerHTML = `${x.top?"":"상위 "}${x.top?"상위 0.1":x.label}<small>% ${x.top?"이내":""}</small>`;
  $("spicy").textContent = spicyFor(x.p);
  $("bar").style.width = Math.max(2,100-x.p)+"%";
  const cmp = [
    `중위 연봉(약 ${MS.won(D.median_won)})의 <b>${x.mult.toFixed(1)}배</b>`,
    `평균 연봉(약 ${MS.won(D.mean_won)})의 <b>${x.vsMean.toFixed(1)}배</b>`,
    `나보다 많이 버는 사람 약 <b>${MS.nf(x.above)}만 명</b> (전체 ${MS.nf(Math.round(D.people/1e4))}만 명 중)`];
  $("cmp").innerHTML = cmp.map(t=>`<li>${t}</li>`).join("");
  $("src").innerHTML = `<b>출처</b> ${D.source} · 기준 ${D.asof}<br>대상: ${D.basis}. 연중 입·퇴사자 포함, 임금근로일자리 통계와 달라요.
   <details><summary>계산 방법</summary>${D.method} 1억 원은 약 상위 7.3~7.4%(국세청 발표 7.3%).</details>
   <div class="warn">${MS.DISCLAIMER} · 총급여(세전) 기준이며 사업·금융·부동산 소득은 포함하지 않아요.</div>`;
  draw();
  if (push) history.replaceState(null,"", MS.shareUrl({s: Math.round(s)}));
}
const ctx = ()=>cur;
function line(x){ return `내 연봉 ${MS.won(x.sal)}, 대한민국 상위 ${x.top?"0.1% 이내":x.label+"%"}`; }
function draw(){ const x=cur; MS.drawCard($("card"), {
  title: `내 연봉 ${MS.won(x.sal)}(세전)은 대한민국 근로자 중`,
  big: (x.top?"0.1":x.label), unit: x.top? "% 이내":"%", line: spicyFor(x.p),
  rows: [`중위 연봉의 ${x.mult.toFixed(1)}배 (중위 ${MS.won(D.median_won)})`, `나보다 많이 버는 사람 약 ${MS.nf(x.above)}만 명`, `근로소득 신고자 ${MS.nf(Math.round(D.people/1e4))}만 명 기준`],
  source: `출처 ${D.source}, ${D.asof}. 구간 평균 보간 추정. 상위 %로 표시.`,
}); }
MS.bindShare({canvas:$("card"), getUrl:()=>MS.shareUrl({s:Math.round(cur.sal)}), getText:()=>line(cur)+" - 돈의 스케일", filename:"money-scale-salary.png"});
const s0 = +MS.q().get("s"); if (s0>0){ $("sal").value = MS.nf(Math.round(s0/1e4)); update(false); }
})();
