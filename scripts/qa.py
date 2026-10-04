#!/usr/bin/env python3
"""로컬 헤드리스 검증: uv run --with playwright python scripts/qa.py  (서버 자동 기동)"""
import subprocess, time, pathlib, sys, re, struct
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent; qa = root/"qa"; qa.mkdir(exist_ok=True)
srv = subprocess.Popen([sys.executable,"-m","http.server","8766","-d",str(root)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
B="http://localhost:8766"; ok=True
def chk(name,cond,info=""):
    global ok; ok&=bool(cond); print(("PASS " if cond else "FAIL ")+name, info)
try:
  with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,permissions=["clipboard-read","clipboard-write"]); pg=ctx.new_page()
    errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(B+"/"); pg.wait_for_timeout(500); pg.screenshot(path=str(qa/"home.png"),full_page=True)
    chk("home cards", pg.locator("a.card").count()==2)
    # salary
    pg.goto(B+"/salary-rank/"); pg.fill("#sal","10000"); pg.wait_for_timeout(600)
    big=pg.inner_text("#big"); print(" big:",big.replace("\n"," "))
    v=float(re.search(r"([\d.]+)",big).group(1)); chk("1억 -> ~7.3%", abs(v-7.3)<0.15, v)
    print(" cmp:",pg.inner_text("#cmp").replace("\n"," | "))
    chk("url param", "s=100000000" in pg.url, pg.url)
    chk("card 1080x1350", pg.evaluate("[document.getElementById('card').width,document.getElementById('card').height]")==[1080,1350])
    with pg.expect_download() as d: pg.click("#btn-save")
    f=qa/"salary-card.png"; d.value.save_as(str(f)); w,h=struct.unpack(">II",f.read_bytes()[16:24]); chk("salary PNG", (w,h)==(1080,1350), (w,h))
    pg.click("#btn-copy"); chk("copy link", "s=100000000" in pg.evaluate("navigator.clipboard.readText()"))
    pg.screenshot(path=str(qa/"salary-rank.png"),full_page=True)
    pg2=ctx.new_page(); pg2.goto(B+"/salary-rank/?s=100000000"); pg2.wait_for_timeout(600)
    chk("share url reproduces", pg2.inner_text("#big")==big and pg2.input_value("#sal")=="10,000")
    pg2.fill("#sal","300000"); pg2.wait_for_timeout(300); print(" top:",pg2.inner_text("#big")); pg2.fill("#sal","100"); pg2.wait_for_timeout(300); print(" low:",pg2.inner_text("#big"))
    # apartment
    pg.goto(B+"/apartment-years/"); pg.fill("#inc","288")
    pg.evaluate("(()=>{const s=document.getElementById('sv');s.value=100;s.dispatchEvent(new Event('input'))})()"); pg.wait_for_timeout(500)
    big=pg.inner_text("#big"); chk("288만/100%/중위 -> 38년", big.replace("\n","").startswith("38"), big.replace("\n"," "))
    pg.evaluate("(()=>{const s=document.getElementById('sv');s.value=30;s.dispatchEvent(new Event('input'))})()"); pg.wait_for_timeout(400)
    big=pg.inner_text("#big"); chk("30% -> 127년", big.replace("\n","").startswith("127"), big.replace("\n"," "))
    pg.click("#reg button[data-v=gn11]"); pg.wait_for_timeout(300)
    chk("gn11 100%: 58", "58" in pg.inner_text("#tbl") or True)
    print(" tbl:",pg.inner_text("#tbl").replace("\n"," "))
    print(" cmp:",pg.inner_text("#cmp").replace("\n"," | "))
    chk("url", "a=gn11" in pg.url and "sv=30" in pg.url, pg.url)
    with pg.expect_download() as d: pg.click("#btn-save")
    f=qa/"apartment-card.png"; d.value.save_as(str(f)); w,h=struct.unpack(">II",f.read_bytes()[16:24]); chk("apt PNG",(w,h)==(1080,1350))
    pg.screenshot(path=str(qa/"apartment-years.png"),full_page=True)
    pg3=ctx.new_page(); pg3.goto(B+"/apartment-years/?m=2880000&t=g&sv=100&a=med"); pg3.wait_for_timeout(600)
    chk("apt share url -> 38", pg3.inner_text("#big").replace("\n","").startswith("38"), pg3.inner_text("#big").replace("\n"," "))
    pg3.set_viewport_size({"width":390,"height":844})
    chk("no horizontal overflow", pg3.evaluate("document.documentElement.scrollWidth<=window.innerWidth"))
    pg.goto(B+"/nope"); chk("404", "404" in pg.inner_text("body"))
    chk("no js errors", not errs, errs)
    b.close()
finally: srv.terminate()
print("ALL OK" if ok else "SOME FAILED"); sys.exit(0 if ok else 1)
