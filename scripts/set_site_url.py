#!/usr/bin/env python3
"""배포 주소 일괄 치환. 사용: python3 scripts/set_site_url.py money-scale.github.io  (또는 user.github.io/repo)
SITE_URL 자리표시자(첫 실행) 또는 직전에 넣은 주소(.site_url 파일)를 새 주소로 바꿈."""
import sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
new = sys.argv[1].replace("https://", "").rstrip("/")
mark = root / ".site_url"
old = mark.read_text().strip() if mark.exists() else "SITE_URL"
n = 0
for p in list(root.glob("*.html")) + list(root.glob("*/index.html")) + [root/"sitemap.xml", root/"robots.txt"]:
    t = p.read_text(encoding="utf-8"); u = t.replace("https://" + old, "https://" + new)
    if u != t: p.write_text(u, encoding="utf-8"); n += 1
mark.write_text(new); print("updated", n, "files ->", new)
