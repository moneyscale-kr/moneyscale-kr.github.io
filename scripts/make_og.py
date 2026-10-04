#!/usr/bin/env python3
"""OG 이미지(1200x630) 생성: uv run --with playwright python scripts/make_og.py  (최초 1회 `uv run --with playwright playwright install chromium`)"""
import pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
ITEMS = {
 "og-home.png": ("내 돈을 숫자로", "월급·연봉·집값 계산기", "돈의 스케일"),
 "og-salary.png": ("상위 몇 %?", "내 연봉, 대한민국에서 몇 등?", "연봉 계산기"),
 "og-apartment.png": ("몇 년?", "내 월급으로 서울 아파트까지", "아파트 계산기"),
}
T = """<body style="margin:0;width:1200px;height:630px;background:#0b0b0f;color:#f4f1ea;font-family:'Black Han Sans','Apple SD Gothic Neo',sans-serif;position:relative;overflow:hidden">
<div style="position:absolute;right:-120px;top:-160px;width:620px;height:620px;border-radius:50%;background:#17171f"></div>
<div style="position:absolute;left:0;top:0;width:100%;height:14px;background:#c8ff3d"></div>
<div style="position:absolute;left:70px;top:60px;font-size:44px;color:#c8ff3d">돈의 스케일 <span style="color:#ff5a4e">.</span> <span style="font-size:28px;color:#9a9aa8;font-family:'Apple SD Gothic Neo'">{tag}</span></div>
<div style="position:absolute;left:70px;top:190px;font-size:170px;line-height:1.05;color:#c8ff3d;letter-spacing:-4px">{big}</div>
<div style="position:absolute;left:74px;top:420px;font-size:56px;color:#ff5a4e">{sub}</div>
<div style="position:absolute;left:74px;bottom:46px;font-size:26px;color:#9a9aa8;font-family:'Apple SD Gothic Neo'">투자 권유 아님 · 추정 · @돈의스케일</div></body>"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":1200,"height":630})
    for f,(big,sub,tag) in ITEMS.items():
        pg.set_content(T.format(big=big,sub=sub,tag=tag)); pg.wait_for_timeout(300)
        pg.screenshot(path=str(root/"assets"/f))
    b.close()
print("og ok")
