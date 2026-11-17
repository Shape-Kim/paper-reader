#!/usr/bin/env python3
"""논문 대화·홈 대화에서 Claude가 쓰는 도구: OpenAlex에서 실제 논문 후보를 한 번에 모은다(LLM 없음).

사용: python3 find_papers.py "검색어" ["검색어2" …] [--paper <arXiv ID>] [--title "아는 제목"]… [--from 연도] [--hot]
- 검색어: 영어 키워드 구(서로 다른 각도로 2~4개가 좋다)
- --paper: 그 논문의 OpenAlex 관련 논문도 더한다(비슷한 논문 찾기)
- --title: 정확한 제목을 아는 논문을 직접 찾는다
- --from: 그 해 이후 논문만
- --hot: 최근 7일 Hugging Face 인기 논문도 더한다(「요즘 핫한」 질문)
출력: 후보 최대 40편 — 제목 · arXiv ID(없으면 DOI) · 연도 · 발표처 · 소속(앞 3곳, 없으면 「미확인」) · 인용 수 · 초록 앞부분.
학위논문·정오표·부속물·심사평은 빼고, 저장소(Zenodo 등)에만 있는 글은 [저장소]로 표시한다.
OpenAlex를 못 쓰거나(무료 한도 소진 등) 0편이면 arXiv API로 대신 찾는다(호출 최대 2번, 소속·인용 수 없음).
OpenAlex API 키: 환경 변수 OPENALEX_API_KEY 또는 이 파일 옆 openalex_key.txt 첫 줄(없으면 IP 공용 무료 한도).
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import server  # noqa: E402  (http·arXiv·HF 피드를 같이 쓴다. import만으로는 서버가 뜨지 않는다)

OA_SELECT = ("id,title,publication_year,cited_by_count,doi,locations,abstract_inverted_index,authorships,"
             "related_works,type,primary_location")
SKIP_TYPES = {"erratum", "paratext", "dissertation", "peer-review", "retraction", "editorial", "letter", "supplementary-materials"}
NO_VENUE = {"arxiv (cornell university)", "arxiv", "arxiv.org"}  # 발표처 정보가 없는 것과 같다
STOPWORDS = {"a", "an", "the", "of", "for", "and", "or", "in", "on", "with", "to", "via", "using", "based", "by",
             "from", "at", "as", "into", "towards", "toward", "is", "are"}


def oa_key():
    key = os.environ.get("OPENALEX_API_KEY", "").strip()
    if not key:
        try:
            words = (ROOT / "openalex_key.txt").read_text(encoding="utf-8").split()
            key = words[0] if words else ""
        except OSError:
            key = ""
    return key


def oa_get(params):
    headers = {"User-Agent": server.UA}
    key = oa_key()
    if key:
        headers["Authorization"] = "Bearer " + key  # 주소에 싣지 않는다(기록·오류문에 남지 않게)
    req = urllib.request.Request("https://api.openalex.org/works?" + urllib.parse.urlencode(params), headers=headers)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read()).get("results", [])


def err_kind(e):
    return f"HTTP {e.code}" if isinstance(e, urllib.error.HTTPError) else type(e).__name__


def oa_item(w):
    aid = None
    doi = w.get("doi") or ""
    m = re.search(r"10\.48550/arxiv\.(.+)$", doi, re.I)
    if m:
        aid = m.group(1)
    for loc in w.get("locations") or []:
        m = re.search(r"arxiv\.org/(?:abs|pdf)/([^\s?#v]+(?:v\d+)?)", loc.get("landing_page_url") or "")
        if m and not aid:
            aid = re.sub(r"v\d+$", "", m.group(1))
    inv = w.get("abstract_inverted_index") or {}
    abstract = " ".join(wd for _, wd in sorted((i, wd) for wd, idx in inv.items() for i in idx))
    insts = []
    for a in w.get("authorships") or []:
        for ins in a.get("institutions") or []:
            name = (ins.get("display_name") or "").strip()
            if name and name not in insts:
                insts.append(name)
    src = ((w.get("primary_location") or {}).get("source") or {})
    venue = (src.get("display_name") or "").strip()
    repo = src.get("type") == "repository" and venue.lower() not in NO_VENUE
    if venue.lower() in NO_VENUE:
        venue = ""
    return {"id": aid, "title": re.sub(r"\s+", " ", w.get("title") or "").strip(),
            "year": w.get("publication_year"), "cites": w.get("cited_by_count") or 0,
            "doi": doi, "venue": venue, "repo": repo, "insts": insts[:3], "type": w.get("type") or "",
            "abstract": re.sub(r"\s+", " ", abstract).strip()}


def arxiv_terms(q):
    """영어 검색어 → arXiv 낱말 AND 조건(불용어·한글 빼고 앞 5낱말). 낱말이 없으면 None."""
    words = [w for w in re.findall(r"[A-Za-z0-9][A-Za-z0-9\-]*", q) if w.lower() not in STOPWORDS][:5]
    if not words:
        return None
    return " AND ".join(f'all:"{w}"' if "-" in w else f"all:{w}" for w in words)


def arxiv_fallback(queries, titles, from_year):
    """OpenAlex 대신 arXiv API. 제목들을 한 번, 검색어들을 한 번(각각 OR로 묶어) — 최대 2번 부른다."""
    calls = []
    tq = []
    for t in titles[:4]:
        t = re.sub(r"\s+", " ", re.sub(r'["()\[\]:]', " ", t)).strip()
        if len(t.split()) >= 3:
            tq.append(f'ti:"{t}"')
    if tq:
        calls.append((" OR ".join(tq), 2 * len(tq)))
    qq = [x for x in (arxiv_terms(q) for q in queries[:4]) if x]
    if qq:
        calls.append((" OR ".join(f"({x})" for x in qq), 25 if from_year else 20))
    items, err = [], None
    for query, n in calls:
        try:
            res = server.arxiv_search(query, n)
        except Exception as e:  # noqa: BLE001
            err = err_kind(e)
            break
        for r in res:
            year = (r.get("date") or "")[:4]
            if from_year and year.isdigit() and int(year) < from_year:
                continue
            items.append({"id": r["id"], "title": r["title"], "year": year, "cites": None, "doi": "", "venue": "",
                          "repo": False, "insts": [], "type": "arxiv", "authors": r.get("authors", ""),
                          "abstract": r.get("summary", "")})
    return items, err, len(calls)


def gather(queries, titles, from_year=None, paper=None, hot=False, limit=40):
    """→ (후보 목록, 상황 정보 dict)"""
    yf = {"filter": f"from_publication_date:{from_year}-01-01"} if from_year else {}
    jobs = [("oa", dict(search=q, per_page=10, select=OA_SELECT, **yf)) for q in queries]
    jobs += [("oa", dict(filter="title.search:" + re.sub(r"[,:|]", " ", t), per_page=2, select=OA_SELECT)) for t in titles]
    if paper:
        jobs.append(("me", dict(filter=f"doi:10.48550/arxiv.{paper}", select=OA_SELECT)))
    if hot:
        jobs += [("hf", time.strftime("%Y-%m-%d", time.localtime(time.time() - 86400 * k))) for k in range(1, 8)]

    def run(job):
        kind, arg = job
        try:
            return kind, (server.get_feed("hf", None, arg) if kind == "hf" else oa_get(arg)), None
        except Exception as e:  # noqa: BLE001
            return kind, [], err_kind(e)
    with ThreadPoolExecutor(8) as ex:
        results = list(ex.map(run, jobs))
    info = {"oa_total": sum(1 for k, _, _ in results if k in ("oa", "me")),
            "oa_errs": [e for k, _, e in results if k in ("oa", "me") and e],
            "fallback": None, "arxiv_err": None, "related_missing": False, "related_err": None, "related_empty": False}
    me_err = next((e for k, _, e in results if k == "me" and e), None)  # 「못 찾음」과 「OpenAlex 요청 실패」를 가른다
    raw, hotlist, me = [], [], None
    for kind, res, _ in results:
        if kind == "me":
            me = res[0] if res else None
        elif kind == "hf":
            hotlist += res
        else:
            raw += res
    if me and me.get("related_works"):  # OpenAlex가 꼽은 관련 논문
        ids = "|".join(w.rsplit("/", 1)[-1] for w in me["related_works"][:12])
        try:
            raw += oa_get({"filter": f"openalex_id:{ids}", "per_page": 12, "select": OA_SELECT})
        except Exception as e:  # noqa: BLE001
            info["oa_errs"].append(err_kind(e))
            info["related_err"] = err_kind(e)
    elif paper and me_err:
        info["related_err"] = me_err
    elif paper and me:
        info["related_empty"] = True
    elif paper:
        info["related_missing"] = True
    items = []
    seen_hot = set()
    for h in sorted(hotlist, key=lambda x: x.get("upvotes") or 0, reverse=True):
        if h.get("id") in seen_hot:
            continue
        seen_hot.add(h.get("id"))
        items.append({"id": h["id"], "title": h["title"], "year": (h.get("date") or "")[:4], "cites": None,
                      "upvotes": h.get("upvotes") or 0, "doi": "", "venue": "", "repo": False, "insts": [],
                      "type": "hf", "abstract": h.get("summary", "")})
        if len(seen_hot) >= 15:
            break
    oa_items = [oa_item(w) for w in raw if (w.get("type") or "") not in SKIP_TYPES]
    all_failed = info["oa_total"] > 0 and len(info["oa_errs"]) >= info["oa_total"]
    if (queries or titles) and (all_failed or not oa_items):
        info["fallback"] = "failed" if all_failed else "empty"
        ax, info["arxiv_err"], info["arxiv_calls"] = arxiv_fallback(queries, titles, from_year)
        oa_items += ax
    elif paper and not (queries or titles) and not oa_items:
        # 검색어 없이 --paper만 주었는데 관련 논문을 못 받았으면 그 논문 제목의 낱말로 arXiv에서 찾는다(arXiv 호출 2번: 제목 · 검색)
        title = server.fetch_arxiv_title(paper)
        info["fallback"] = "failed" if all_failed else "empty"
        info["paper_title"] = title
        if title:
            ax, info["arxiv_err"], info["arxiv_calls"] = arxiv_fallback([title], [], from_year)
            oa_items += ax
    items += oa_items
    seen, out = set(), []
    for it in items:
        key = re.sub(r"\W+", "", it["title"].lower())
        if not key or key in seen or (paper and it.get("id") == paper):
            continue
        seen.add(key)
        out.append(it)
    return out[:limit], info


def status_lines(info, n, nq, nt, paper, hot):
    src = f"검색어 {nq} · 제목 {nt}{' · 관련 논문 ' + paper if paper else ''}{' · HF 인기 포함' if hot else ''}"
    errs = info["oa_errs"]
    lines = []
    if "paper_title" in info and not info["paper_title"]:  # --paper만 주었고 관련 논문도, arXiv 제목도 못 받음
        why = (f"OpenAlex에 연결하지 못했고({errs[0]})" if errs else "OpenAlex에 관련 논문이 없었고") + " arXiv에서 이 논문 제목도 받지 못했습니다."
        if n:  # --hot으로 붙인 HF 인기 논문만 있다
            lines.append(f"관련 논문은 0편이고, 아래는 HF 인기 논문 {n}편뿐입니다 ({src}) — {why}")
        else:
            lines.append(f"관련 논문 후보 0편 ({src}) — {why}")
        lines.append("검색어를 함께 주면(예: find_papers.py \"영어 검색어\" --paper " + str(paper) + ") arXiv로 대신 찾습니다. "
                     "1~3분 뒤 다시 하거나 WebSearch로 찾으세요.")
        return lines
    if info["fallback"]:
        if info["fallback"] == "failed":
            why = ("OpenAlex 무료 한도가 오늘 다 찼습니다(자정 UTC = 한국 시간 오전 9시에 초기화). arXiv API로 대신 찾았습니다."
                   if "HTTP 429" in errs else f"OpenAlex에 연결하지 못했습니다({errs[0]}). arXiv API로 대신 찾았습니다.")
        else:
            why = "OpenAlex에서 0편이라 arXiv API로 다시 찾았습니다."
        lines.append(f"arXiv 대체 검색 후보 {n}편 ({src}) — {why} 이 목록에는 소속·인용 수가 없습니다.")
        if info.get("paper_title"):
            lines.append(f"(검색어 없이 --paper만 주어, 관련 논문 대신 이 논문 제목 「{info['paper_title']}」의 낱말로 찾았습니다. "
                         "검색어를 함께 주면 더 정확합니다.)")
        if info.get("arxiv_err"):
            lines.append(f"arXiv도 응답하지 않았습니다({info['arxiv_err']}). 1~3분 뒤 다시 하거나 WebSearch로 찾으세요.")
        if info["fallback"] == "failed" and "HTTP 429" in errs and not oa_key():
            lines.append("(사용자가 OpenAlex 무료 API 키를 받아 openalex_key.txt에 넣으면 따로 한도가 생깁니다.)")
    else:
        lines.append(f"OpenAlex 후보 {n}편 ({src})")
        if errs:
            lines.append(f"(OpenAlex 요청 {info['oa_total']}개 중 {len(errs)}개 실패: {', '.join(sorted(set(errs)))} — 일부 검색어 결과가 빠졌을 수 있습니다)")
    if info["related_err"]:
        lines.append(f"(관련 논문: OpenAlex 요청이 실패해({info['related_err']}) 넣지 못했습니다 — 논문이 없다는 뜻은 아닙니다)")
    elif info["related_empty"]:
        lines.append(f"(관련 논문: OpenAlex에 {paper} 논문은 있지만 관련 논문 목록이 비어 있습니다)")
    elif info["related_missing"]:
        lines.append(f"(관련 논문: OpenAlex에서 {paper} 논문을 찾지 못해 넣지 못했습니다)")
    return lines


def main(argv):
    queries, titles, paper, from_year, hot = [], [], None, None, False
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ("--paper", "--title", "--from") and i + 1 < len(argv):
            v = argv[i + 1]
            if a == "--paper":
                paper = re.sub(r"v\d+$", "", server.parse_arxiv_id(v) or v)
            elif a == "--title":
                titles.append(v)
            else:
                try:
                    from_year = int(v)
                except ValueError:
                    print(f"--from 뒤에는 연도(예: 2024)를 주세요: {v}")
                    return 2
            i += 2
        elif a == "--hot":
            hot = True
            i += 1
        elif a.startswith("--"):
            print(f"모르는 옵션: {a}")
            return 2
        else:
            queries.append(a)
            i += 1
    if not (queries or titles or paper or hot):
        print(__doc__.strip().splitlines()[2])
        return 2
    cands, info = gather(queries[:6], titles[:8], from_year, paper, hot)
    print("\n".join(status_lines(info, len(cands), len(queries), len(titles), paper, hot)))
    if not cands:
        print("찾지 못했습니다. 검색어를 바꾸거나 더 일반적인 낱말로 다시 찾아 보거나, WebSearch로 찾으세요.")
        return 0
    for k, c in enumerate(cands, 1):
        ref = f"arXiv {c['id']}" if c.get("id") else (c.get("doi") or "ID 없음")
        bits = [ref, str(c.get("year") or "연도 미확인")]
        if c.get("venue"):
            bits.append(c["venue"] + (" [저장소]" if c.get("repo") else ""))
        if c.get("type") == "arxiv":
            bits.append("저자: " + (c.get("authors") or "미확인"))
            bits.append("소속·인용 미확인")
        else:
            bits.append("소속: " + (", ".join(c["insts"]) if c.get("insts") else "미확인"))
            bits.append(f"HF 추천 {c['upvotes']}" if c.get("type") == "hf" else f"인용 {c.get('cites', 0)}")
        ab = c.get("abstract") or ""
        print(f"{k}. {c['title']}\n   {' | '.join(bits)}\n   {ab[:400]}{'…' if len(ab) > 400 else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
