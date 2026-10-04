#!/usr/bin/env python3
"""data/*.json 생성. 사용: python3 scripts/build_data.py
수치 갱신 시 아래 APARTMENT 상수 또는 nts CSV를 바꾸고 다시 실행."""
import csv, json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
CSV = pathlib.Path(__file__).with_name("nts_2024_percentile.csv")

# ---- 1) 국세청 근로소득 백분위(천분위) -> 구간 평균 점 ----
rows = []
with open(CSV, encoding="utf-8-sig") as f:
    r = csv.reader(f); next(r)
    for lab, n, tot, *_ in r:
        pct = float(re.sub(r"[^0-9.]", "", lab))   # 상위 X% 구간의 끝 (예 0.1, 1.0, 2, ... 100)
        n, tot = int(n), int(tot)                    # 인원(명), 총급여 합계(억원)
        rows.append((pct, n, tot * 1e8 / n))
rows.sort()
points, prev = [], 0.0
for pct, n, avg in rows:
    points.append([round((prev + pct) / 2, 3), round(avg)])   # [구간 중앙 백분위, 구간 평균 총급여(원)]
    prev = pct
people = sum(n for _, n, _ in rows)
total = sum(a * n for _, n, a in rows)
mean = total / people
def pct_of(s):  # 검증용 (JS와 같은 선형보간)
    for (p0, a0), (p1, a1) in zip(points, points[1:]):
        if a0 >= s >= a1:
            return p0 + (a0 - s) / (a0 - a1) * (p1 - p0)
median = None
lo, hi = 20e6, 60e6
for _ in range(60):
    mid = (lo + hi) / 2
    if pct_of(mid) > 50: lo = mid
    else: hi = mid
median = round(mid)
sal = {
  "title": "근로소득 백분위(천분위) 구간 평균",
  "basis": "2024년 귀속 근로소득 연말정산 총급여(세전, 비과세 제외)",
  "source": "국세청 국세통계 「근로소득 백분위(천분위) 자료」 (공공데이터포털 15082063)",
  "source_url": "https://www.data.go.kr/data/15082063/fileData.do",
  "asof": "2024년 귀속 (2025.12 공개)",
  "people": people, "mean_won": round(mean), "median_won": median,
  "method": "각 구간(1% 또는 0.1%)의 평균 총급여를 구간 중앙 백분위에 놓고, 사이를 직선으로 보간해요. 구간 안 분포는 모르기 때문에 ±0.1~0.3%p 안팎 오차가 있어요.",
  "points": points,
}
(ROOT / "data").mkdir(exist_ok=True)
(ROOT / "data/salary-percentile.json").write_text(json.dumps(sal, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("people", people, "mean", round(mean), "median", median, "1억 ->", round(pct_of(1e8), 2))

# ---- 2) 서울 아파트 · 월급 (facts.md 2026-10-04 조사) ----
APARTMENT = {
  "regions": [
    {"id": "med", "label": "서울 중위", "price_man": 131333, "note": "서울 아파트 중위 매매가격"},
    {"id": "avg", "label": "서울 평균", "price_man": 162469, "note": "서울 아파트 평균 매매가격"},
    {"id": "gn11", "label": "강남 11개 구 평균", "price_man": 200791, "note": "한강 이남 11개 구(KB 분류) 아파트 평균"},
  ],
  "price_source": "KB부동산 「월간 주택가격동향」",
  "price_url": "https://data.kbland.kr",
  "price_asof": "2026년 9월 (조사기준일 2026-09-14, 발표 2026-09-28)",
  "income": {
    "median_man": 288, "mean_man": 375,
    "source": "국가데이터처(구 통계청) 「2024년 임금근로일자리 소득(보수) 결과」",
    "url": "https://mods.go.kr/board.es?act=view&bid=11113&list_no=443648&mid=a10301030500",
    "asof": "2024년 12월 기준 (발표 2026-02-23), 세전",
  },
  "surplus_rate": {"pct": 30.8, "source": "국가데이터처 「가계동향조사」", "asof": "2026년 2분기 (전국 1인 이상 가구, 처분가능소득 기준)"},
  "calc": "집값 ÷ (월급 × 저축률 × 12). 이자·물가·집값 변동·세금·대출 미반영.",
}
(ROOT / "data/apartment.json").write_text(json.dumps(APARTMENT, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("apartment.json ok")
