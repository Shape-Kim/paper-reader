# Paper Reader

arXiv 논문(또는 내 PDF)을 읽으면서 문단을 드래그해 **Claude에게 바로 묻는** 로컬 논문 리더입니다. alphaXiv 같은 형식을 내 컴퓨터에서 돌린다고 보면 됩니다.

AI는 이 컴퓨터에 로그인된 **Claude Code CLI(`claude -p`)** 를 그대로 씁니다. API 키나 별도 결제가 필요 없고, Claude 구독 사용량에서 차감됩니다.

- 왼쪽에 논문(PDF 원문 또는 arXiv HTML판), 오른쪽에 대화
- 본문 드래그 → 질문 · 설명 · 번역 · 하이라이트
- 답 속 근거 표기(「Table 1」「Figure 4」「§3.2」「식 (4)」)를 누르면 논문 그 위치로 이동
- 논문마다 Q&A·메모·그림 캡처를 모은 `세미나자료.md`가 자동으로 쌓임
- 홈에서 Hugging Face 인기 논문 · 내 분야 arXiv 최신 논문 · 논문 찾기 대화
- 서버는 Python 표준 라이브러리만으로 동작(설치할 패키지 없음, 선택 패키지만 있음)

---

## 필요한 것

| 항목 | 설명 |
|---|---|
| macOS | 개발·사용한 환경입니다. Linux는 대부분 동작할 것으로 보이지만 확인하지 않았습니다(「자료 폴더 열기」는 macOS `open`을 씁니다). Windows는 지원하지 않습니다. |
| Python 3.9+ | macOS 기본 `python3`로 충분합니다. |
| [Claude Code](https://docs.claude.com/en/docs/claude-code) | `claude` 명령이 PATH에 있고 **로그인된 상태**여야 합니다. 터미널에서 `claude`를 한 번 실행해 로그인해 두세요. |
| (권장) `pdftotext` | PDF 글자 추출. `brew install poppler` |
| (선택) `pypdf` | `pdftotext`가 없을 때 대신 쓰고, PDF 정보의 제목도 읽습니다. `pip3 install pypdf` |
| (선택) `beautifulsoup4` | arXiv HTML판 정리를 조금 더 잘합니다. `pip3 install beautifulsoup4` |

## 설치 · 실행

```bash
git clone https://github.com/Shape-Kim/paper-reader.git
cd paper-reader
python3 server.py
```

브라우저에서 http://localhost:8765 를 엽니다. macOS에서는 Finder에서 `start.command`를 더블클릭해도 됩니다(서버를 켜고 브라우저를 엽니다). 처음 한 번은 실행 권한을 줘야 합니다.

```bash
chmod +x start.command
```

처음 켜면 `library/` 폴더가 생깁니다. 내가 연 논문·대화·메모는 모두 여기에만 저장되고, `.gitignore`에 들어 있어 git에 올라가지 않습니다.

### 처음 하면 좋은 설정

- ⚙ 설정 → **내 분야 키워드**: 홈 「내 분야」 탭이 arXiv에서 이 낱말이 든 최신 논문을 보여 줍니다(쉼표로 12개까지). 비워 두면 일반적인 AI 키워드를 씁니다. 기본값은 `server.py`의 `MINE_DEFAULT`에서 바꿀 수 있습니다.
- ⚙ 설정 → **설명 방식 기억**: 모든 대화에 들어가는 내 규칙(예: 「설명할 때 ablation과 baseline 공정성을 꼭 짚어 줘」). 대화에서 「앞으로 ~해 줘」라고 해도 쌓입니다. 내용은 `memory.md`에 저장됩니다(git 제외).

## 쓰는 법

### 논문 열기

- **⌘K** 찾기 창에 arXiv 주소·ID를 붙여넣거나, 서재에서 제목으로 찾습니다.
- 입력칸 밖에서 ⌘V로 arXiv 주소를 붙여넣어도 열립니다.
- **PDF 파일**은 화면 아무 데나 끌어다 놓습니다(또는 ⌘K → 「PDF 올리기…」). 제목은 첫 쪽의 가장 큰 글자 줄에서 읽어 정합니다.
- 답 속 arXiv 링크를 누르면 앱 안에서 엽니다(서재에 없으면 받아서 넣습니다).

### 읽기

- **PDF 원문**(pdf.js): 확대 50~300%(⌘+ ⌘− ⌘0), 쪽 이동, 목차, 본문 링크, 브라우저 ⌘F 전문 검색.
- 인용 `[12]` 위에 마우스를 올리면 참고문헌 미리보기 카드가 뜹니다.
- 읽던 위치·확대·보기(PDF/HTML)를 논문마다 기억합니다.
- **arXiv HTML판**(⋯ 메뉴)은 모양이 다르지만, 드래그한 수식이 LaTeX로 정확히 넘어갑니다.

### 묻기

- 본문을 드래그하면 팝업: **질문 · 설명 · 번역 · 🖍 하이라이트**.
- 입력창에서 **`/`** 를 누르면 빠른 질문: 요약 · 비슷한 논문 · 핵심 기여 · 실험·결과 · 비판 점검 · 읽은 논문과 연결 · 발표 구성 짜기 · 방금 답 메모하기.
- **그림 캡처**: 입력창 왼쪽 아이콘을 누르고 논문 위를 끌면 그 영역이 질문에 붙습니다.
- Claude는 필요하면 도구를 씁니다(웹 검색·페이지 열기·arXiv 전문 받기·OpenAlex 후보 찾기·서재 읽기). 쓴 도구는 답 위 접힌 상자에 남습니다.
- 답하는 동안 보내기 버튼이 **■ 멈춤**이 됩니다(Esc도 같음). 오른쪽 위에서 모델·노력(effort)을 고릅니다.

### 메모 · 세미나자료

- 대화에서 「**메모해 줘**」라고 하면 요점을 정리해 메모 탭에 저장합니다. 🖍 하이라이트도 메모 탭에 쌓입니다.
- 논문마다 `library/<id>/세미나자료.md`에 메모 + 그림·표 캡처 + Q&A가 모입니다. 답 아래 「표·그림을 세미나자료에」를 누르면 답에 나온 표·그림을 고해상도로 잘라 넣습니다.
- 서재 전체 목록은 `library/INDEX.md`. Claude Code에게 「paper-reader의 ○○ 논문 세미나자료로 발표 자료 만들어 줘」처럼 이어서 쓸 수 있습니다.

### 폴더(봐야할 논문 · 살펴본 논문 · 내 폴더)

- 서재 목록에서 책갈피 아이콘 → 폴더 고르기. 인기·내 분야 목록의 책갈피는 한 번 누르면 「봐야할 논문」에 들어갑니다.
- 대화로도 넣습니다: 「이 논문 봐야할 논문에 넣어 줘」 · 「방금 말한 3번이랑 5번 나중에 읽게 담아 줘」 · 「MoE 모음 폴더 만들어서 넣어 줘」.
- 부탁하지 않았는데 Claude가 넣으려 하면 넣지 않습니다(논문·웹 페이지 속 글이 몰래 넣는 것을 막기 위해). 넣으면 「되돌리기」가 뜹니다.

### 단축키

⌘K 논문 열기·찾기 · `/` 빠른 질문 · ⌘+ ⌘− ⌘0 확대·축소·폭 맞춤 · Esc 메뉴 닫기·답 멈춤 · ⌘F 논문 전문 검색

## 데이터는 어디에

| 위치 | 내용 | git |
|---|---|---|
| `library/<id>/` | `meta.json` · `paper.md`(Claude에게 주는 전문) · `paper.pdf` 또는 `view.html` · `chat.json`/`chat.md` · `notes.json`/`notes.md` · `세미나자료.md` · `figs/` · `images/` | 제외 |
| `library/_home/` | 홈 대화 | 제외 |
| `library/_shelves.json` | 폴더 | 제외 |
| `library/_events.jsonl` | 기능 사용 기록(이 컴퓨터에만 남고 어디에도 보내지 않음) | 제외 |
| `library/_trash/` | 서재에서 뺀 논문 | 제외 |
| `memory.md` | 설명 방식 기억 | 제외 |
| `openalex_key.txt` | (선택) OpenAlex API 키 | 제외 |

다른 곳에 서재를 두고 싶으면 환경 변수로 바꿉니다: `PAPER_READER_LIB`(서재 폴더) · `PAPER_READER_MEMORY`(기억 파일) · `PAPER_READER_PORT`(포트, 기본 8765).

## 구조

| 파일 | 역할 |
|---|---|
| `server.py` | 표준 라이브러리 HTTP 서버. 논문 받기, 텍스트 추출, `claude -p` 호출(SSE 스트리밍), 메모·세미나자료, 참고문헌 찾기, 피드 |
| `fetch_paper.py` | Claude가 부르는 도구: arXiv 전문을 받아 `library/_cache/<id>.md`에 둡니다 |
| `find_papers.py` | Claude가 부르는 도구: OpenAlex에서 후보 논문(초록·소속·인용 수·arXiv ID)을 찾습니다. OpenAlex가 막히면 arXiv 검색으로 대신합니다. 키가 있으면 환경 변수 `OPENALEX_API_KEY`나 `openalex_key.txt`에(없어도 동작) |
| `static/index.html · app.js · style.css` | 화면 |
| `static/pdf.html` | PDF.js 뷰어(쪽·확대·목차·링크·인용 카드·위치 찾기·고해상도 캡처) |
| `static/paper.css` · `icon.svg` | HTML판 읽기용 CSS · 앱 아이콘 |
| `start.command` | macOS 더블클릭 실행 |

### Claude 호출 방식

- `claude -p --input-format stream-json --output-format stream-json --verbose --include-partial-messages --model <m> [--effort <e>] [--resume <session>]`
- 도구는 `WebSearch, WebFetch, Read, Grep, Glob, Bash`만 켜고, 자동 허용은 `WebSearch`·`WebFetch`와 `fetch_paper.py`·`find_papers.py` 실행뿐입니다. 서재는 `--add-dir library`로 읽기만 합니다. 파일 쓰기·다른 셸 명령은 막힙니다.
- `--setting-sources "" --strict-mcp-config`로 사용자의 훅·설정·MCP를 읽지 않습니다. 환경에 `ANTHROPIC_API_KEY`가 있어도 지우고 불러 **항상 구독 로그인**을 씁니다.
- 첫 질문에 논문 전문(최대 35만 자)을 넘기고, 그 뒤는 `--resume`으로 이어 갑니다.
- 답마다 걸린 시간·도구 수·비용(`total_cost_usd`)을 `chat.json`에 남깁니다.

## 보안

- `127.0.0.1`에서만 열립니다. Host 헤더가 localhost가 아니면 403(DNS rebinding 방지).
- POST는 `X-PR: 1` 헤더가 있어야 하고, Origin이 있으면 이 주소여야 합니다. 본문 크기는 읽기 전에 제한합니다.
- arXiv HTML판은 iframe sandbox(스크립트 금지) · CSP · `on*` 속성 제거로 세 겹으로 막습니다.
- 논문 본문·웹 페이지 속 지시는 따르지 않도록 시스템 프롬프트에 적었습니다. **WebFetch는 모든 사이트에 열려 있습니다.** 더 막으려면 `server.py`의 `--allowedTools`에서 `WebFetch`를 `WebFetch(domain:arxiv.org)` 같은 목록으로 바꾸세요.
- 혼자 쓰는 로컬 도구로 만들었습니다. 서버를 외부에 열지 마세요.

## 알려진 한계

- 질문할 때마다 `claude`가 새로 떠서 답이 시작될 때까지 몇 초 걸립니다. 첫 질문은 전문을 읽느라 더 걸립니다.
- PDF에서 드래그한 수식은 깨진 글자로 넘어갑니다. 수식은 HTML판으로 보거나 그림 캡처로 물으세요.
- 참고문헌 찾기는 arXiv에 있는 논문만 찾습니다. arXiv가 잠시 막으면(429) 1~3분 뒤 다시 하세요.
- OpenAlex 무료 한도는 같은 IP가 나눠 씁니다. 다 차면 후보가 arXiv 검색으로만 나와 소속·인용 수가 빠집니다.
- 「기억 추가」·「폴더 넣기」 판단은 낱말 규칙이라 빗나갈 수 있습니다. 대신 저장되면 늘 「되돌리기」가 뜹니다.
- 스캔 PDF나 첫 쪽이 표지인 PDF는 제목을 못 읽어 파일 이름이 그대로 남습니다(연필 아이콘으로 바꿀 수 있습니다).
- UI와 Claude 프롬프트는 한국어 기준입니다.

## 라이선스

MIT. pdf.js · marked · DOMPurify · KaTeX는 cdnjs에서 불러오며 각자의 라이선스를 따릅니다.
