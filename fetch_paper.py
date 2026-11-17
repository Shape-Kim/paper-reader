#!/usr/bin/env python3
"""논문 찾기 대화(홈)에서 Claude가 쓰는 도구: arXiv 논문 전문을 텍스트로 받아 파일 경로를 알려 준다.

사용: python3 fetch_paper.py <arXiv ID 또는 주소>
- 서재에 있으면 library/<id>/paper.md 경로를 그대로 알려 준다.
- 없으면 arXiv HTML판(없으면 PDF)을 받아 library/_cache/<id>.md 에 저장한다(서재 목록에는 안 들어감).
Claude는 이 경로를 Read/Grep으로 읽는다.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
import server  # noqa: E402


def main():
    if len(sys.argv) < 2:
        print("사용: python3 fetch_paper.py <arXiv ID>")
        return 2
    aid = server.parse_arxiv_id(sys.argv[1])
    if not aid:
        print(f"arXiv ID를 알아볼 수 없습니다: {sys.argv[1]}")
        return 1
    aid = re.sub(r"v\d+$", "", aid)
    lib = server.paper_dir(aid)
    if (lib / "paper.md").exists():
        meta = json.loads((lib / "meta.json").read_text())
        print(f"서재에 있음 · 제목: {meta.get('title')}\n전문: {lib / 'paper.md'} ({(lib / 'paper.md').stat().st_size:,} bytes)")
        if (lib / server.PACKET_NAME).exists():
            print(f"사용자 메모·Q&A: {lib / server.PACKET_NAME}")
        return 0
    cache = server.LIB / "_cache"
    cache.mkdir(parents=True, exist_ok=True)
    out = cache / f"{server.safe_dir_name(aid)}.md"
    if not out.exists():
        text, src = None, None
        for url in (f"https://arxiv.org/html/{aid}", f"https://ar5iv.labs.arxiv.org/html/{aid}"):
            try:
                data, final, _ = server.http_get(url, 60)
                s = data.decode("utf-8", "replace")
                if "ltx_document" in s or "ltx_page_main" in s:
                    text, src = server.html_to_text(s), final
                    break
            except Exception:  # noqa: BLE001
                continue
        if not text:
            data, _, _ = server.http_get(f"https://arxiv.org/pdf/{aid}", 120)
            if not data.startswith(b"%PDF"):
                print("arXiv에서 HTML판도 PDF도 받지 못했습니다.")
                return 1
            pdf = cache / f"{server.safe_dir_name(aid)}.pdf"
            pdf.write_bytes(data)
            text, src = server.pdf_to_text(pdf), f"https://arxiv.org/pdf/{aid}"
        title = server.fetch_arxiv_title(aid) or aid
        out.write_text(f"# {title}\n\n출처: {src}\n\n{text}", encoding="utf-8")
    head = out.read_text(encoding="utf-8").splitlines()[0]
    print(f"받음 · {head[2:]}\n전문: {out} ({out.stat().st_size:,} bytes) — Read(필요하면 offset/limit)나 Grep으로 읽으세요.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
