/* 돈의 스케일 공용: 포맷, 쿼리, 카드(canvas 1080x1350) 렌더, 공유 */
(function(){
const MS = window.MS = {};
MS.YT = "https://www.youtube.com/@돈의스케일";
MS.IG = "https://www.instagram.com/money.scale.kr/";
MS.HANDLE = "@돈의스케일 · IG @money.scale.kr";
MS.DISCLAIMER = "투자 권유 아님 · 추정";
MS.json = (p) => fetch(p).then(r => r.json());
MS.q = () => new URLSearchParams(location.search);
MS.nf = (n, d=0) => Number(n).toLocaleString("ko-KR", {maximumFractionDigits:d, minimumFractionDigits:d});
// 원 -> "1억 2,345만 원"
MS.won = (w) => {
  w = Math.round(w/1e4)*1e4; const eok = Math.floor(w/1e8), man = Math.round((w - eok*1e8)/1e4);
  if (!eok) return MS.nf(man) + "만 원";
  return eok + "억" + (man ? " " + MS.nf(man) + "만" : "") + " 원";
};
MS.setSeo = () => {};
MS.toast = (m) => { const t = document.getElementById("toast"); if (t){ t.textContent = m; setTimeout(()=>{ if(t.textContent===m) t.textContent=""; }, 3500);} };

/* ---- 카드 ---- */
const W = 1080, H = 1350, LIME="#C8FF3D", CORAL="#FF5A4E", INK="#0B0B0F", PAPER="#F4F1EA", MUTE="#9A9AA8";
const DISP = '"Black Han Sans","Anton","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
const BODY = '"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
function wrap(ctx, text, maxW){
  const lines=[]; let cur="";
  for (const ch of text){ if (ch==="\n"){lines.push(cur);cur="";continue;}
    if (ctx.measureText(cur+ch).width>maxW && cur){ lines.push(cur); cur=ch.trim()?ch:""; } else cur+=ch; }
  if (cur) lines.push(cur); return lines;
}
/* spec: {kicker, title, big, unit, line, rows:[str], source, url} */
MS.drawCard = async function(canvas, spec){
  const all = [spec.title, spec.big, spec.unit, spec.line, "돈의 스케일"].join("");  // 글리프 서브셋 로드 보장
  try { await Promise.all([document.fonts.load('80px "Black Han Sans"', all), document.fonts.load('80px "Anton"', all)]); } catch(e){}
  canvas.width = W; canvas.height = H; const c = canvas.getContext("2d"); const P = 72;
  c.fillStyle = INK; c.fillRect(0,0,W,H);
  c.fillStyle = LIME; c.fillRect(0,0,W,14);
  c.fillStyle = "#17171F"; c.beginPath(); c.arc(W+40,-40,420,0,7); c.fill();
  c.textBaseline = "alphabetic"; c.textAlign = "left";
  c.font = `64px ${DISP}`; c.fillStyle = LIME; c.fillText("돈의 스케일", P, 130);
  c.fillStyle = CORAL; c.fillRect(P+ c.measureText("돈의 스케일").width + 16, 96, 22, 22);
  c.font = `700 40px ${BODY}`; c.fillStyle = MUTE;
  let y = 230; for (const l of wrap(c, spec.title, W-2*P)) { c.fillText(l, P, y); y += 54; }
  // big number auto-fit
  let fs = 340; c.font = `${fs}px ${DISP}`;
  const unitFs = 90; c.font = `${unitFs}px ${DISP}`; const uw = spec.unit ? c.measureText(spec.unit).width + 20 : 0;
  while (fs > 90){ c.font = `${fs}px ${DISP}`; if (c.measureText(spec.big).width + uw <= W-2*P) break; fs -= 6; }
  y = Math.max(y + 40, 380) + fs*0.82; c.font = `${fs}px ${DISP}`; c.fillStyle = LIME; c.fillText(spec.big, P, y);
  const bw = c.measureText(spec.big).width;
  if (spec.unit){ c.font = `${unitFs}px ${DISP}`; c.fillStyle = PAPER; c.fillText(spec.unit, P + bw + 20, y); }
  y += 90; c.font = `62px ${DISP}`; c.fillStyle = CORAL;
  for (const l of wrap(c, spec.line, W-2*P)) { c.fillText(l, P, y); y += 80; }
  y += 14; c.font = `600 38px ${BODY}`;
  for (const r of (spec.rows||[]).slice(0,3)){ c.fillStyle = LIME; c.fillRect(P, y-26, 10, 34); c.fillStyle = PAPER;
    const ls = wrap(c, r, W-2*P-34); ls.forEach((l,i)=>{ c.fillText(l, P+30, y); y += 50; }); y += 8; }
  // footer
  c.fillStyle = "#2A2A36"; c.fillRect(P, H-210, W-2*P, 2);
  c.font = `500 27px ${BODY}`; c.fillStyle = MUTE; let fy = H-165;
  for (const l of wrap(c, spec.source, W-2*P).slice(0,3)) { c.fillText(l, P, fy); fy += 38; }
  c.fillStyle = CORAL; c.font = `700 27px ${BODY}`; c.fillText(MS.DISCLAIMER, P, H-44);
  c.textAlign = "right"; c.fillStyle = LIME; c.fillText(spec.url || MS.HANDLE, W-P, H-44);
  return canvas;
};
MS.cardBlob = (canvas) => new Promise(res => canvas.toBlob(res, "image/png"));

/* ---- 공유 ---- */
MS.bindShare = function({canvas, getUrl, getText, filename}){
  const $ = (id) => document.getElementById(id);
  $("btn-share").onclick = async () => {
    const url = getUrl(), text = getText(); const blob = await MS.cardBlob(canvas);
    const file = new File([blob], filename || "money-scale.png", {type:"image/png"});
    try {
      if (navigator.canShare && navigator.canShare({files:[file]})) { await navigator.share({files:[file], text: text + "\n" + url}); return; }
      if (navigator.share) { await navigator.share({text, url}); return; }
    } catch(e){ if (e && e.name === "AbortError") return; }
    MS.copy(url);
  };
  $("btn-save").onclick = async () => {
    const a = document.createElement("a"); a.download = filename || "money-scale.png";
    a.href = URL.createObjectURL(await MS.cardBlob(canvas)); a.click(); MS.toast("카드 이미지를 저장했어요");
  };
  $("btn-copy").onclick = () => MS.copy(getUrl());
};
MS.copy = async (u) => {
  try { await navigator.clipboard.writeText(u); } catch(e){ const t=document.createElement("textarea"); t.value=u; document.body.appendChild(t); t.select(); try{document.execCommand("copy")}catch(_){} t.remove(); }
  MS.toast("링크를 복사했어요");
};
MS.shareUrl = (params) => { const u = new URL(location.href); u.search = new URLSearchParams(params).toString(); u.hash=""; return u.toString(); };
})();
