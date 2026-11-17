// Paper Reader 화면 — 논문과 대화만 늘 보이고, 나머지는 필요할 때 나타난다.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const state = { paper: null, quote: "", quoteRaw: "", quotePage: null, busy: null, notes: [], attach: [], library: [], shelves: { folders: [], items: [] },
  view: "pdf", hzoom: 1, model: "sonnet", effort: "auto" };
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};

// ---------- 아이콘(Tabler outline)
const ICON_PATHS = {
  home: '<path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>',
  search: '<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>',
  settings: '<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
  list: '<path d="M9 6l11 0"/><path d="M9 12l11 0"/><path d="M9 18l11 0"/><path d="M5 6l0 .01"/><path d="M5 12l0 .01"/><path d="M5 18l0 .01"/>',
  dots: '<path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>',
  crop: '<path d="M8 5v10a1 1 0 0 0 1 1h10"/><path d="M5 8h10a1 1 0 0 1 1 1v10"/>',
  arrowUp: '<path d="M12 5l0 14"/><path d="M18 11l-6 -6"/><path d="M6 11l6 -6"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/>',
  messagePlus: '<path d="M8 9h8"/><path d="M8 13h6"/><path d="M12.01 18.594l-4.01 2.406v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5.5"/><path d="M16 19h6"/><path d="M19 16v6"/>',
  copy: '<path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>',
  check: '<path d="M5 12l5 5l10 -10"/>',
  note: '<path d="M13 20l7 -7"/><path d="M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7"/>',
  highlight: '<path d="M3 19h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M12.5 5.5l4 4"/><path d="M4.5 13.5l4 4"/><path d="M21 15v4h-8l4 -4z"/>',
  chevronDown: '<path d="M6 9l6 6l6 -6"/>',
  chevronLeft: '<path d="M15 6l-6 6l6 6"/>',
  chevronRight: '<path d="M9 6l6 6l-6 6"/>',
  x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
  external: '<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"/><path d="M11 13l9 -9"/><path d="M15 4h5v5"/>',
  minus: '<path d="M5 12l14 0"/>',
  plus: '<path d="M12 5l0 14"/><path d="M5 12l14 0"/>',
  pencil: '<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>',
  folder: '<path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"/>',
  fileText: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 9l1 0"/><path d="M9 13l6 0"/><path d="M9 17l6 0"/>',
  upload: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 9l5 -5l5 5"/><path d="M12 4l0 12"/>',
  book: '<path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6l0 13"/><path d="M12 6l0 13"/><path d="M21 6l0 13"/>',
  photo: '<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>',
  fileOff: '<path d="M3 3l18 18"/><path d="M7 3h7l5 5v7"/><path d="M19 19a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-14"/>',
  bookmark: '<path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z"/>',
  message: '<path d="M8 9h8"/><path d="M8 13h6"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ""}</svg>`;
const ic = (name) => `<span class="ic">${icon(name)}</span>`;
function paintIcons(root = document) { $$(".ic[data-icon]", root).forEach((el) => { el.innerHTML = icon(el.dataset.icon); el.removeAttribute("data-icon"); }); }

// ---------- 공통
function toast(text, ms = 2600, action) {
  const t = $("#toast"); t.innerHTML = ""; t.append(text);
  if (action) { const b = document.createElement("button"); b.textContent = action.label; b.onclick = () => { t.hidden = true; action.run(); }; t.append(b); }
  t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), ms);
}
async function api(path, opts = {}) {
  if (opts.method && opts.method !== "GET") opts.headers = Object.assign({ "X-PR": "1" }, opts.headers || {});
  const r = await fetch(path, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
const postJSON = (path, obj) => api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reEsc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const nowStr = () => { const d = new Date(), p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
const EFFORT_LABEL = { auto: "기본", low: "낮음", medium: "보통", high: "높음", xhigh: "매우 높음", max: "최대" };
const MODEL_LABEL = { sonnet: "Sonnet", opus: "Opus", haiku: "Haiku" };
const runLabel = (model, effort) => `${MODEL_LABEL[model] || model} · ${EFFORT_LABEL[effort || "auto"] || effort}`;

// ---------- 빠른 질문: chip = 빈 대화에 보이는 시작 버튼(실사용 근거가 있는 것만) · 나머지는 입력창 / 메뉴
const PAPER_PROMPTS = [
  { key: "summary", label: "요약", chip: true, q: "이 논문을 한국어로 요약해 줘. 문제, 방법, 결과, 한계 순서로." },
  { key: "similar", label: "비슷한 논문", q: "이 논문과 비슷한 논문 8편을 찾아 줘. find_papers.py로 후보를 모으고 실제로 확인한 것만 골라서, 각 항목은 [제목](#open=arXiv ID) 형식으로 쓰고 왜 볼 만한지와 이 논문과의 관계(선행·후속·경쟁 방법·서베이)를 한 줄씩 붙여 줘." },
  { key: "contrib", label: "핵심 기여", q: "이 논문의 핵심 기여를 3가지로 정리하고, 기존 연구와 무엇이 다른지 설명해 줘." },
  { key: "results", label: "실험·결과", q: "이 논문의 실험 설정과 주요 결과 수치를 표로 정리해 줘." },
  { key: "critique", label: "비판 점검", q: "이 논문을 비판적으로 점검해 줘: 베이스라인이 같은 조건이었는지(공정성), 빠진 비교, ablation으로 기여 요인을 분리했는지, 주장한 메커니즘이 실제로 검증됐는지, 지표가 재는 것과 주장의 차이, 표본 크기와 실패 사례 분석." },
  { key: "link", label: "읽은 논문과 연결", q: "내 서재(INDEX.md)에서 이 논문과 관련 있는 논문을 찾아서, 무엇이 어떻게 연결되는지(같은 문제, 방법 차이, 결과 비교, 인용·확장 관계) 설명해 줘. 그 논문에서 내가 남긴 메모나 했던 질문도 이어서 짚어 주고, 관련 있는 게 없으면 없다고 해 줘." },
  { key: "seminar", label: "발표 구성 짜기", q: "지금까지의 Q&A와 메모(이 논문의 세미나자료.md)를 바탕으로 이 논문 세미나 발표 구성을 짜 줘. 슬라이드 10장 안팎으로, 장마다 제목·핵심 내용·넣을 그림이나 표(논문 Figure/Table 번호)를 적어 줘." },
  { key: "memo", label: "방금 답 메모하기", q: "방금 답변의 핵심을 메모해 줘." },
];
const HOME_PROMPTS = [
  { key: "mine", label: "내 연구 흐름에 맞는 논문 찾기", chip: true, q: "내 서재(INDEX.md)와 거기 남긴 메모·질문을 보고 내 연구 흐름을 파악한 다음, 이어서 읽으면 좋을 최근 논문을 찾아 줘. find_papers.py와 웹 검색으로 후보를 모으고, 실제로 확인한 것만 [제목](#open=arXiv ID) 형식으로 이유와 함께 알려 줘." },
  { key: "hot", label: "요즘 핫한 AI 논문", chip: true, q:"요즘 핫한 AI 논문 중에 논리도 탄탄하고 볼 만한 논문 추천해 줘." },
];
const prompts = () => (state.paper ? PAPER_PROMPTS : HOME_PROMPTS);

// ---------- 마크다운 + 수식
function renderMarkdown(src) {
  const maths = [];
  const keep = (tex, display) => { maths.push({ tex, display }); return `${maths.length - 1}`; };
  const s = src
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => keep(t, true))
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => keep(t, true))
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, t) => keep(t, false))
    .replace(/(^|[^\\$])\$([^\s$](?:[^$\n]*?[^\s$])?)\$(?!\d)/g, (_, pre, t) => pre + keep(t, false));
  let html = DOMPurify.sanitize(marked.parse(s, { mangle: false, headerIds: false }));
  html = html.replace(/(\d+)/g, (_, i) => {
    const m = maths[+i];
    try { return katex.renderToString(m.tex, { displayMode: m.display, throwOnError: false, output: "html" }); }
    catch (e) { return esc(m.tex); }
  });
  return html;
}
// 모델이 설정 태그(<thinking_mode>off</thinking_mode> 등)를 답에 따라 쓸 때가 있다 → 지운다(DOMPurify는 태그만 지우고 「off」를 남긴다)
const CTRL_TAG = "thinking_mode|reasoning_effort|max_thinking_length";
// 서버 CTRL_TAG_RE와 같게 태그 안 글은 80자까지만(짝이 멀리 떨어진 깨진 글에서 본문을 지우지 않게) · 스트리밍 중 덜 온 짝도 숨긴다
const CTRL_RES = [new RegExp(`<(${CTRL_TAG})>[^<]{0,80}<\\/\\1>[ \\t]*\\n?`, "g"), new RegExp(`<(?:${CTRL_TAG})>[^<]{0,80}$`),
  new RegExp(`<\\/?(?:${CTRL_TAG})>`, "g")];
const stripCtrl = (t) => CTRL_RES.reduce((s, re) => s.replace(re, ""), String(t || ""));
// 스트리밍 중 <memo>/<remember> 블록은 날것으로 보이지 않게 카드 모양으로
const maskCode = (s) => s.replace(/```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)|``[^\n]*?``|`[^`\n]*`/g, (m) => " ".repeat(m.length));   // 자리는 그대로 두고 코드만 빈칸으로
function displayText(t, final, raw) {   // raw = 서버가 정리한 글을 받지 못하고 끝난 답(멈춤·연결 끊김)
  t = stripCtrl(t);
  // 「폴더에 넣어 줘」: 코드 밖 이 앱의 <shelf> 블록(폴더·ID·제목 속성이 있는 것 — 「<shelf name=…>」 같은 다른 글은 그대로)은 지우고
  // 한 줄만(답이 끝나면 서버가 카드로 바꾼다). 서버가 정리한 글(final)은 자르지 않는다 — 「<shelf>」라는 말까지 「넣는 중…」으로 가리지 않게
  const REAL = /(?:^|\s)(?:folder|id|title)\s*=/i;
  const spans = [], sre = /<shelf((?:\s+\w+\s*=\s*(?:"[^"]{0,400}"|'[^']{0,400}'|[^\s"'<>\/]+)){1,8})\s*(?:\/>|>(?:(?!<shelf\b)[\s\S]){0,2000}?<\/shelf\s*>)[ \t]*\n?/g, mk = maskCode(t);
  for (let m; (m = sre.exec(mk));) if (REAL.test(m[1])) spans.push([m.index, m.index + m[0].length]);
  for (const [a, b] of spans.reverse()) t = t.slice(0, a) + t.slice(b);
  let so = -1, part = -1;
  if (!final || raw) {   // 아직 다 오지 않은 블록: 속성이 시작된 여는 말 · 글 끝의 「<shelf」·「<shelf fol」(· 「<sh」 같은 앞 조각은 「넣는 중」 없이)
    const mk2 = maskCode(t), ore = /<shelf\b[^<>\n]*/g;
    for (let m; (m = ore.exec(mk2));) if (REAL.test(m[0].slice(6))) { so = m.index; break; }
    const tail = mk2.search(/<shelf(?:\s+[\w-]*)?\s*$/);
    if (tail >= 0 && (so < 0 || tail < so)) so = tail;
    if (so < 0) part = mk2.search(/<(?:s(?:h(?:e(?:l)?)?)?)?$/);
  }
  if (so >= 0) t = t.slice(0, so); else if (part >= 0) t = t.slice(0, part);
  if (!final && (spans.length || so >= 0)) t = t.replace(/\s*$/, "") + "\n\n*🔖 폴더에 넣는 중…*";
  t = t.replace(/<memo(?:\s+title="([^"]*)")?\s*>([\s\S]*?)<\/memo>/g, (_, title, body) =>
    `\n\n> **📝 메모 저장 — ${title || "메모"}**\n>\n` + body.trim().split("\n").map((l) => "> " + l).join("\n") + "\n");
  t = t.replace(/<remember>([\s\S]*?)<\/remember>/g, (_, r) => `\n\n> **🧠 기억에 추가** — ${r.trim().replace(/\s+/g, " ")}\n`);
  const open = t.search(/<memo\b/);
  if (open >= 0) t = t.slice(0, open) + "\n\n*📝 메모 정리 중…*";
  const ro = t.search(/<remember\b/);
  if (ro >= 0) t = t.slice(0, ro) + "\n\n*🧠 기억하는 중…*";
  return t;
}

// ---------- 답 속 링크: 서재 논문 ID → 그 논문 열기 · 「Table 5」「§4.2」「식 (3)」 → 논문 그 위치로
function eachTextNode(el, re, make) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => n.parentElement.closest("a, code, pre, .katex, kbd") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; for (let n; (n = walker.nextNode());) { re.lastIndex = 0; if (re.test(n.data)) nodes.push(n); }
  for (const n of nodes) {
    const frag = document.createDocumentFragment(); let last = 0; re.lastIndex = 0;
    for (let m; (m = re.exec(n.data));) {
      const a = make(m); if (!a) continue;
      frag.append(n.data.slice(last, m.index), a); last = m.index + m[0].length;
    }
    frag.append(n.data.slice(last)); n.replaceWith(frag);
  }
}
// 서재 ID와 답 속 모든 arXiv ID(앞 네 자리가 연월인 것만) → 앱 안에서 열기. 서재에 없으면 받아서 연다.
const AID = "(?:0[7-9]|[12]\\d)(?:0[1-9]|1[0-2])\\.\\d{4,5}(?:v\\d+)?";
function linkifyPapers(el) {
  const others = state.library.map((p) => p.id).filter((id) => id && !/^\d{4}\.\d{4,5}/.test(id)).sort((a, b) => b.length - a.length).map(reEsc);
  const re = new RegExp(`(?<![\\w./-])(${[...others, AID].join("|")})(?![\\w-]|\\.\\d)`, "g");
  eachTextNode(el, re, (m) => {
    const id = m[1], base = id.replace(/v\d+$/, ""), p = state.library.find((x) => x.id === id || x.id === base);
    const a = document.createElement("a"); a.href = "#"; a.className = "plink"; a.textContent = id;
    if (p) { a.dataset.id = p.id; a.title = "서재에서 열기"; } else { a.dataset.open = base; a.title = "이 논문 열기(서재에 넣음)"; }
    return a;
  });
}
// 답 속 근거 표기(「Table 1, 5–7」「Figure 4·5」「§3.2」「식 (4)」「Algorithm 1」「부록 B」…) — 실험 시제품 findMentions, 실제 답 174/174
// 한글 낱말 경계: 「지표 2」「목표 1」「발표 2회」「좌표 2」가 표 번호로 잡히지 않게 앞 글자에 한글도 막는다(검토 지적)
const MENTION_RES = [
  ["table", /(^|[^\w.])(?:Tables?|Tab\.|TABLE)\s*([A-Z]?\d+|[IVX]{1,5}\b)/g],
  ["table", /(^|[^\w가-힣])표\s*([A-Z]?\d+)(?!\s*(?:[%배명개회번편]|가지|단계))/g],
  ["figure", /(^|[^\w.])(?:Figures?|Figs?\.|FIGURE)\s*([A-Z]?\d+)/g],
  ["figure", /(^|[^\w가-힣])그림\s*([A-Z]?\d+)/g],
  ["section", /(^|[^\w])§\s*([A-Z]?\d+(?:\.\d+)*|[A-Z](?:\.\d+)*)/g],
  ["section", /(^|[^\w.])(?:Sections?|Sec\.|Sect\.)\s*([A-Z]?\d+(?:\.\d+)*)/g],
  ["section", /(^|[^\d.])(\d+(?:\.\d+)*)\s*절/g],
  ["section", /(^|[^\w가-힣])섹션\s*(\d+(?:\.\d+)*)/g],
  ["section", /(^|[^\w.])(?:Appendix|App\.)\s*([A-Z](?:\.\d+)*)\b/g],
  ["section", /(^|[^\w가-힣])부록\s*([A-Z](?:\.\d+)*)/g],
  ["equation", /(^|[^\w.])(?:Equations?|Eqs?\.|Eqn\.)\s*\(?(\d+)\)?/g],
  ["equation", /(^|[^\w가-힣])(?:수식|식)\s*\(\s*(\d+)\s*\)/g],
  ["algorithm", /(^|[^\w.])(?:Algorithm|Alg\.)\s*(\d+)/g],
  ["algorithm", /(^|[^\w가-힣])알고리즘\s*(\d+)/g],
];
const CONT_RE = /^(\s*(?:,|·|및|and|&|–|-|~|∼|to)\s*\(?)([A-Z]?\d{1,3}(?:\.\d+)*|[A-Z](?:\.\d+)*)(?![A-Za-z0-9])\)?/;
// 이어 붙인 숫자 뒤에 단위·셀 수 있는 명사가 오면 번호가 아니다: 「Table 2, 3개 baseline」「Section 3 and 4 seeds」「§3.2 및 5배」
const CONT_STOP = /^\s*(?:[%배명개회번편초분]|가지|단계|x\b|×|times?\b|seeds?\b|runs?\b|epochs?\b|layers?\b|steps?\b|samples?\b|tokens?\b|GPUs?\b|models?\b|datasets?\b|tasks?\b|baselines?\b|experts?\b|points?\b)/i;
function findMentions(text) {
  const found = [];
  for (const [kind, re] of MENTION_RES) {
    re.lastIndex = 0;
    for (let m; (m = re.exec(text));) {
      const start = m.index + m[1].length, end = m.index + m[0].length;
      if (found.some((f) => !(end <= f.start || start >= f.end))) continue;
      found.push({ kind, label: m[m.length - 1], start, end });
      let pos = end, prev = m[m.length - 1];   // 뒤따르는 목록·범위: 「, 5–7」「·5」「~(6)」
      for (let k = 0; k < 6; k++) {
        const c = CONT_RE.exec(text.slice(pos)); if (!c) break;
        if (CONT_STOP.test(text.slice(pos + c[0].length))) break;
        const lab = c[2], sep = c[1].trim().replace("(", ""), range = /^[–\-~∼]|^to$/.test(sep);
        if (range && !(/^\d+$/.test(prev) && /^\d+$/.test(lab) && +lab > +prev && +lab - +prev <= 20)) break;
        found.push({ kind, label: lab, start: pos + c[1].length, end: pos + c[1].length + lab.length });
        prev = lab; pos += c[0].length;
      }
    }
  }
  return found.sort((a, b) => a.start - b.start);
}
const KIND_LABEL = { table: "표", figure: "그림", section: "절", equation: "식", algorithm: "알고리즘", page: "쪽" };
function linkifyTargets(el) {
  if (!state.paper) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => n.parentElement.closest("a, code, pre, .katex, kbd") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; for (let n; (n = walker.nextNode());) nodes.push(n);
  for (const n of nodes) {
    const ms = findMentions(n.data); if (!ms.length) continue;
    const frag = document.createDocumentFragment(); let last = 0;
    for (const m of ms) {
      if (m.start < last) continue;
      const a = document.createElement("a"); a.href = "#"; a.className = "jump"; a.textContent = n.data.slice(m.start, m.end);
      a.dataset.kind = m.kind; a.dataset.label = m.label.replace(/\.$/, ""); a.title = "논문에서 이 위치로";
      frag.append(n.data.slice(last, m.start), a); last = m.end;
    }
    frag.append(n.data.slice(last)); n.replaceWith(frag);
  }
}
function enhance(body) { linkifyPapers(body); linkifyTargets(body); }
// 이 논문에 없는 대상(다른 논문의 표 번호 등)은 링크를 풀어 글자로 되돌린다 — 답이 끝난 뒤·논문이 열린 뒤 한 번
// 논문 칸에 지금 논문이 실제로 열려 있는지(바꾸는 중에는 앞 논문 문서가 잠깐 남아 있다)
function frameIsCurrent() {
  try {
    const l = $("#paperFrame").contentWindow.location, id = encodeURIComponent(state.paper.id);
    return state.view === "pdf" ? l.pathname === "/static/pdf.html" && new URLSearchParams(l.search).get("id") === state.paper.id : l.pathname === `/paper/${id}/view`;
  } catch (e) { return false; }
}
async function pruneJumps(root) {
  const links = $$("a.jump", root); if (!links.length || !state.paper || !frameIsCurrent()) return;
  const paper = state.paper, view = state.view;
  let locate;
  if (view === "pdf") {
    const pr = framePR(); if (!pr || !pr.locate) return;
    try { await pr.ready; } catch (e) { return; }
    locate = (k, l) => pr.locate(k, l);
  } else { if (!frameDoc()) return; locate = async (k, l) => !!htmlLocate(k, l); }
  const memo = new Map();
  for (const a of links) {
    const key = a.dataset.kind + ":" + a.dataset.label;
    if (!memo.has(key)) memo.set(key, locate(a.dataset.kind, a.dataset.label).catch(() => true));
    const ok = await memo.get(key);
    if (state.paper !== paper || state.view !== view) return;
    if (!ok && a.isConnected) a.replaceWith(document.createTextNode(a.textContent));
  }
  $$(".msg.assistant", (root.closest && root.closest("#messages")) || root).forEach(updateFigBtn);
}

document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("a"); if (!a) return;
  if (a.classList.contains("plink")) {
    e.preventDefault();
    if (a.dataset.open) { logEvent("open", { via: "answer-id" }); openSrc(a.dataset.open); return; }
    const p = state.library.find((x) => x.id === a.dataset.id);
    if (p && (!state.paper || p.id !== state.paper.id)) { logEvent("open", { via: "answer-id" }); showPaper(p); }
    return;
  }
  if (a.classList.contains("jump")) { e.preventDefault(); jumpTo(a.dataset.kind, a.dataset.label); return; }
  if (!a.closest(".msg")) return;
  const href = a.getAttribute("href") || "";
  const m = href.match(/^#open=(.+)$/), ax = href.match(/arxiv\.org\/(?:abs|pdf|html)\/(\d{4}\.\d{4,5})/);
  if (m || ax) {   // arXiv 논문 링크는 앱 안에서 · 서재에 있으면(내 PDF·버전 붙은 ID 포함) 받지 않고 바로 연다
    e.preventDefault(); logEvent("open", { via: "answer-link" });
    let id = ax ? ax[1] : m[1]; try { id = decodeURIComponent(id); } catch (err) {}
    const base = id.replace(/v\d+$/, ""), L = state.library;
    const p = L.find((x) => x.id === id) || L.find((x) => x.id === base) || L.find((x) => x.arxiv_id && x.arxiv_id.replace(/v\d+$/, "") === base);
    if (p) { if (!state.paper || state.paper.id !== p.id) showPaper(p); }
    else if (/^local-/.test(id)) toast("서재에서 뺀 PDF입니다.", 4000);
    else openSrc(id);
  }
  else if (/^https?:/.test(href)) { e.preventDefault(); window.open(href, "_blank", "noopener"); }
});

// ---------- 메시지
function addMessage(role, text, opts = {}) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  if (role === "user") {
    if (opts.quote) { const q = document.createElement("div"); q.className = "q"; q.textContent = opts.quote; div.appendChild(q); }
    if (opts.images && opts.images.length) {
      const g = document.createElement("div"); g.className = "thumbs";
      for (const src of opts.images) { const im = document.createElement("img"); im.src = src; im.alt = "첨부 그림"; im.onclick = () => window.open(src, "_blank"); g.appendChild(im); }
      div.appendChild(g);
    }
  }
  const body = document.createElement("div"); body.className = "body";
  if (role === "assistant") { body.innerHTML = renderMarkdown(stripCtrl(text)); enhance(body); }
  else body.textContent = text;
  div.appendChild(body);
  $("#messages").appendChild(div);
  $("#messages").scrollTop = $("#messages").scrollHeight;
  return div;
}
// 답 아래: 복사 · 메모로 · 세미나자료에서 빼기 · (모델 · 시간) — 마우스를 올리거나 마지막 답일 때만 보인다
// msg = { index: chat.json 안 위치(답 저장이 끝나야 생김), out: 세미나자료에 안 들어가는 까닭(서버 판정 · 없으면 들어감) }
function addActions(div, getText, question, metaText, msg) {
  const bar = document.createElement("div"); bar.className = "acts";
  bar.innerHTML = `<button class="icon xs" data-a="copy" title="답 복사">${ic("copy")}</button>`
    + (state.paper ? `<button class="icon xs" data-a="memo" title="이 답을 메모 탭에 저장">${ic("note")}</button>`
      + `<button class="icon xs" data-a="figs" title="이 답에 나온 표·그림을 캡처해 세미나자료에 넣기" hidden>${ic("photo")}</button>`
      + `<button class="icon xs" data-a="excl">${ic("fileOff")}</button>` : "")
    + `<span class="meta"></span>`;
  const fb = bar.querySelector('[data-a="figs"]');
  if (fb) fb.onclick = () => saveFigures(div, fb);
  const meta = bar.querySelector(".meta");
  const paintMeta = () => { meta.textContent = (metaText || "") + (!msg || !msg.out ? "" : msg.out === "직접 뺌" ? " · 세미나자료에서 뺌" : " · 세미나자료에 안 넣음"); };
  bar.querySelector('[data-a="copy"]').onclick = async (e) => {
    const b = e.currentTarget;   // await 뒤에는 currentTarget이 비어 있다
    try { await navigator.clipboard.writeText(stripCtrl(getText())); b.innerHTML = ic("check"); setTimeout(() => (b.innerHTML = ic("copy")), 1200); logEvent("copy"); }
    catch (err) { toast("복사하지 못했습니다."); }
  };
  const mb = bar.querySelector('[data-a="memo"]');
  if (mb) mb.onclick = () => {
    const text = stripCtrl(getText()); if (!text || !state.paper) return;
    state.notes.push({ id: uid(), title: (question || "답변").split("\n")[0].slice(0, 40), text: "", quote: "", note: text, page: null, created: nowStr(), source: "answer", question });
    renderNotes(); saveNotes(); mb.innerHTML = ic("check"); mb.disabled = true; toast("답을 메모에 저장했습니다."); logEvent("memo-hover");
  };
  const xb = bar.querySelector('[data-a="excl"]');
  const paintX = () => { if (xb) { xb.title = msg && msg.out ? `세미나자료에 넣기(지금은 빠짐: ${msg.out})` : "세미나자료에서 빼기(시험·잡담 답)"; xb.classList.toggle("on", !!(msg && msg.out)); } paintMeta(); };
  if (xb) xb.onclick = async () => {
    if (!msg || msg.index == null) { toast("답 저장이 끝난 뒤에 할 수 있습니다."); return; }
    const want = !msg.out, was = msg.out, pid = state.paper.id;   // want = 빼기(들어 있을 때) · 아니면 넣기
    try {
      await postJSON("/api/exclude/" + encodeURIComponent(pid), { index: msg.index, exclude: want });
      msg.out = want ? "직접 뺌" : null; paintX(); logEvent("packet-exclude", { on: want, auto: !!was && was !== "직접 뺌" });
      toast(want ? "세미나자료에서 뺐습니다." : "세미나자료에 넣었습니다.");
    } catch (e) { toast(e.message); }
  };
  paintX();
  div.appendChild(bar);
  updateFigBtn(div);
  return { setMeta: (t) => { metaText = t; paintMeta(); } };
}
// 표·그림 캡처 버튼은 답에 (이 논문에 실제로 있는) 표·그림·알고리즘 링크가 있을 때만
const FIG_SEL = '.body a.jump[data-kind="table"], .body a.jump[data-kind="figure"], .body a.jump[data-kind="algorithm"]';
function updateFigBtn(div) { const b = div.querySelector('.acts [data-a="figs"]'); if (b) b.hidden = !div.querySelector(FIG_SEL); }
// 답에 나온 표·그림을 높은 해상도로 잘라 논문 폴더 figs/에 넣고 세미나자료.md에 붙인다(덱에 표 캡처를 넣는 용도)
async function saveFigures(div, btn) {
  if (!state.paper) return;
  if (state.view !== "pdf") { toast("PDF 보기에서 할 수 있습니다(⋯ 메뉴 → PDF 원문으로 보기)."); return; }
  const pr = framePR(); if (!pr || !pr.snapshot || !frameIsCurrent()) { toast("PDF가 아직 열리는 중입니다."); return; }
  const pid = state.paper.id, seen = new Set(), items = [];
  for (const a of $$(FIG_SEL, div)) { const key = a.dataset.kind + "-" + a.dataset.label; if (!seen.has(key)) { seen.add(key); items.push([a.dataset.kind, a.dataset.label]); } }
  if (!items.length) return;
  btn.disabled = true; toast(`표·그림 ${items.length}개를 캡처하는 중…`, 20000);
  let n = 0;
  const miss = [];   // 본문 영역을 못 찾은 것(캡션 띠만 저장하지 않고 건너뛴다)
  try {
    for (const [k, l] of items.slice(0, 12)) {
      const s = await pr.snapshot(k, l); if (!s) { miss.push(`${k === "table" ? "표" : "그림"} ${l}`); continue; }
      await postJSON("/api/figure/" + encodeURIComponent(pid), { name: `${k}-${l}`, data: s.data, page: s.page });
      n++;
    }
    logEvent("figs", { n, miss: miss.length });
    const skip = miss.length ? ` ${miss.join(", ")}은(는) 영역을 못 찾아 건너뛰었습니다.` : "";
    toast(n ? `${n}개를 세미나자료에 넣었습니다(논문 폴더 figs/).${skip}` : `캡처할 표·그림을 찾지 못했습니다.${skip}`, n && !miss.length ? 7000 : 10000,
      n ? { label: "폴더 열기", run: () => postJSON("/api/reveal/" + encodeURIComponent(pid), { what: "folder" }).catch((e) => toast(e.message)) } : undefined);
  } catch (e) { toast("캡처 저장 실패: " + e.message); }
  finally { btn.disabled = false; }
}
function markLast() { $$("#messages .msg.assistant.last").forEach((m) => m.classList.remove("last")); const l = $$("#messages .msg.assistant").pop(); if (l) l.classList.add("last"); }
// Claude가 쓴 도구(검색·열기·전문 받기)와 그 사이 혼잣말(💬) 기록 — 서버가 준 목록·요약 줄을 그대로 그린다
function toolBox(div, items, open, summary, replace) {
  let d = div.querySelector("details.tools");
  if (!d) {
    d = document.createElement("details"); d.className = "tools"; d.open = !!open;
    d.innerHTML = "<summary></summary><ol></ol>";
    div.insertBefore(d, div.querySelector(".body"));
  }
  const ol = d.querySelector("ol");
  if (replace) ol.innerHTML = "";
  for (const l of items) {
    const li = document.createElement("li"); li.textContent = l;
    if (/^💬/.test(l)) li.className = "aside"; else if (/^⛔/.test(l)) li.className = "denied";
    ol.appendChild(li);
  }
  if (summary) d.querySelector("summary").textContent = summary;
  else {   // 예전 기록: 직접 센다(혼잣말은 단계에서 뺀다)
    const lis = $$("li", d).filter((li) => !li.classList.contains("aside"));
    const ids = new Set(lis.map((li) => (li.textContent.match(/^📄\D*(\d{4}\.\d{4,5})/) || [])[1]).filter(Boolean));
    d.querySelector("summary").textContent = `찾아보고 읽음 · ${lis.length}단계` + (ids.size ? ` · 전문 ${ids.size}편` : "");
  }
  return d;
}
// 빈 대화: 짧은 안내와 시작 제안
function renderEmptyChat() {
  const box = document.createElement("div"); box.className = "empty-chat";
  const hello = state.paper
    ? `<b>${esc(state.paper.title || state.paper.id)}</b>${shelfWhy()}<small>본문을 드래그해 묻거나 아래에서 골라 시작하세요. 입력창에서 <kbd>/</kbd> 를 누르면 빠른 질문이 나옵니다.</small>`
    : `<b>논문 찾기</b><small>웹 검색과 논문 전문 읽기로 찾아 드립니다. 답 속 제목을 누르면 바로 열립니다.</small>`;
  box.innerHTML = `<div class="hello">${hello}</div><div class="chips"></div>`;
  for (const p of prompts().filter((x) => x.chip)) {
    const b = document.createElement("button"); b.className = "chip"; b.textContent = p.label; b.title = p.q; b.onclick = () => { logEvent("chip", { key: p.key }); ask(p.q); };
    box.querySelector(".chips").appendChild(b);
  }
  $("#messages").appendChild(box);
}
function renderHistory(chat) {
  const imgUrl = (n) => `/paper/${encodeURIComponent(state.paper.id)}/img/${n}`;
  let lastQ = "";
  chat.messages.forEach((m, i) => {
    if (m.role === "user") {
      addMessage("user", m.text, { quote: m.quote, images: state.paper ? (m.images || []).map(imgUrl) : [] }); lastQ = m.text;
    } else {
      const div = addMessage("assistant", m.text);
      if (m.stopped) div.classList.add("stopped");
      if (m.tools && m.tools.length) toolBox(div, m.tools, false, m.tools_summary);
      const meta = [m.model ? runLabel(m.model, m.effort) : "", m.time || "", m.ms ? `${Math.round(m.ms / 1000)}초` : "", m.stopped ? "중지됨" : ""].filter(Boolean).join(" · ");
      addActions(div, () => m.text, lastQ, meta, { index: i, out: m.out || null });
    }
  });
  if (!chat.messages.length) renderEmptyChat();
  markLast();
}

// ---------- 서재 · 인기 · 내 분야 (홈 왼쪽 한 목록)
async function loadLibrary() { const [lib] = await Promise.all([api("/api/papers").catch(() => []), loadShelves()]); state.library = lib; syncShelfMenu(); }   // 열린 폴더 메뉴도 새 폴더 상태로
function homeSrc() { if (state.homeSrc == null) state.homeSrc = LS.get("pr_home", "lib"); const s = state.homeSrc; return s === "arxiv" ? "mine" : s; }   // 예전 「최신(cs.AI)」 탭은 「내 분야」로 · 탭마다 따로(저장 값은 새 탭이 처음 열 때만)
const dayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// 홈 목록을 다시 그려도 키보드 위치는 그대로(같은 논문 줄·같은 단추·같은 칩) — 그사이 사용자가 다른 곳으로 옮겼으면 두고
function homeFocusKey() {
  const a = document.activeElement;
  if (!a || a === document.body || !a.closest) return null;
  const chip = a.closest("#shelfBar .chip");
  if (chip) return { chip: chip.dataset.folder || "" };
  const row = a.closest("#homeList .item");
  if (!row) return null;
  return { id: row.dataset.id || "", key: row.dataset.key || "", ax: row.dataset.ax || "", btn: ["bm", "ren", "del", "unshelf"].find((c) => a.classList.contains(c)) || "" };
}
function restoreHomeFocus(k) {
  const cur = document.activeElement;
  if (!k || (cur && cur !== document.body)) return;
  let el = null;
  if (k.chip !== undefined) el = $$("#shelfBar .chip").find((c) => (c.dataset.folder || "") === k.chip) || null;
  else {
    const row = $$("#homeList .item").find((r) => (k.id && r.dataset.id === k.id) || (k.key && r.dataset.key === k.key) || (k.ax && r.dataset.ax === k.ax));
    el = row ? (k.btn && $("." + k.btn, row)) || row : null;
  }
  if (el) el.focus({ preventScroll: true });
}
async function renderHome() { const fx = homeFocusKey(); await renderHome0(); restoreHomeFocus(fx); }
async function renderHome0() {
  const src = homeSrc();
  $$("#homeTabs button").forEach((b) => b.classList.toggle("on", b.dataset.src === src));
  $("#feedDate").hidden = src !== "hf"; $("#feedDate").max = dayStr(new Date(Date.now() - 864e5));   // 오늘 목록은 아직 없다
  const box = $("#homeList"); box.innerHTML = "";
  renderShelfBar(src);
  if (src === "lib" && shelfSel() !== "recent") { renderFolderList(box, shelfSel()); return; }
  if (src === "lib") {
    if (!state.library.length) {
      box.innerHTML = `<div class="home-empty"><b>아직 연 논문이 없습니다.</b><br>위의 <kbd>⌘K</kbd>에 arXiv 주소를 붙여넣거나, PDF를 화면에 끌어다 놓으세요.<br>「인기」·「내 분야」 탭에서 골라도 됩니다.</div>`;
      return;
    }
    for (const p of state.library) {
      const b = document.createElement("div"); b.className = "item lib"; b.tabIndex = 0; b.setAttribute("role", "button"); b.dataset.id = p.id;
      const bits = [p.arxiv_id || "내 PDF", p.last || p.added, p.turns ? `질문 ${p.turns}` : "", p.notes ? `메모 ${p.notes}` : ""].filter(Boolean);
      const sh = shelfItemFor({ pid: p.id, ax: p.arxiv_id });
      b.innerHTML = `<span class="t">${esc(p.title || p.id)}</span><small>${bits.map(esc).join(" · ")}${shelfTags(sh)}</small>
        <button class="icon xs bm" title="폴더에 넣기" aria-label="폴더에 넣기" aria-haspopup="menu">${ic("bookmark")}</button>
        <button class="icon xs ren" title="이름 바꾸기" aria-label="이름 바꾸기">${ic("pencil")}</button>
        <button class="icon xs del" title="서재에서 빼기" aria-label="서재에서 빼기">${ic("trash")}</button>`;
      const t = b.querySelector(".t"); t.title = titleTip(p);
      b.onclick = (e) => {   // 이름을 고치는 중이면(입력칸 안에서 끌어 고르다 줄 위에서 놓은 경우 등) 열지 않는다
        const ed = b.querySelector(".title-edit");   // 입력칸에 글자를 고치는 중(포커스가 있음)일 때만 막는다
        if ((ed && document.activeElement === ed) || e.target.closest(".del, .ren, .bm")) return;
        logEvent("open", { via: "library" }); showPaper(p);
      };
      b.onkeydown = (e) => { if (e.key === "Enter" && e.target === b) { logEvent("open", { via: "library" }); showPaper(p); } };
      b.querySelector(".ren").onclick = () => inlineEdit(t, p.title || p.id, (v) => renamePaper(p, v, "list"), b.querySelector(".ren"));
      b.querySelector(".del").onclick = () => removePaper(p);
      b.querySelector(".bm").onclick = (e) => openShelfMenu(e.currentTarget, { pid: p.id, ax: p.arxiv_id, title: p.title || p.id }, "list");
      box.appendChild(b);
    }
    return;
  }
  box.innerHTML = `<p class="muted" style="padding:12px">불러오는 중…</p>`;
  const qs = new URLSearchParams({ source: src });
  if (src === "mine" && LS.get("pr_kw", "").trim()) qs.set("kw", LS.get("pr_kw", "").trim());
  if (src === "hf" && $("#feedDate").value) qs.set("date", $("#feedDate").value);
  try {
    const items = await api("/api/feed?" + qs);
    if (homeSrc() !== src) return;
    const have = new Set(state.library.map((p) => p.arxiv_id));
    box.innerHTML = items.length ? "" : `<p class="muted" style="padding:12px">${src === "hf" ? "그날 목록이 아직 없습니다. 날짜를 바꿔 보세요." : "논문이 없습니다. 설정에서 키워드를 바꿔 보세요."}</p>`;
    for (const it of items) {   // 줄 = 열기 · 책갈피 = 봐야할 논문에 넣기/빼기(한 번에, 되돌리기 알림)
      const b = document.createElement("div"); b.className = "item feed"; b.tabIndex = 0; b.setAttribute("role", "button"); b.dataset.ax = it.id;
      b.innerHTML = `<span class="t">${esc(it.title)}</span>
        <small>${it.upvotes != null ? `▲ ${it.upvotes} · ` : ""}${esc(it.id)} · ${esc(it.date)}${have.has(it.id) ? " · 서재에 있음" : ""}${it.authors ? " · " + esc(it.authors) : ""}<span class="fmark"></span></small>
        <span class="sum">${esc(it.summary)}</span>
        <button class="icon xs bm" aria-label="봐야할 논문에 넣기">${ic("bookmark")}</button>`;
      const go = () => { logEvent("open", { via: "feed-" + src }); openSrc(it.id); };
      b.onclick = (e) => { if (!e.target.closest(".bm")) go(); };
      b.onkeydown = (e) => { if ((e.key === "Enter" || e.key === " ") && e.target === b) { e.preventDefault(); go(); } };
      b.querySelector(".bm").onclick = () => toggleToread({ ax: it.id, title: it.title }, "feed-" + src);
      box.appendChild(b);
    }
    paintFeedMarks();
  } catch (e) { box.innerHTML = `<p class="muted" style="padding:12px">${esc(e.message)}</p>`; }
}
$$("#homeTabs button").forEach((b) => (b.onclick = () => { state.homeSrc = b.dataset.src; LS.set("pr_home", b.dataset.src); renderHome(); }));
$("#feedDate").onchange = renderHome;

// ---------- 이름 바꾸기: 서재 목록의 연필 · ⋯ 메뉴 → 그 자리에서 고친다(Enter 저장 · Esc 취소 · 비우면 처음 이름)
function titleTip(p) {
  const name = p.title || p.id;
  return [name, p.title_orig && p.title_orig !== name ? `원래 이름: ${p.title_orig}` : "",
    p.file_name && p.file_name !== name ? `파일 이름: ${p.file_name}` : ""].filter(Boolean).join("\n");
}
function setPaperTitle(meta) {
  const t = $("#paperTitle"), tip = titleTip(meta).split("\n");
  if (meta.abs_url) tip[0] += " — arXiv에서 열기";
  t.textContent = meta.title || meta.id; t.title = tip.join("\n");
  if (meta.abs_url) t.href = meta.abs_url; else t.removeAttribute("href");
}
let lastDown = { el: null, at: 0 };   // 마지막으로 누른 곳(입력칸이 무엇을 눌러서 닫히는지 알려고)
let pressing = false; const afterRelease = [];   // 누르고 있는 동안 미룬 화면 고치기(클릭이 끝난 뒤에 한다)
document.addEventListener("pointerdown", (e) => { lastDown = { el: e.target, at: performance.now() }; pressing = true; }, true);
const released = () => { pressing = false; const fs = afterRelease.splice(0); if (fs.length) setTimeout(() => fs.forEach((f) => f()), 0); };
["pointerup", "pointercancel"].forEach((ev) => document.addEventListener(ev, released, true));
window.addEventListener("blur", released);
const whenReleased = (f) => (pressing ? afterRelease.push(f) : f());
function inlineEdit(target, initial, onCommit, back, opts = {}) {
  if (target.hidden) return;   // 이미 고치는 중
  const inp = document.createElement("input");
  inp.className = "title-edit"; inp.value = initial; inp.maxLength = opts.max || 200; inp.spellcheck = false;
  inp.placeholder = opts.placeholder || "비우고 Enter면 처음 이름으로"; inp.setAttribute("aria-label", opts.label || "논문 이름");
  target.hidden = true; target.after(inp); inp.focus();
  inp.select(); inp.scrollLeft = 0;   // 전부 고르되 긴 이름의 앞부분이 보이게(역방향 고르기로는 앞으로 굴러가지 않았다)
  let fin = false;   // remove()가 blur를 다시 부르므로 한 번만
  const done = (save, byKey) => {
    if (fin) return; fin = true;
    const v = inp.value.trim();
    inp.onblur = null;
    const close = () => { inp.remove(); target.hidden = false; };
    if (byKey) close(); else whenReleased(close);   // 다른 곳을 눌러 닫혔으면 그 클릭이 끝난 뒤에 치운다(줄 높이가 바뀌어 클릭이 사라지지 않게)
    if (byKey && back && back.isConnected) back.focus({ preventScroll: true });   // 키보드로 끝냈으면 시작한 단추로
    if (save && v !== initial) onCommit(v);
  };
  inp._finish = done;
  inp.onkeydown = (e) => {
    e.stopPropagation();
    if (e.isComposing || e.keyCode === 229) return;   // 한글 조합 중 Enter는 글자를 확정할 뿐
    if (e.key === "Enter") { e.preventDefault(); done(true, true); }
    else if (e.key === "Escape") { e.preventDefault(); done(false, true); }
    else if (e.key === "Tab" && inp.closest("#shelfMenu")) {
      e.preventDefault(); done(false, true);
      const a = shelfMenu.anchor; $("#shelfMenu").hidden = true; if (a && a.isConnected) a.focus({ preventScroll: true });
    }
  };
  // 밖을 눌러 닫으면 저장. 비운 채면 취소(처음 이름으로 되돌리기는 Enter로만) · 알림의 「되돌리기」를 눌러 닫혔으면 취소
  inp.onblur = () => {
    const el = lastDown.el, toastPress = performance.now() - lastDown.at < 1500 && el && el.closest && el.closest("#toast");
    done(opts.commitOnBlur !== false && !!inp.value.trim() && !toastPress);   // 메뉴 안 새 폴더 칸은 Enter로만(밖을 누르면 취소)
  };
  inp.onclick = (e) => e.stopPropagation();
}
function closeTitleEdits() { $$(".title-edit").forEach((i) => i._finish && i._finish(!!i.value.trim())); }   // 다른 논문으로 넘어가기 전에 저장
function applyTitle(id, meta) {
  const put = (q) => { q.title = meta.title; q.title_orig = meta.title_orig; };
  state.library.filter((q) => q.id === id).forEach(put);
  (state.shelves.items || []).filter((s) => s.lib === id).forEach((s) => { s.title = meta.title; });
  (state.shelves.items || []).filter((s) => s.from === id).forEach((s) => { s.from_title = meta.title; });
  if (state.paper && state.paper.id === id) {
    put(state.paper); setPaperTitle(state.paper);
    const hello = $("#messages .empty-chat .hello b"); if (hello) hello.textContent = meta.title;
  }
  // 목록은 다시 그리지 않고 그 줄 글자만, 그것도 마우스를 뗀 뒤에(누르는 사이에 줄 높이가 바뀌면 다른 논문을 누른 클릭이 사라진다)
  whenReleased(() => {
    const row = $$("#homeList .item.lib").find((r) => r.dataset.id === id);
    if (row) { const t = $(".t", row); t.textContent = meta.title; t.title = titleTip(state.library.find((q) => q.id === id) || meta); }
    let fromRow = false;
    for (const r of $$("#homeList .item.shelf")) {
      const s = (state.shelves.items || []).find((x) => x.key === r.dataset.key);
      if (s && s.lib === id) $(".t", r).textContent = meta.title;
      if (s && s.from === id) fromRow = true;
    }
    if (fromRow && !$(".title-edit")) renderHome();   // 그 논문에서 넣은 줄의 「…에서」도 새 이름으로
  });
  if (!$("#palette").hidden) buildPalette();
}
async function renamePaper(p, title, where) {
  const before = p.title || p.id;
  try {
    applyTitle(p.id, await postJSON("/api/rename/" + encodeURIComponent(p.id), { title }));
    logEvent("rename", { where, reset: !title });
    toast(title ? "이름을 바꿨습니다." : "처음 이름으로 되돌렸습니다.", 6000, { label: "되돌리기", run: async () => {
      try { applyTitle(p.id, await postJSON("/api/rename/" + encodeURIComponent(p.id), { title: before })); toast("되돌렸습니다."); }
      catch (e) { toast(e.message); }
    } });
  } catch (e) { toast(e.message, 4000); }
}

// ---------- 폴더: 봐야할 논문 · 살펴본 논문 · 내 폴더(서버 library/_shelves.json이 정본 · 바꾼 뒤 서버가 준 목록으로 다시 그린다)
async function loadShelves() { try { state.shelves = await api("/api/shelves"); } catch (e) {} }
const axBase = (id) => String(id || "").replace(/v\d+$/, "");
const folderName = (fid) => ((state.shelves.folders || []).find((f) => f.id === fid) || {}).name || "";
const josaRo = (w) => { const c = String(w || "").trim().slice(-1); if (c < "가" || c > "힣") return "(으)로"; const j = (c.charCodeAt(0) - 0xac00) % 28; return j && j !== 8 ? "으로" : "로"; };
const dateLabel = (t) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(t || ""); return m ? `${+m[2]}월 ${+m[3]}일` : ""; };
// t = { key } | { pid(서재 id), ax(arXiv ID) } → 폴더 항목(어느 폴더에도 없으면 null)
function shelfItemFor(t) {
  const items = state.shelves.items || [];
  if (t.key) return items.find((s) => s.key === t.key) || null;
  const ax = t.ax ? axBase(t.ax) : null;
  return (t.pid && items.find((s) => s.lib === t.pid)) || (ax && items.find((s) => s.arxiv_id === ax || s.key === ax)) || null;
}
// 넣을 때 가리키는 것: 폴더 줄에서 연 메뉴는 그 항목 키(폴더에서 다 빠진 뒤에도 같은 항목 — 담은 이유·출처가 이어진다)
const shelfRef = (t, s) => (t.key ? { key: t.key } : s ? { key: s.key } : t.pid ? { id: t.pid } : { id: t.ax, title: t.title });
function shelfTags(s, except) {
  return s ? Object.keys(s.in || {}).filter((fid) => fid !== except).map((fid) => `<span class="ftag">${esc(folderName(fid))}</span>`).join("") : "";
}
function shelfSel() {
  if (state.shelfSel === undefined) state.shelfSel = LS.get("pr_shelf", "recent");
  const v = state.shelfSel;
  return v === "recent" || (state.shelves.folders || []).some((f) => f.id === v) ? v : "recent";
}
function setShelfSel(v) { state.shelfSel = v; LS.set("pr_shelf", v); }
// 논문 화면 빈 대화 인사의 폴더 줄(폴더 · 담은 이유 · 어디서 넣었는지)
function shelfWhy() {
  const s = state.paper ? shelfItemFor({ pid: state.paper.id, ax: state.paper.arxiv_id }) : null;
  return s ? `<small class="why">${ic("bookmark")}<span>${esc(Object.keys(s.in || {}).map(folderName).filter(Boolean).join(" · "))}`
    + `${s.note ? ` · 담은 이유: ${esc(s.note)}` : ""}${s.from_title && s.from !== state.paper.id ? ` · ${esc(s.from_title)}에서` : ""}</span></small>` : "";
}
// 폴더가 바뀐 뒤: 홈 목록(서재 탭은 다시 그리고, 피드는 책갈피만) · 논문 화면은 인사의 폴더 줄 · 열린 폴더 메뉴도 지금 상태로
// (이름 고치는 칸이 열려 있으면 목록은 두고, 누르는 중이면 뗀 뒤에)
function refreshShelfViews() {
  whenReleased(() => {
    if (state.paper) {
      const h = $("#messages .empty-chat .hello");
      if (h) { const old = $(".why", h); if (old) old.remove(); const b = $("b", h); if (b) b.insertAdjacentHTML("afterend", shelfWhy()); }
    } else if (!$("#home").hidden) {
      if (homeSrc() === "lib") { if (!$(".title-edit")) renderHome(); }
      else paintFeedMarks();
    }
    syncShelfMenu();
  });
}
async function shelfOps(ops, via, msg) {
  const r = await postJSON("/api/shelf", { ops });
  state.shelves = r.shelves; refreshShelfViews();
  logEvent("shelf", { op: ops.map((o) => o.op).join("+"), via });
  if (msg) toast(msg(r), 8000, r.undo && r.undo.length ? { label: "되돌리기", run: () => shelfUndo(r.undo) } : undefined);
  return r;
}
async function shelfUndo(undo) {
  try { const r = await postJSON("/api/shelf", { ops: undo }); state.shelves = r.shelves; refreshShelfViews(); toast("되돌렸습니다."); logEvent("shelf", { op: "undo" }); }
  catch (e) { toast(e.message, 4000); }
}
const shelfMsg = (r) => {
  const x = (r.results || []).find((q) => q.op === "add" || q.op === "remove") || {}, n = x.name || "";
  return x.status === "removed" ? `${n}에서 뺐습니다.` : x.status === "moved" ? `${n}${josaRo(n)} 옮겼습니다.` : x.status === "exists" ? `이미 ${n}에 있습니다.`
    : x.status === "absent" ? `${n}에 없습니다.` : `${n}에 넣었습니다.`;
};
// 메뉴로 넣거나 뺀 뒤: 포커스를 (다시 그린) 그 줄의 책갈피로 — 다음 Tab이 알림의 「되돌리기」로 가서 방금 한 일을 되돌리지 않게.
// 그 줄이 이 폴더에서 빠져 사라졌으면 같은 자리 줄(없으면 윗줄)의 책갈피, 줄이 없으면 지금 고른 칩으로
const shelfRowIndex = () => { const a = shelfMenu.anchor; return a ? $$("#homeList .item").findIndex((r) => r.contains(a)) : -1; };
// 마우스로 쓰던 메뉴가 닫히면 포커스는 목록 자리로 — 보이지 않는 책갈피에 두면 Space가 메뉴를 다시 열고 다음 Space가 첫 항목을 누른다
// (다음 Tab이 알림의 「되돌리기」로 가지 않게 하는 것은 같다)
function parkFocus() {
  // 늘 보이는 단추(논문 화면의 ⋯ 등)면 그 단추로 · 서재 목록의 책갈피는 마우스를 떼면 안 보이므로 목록 자리로 · 숨은 곳(메모 탭 뒤 대화)은 건너뛴다
  const a = shelfMenu.anchor, shown = (el) => !!el && el.isConnected && el.getClientRects().length > 0;
  for (const el of [a && !a.closest("#homeList") ? a : null, state.paper ? $("#messages") : $("#home"), state.paper ? $("#chat") : null]) {
    if (!shown(el)) continue;
    if (!el.matches("button, a, input, select, textarea, [tabindex]")) el.tabIndex = -1;
    el.focus({ preventScroll: true });
    if (document.activeElement === el) return;
  }
}
function refocusShelf(t, pos = -1) {
  const cur = document.activeElement;
  if (cur && cur !== document.body && !$("#shelfMenu").contains(cur)) return;   // 사용자가 이미 다른 곳으로 옮겼다
  if (!lastKbd) { parkFocus(); return; }   // 마우스로 고른 메뉴 → 목록 자리로(키보드면 그 줄의 책갈피로)
  let a = shelfAnchor(t);
  if (!a && pos >= 0) { const rows = $$("#homeList .item"), r = rows[Math.min(pos, rows.length - 1)]; a = r ? ($(".bm", r) || r) : $("#shelfBar .chip.on"); }
  if (a) a.focus({ preventScroll: true });
}
async function toggleShelf(t, fid, via, shown) {   // shown = 메뉴에 보인 상태(그 사이 다른 창이 바꿨어도 사용자가 본 대로)
  const fromMenu = !$("#shelfMenu").hidden, pos = fromMenu ? shelfRowIndex() : -1;
  $("#shelfMenu").hidden = true;
  const s = shelfItemFor(t), on = typeof shown === "boolean" ? shown : !!(s && s.in && s.in[fid]);
  if (on && !s) { refreshShelfViews(); toast(`${folderName(fid)}에 없습니다.`); if (fromMenu) refocusShelf(t, pos); return; }
  try { await shelfOps([on ? { op: "remove", folder: fid, key: s.key } : { op: "add", folder: fid, item: shelfRef(t, s), from: t.from }], via, shelfMsg); }
  catch (e) { toast(e.message, 4000); }
  if (fromMenu) refocusShelf(t, pos);
}
function toggleToread(t, via) { toggleShelf(t, "toread", via); }
async function newFolder(name, t, via) {   // t가 있으면 그 논문을 새 폴더에 바로 넣는다
  $("#shelfMenu").hidden = true;
  const ops = [{ op: "new", name }];
  if (t) ops.push({ op: "add", folder: "@" + name, item: shelfRef(t, shelfItemFor(t)), from: t.from });
  try {
    const r = await shelfOps(ops, via, (r) => t ? `새 폴더 「${r.results[0].name}」에 넣었습니다.` : `폴더를 만들었습니다: ${r.results[0].name}`);
    if (!t) { setShelfSel(r.results[0].folder); renderHome(); }
  } catch (e) { toast(e.message, 4000); }
  if (t) refocusShelf(t);
}
async function dropFolder(f) {
  try {
    await shelfOps([{ op: "drop", folder: f.id }], "bar", (r) => `폴더를 지웠습니다: ${f.name}${r.results[0].n ? ` · 논문 ${r.results[0].n}편은 서재·다른 폴더에 그대로` : ""}`);
    setShelfSel("recent"); renderHome();
  } catch (e) { toast(e.message, 4000); }
}
// 폴더 고르기 메뉴: 폴더마다 넣기/빼기(봐야할↔살펴본은 서버가 옮긴다) · 새 폴더…
let shelfMenu = { target: null, via: null, anchor: null };
// 메뉴를 연 단추 — 목록을 다시 그렸으면 같은 줄의 새 책갈피(논문 화면은 ⋯ 단추)
function shelfAnchor(t) {
  if (!t || t === shelfMenu.target) { if (shelfMenu.anchor && shelfMenu.anchor.isConnected) return shelfMenu.anchor; t = shelfMenu.target; }
  if (!t) return null;
  if (t.from && state.paper && t.from === state.paper.id) return $("#viewMenuBtn");
  const row = t.key ? $$("#homeList .item.shelf").find((r) => r.dataset.key === t.key)
    : t.pid ? $$("#homeList .item.lib").find((r) => r.dataset.id === t.pid) : null;
  return row ? $(".bm", row) : null;
}
// 폴더가 바뀌면 열린 메뉴도 지금 상태로 그리고, 목록을 다시 그려 그 줄이 움직였으면 메뉴도 따라간다(그 줄이 사라졌거나 화면 밖이면
// 닫고, 새 폴더 이름을 쓰는 중이면 그대로 둔다). 포커스는 같은 폴더 항목에 둔다(폴더가 늘거나 줄어도 다른 폴더로 옮겨 가지 않게)
const shelfBtnKey = (b) => (b && b.dataset ? b.dataset.fid || "" : "");
function syncShelfMenu() {
  const m = $("#shelfMenu"); if (m.hidden || $(".title-edit", m)) return;
  const a = shelfAnchor();
  if (!a) { m.hidden = true; return; }
  const r = a.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight || (!r.width && !r.height)) { m.hidden = true; return; }
  const keep = m.contains(document.activeElement) ? shelfBtnKey(document.activeElement) : "";
  if (a !== shelfMenu.anchor) { shelfMenu.anchor = a; a.setAttribute("aria-expanded", "true"); }
  renderShelfMenu(); placeShelfMenu(a);
  if (keep) { const b = $$("#shelfMenu > button").find((x) => shelfBtnKey(x) === keep); if (b) b.focus({ preventScroll: true }); }
}
function placeShelfMenu(anchor) {
  const m = $("#shelfMenu"), r = anchor.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + "px";
  m.style.top = (r.bottom + 4 + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 4) : r.bottom + 4) + "px";
}
function openShelfMenu(anchor, target, via) {
  const m = $("#shelfMenu");
  if (!m.hidden && shelfMenu.anchor === anchor) { m.hidden = true; if (!lastKbd) parkFocus(); return; }   // 같은 단추를 다시 누르면 닫기(마우스면 포커스는 목록 자리로)
  closeMenus();
  if (shelfMenu.anchor && shelfMenu.anchor !== anchor) shelfMenu.anchor.setAttribute("aria-expanded", "false");
  shelfMenu = { target, via, anchor };
  renderShelfMenu(); m.hidden = false; anchor.setAttribute("aria-expanded", "true");
  placeShelfMenu(anchor);
  const first = m.querySelector("button"); if (first) first.focus({ preventScroll: true });
  logEvent("shelf-menu", { via });
}
function renderShelfMenu() {
  const m = $("#shelfMenu"), t = shelfMenu.target; if (!t) return;
  const s = shelfItemFor(t);
  m.innerHTML = `<div class="mhead" title="${esc(t.title || "")}">${esc(t.title || "")}</div>`;
  for (const f of state.shelves.folders || []) {
    const on = !!(s && s.in && s.in[f.id]);
    const b = document.createElement("button"); b.className = on ? "on" : ""; b.setAttribute("role", "menuitemcheckbox"); b.setAttribute("aria-checked", on ? "true" : "false");
    b.dataset.fid = f.id;
    b.innerHTML = `${ic(on ? "check" : f.builtin ? "bookmark" : "folder")}<span>${esc(f.name)}</span>`;
    b.title = on ? `${f.name}에서 빼기` : f.id === "seen" && s && s.in.toread ? "살펴본 논문으로 옮기기" : f.id === "toread" && s && s.in.seen ? "봐야할 논문으로 옮기기" : `${f.name}에 넣기`;
    b.onclick = () => toggleShelf(t, f.id, shelfMenu.via, on);
    m.appendChild(b);
  }
  const sep = document.createElement("div"); sep.className = "msep"; m.appendChild(sep);
  const nb = document.createElement("button"); nb.innerHTML = `${ic("plus")}<span>새 폴더…</span>`; nb.setAttribute("role", "menuitem"); nb.dataset.fid = "new";
  nb.onclick = () => inlineEdit(nb, "", (v) => newFolder(v, t, shelfMenu.via), nb, { placeholder: "새 폴더 이름 · Enter", label: "새 폴더 이름", max: 40, commitOnBlur: false });
  m.appendChild(nb);
}
// 서재 탭 아래 칩: 최근 · 봐야할 논문 · 살펴본 논문 · 내 폴더… · ＋ 새 폴더 (고른 칩은 기억)
function renderShelfBar(src) {
  const bar = $("#shelfBar"); bar.hidden = src !== "lib"; if (bar.hidden) return;
  const sel = shelfSel(); bar.innerHTML = "";
  const chip = (id, name, n) => {
    const b = document.createElement("button"); b.className = "chip" + (sel === id ? " on" : ""); b.dataset.folder = id;
    b.innerHTML = `<span>${esc(name)}</span><span class="n">${n}</span>`;
    b.onclick = () => { setShelfSel(id); logEvent("shelf-view", { folder: ["recent", "toread", "seen"].includes(id) ? id : "custom" }); renderHome(); };
    bar.appendChild(b);
  };
  chip("recent", "최근", state.library.length);
  for (const f of state.shelves.folders || []) chip(f.id, f.name, f.count);
  const nb = document.createElement("button"); nb.className = "chip add"; nb.innerHTML = `${ic("plus")}<span>새 폴더</span>`;
  nb.onclick = () => inlineEdit(nb, "", (v) => newFolder(v, null, "bar"), nb, { placeholder: "새 폴더 이름 · Enter", label: "새 폴더 이름", max: 40 });
  bar.appendChild(nb);
  const cur = (state.shelves.folders || []).find((f) => f.id === sel && !f.builtin);
  if (cur) {
    const d = document.createElement("button"); d.className = "icon xs"; d.title = "이 폴더 지우기(논문은 서재에 그대로)"; d.setAttribute("aria-label", "이 폴더 지우기");
    d.innerHTML = ic("trash"); d.onclick = () => dropFolder(cur); bar.appendChild(d);
  }
}
function renderFolderList(box, fid) {
  const f = (state.shelves.folders || []).find((x) => x.id === fid) || { name: "" };
  const items = (state.shelves.items || []).filter((s) => s.in && s.in[fid]).sort((a, b) => { const x = a.in[fid] || "", y = b.in[fid] || ""; return x < y ? 1 : x > y ? -1 : 0; });   // 최근에 넣은 순(같으면 서버 순서 = 나중에 넣은 것 먼저)
  if (!items.length) {   // 인기·내 분야의 책갈피는 봐야할 논문에만 넣는다
    const how = fid === "toread" ? "「최근」·「인기」·「내 분야」 목록에서 책갈피 아이콘을 누르세요." : "「최근」 목록에서 책갈피 아이콘을 눌러 이 폴더를 고르세요.";
    box.innerHTML = `<div class="home-empty"><b>아직 넣은 논문이 없습니다.</b><br>대화에서 「${esc(f.name)}에 넣어 줘」라고 하거나,<br>${how}</div>`;
    return;
  }
  for (const s of items) {
    const lib = s.lib ? state.library.find((p) => p.id === s.lib) : null;
    const b = document.createElement("div"); b.className = "item lib shelf"; b.tabIndex = 0; b.setAttribute("role", "button"); b.dataset.key = s.key;
    const bits = [s.arxiv_id || (s.lib ? "내 PDF" : s.gone ? "서재에서 뺀 PDF" : "arXiv ID 모름"), `${dateLabel(s.in[fid])} 넣음`,
      s.from_title && s.from !== s.lib ? `${s.from_title}에서` : "", lib ? "서재에 있음" : "", s.arxiv === "unchecked" ? "arXiv 확인 전" : ""].filter(Boolean);
    b.innerHTML = `<span class="t">${esc(s.title)}</span><small>${bits.map(esc).join(" · ")}${shelfTags(s, fid)}</small>${s.note ? `<span class="sum">${esc(s.note)}</span>` : ""}
      <button class="icon xs bm" title="폴더 고르기" aria-label="폴더 고르기" aria-haspopup="menu">${ic("bookmark")}</button>
      <button class="icon xs unshelf" title="이 폴더에서 빼기" aria-label="이 폴더에서 빼기">${ic("x")}</button>`;
    b.querySelector(".t").title = s.title + (s.note ? "\n" + s.note : "");
    const open = async () => {
      logEvent("open", { via: "shelf" });
      let lp = lib;
      if (s.lib && !lp) { await loadLibrary(); lp = state.library.find((p) => p.id === s.lib); }   // 다른 탭·창에서 올린 PDF 등
      if (lp) return showPaper(lp);
      if (s.arxiv_id) return openSrc(s.arxiv_id);
      if (s.gone) return toast("서재에서 뺀 PDF입니다. 같은 PDF를 다시 올리면 이 줄에 이어집니다.", 5000);
      if (s.lib) return toast("서재에서 이 논문을 찾지 못했습니다. 화면을 새로 고쳐 보세요.", 4000);   // 서재 논문을 제목 검색으로 엉뚱하게 잇지 않게
      openPalette(s.title, s); palResolve(s.title);   // 제목만 넣은 논문 → arXiv에서 제목으로 찾고, 이 창에서 고른 논문에 잇는다
    };
    b.onclick = (e) => { if (!e.target.closest(".bm, .unshelf")) open(); };
    b.onkeydown = (e) => { if (e.key === "Enter" && e.target === b) open(); };
    b.querySelector(".bm").onclick = (e) => openShelfMenu(e.currentTarget, { key: s.key, title: s.title }, "folder");
    b.querySelector(".unshelf").onclick = () => shelfOps([{ op: "remove", folder: fid, key: s.key }], "folder", shelfMsg).catch((e) => toast(e.message, 4000));
    box.appendChild(b);
  }
}
// 제목만 넣어 둔 논문을 찾기 창에서 고른 논문에 잇는다(폴더·담은 이유·자동 옮기기 그대로 — 서버가 그 항목(merge = 키)을 합친다.
// 고른 논문이 이미 서재에 있어 제목이 달라도)
function relinkShelf(s, id) {
  const fid = Object.keys(s.in || {})[0]; if (!fid || !id) return;
  shelfOps([{ op: "add", folder: fid, item: { id, title: s.title }, merge: s.key, at: s.in[fid] }], "relink").catch(() => {});
}
// 인기·내 분야 줄: 봐야할 논문에 든 것은 책갈피를 칠하고 폴더 이름표를 단다(목록을 다시 받지 않고)
function paintFeedMarks() {
  for (const row of $$("#homeList .item.feed")) {
    const s = shelfItemFor({ ax: row.dataset.ax }), on = !!(s && s.in && s.in.toread), bm = $(".bm", row);
    bm.classList.toggle("on", on); bm.title = on ? "봐야할 논문에서 빼기" : "봐야할 논문에 넣기"; bm.setAttribute("aria-label", bm.title);
    $(".fmark", row).innerHTML = shelfTags(s);
  }
}
// 대화가 넣은 결과(<shelf> → 서버 카드) · 봐야할 → 살펴본 자동 옮기기
function handleShelfEvent(d, quiet) {
  if (d.shelves) { state.shelves = d.shelves; refreshShelfViews(); }
  const res = d.results || [], changed = res.filter((r) => r.status === "added" || r.status === "moved");
  if (res.length) logEvent("shelf", { op: "add", via: "chat", n: changed.length });
  if (quiet || !res.length) return;
  if (!changed.length) { toast("이미 폴더에 있습니다."); return; }
  const names = [...new Set(changed.map((r) => r.name))].join(" · "), moved = changed.every((r) => r.status === "moved");
  const what = `${(changed[0].title || "").slice(0, 40)}${changed.length > 1 ? ` 외 ${changed.length - 1}편` : ""}`;
  toast(moved ? `${names}${josaRo(names)} 옮겼습니다: ${what}` : `${names}에 넣었습니다: ${what}`, 8000,
    d.undo && d.undo.length ? { label: "되돌리기", run: () => shelfUndo(d.undo) } : undefined);
}
function handleShelfMoved(d, later) {   // later: 같은 답의 기억 알림(되돌리기·그래도 저장)이 먼저 떠 있으면 그게 사라진 뒤에 띄운다
  if (d.shelves) { state.shelves = d.shelves; refreshShelfViews(); }
  logEvent("shelf", { op: "auto-move" });
  const show = () => toast(`다 봐서 살펴본 논문으로 옮겼습니다: ${(d.title || "").slice(0, 40)}`, 8000, { label: "되돌리기", run: () => shelfUndo(d.undo) });
  if (!later) return show();
  const t = $("#toast"), iv = setInterval(() => { if (t.hidden) { clearInterval(iv); show(); } }, 400);
}
// 다른 탭·창에서 바꿨을 수 있다 → 돌아오면 서재와 폴더를 다시 받아 그린다(다른 창에서 올린 PDF도 · 열린 메뉴도 지금 상태로)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  const before = JSON.stringify([state.library, state.shelves]);
  loadLibrary().then(() => { if (JSON.stringify([state.library, state.shelves]) !== before) refreshShelfViews(); });
});
// 메뉴 키보드: 화살표·Home·End로 옮겨 다니고(메뉴가 길면 그 항목이 보이게 굴린다), Tab·Shift+Tab은 메뉴를 닫고 연 단추로
// (알림의 「되돌리기」로 넘어가 방금 한 일을 되돌리지 않게) · 포커스가 메뉴 밖(연 단추 말고)으로 나가면 닫는다 · 목록을 굴리거나 창 크기가 바뀌면 닫는다
$("#shelfMenu").addEventListener("keydown", (e) => {
  if (e.key === "Tab") { e.preventDefault(); const a = shelfMenu.anchor; $("#shelfMenu").hidden = true; if (a && a.isConnected) a.focus({ preventScroll: true }); return; }
  if (e.target.classList.contains("title-edit")) return;
  const bs = $$("#shelfMenu > button"), n = bs.length, i = bs.indexOf(document.activeElement);
  const go = (j) => { e.preventDefault(); if (n) { const b = bs[((j % n) + n) % n]; b.focus({ preventScroll: true }); b.scrollIntoView({ block: "nearest" }); } };
  if (e.key === "ArrowDown") go(i + 1); else if (e.key === "ArrowUp") go(i < 0 ? n - 1 : i - 1);
  else if (e.key === "Home") go(0); else if (e.key === "End") go(n - 1);
});
// 메뉴의 제목·여백을 눌러도 포커스가 메뉴 밖으로 빠지지 않게(메뉴가 닫히거나 쓰던 새 폴더 이름이 지워지지 않게)
$("#shelfMenu").addEventListener("mousedown", (e) => { if (!e.target.closest("button, input")) e.preventDefault(); });
let shelfMenuFocused = false;   // 메뉴 안에 포커스가 있었나
let lastKbd = false;   // 마지막 입력이 키보드였나(메뉴가 저절로 닫힐 때 포커스를 어디에 둘지)
document.addEventListener("keydown", () => { lastKbd = true; }, true);
document.addEventListener("pointerdown", () => { lastKbd = false; }, true);
$("#shelfMenu").addEventListener("focusin", () => { shelfMenuFocused = true; });
$("#shelfMenu").addEventListener("focusout", () => setTimeout(() => {
  const m = $("#shelfMenu"), cur = document.activeElement;
  if (!m.contains(cur) && cur && cur !== document.body) shelfMenuFocused = false;   // 사용자가 다른 곳으로 옮겼다
  if (!m.hidden && !m.contains(cur) && cur !== shelfMenu.anchor && document.hasFocus()) m.hidden = true;
}, 0));
$("#home").addEventListener("scroll", () => { const m = $("#shelfMenu"); if (!m.hidden && !$(".title-edit", m)) m.hidden = true; }, { passive: true });
window.addEventListener("resize", () => { $("#shelfMenu").hidden = true; });
// 메뉴가 닫히면 연 단추의 aria-expanded도 끈다(닫는 곳이 여럿이라 한곳에서)
new MutationObserver(() => {
  if (!$("#shelfMenu").hidden) return;
  if (shelfMenu.anchor) shelfMenu.anchor.setAttribute("aria-expanded", "false");
  if (!shelfMenuFocused) return;
  shelfMenuFocused = false;
  setTimeout(() => {
    const cur = document.activeElement;
    if (cur && cur !== document.body && !$("#shelfMenu").contains(cur)) return;
    // 키보드로 쓰던 메뉴 → 연 단추(없으면 고른 칩)로 · 마우스로 쓰던 메뉴 → 목록 자리로(보이지 않는 책갈피에 두면 Space가 메뉴를 다시 연다)
    // — 어느 쪽이든 다음 Tab이 알림의 「되돌리기」로 가지 않게
    const a = lastKbd && (shelfMenu.anchor && shelfMenu.anchor.isConnected ? shelfMenu.anchor : $("#shelfBar .chip.on"));
    if (a) a.focus({ preventScroll: true }); else parkFocus();
  }, 0);
}).observe($("#shelfMenu"), { attributes: true, attributeFilter: ["hidden"] });

async function removePaper(p) {
  try {
    await flushNoteSave();   // 쓰던 메모를 먼저 저장한다(빼고 나면 저장할 곳이 없다 · 되돌리면 그대로 돌아온다)
    const r = await postJSON("/api/delete/" + encodeURIComponent(p.id), {});
    if (state.paper && state.paper.id === p.id) await goHome();
    await loadLibrary(); if (!state.paper) renderHome(); logEvent("remove", { id: p.id });
    toast(`서재에서 뺐습니다: ${(p.title || p.id).slice(0, 40)}`, 8000, { label: "되돌리기", run: async () => {
      try { await postJSON("/api/restore", { trash: r.trash }); await loadLibrary(); if (!state.paper) renderHome(); toast("되돌렸습니다."); logEvent("restore", { id: p.id }); }
      catch (e) { toast(e.message); }
    } });
  } catch (e) { toast(e.message, 4000); }
}

// ---------- 논문 열기: ⌘K 찾기 창 · 끌어다 놓기
const ARXIV_RE = /^\s*(?:arxiv:\s*)?(\d{4}\.\d{4,5})(v\d+)?\s*$|arxiv\.org\/(?:abs|pdf|html)\/([\w.\-\/]+?)(?:v\d+)?(?:\.pdf)?(?:[?#].*)?\s*$/i;
const pal = { items: [], sel: 0, relink: null };
function openPalette(prefill = "", relink = null) {
  closeMenus(); pal.relink = relink; $("#palette").hidden = false; const inp = $("#palInput"); inp.value = prefill; buildPalette(); inp.focus(); inp.select();
}
function closePalette() { $("#palette").hidden = true; }
function palPicked(id) { const s = pal.relink; pal.relink = null; if (s && id) relinkShelf(s, id); }
function buildPalette() {
  const q = $("#palInput").value.trim(), ql = q.toLowerCase();
  const items = [];
  const am = q.match(ARXIV_RE);
  if (am) items.push({ group: "열기", icon: "external", title: `arXiv ${am[1] || am[3]} 열기`, sub: "받아서 서재에 넣고 엽니다", run: () => { logEvent("open", { via: "palette-id" }); palPicked(am[1] || am[3]); openSrc(q); } });
  const lib = state.library.filter((p) => !ql || (p.title || "").toLowerCase().includes(ql) || (p.id || "").toLowerCase().includes(ql)).slice(0, ql ? 12 : 8);
  for (const p of lib) items.push({ group: "서재", icon: "book", title: p.title || p.id, sub: [p.arxiv_id || "내 PDF", p.last || p.added].filter(Boolean).join(" · "), run: () => { logEvent("open", { via: "palette-library" }); palPicked(p.id); showPaper(p); } });
  if (q && !am) {
    items.push({ group: "찾기", icon: "search", title: `제목으로 arXiv에서 찾기: ${q}`, run: () => palResolve(q), keep: true });
    items.push({ group: "찾기", icon: "message", title: `Claude에게 물어보기: ${q}`, sub: "논문 찾기 대화 — 웹 검색·전문 읽기", run: async () => { logEvent("palette-ask"); await goHome(); ask(q); } });
  }
  items.push({ group: "올리기", icon: "upload", title: "PDF 올리기…", sub: "화면에 끌어다 놓아도 됩니다", run: () => $("#fileInput").click() });
  pal.items = items; pal.sel = 0; renderPalette();
}
function renderPalette() {
  const box = $("#palList"); box.innerHTML = ""; let group = null;
  pal.items.forEach((it, i) => {
    if (it.group !== group) { group = it.group; const h = document.createElement("div"); h.className = "phead"; h.textContent = group; box.appendChild(h); }
    const b = document.createElement("button"); b.className = "pitem" + (i === pal.sel ? " sel" : "");
    b.innerHTML = `${ic(it.icon)}<span class="ptxt"><b>${esc(it.title)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ""}</span>`;
    b.title = it.title;
    b.onmouseenter = () => { pal.sel = i; $$(".pitem", box).forEach((x, j) => x.classList.toggle("sel", j === i)); };
    b.onclick = () => runPal(i);
    box.appendChild(b);
  });
  const s = $(".pitem.sel", box); s && s.scrollIntoView({ block: "nearest" });
}
function runPal(i) { const it = pal.items[i]; if (!it) return; if (!it.keep) closePalette(); it.run(); }
async function palResolve(q) {
  pal.items = [{ group: "arXiv 검색", icon: "search", title: "찾는 중…", run: () => {}, keep: true }]; pal.sel = 0; renderPalette();
  try {
    const list = await postJSON("/api/resolve", { text: q });
    pal.items = list.length ? list.map((it) => ({ group: "arXiv 검색", icon: "external", title: it.title, sub: [it.id, it.date, it.authors].filter(Boolean).join(" · "), run: () => { logEvent("open", { via: "palette-search" }); palPicked(it.id); openSrc(it.id); } }))
      : [{ group: "arXiv 검색", icon: "search", title: pal.relink ? "arXiv에서 찾지 못했습니다. arXiv에 없는 논문일 수 있어요 — PDF가 있으면 화면에 끌어다 놓으세요." : "찾지 못했습니다. 제목을 더 정확히 적어 보세요.", run: () => {}, keep: true }];
  } catch (e) { pal.items = [{ group: "arXiv 검색", icon: "x", title: e.message, run: () => {}, keep: true }]; }
  pal.sel = 0; renderPalette();
}
$("#palInput").addEventListener("input", buildPalette);
$("#palInput").addEventListener("keydown", (e) => {
  if (e.isComposing) return;
  if (e.key === "ArrowDown") { e.preventDefault(); pal.sel = Math.min(pal.items.length - 1, pal.sel + 1); renderPalette(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); pal.sel = Math.max(0, pal.sel - 1); renderPalette(); }
  else if (e.key === "Enter") { e.preventDefault(); runPal(pal.sel); }
  else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closePalette(); }   // 창만 닫는다(답은 멈추지 않게)
});
$("#palette").addEventListener("mousedown", (e) => { if (e.target.id === "palette") closePalette(); });
$("#paletteBtn").onclick = () => openPalette();

async function openSrc(src) {
  if (!String(src).trim()) return;
  closePalette(); $("#loading").hidden = false; $("#refPop").hidden = true; $("#citePop").hidden = true;
  try { const meta = await postJSON("/api/open", { src }); await loadLibrary(); showPaper(meta); }
  catch (e) { toast(e.message, 5000); }
  finally { $("#loading").hidden = true; }
}
async function uploadFile(f) {
  if (!f) return;
  if (f.size > 300e6) { toast("300MB가 넘는 PDF는 올릴 수 없습니다.", 5000); return; }   // 서버 한도(본문을 읽기 전에 끊으면 오류 글이 안 보인다)
  $("#loading").hidden = false;
  try {
    const meta = await api("/api/upload", { method: "POST", headers: { "X-Filename": encodeURIComponent(f.name) }, body: await f.arrayBuffer() });
    await loadLibrary(); showPaper(meta);
  } catch (err) { toast(err.message, 5000); }
  finally { $("#loading").hidden = true; }
}
$("#fileInput").onchange = (e) => { logEvent("open", { via: "upload" }); uploadFile(e.target.files[0]); e.target.value = ""; };
// 입력칸 밖에서 ⌘V로 arXiv 주소·ID를 붙여넣으면 바로 연다(논문 칸 안에서 붙여도: hookFrame이 같은 함수를 단다)
function onPaste(e) {
  const t = e.target, typing = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
  if (typing || !$("#palette").hidden) return;
  const s = (e.clipboardData && e.clipboardData.getData("text") || "").trim();
  if (s.length < 200 && ARXIV_RE.test(s)) { e.preventDefault(); logEvent("open", { via: "paste" }); openSrc(s); }
}
document.addEventListener("paste", onPaste);
// PDF를 화면 어디에나 끌어다 놓으면 연다. 안내(#dropHint)는 pointer-events:none이라 놓는 곳이 못 된다 → 창과 논문 칸 문서가 직접 받는다
const hasFiles = (e) => e.dataTransfer && [...e.dataTransfer.types].includes("Files");
function showDrop(e) { if (hasFiles(e)) { e.preventDefault(); $("#dropHint").hidden = false; } }
function leaveDrop(e) { if (!e.relatedTarget) $("#dropHint").hidden = true; }   // 창 밖으로 나가거나 끌기를 그만둠(논문 칸을 드나들 때 숨으면 dragover가 다시 띄운다)
function onDrop(e) {
  if (!hasFiles(e)) return;
  e.preventDefault(); $("#dropHint").hidden = true;
  const f = [...e.dataTransfer.files].find((x) => x.type === "application/pdf" || /\.pdf$/i.test(x.name));
  if (f) { logEvent("open", { via: "drop" }); uploadFile(f); } else toast("PDF 파일만 열 수 있습니다.");
}
const DROP_EVENTS = [["dragenter", showDrop], ["dragover", showDrop], ["dragleave", leaveDrop], ["drop", onDrop]];
for (const [t, fn] of DROP_EVENTS) window.addEventListener(t, fn);

// ---------- 화면 전환: 홈 ↔ 논문
function setChatMode(home) {
  $("#notesTab").hidden = home; $("#captureBtn").hidden = home;
  if (home && !$("#notesPane").hidden) switchTab("chatPane");
  $("#askInput").placeholder = home ? "어떤 논문을 찾을지 물어보세요 · / 빠른 질문" : "이 논문에 대해 질문하기 · / 빠른 질문";
}
async function goHome() {
  closeTitleEdits(); flushNoteSave(); savePosNow(); closeMenus();
  state.paper = null; history.replaceState(null, "", location.pathname);
  $("#paperFrame").hidden = true; $("#paperFrame").src = "about:blank"; $("#home").hidden = false; $("#viewBar").hidden = true;
  $("#brand").hidden = false; $("#paperTitle").hidden = true;
  state.notes = []; renderNotes(); clearAttach(); setQuote("");
  setChatMode(true);
  $("#messages").innerHTML = "";
  await loadLibrary();
  renderHome();
  const chat = await api("/api/chat/_home").catch(() => ({ messages: [] }));
  if (state.paper) return;
  $("#messages").innerHTML = "";
  renderHistory(chat);
}
$("#homeBtn").onclick = () => goHome();

async function showPaper(meta) {
  closeTitleEdits();
  const flushing = flushNoteSave(); savePosNow(); closeMenus(); closePalette();
  state.paper = meta; state.notes = []; renderNotes();
  history.replaceState(null, "", "#paper=" + encodeURIComponent(meta.id));
  $("#home").hidden = true; $("#paperFrame").hidden = false;
  $("#brand").hidden = true;
  $("#paperTitle").hidden = false; setPaperTitle(meta);
  setChatMode(false);
  setView(meta.kind === "html" ? viewOf(meta.id) : "pdf");
  $("#messages").innerHTML = ""; setQuote(""); clearAttach();
  const [chat, notes] = await Promise.all([
    api("/api/chat/" + encodeURIComponent(meta.id)).catch(() => ({ messages: [] })),
    Promise.resolve(flushing).then(() => api("/api/notes/" + encodeURIComponent(meta.id))).catch(() => []),   // 같은 논문을 다시 열 때 막 보낸 메모보다 먼저 읽지 않게
  ]);
  if (state.paper !== meta) return;
  state.notes = notes; renderNotes(); applyNotes();
  $("#messages").innerHTML = "";
  renderHistory(chat);
  pruneJumps($("#messages"));   // 논문이 먼저 열렸으면 여기서, 아니면 hookFrame에서
}

// ---------- 논문 보기: PDF 원문(기본) / arXiv HTML판 + 아래 작은 막대
function prefView() { return LS.get("pr_view", "pdf"); }
const viewOf = (id) => LS.get("pr_viewof_" + id, null) || prefView();   // 논문마다 마지막으로 고른 보기
const posKey = (id, v) => `pr_pos_${v}_${id}`;                           // 보기마다 읽던 위치
function loadPos(id, v) { try { return JSON.parse(LS.get(posKey(id, v), "null")); } catch (e) { return null; } }
function framePR() { try { return $("#paperFrame").contentWindow.PR || null; } catch (e) { return null; } }
let htmlReadyDoc = null;   // HTML판: 읽던 곳·확대를 되살린 문서(그 전에는 위치를 저장하지 않는다)
function setView(v) {
  if (!state.paper) return;
  if (state.paper.kind !== "html") v = "pdf";
  state.view = v; state.hzoom = 1; htmlReadyDoc = null;
  const id = encodeURIComponent(state.paper.id), pos = loadPos(state.paper.id, v), fr = $("#paperFrame");
  let src;
  if (v === "html") src = `/paper/${id}/view`;
  else {
    src = `/static/pdf.html?id=${id}`;
    if (pos) src += `&page=${pos.page || 1}&y=${(+pos.y || 0).toFixed(3)}` + (pos.z && pos.z !== 1 ? `&zoom=${pos.z}` : "");
  }
  // arXiv HTML판은 남이 만든 문서 → 스크립트를 막는다(같은 출처만 남겨 하이라이트·선택 팝업·위치 저장은 그대로). PDF 뷰어는 우리 코드라 막지 않는다
  if (v === "html") fr.setAttribute("sandbox", "allow-same-origin"); else fr.removeAttribute("sandbox");
  fr.src = src;
  $("#selPop").hidden = true; $("#citePop").hidden = true;
  updateBar();
}
function savePosNow() {
  if (!state.paper) return;
  try {
    if (state.view === "pdf") { const pr = framePR(); if (pr && pr.pages) { const p = pr.position(); LS.set(posKey(state.paper.id, "pdf"), JSON.stringify({ page: p.page, y: +(+p.y).toFixed(3), z: pr.zoom })); } }
    else { const d = frameDoc(), se = d && d === htmlReadyDoc && d.scrollingElement; if (se && se.scrollHeight > se.clientHeight) LS.set(posKey(state.paper.id, "html"), JSON.stringify({ f: +(se.scrollTop / (se.scrollHeight - se.clientHeight)).toFixed(4), z: state.hzoom })); }
  } catch (e) {}
}
let posTimer; const savePosSoon = () => { clearTimeout(posTimer); posTimer = setTimeout(savePosNow, 700); };
window.addEventListener("pagehide", () => { savePosNow(); flushNoteSave(true); });   // 창을 닫거나 새로 고칠 때도 쓰던 메모를 보낸다

function updateBar(d) {
  const bar = $("#viewBar");
  if (!state.paper) { bar.hidden = true; return; }
  bar.hidden = false;
  const pdf = state.view === "pdf", pr = pdf ? framePR() : null;
  ["#pgPrev", "#pgLabel", "#pgNext"].forEach((s) => ($(s).hidden = !pdf));
  bar.querySelector(".vsep").hidden = !pdf;
  if (pdf) {
    const page = d?.page ?? pr?.page, pages = d?.pages ?? pr?.pages, zoom = d?.zoom ?? pr?.zoom ?? 1;
    if (!$("#pgLabel input")) $("#pgLabel").textContent = pages ? `${page} / ${pages}` : "…";
    $("#zoomLabel").textContent = Math.round(zoom * 100) + "%";
  } else $("#zoomLabel").textContent = Math.round(state.hzoom * 100) + "%";
}
const ZOOMS = [0.5, 0.67, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
function zoomBy(dir) {
  if (!state.paper) return;
  logEvent("zoom", { dir });
  if (state.view === "pdf") { const pr = framePR(); if (!pr) return; dir > 0 ? pr.zoomIn() : dir < 0 ? pr.zoomOut() : pr.fit(); }
  else {
    let z = state.hzoom;
    if (dir === 0) z = 1;
    else if (dir > 0) z = ZOOMS.find((s) => s > z + 0.001) || z;
    else z = [...ZOOMS].reverse().find((s) => s < z - 0.001) || z;
    state.hzoom = z; const d = frameDoc(); if (d) d.documentElement.style.zoom = z;
    updateBar();
  }
  savePosSoon();
}
$("#zoomIn").onclick = () => zoomBy(1);
$("#zoomOut").onclick = () => zoomBy(-1);
$("#zoomLabel").onclick = () => zoomBy(0);
$("#pgPrev").onclick = () => { const pr = framePR(); pr && pr.goto(Math.max(1, pr.page - 1)); };
$("#pgNext").onclick = () => { const pr = framePR(); pr && pr.goto(Math.min(pr.pages, pr.page + 1)); };
$("#pgLabel").onclick = () => {
  const pr = framePR(); if (!pr || !pr.pages || $("#pgLabel input")) return;
  const inp = document.createElement("input"); inp.className = "pgin"; inp.type = "number"; inp.min = 1; inp.max = pr.pages; inp.value = pr.page;
  $("#pgLabel").textContent = ""; $("#pgLabel").appendChild(inp); inp.focus(); inp.select();
  // remove()가 blur를 다시 부르므로 한 번만 처리한다(안 그러면 Enter로 쪽을 옮기지 못하고 오류가 난다)
  let fin = false;
  const done = (go) => { if (fin) return; fin = true; const n = +inp.value; inp.onblur = null; inp.remove(); if (go && n >= 1 && n <= pr.pages) pr.goto(n); updateBar(); };
  inp.onkeydown = (e) => { if (e.key === "Enter") done(true); if (e.key === "Escape") done(false); e.stopPropagation(); };
  inp.onblur = () => done(false);
};
// 목차
async function outline() {
  if (state.view === "pdf") {
    const pr = framePR(); if (!pr) return []; await pr.ready;
    // 쪽을 모르는 항목과 「main.pdf」 같은 파일 이름 뿌리는 빼고, 남은 것 중 가장 얕은 단계를 0으로
    const items = (await pr.outline()).filter((o) => o.page && !/\.pdf$/i.test(o.title));
    const top = Math.min(...items.map((o) => o.level || 0));
    return items.map((o) => ({ title: o.title, level: (o.level || 0) - top, page: o.page, go: () => pr.goto(o.page, Math.max(0, (o.y || 0) - 0.01)) }));
  }
  const doc = frameDoc(); if (!doc) return [];
  return $$("h2.ltx_title_section, h3.ltx_title_subsection, h2.ltx_title_appendix, h2.ltx_title_bibliography", doc).map((h) => ({
    title: h.textContent.replace(/\s+/g, " ").trim(), level: /subsection/.test(h.className) ? 1 : 0, go: () => h.scrollIntoView({ block: "start" }) }));
}
$("#tocBtn").onclick = async () => {
  const p = $("#tocPanel"); if (!p.hidden) { p.hidden = true; return; }
  closeMenus(); p.innerHTML = `<button disabled>목차를 읽는 중…</button>`; p.hidden = false; logEvent("toc");
  const items = await outline().catch(() => []);
  p.innerHTML = "";
  if (!items.length) { p.innerHTML = `<button disabled>이 논문에는 목차 정보가 없습니다.</button>`; return; }
  for (const it of items) {
    const b = document.createElement("button"); b.className = "l" + Math.min(2, it.level || 0);
    b.innerHTML = `<span>${esc(it.title)}</span>${it.page ? `<small>${it.page}</small>` : ""}`;
    b.onclick = () => { p.hidden = true; it.go(); };
    p.appendChild(b);
  }
};
// ⋯ 메뉴: 보기 전환 · arXiv · 이름 바꾸기 · 서재에서 빼기
$("#viewMenuBtn").onclick = () => {
  const m = $("#viewMenu"); if (!m.hidden) { m.hidden = true; return; }
  closeMenus();
  const p = state.paper; if (!p) return;
  const vb = $('[data-m="view"]', m); vb.hidden = p.kind !== "html";
  $(".mtext", vb).textContent = state.view === "html" ? "PDF 원문으로 보기" : "arXiv HTML판으로 보기";
  $('[data-m="arxiv"]', m).hidden = !p.abs_url;
  m.hidden = false;
};
$("#viewMenu").onclick = (e) => {
  const b = e.target.closest("button"); if (!b) return;
  $("#viewMenu").hidden = true;
  const p = state.paper; if (!p) return;
  if (b.dataset.m === "view") { savePosNow(); const v = state.view === "html" ? "pdf" : "html"; LS.set("pr_viewof_" + p.id, v); logEvent("view-toggle", { to: v }); setView(v); }
  if (b.dataset.m === "arxiv") { logEvent("arxiv-page"); window.open(p.abs_url, "_blank", "noopener"); }
  if (b.dataset.m === "rename") setTimeout(() => inlineEdit($("#paperTitle"), p.title || p.id, (v) => renamePaper(p, v, "menu"), $("#viewMenuBtn")), 0);
  if (b.dataset.m === "shelf") setTimeout(() => openShelfMenu($("#viewMenuBtn"), { pid: p.id, ax: p.arxiv_id, title: p.title || p.id, from: p.id }, "menu"), 0);
  if (b.dataset.m === "remove") removePaper(p);
};
// 대화 ⋯ 메뉴: 세미나자료 열기 · 자료 폴더 · 새 대화
$("#chatMenuBtn").onclick = () => {
  const m = $("#chatMenu"); if (!m.hidden) { m.hidden = true; return; }
  closeMenus();
  $$('[data-c="packet"], [data-c="folder"]', m).forEach((b) => (b.hidden = !state.paper));
  m.hidden = false;
};
$("#chatMenu").onclick = async (e) => {
  const b = e.target.closest("button"); if (!b) return;
  $("#chatMenu").hidden = true;
  const c = b.dataset.c, pid = state.paper ? state.paper.id : "_home";
  if (c === "packet" || c === "folder") {
    logEvent(c + "-open");
    postJSON("/api/reveal/" + encodeURIComponent(pid), { what: c }).catch((err) => toast(err.message));
  }
  if (c === "reset") {
    if (state.busy) { toast("답이 끝난 뒤에 새로 시작할 수 있습니다."); return; }
    if (!confirm("대화를 새로 시작할까요? 이전 대화는 파일로 보관됩니다.")) return;
    logEvent("reset");
    await api("/api/reset/" + encodeURIComponent(pid), { method: "POST" });
    state.paper ? showPaper(state.paper) : goHome();
  }
};
// 드래그 팝업·그림 캡처 덮개도 닫는다(홈으로 가거나 다른 논문을 열면 앞 논문 글자로 남지 않게)
function closeMenus() { ["#tocPanel", "#viewMenu", "#chatMenu", "#runMenu", "#slashMenu", "#refPop", "#citePop", "#selPop", "#capOverlay", "#shelfMenu"].forEach((s) => ($(s).hidden = true)); }
document.addEventListener("mousedown", (e) => {
  if (!e.target.closest("#shelfMenu") && !(shelfMenu.anchor && shelfMenu.anchor.contains(e.target))) {
    if (!$("#shelfMenu").hidden) shelfMenuFocused = false;   // 밖을 눌러 닫았다 → 포커스는 누른 곳에(옮기지 않는다)
    $("#shelfMenu").hidden = true;
  }
  if (!e.target.closest("#tocPanel, #tocBtn")) $("#tocPanel").hidden = true;
  if (!e.target.closest("#viewMenu, #viewMenuBtn")) $("#viewMenu").hidden = true;
  if (!e.target.closest("#chatMenu, #chatMenuBtn")) $("#chatMenu").hidden = true;
  if (!e.target.closest("#runMenu, #runBtn")) $("#runMenu").hidden = true;
  if (!e.target.closest("#slashMenu, #askInput")) $("#slashMenu").hidden = true;
  if (!e.target.closest("#refPop, #selPop")) $("#refPop").hidden = true;
  if (!e.target.closest("#citePop")) $("#citePop").hidden = true;
});

// 답 속 「Table 5」 등을 누르면 논문 그 위치로
async function jumpTo(kind, label) {
  if (!state.paper) return;
  let ok = false;
  if (state.view === "pdf") {   // 성공하면 pdf.html이 pr-jump를 보내고, 거기서 「읽던 곳으로」를 띄운다
    const pr = framePR(); if (!pr) { toast("PDF가 아직 열리는 중입니다."); return; }
    try { await pr.ready; } catch (e) { toast("PDF를 열지 못했습니다."); return; }
    ok = await pr.find(kind, label);
  } else {
    const se = frameDoc()?.scrollingElement, y = se ? se.scrollTop : 0;
    ok = htmlFind(kind, label);
    if (ok && se) offerBack(() => { se.scrollTop = y; });
  }
  logEvent("jump", { kind, ok: !!ok, view: state.view });
  if (!ok) toast(`논문에서 ${KIND_LABEL[kind] || ""} ${label} 위치를 찾지 못했습니다.`);
}
// 답 링크·인용을 눌러 옮겨 간 뒤 6초 동안 「읽던 곳으로」
function offerBack(run) { toast("위치를 옮겼습니다.", 6000, { label: "읽던 곳으로", run }); }
function htmlFind(kind, label) {
  const el = htmlLocate(kind, label); if (!el) return false;
  el.scrollIntoView({ block: "center" });
  flashEl(el);
  return true;
}
function htmlLocate(kind, label) {
  const doc = frameDoc(); if (!doc) return null;
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  let el = null;
  if (kind === "section") {
    // LaTeXML은 부록을 A1, A2…로 매긴다: 부록 B → A2, C.1 → A3.SS1
    const parts = label.split(".");
    const id = (/^[A-Z]$/.test(parts[0]) ? "A" + (parts[0].charCodeAt(0) - 64) : "S" + parts[0]) + parts.slice(1).map((p, i) => (i === 0 ? ".SS" : ".SSS") + p).join("");
    el = doc.getElementById(id);
    if (!el) { const tag = $$(".ltx_title .ltx_tag", doc).find((t) => norm(t.textContent).replace(/^Appendix\s+/i, "").replace(/\.$/, "") === label); el = tag && tag.closest("section"); }
  } else if (kind === "table" || kind === "figure") {
    const word = kind === "table" ? "(Table|Tab\\.)" : "(Figure|Fig\\.)";
    const re = new RegExp(`^${word}\\s*${reEsc(label)}\\s*[:.]?$`, "i");
    const tag = $$(`.ltx_tag_${kind}`, doc).find((t) => re.test(norm(t.textContent)));
    el = tag && (tag.closest("figure") || tag.closest(".ltx_table, .ltx_figure"));
  } else if (kind === "equation") {
    const tag = $$(".ltx_tag_equation", doc).find((t) => norm(t.textContent) === `(${label})`);
    el = tag && (tag.closest("tr") || tag.closest("table") || tag);
  } else if (kind === "algorithm") {
    const re = new RegExp(`^(Algorithm|Alg\\.)\\s*${reEsc(label)}\\b`, "i");
    const tag = $$(".ltx_tag_float, .ltx_caption .ltx_tag", doc).find((t) => re.test(norm(t.textContent)));
    el = tag && (tag.closest("figure") || tag.closest(".ltx_float"));
  }
  return el || null;
}
function flashEl(el) { styleMarks(); el.classList.add("pr-jump"); setTimeout(() => el.classList.remove("pr-jump"), 1600); }

// ---------- 선택 글자
// PDF에서 낱말 중간부터 고른 경우(「d by complex…」) 앞뒤를 낱말 끝까지 넓힌다
function expandToWords(win) {
  const sel = win.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return;
  const r = sel.getRangeAt(0).cloneRange(), W = /[\p{L}\p{N}]/u, sc = r.startContainer, ec = r.endContainer;
  let changed = false;
  if (sc.nodeType === 3 && W.test(sc.data[r.startOffset] || "") && W.test(sc.data[r.startOffset - 1] || "")) {
    let i = r.startOffset; while (i > 0 && W.test(sc.data[i - 1])) i--; r.setStart(sc, i); changed = true;
  }
  if (ec.nodeType === 3 && W.test(ec.data[r.endOffset - 1] || "") && W.test(ec.data[r.endOffset] || "")) {
    let i = r.endOffset; while (i < ec.data.length && W.test(ec.data[i])) i++; r.setEnd(ec, i); changed = true;
  }
  if (changed) { sel.removeAllRanges(); sel.addRange(r); }
}
function selectionText(win) {
  const sel = win.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return "";
  const frag = sel.getRangeAt(0).cloneContents();
  frag.querySelectorAll("math").forEach((m) => { const alt = m.getAttribute("alttext"); m.replaceWith(alt ? ` $${alt}$ ` : m.textContent); });
  frag.querySelectorAll(".ltx_tag_equation, annotation, .ltx_note_mark").forEach((n) => n.remove());
  const div = win.document.createElement("div"); div.appendChild(frag);
  div.querySelectorAll("p, li, figcaption, h1, h2, h3, h4, div.ltx_para, br").forEach((b) => b.after(win.document.createTextNode("\n")));
  return (div.textContent || sel.toString()).replace(/[ \t ]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
}
// 고른 글자가 참고문헌 항목처럼 보일 때만 「논문 찾기」를 보인다(실험 최종판: 재현율 96~100%, 오탐 0 — 단 튜닝에 쓴 세트 기준)
function looksLikeReference(text) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length < 30 || t.length > 1500) return false;
  const lead = /^([\[(]\d{1,3}[\])]|[A-Z][\w'’-]+( et al\.| and [A-Z][\w'’-]+)? \((19|20)\d\d[a-z]?\))\s/.test(t);   // [12] (12) Cobbe et al. (2021)
  const authors = /^([\[(]\d{1,3}[\])]\s*)?((([A-Z][\w'’-]*\.?\s?){1,4}, ){2,}|([A-Z]\.\s?){1,3}[A-Z][\w'’-]+,|([A-Z][\w'’-]*\.?\s?){1,3}(and|&) ([A-Z][\w'’-]*\.?\s?){1,3}[.,])/.test(t);
  const venue = /\b(In [A-Z]{3,}|Empirical Methods|Annual Meeting|Proceedings|Conference|Symposium|Workshop|Transactions|Journal|Communications of|arXiv preprint|CoRR|Advances in [Nn]eural|Press|Wiley|Springer|External Links|Cited by)\b|\bProc\.|논문지|학술대회|학회/.test(t);
  const ident = /\barXiv:\s?\d{4}\.\d{4,5}|\b\d{4}\.\d{4,5}\b|\bdoi\b|\b10\.\d{4,9}\/|ISBN|https?:\/\//i.test(t);
  const pages = /\b(pp?\.|pages|vol\.|volume)\s*\d+|\d+\s*[–-]\s*\d+, (19|20)\d\d/i.test(t);
  const year = /\b(19|20)\d\d[a-z]?\b/.test(t);
  const we = /\b(we|our|us)\b/i.test(t);   // 본문 1인칭이면 감점
  const score = 2 * (lead + authors + venue + ident) + pages + year - 2 * we;
  return score >= 4 && (lead || authors || venue);
}
// HTML판 참고문헌 항목에서 제목·arXiv ID를 그대로 꺼내 보낸다(글자 통째보다 정확)
function bibExtra(li) {
  if (!li) return {};
  const title = li.querySelector(".ltx_bib_title"), ax = [...li.querySelectorAll("a[href]")].map((a) => (a.getAttribute("href").match(/arxiv\.org\/abs\/(\d{4}\.\d{4,5})/) || [])[1]).find(Boolean);
  return Object.assign({}, title ? { title: title.textContent.replace(/\s+/g, " ").trim() } : {}, ax ? { arxiv: ax } : {});
}

// ---------- 하이라이트 (공백을 무시하고 글자열을 찾아 <mark>로 감싼다)
// 수식 글자(𝑥 → x)·합자·보이지 않는 연산자 차이를 없애고 비교한다
const SKIP_RE = /[\s​⁡-⁤]/;
const normTxt = (s) => s.normalize("NFKC").replace(/[\s​⁡-⁤]+/g, "");
function wrapText(doc, root, needle, nid) {
  const target = normTxt(needle || "");
  if (target.length < 2) return false;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => n.parentElement && n.parentElement.closest("script, style, annotation, annotation-xml, mark.pr-hl, .endOfContent, .pr-ui, .pr-card, .prLinks")
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const chars = [], map = [];
  for (let n; (n = walker.nextNode());) {
    const s = n.data;
    for (let i = 0; i < s.length; i++) {
      let ch = s[i], w = 1;
      if (/[\ud800-\udbff]/.test(ch) && i + 1 < s.length) { ch = s.slice(i, i + 2); w = 2; }
      if (!SKIP_RE.test(ch)) for (const c of normTxt(ch)) { chars.push(c); map.push([n, i, i + w]); }
      i += w - 1;
    }
  }
  const idx = chars.join("").indexOf(target);
  if (idx < 0) return false;
  const segs = new Map();
  for (let k = idx; k < idx + target.length; k++) {
    const [n, a, b] = map[k];
    const sg = segs.get(n); if (sg) sg[1] = b; else segs.set(n, [a, b]);
  }
  let wrapped = 0;
  for (const [n, [a, b]] of segs) {
    if (n.parentElement.closest("math")) continue;
    const r = doc.createRange(); r.setStart(n, a); r.setEnd(n, b);
    const mk = doc.createElement("mark"); mk.className = "pr-hl"; mk.dataset.nid = nid;
    try { r.surroundContents(mk); wrapped++; } catch (e) {}
  }
  return wrapped > 0;
}
function frameDoc() { try { const d = $("#paperFrame").contentDocument; return d && d.body ? d : null; } catch (e) { return null; } }
function applyNotes(root) {
  const doc = frameDoc(); if (!doc) return;
  root = root || doc.body;
  for (const n of state.notes) {
    if (!n.text || doc.querySelector(`mark.pr-hl[data-nid="${n.id}"]`)) continue;
    if (n.page && root !== doc.body && root.closest && root.closest(".page") && +root.closest(".page").dataset.n !== n.page) continue;
    wrapText(doc, root, n.text, n.id);
  }
  styleMarks();
}
function styleMarks() {
  const doc = frameDoc(); if (!doc) return;
  if (!doc.getElementById("pr-hl-style")) {
    const st = doc.createElement("style"); st.id = "pr-hl-style";
    st.textContent = `mark.pr-hl{background:rgba(255,214,90,.55);color:inherit;border-radius:2px;cursor:pointer}
      mark.pr-hl.has-note{background:rgba(120,190,255,.45);border-bottom:2px solid #3b82f6}
      .textLayer mark.pr-hl{color:transparent}
      mark.pr-hl.flash{outline:3px solid #e0864f}
      .pr-jump{outline:3px solid rgba(224,134,79,.85)!important;outline-offset:4px;border-radius:4px}`;
    doc.head.appendChild(st);
  }
  for (const n of state.notes) doc.querySelectorAll(`mark.pr-hl[data-nid="${n.id}"]`).forEach((m) => m.classList.toggle("has-note", !!n.note));
}
function unwrapNote(nid) {
  const doc = frameDoc(); if (!doc) return;
  doc.querySelectorAll(`mark.pr-hl[data-nid="${nid}"]`).forEach((m) => { m.replaceWith(...m.childNodes); });
}

// ---------- 메모
// 메모 글은 600ms 쉬면 저장한다. 어느 논문의 어떤 목록인지는 글을 쓸 때 정해 두고, 논문을 옮기거나 창을 닫으면 바로 보낸다
let noteSave = null;   // { pid, notes, timer }
async function saveNotes(pid = state.paper && state.paper.id, notes = state.notes, keepalive = false) {
  if (!pid) return;
  if (noteSave && noteSave.pid === pid) { clearTimeout(noteSave.timer); noteSave = null; }   // 목록을 통째로 보내니 기다리던 저장은 필요 없다
  const body = JSON.stringify(notes);
  try { await api("/api/notes/" + encodeURIComponent(pid), { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: keepalive && new Blob([body]).size < 60000 }); }
  catch (e) { toast("메모 저장 실패: " + e.message); }
}
function saveNotesSoon() {
  if (!state.paper) return;
  const pid = state.paper.id, notes = state.notes;
  if (noteSave && noteSave.pid !== pid) flushNoteSave();
  clearTimeout(noteSave && noteSave.timer);
  noteSave = { pid, notes, timer: setTimeout(() => { noteSave = null; saveNotes(pid, notes); styleMarks(); }, 600) };
}
function flushNoteSave(keepalive) { const s = noteSave; return s ? saveNotes(s.pid, s.notes, keepalive) : null; }   // pagehide에서는 keepalive(창이 닫혀도 간다)
function addNote(raw, quote, page) {
  const n = { id: uid(), text: raw, quote, note: "", page: page || null, created: nowStr() };
  const doc = frameDoc();
  const ok = doc && wrapText(doc, doc.body, raw, n.id);
  state.notes.push(n); styleMarks(); renderNotes(); saveNotes();
  if (!ok) toast("메모는 저장했지만 본문에 색을 칠하지 못했습니다(겹치거나 수식만 고른 경우).");
  doc && doc.defaultView.getSelection().removeAllRanges();
  const openMemo = () => { switchTab("notesPane"); const ta = document.querySelector(`.note[data-nid="${n.id}"] textarea`); ta && ta.focus(); };
  if (ok) toast("하이라이트했습니다.", 4000, { label: "메모 쓰기", run: openMemo });
}
function renderNotes() {
  $("#noteCount").textContent = state.notes.length || "";
  const box = $("#notesList"); box.innerHTML = "";
  if (!state.notes.length) {
    box.innerHTML = `<div class="empty">본문을 드래그해 팝업의 ${ic("highlight")} 버튼을 누르면 <b>하이라이트</b>가 여기 쌓이고, 카드에 <b>메모</b>를 쓸 수 있습니다. 대화에서 「메모해 줘」라고 해도 됩니다.<br>메모와 Q&amp;A는 이 논문 폴더의 <code>세미나자료.md</code>에 모입니다.</div>`;
    return;
  }
  for (const n of state.notes) {
    const d = document.createElement("div"); d.className = "note" + (n.source ? " auto" : ""); d.dataset.nid = n.id;
    const q = n.quote || n.text;
    const rows = Math.min(14, Math.max(2, (n.note || "").split("\n").length + 1));
    const src = n.source === "chat" ? " · 대화에서 메모" : n.source === "answer" ? " · 답 저장" : "";
    d.innerHTML = `${n.title ? `<div class="ntitle">${esc(n.title)}</div>` : ""}${q ? `<div class="nq">${esc(q)}</div>` : ""}
      <textarea rows="${rows}" placeholder="메모 쓰기…">${esc(n.note)}</textarea>
      <div class="nfoot"><span>${esc(n.created)}${n.page ? ` · p.${n.page}` : ""}${src}</span>
        <span class="nbtns">${n.text ? '<button data-a="go">보기</button>' : ""}<button data-a="ask">질문</button><button data-a="del">삭제</button></span></div>`;
    const ta = d.querySelector("textarea");
    ta.addEventListener("input", () => { n.note = ta.value; saveNotesSoon(); });
    const go = d.querySelector('[data-a="go"]'); if (go) go.onclick = () => scrollToNote(n.id);
    d.querySelector('[data-a="ask"]').onclick = () => { setQuote(n.quote || n.text || n.note, n.text, n.page); switchTab("chatPane"); $("#askInput").focus(); };
    d.querySelector('[data-a="del"]').onclick = () => {
      if (!confirm("이 메모를 지울까요?")) return;
      state.notes = state.notes.filter((x) => x.id !== n.id); unwrapNote(n.id); renderNotes(); saveNotes();
    };
    box.appendChild(d);
  }
}
function scrollToNote(nid, retry = 0) {
  const doc = frameDoc(); if (!doc) return;
  const m = doc.querySelector(`mark.pr-hl[data-nid="${nid}"]`);
  if (!m) {
    const n = state.notes.find((x) => x.id === nid), pr = framePR();
    if (n && n.page && pr && retry < 3) { pr.goto(n.page); setTimeout(() => { applyNotes(); scrollToNote(nid, retry + 1); }, 500); return; }
    toast("본문에서 위치를 찾지 못했습니다."); return;
  }
  m.scrollIntoView({ block: "center" });
  doc.querySelectorAll(`mark.pr-hl[data-nid="${nid}"]`).forEach((x) => { x.classList.add("flash"); setTimeout(() => x.classList.remove("flash"), 1500); });
}

// ---------- 탭
function switchTab(id) {
  $$(".tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === id));
  $$(".pane").forEach((p) => (p.hidden = p.id !== id));
}
$$(".tab").forEach((t) => (t.onclick = () => switchTab(t.dataset.tab)));

// ---------- iframe 연결: 드래그 팝업 · 하이라이트 · 쪽/위치 · 인용 미리보기
function hookFrame() {
  const fr = $("#paperFrame");
  let win; try { win = fr.contentWindow; if (!win.document.body || win.location.href === "about:blank") return; } catch (e) { return; }
  const doc = win.document, pop = $("#selPop");
  const onUp = () => setTimeout(() => {
    if (state.view === "pdf") expandToWords(win);
    const text = selectionText(win);
    if (!text || text.length < 2) { pop.hidden = true; return; }
    const sel = win.getSelection(), range = sel.getRangeAt(0);
    const r = range.getBoundingClientRect(), fr_r = fr.getBoundingClientRect();
    const at = range.startContainer.parentElement || range.startContainer;
    const pg = at.closest?.(".page"), bib = at.closest?.(".ltx_bibliography");
    pop.dataset.text = text; pop.dataset.raw = sel.toString(); pop.dataset.page = pg ? pg.dataset.n : "";
    pop._extra = bibExtra(at.closest?.("li.ltx_bibitem"));
    $("#refAct").hidden = !(looksLikeReference(text) || bib);
    pop.hidden = false;
    const x = Math.min(Math.max(fr_r.left + r.left + r.width / 2 - pop.offsetWidth / 2, 8), window.innerWidth - pop.offsetWidth - 8);
    let y = fr_r.top + r.top - pop.offsetHeight - 8;
    if (y < fr_r.top + 4) y = Math.min(fr_r.top + r.bottom + 8, window.innerHeight - pop.offsetHeight - 8);
    pop.style.left = x + "px"; pop.style.top = Math.max(8, y) + "px";   // 선택이 화면 밖까지 이어져도 팝업은 화면 안에
  }, 10);
  doc.addEventListener("mouseup", onUp);
  doc.addEventListener("keyup", (e) => { if (e.shiftKey) onUp(); });
  const hide = () => { pop.hidden = true; $("#refPop").hidden = true; };
  doc.addEventListener("scroll", hide, { passive: true });
  win.addEventListener("scroll", hide, { passive: true });
  doc.addEventListener("mousedown", (e) => { hide(); if (!e.target.closest || !e.target.closest(".pr-ui")) closeMenus(); });
  doc.addEventListener("click", (e) => {
    const m = e.target.closest && e.target.closest("mark.pr-hl");
    if (!m || !win.getSelection().isCollapsed) return;
    switchTab("notesPane");
    const card = document.querySelector(`.note[data-nid="${m.dataset.nid}"]`);
    if (card) { card.scrollIntoView({ block: "center" }); card.classList.add("flash"); setTimeout(() => card.classList.remove("flash"), 1500); }
  });
  for (const [t, fn] of DROP_EVENTS) doc.addEventListener(t, fn);   // 논문 칸 위에 PDF를 놓아도 받는다
  doc.addEventListener("paste", onPaste);                            // 읽다가 ⌘V로 arXiv 주소를 붙여도 연다
  // 단축키는 논문 칸 안에서도 먹게(PDF 확대 키는 pdf.html이 직접 처리)
  doc.addEventListener("keydown", (e) => {
    if (state.view === "pdf" && (e.metaKey || e.ctrlKey) && ["=", "+", "-", "_", "0"].includes(e.key)) return;
    if (e.key === "Escape" && doc.querySelector(".pr-card")) return;   // PDF 인용 카드만 닫는다(답을 멈추지 않게)
    globalKeys(e);
  });
  if (state.view === "pdf") {
    // PDF: 쪽이 그려질 때마다 하이라이트 다시 칠하기 · 쪽/확대 바뀌면 막대와 읽던 위치 갱신 · 링크로 옮기면 「읽던 곳으로」
    win.addEventListener("pr-page", (e) => applyNotes(e.detail));
    win.addEventListener("pr-view", (e) => { updateBar(e.detail); savePosSoon(); });
    win.addEventListener("pr-jump", () => offerBack(() => { const pr = framePR(); pr && pr.back(); }));
    win.addEventListener("pr-cite", () => logEvent("cite-hover", { view: "pdf" }));
    doc.querySelectorAll(".page .textLayer").forEach((tl) => applyNotes(tl));
    const waitPR = (n) => { const pr = framePR(); if (pr && pr.ready) pr.ready.then(() => { updateBar(); pruneJumps($("#messages")); }, () => {}); else if (n < 40) setTimeout(() => waitPR(n + 1), 100); };
    waitPR(0);
  } else {
    applyNotes(doc.body);
    const pos = state.paper && loadPos(state.paper.id, "html");
    if (pos && pos.z && pos.z !== 1) { state.hzoom = pos.z; doc.documentElement.style.zoom = pos.z; }
    if (pos && pos.f > 0) setTimeout(() => { const se = doc.scrollingElement; se.scrollTop = pos.f * (se.scrollHeight - se.clientHeight); htmlReadyDoc = doc; }, 50);
    else htmlReadyDoc = doc;
    win.addEventListener("scroll", savePosSoon, { passive: true });
    hookHtmlCitations(win, doc);
    pruneJumps($("#messages"));
    // <base href>가 arXiv라서 #bib… 같은 문서 안 링크가 arXiv로 넘어가 버린다 → 여기서 그 위치로 스크롤하고, 바깥 링크는 새 탭으로
    // javascript: 같은 링크는 열지 않는다. 가운데 버튼도 여기서 연다(샌드박스가 논문 칸의 새 창을 막는다)
    const onLink = (e) => {
      const a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
      const href = a.getAttribute("href") || "", inDoc = href.startsWith("#");
      if (e.type === "auxclick" && (e.button !== 1 || inDoc)) return;
      e.preventDefault();
      if (inDoc) {
        const t = doc.getElementById(decodeURIComponent(href.slice(1))), se = doc.scrollingElement, y = se.scrollTop;
        if (t) { t.scrollIntoView({ block: "center" }); flashEl(t); offerBack(() => { se.scrollTop = y; }); }
      } else if (/^(https?|mailto):/i.test(a.href)) window.open(a.href, "_blank", "noopener");
    };
    doc.addEventListener("click", onLink, true);
    doc.addEventListener("auxclick", onLink, true);
    updateBar();
  }
}
$("#paperFrame").addEventListener("load", hookFrame);

// HTML판 인용 [12] 위에 올리면 참고문헌 미리보기
function hookHtmlCitations(win, doc) {
  let t;
  doc.addEventListener("mouseover", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#bib.bib"]'); if (!a) return;   // 「#bib」(참고문헌 절 링크)는 빼고 항목만
    clearTimeout(t); t = setTimeout(() => {
      const li = doc.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))); if (!li) return;
      const text = li.textContent.replace(/\s+/g, " ").trim();
      const fr = $("#paperFrame").getBoundingClientRect(), r = a.getBoundingClientRect();
      logEvent("cite-hover", { view: "html" });
      showCite(text, { left: fr.left + r.left, top: fr.top + r.top, bottom: fr.top + r.bottom }, () => {
        const se = doc.scrollingElement, y = se.scrollTop;
        li.scrollIntoView({ block: "center" }); flashEl(li); offerBack(() => { se.scrollTop = y; });
      }, bibExtra(li));
    }, 250);
  });
  doc.addEventListener("mouseout", (e) => { if (e.target.closest && e.target.closest('a[href^="#bib.bib"]')) { clearTimeout(t); hideCiteSoon(); } });
}
let citeHideT;
function showCite(text, at, go, extra) {
  const box = $("#citePop"); clearTimeout(citeHideT);
  box.innerHTML = `<div class="ctext">${esc(text)}</div><div class="cbtns"><button class="btn" data-c="go">이동</button><button class="btn" data-c="find">논문 찾기</button></div>`;
  box.querySelector('[data-c="go"]').onclick = () => { box.hidden = true; go && go(); };
  box.querySelector('[data-c="find"]').onclick = () => { box.hidden = true; resolveRef(text, at, extra || {}); };
  box.hidden = false;
  const w = box.offsetWidth, h = box.offsetHeight;
  box.style.left = Math.min(Math.max(8, at.left), window.innerWidth - w - 8) + "px";
  box.style.top = (at.bottom + 6 + h < window.innerHeight ? at.bottom + 6 : Math.max(8, at.top - h - 6)) + "px";
}
function hideCiteSoon() { clearTimeout(citeHideT); citeHideT = setTimeout(() => { if (!$("#citePop").matches(":hover")) $("#citePop").hidden = true; }, 400); }
$("#citePop").addEventListener("mouseleave", hideCiteSoon);
// PDF 뷰어(pdf.html)의 인용 미리보기 카드에서 「논문 찾기」를 누르면 여기로 온다
// (rect는 pdf.html이 이미 이 창 기준 좌표로 바꿔서 준다)
window.prOpenRef = (text, rect) => resolveRef(text, rect || { left: 40, top: 40, bottom: 60 });

$("#selPop").addEventListener("mousedown", (e) => e.preventDefault());
$("#selPop").onclick = async (e) => {
  const b = e.target.closest("button"); const act = b && b.dataset.act; if (!act) return;
  const pop = $("#selPop"), at = pop.getBoundingClientRect(), text = pop.dataset.text || "", raw = pop.dataset.raw || "", page = +pop.dataset.page || null;
  pop.hidden = true; logEvent("popup", { act });   // 자리는 숨기기 전에 잰다(숨기면 0,0이라 결과 창이 왼쪽 위로 간다)
  if (act === "highlight") return addNote(raw, text, page);
  if (act === "ref") return resolveRef(text, at, pop._extra || {});
  setQuote(text, raw, page); switchTab("chatPane");
  if (act === "ask") { $("#askInput").focus(); return; }
  if (act === "explain") ask("이 부분을 쉽게 풀어서 설명해 줘. 논문 앞뒤 맥락에서 이 부분이 왜 중요한지도.");
  if (act === "translate") ask("이 부분을 자연스러운 한국어로 번역해 줘. 번역 뒤에 어려운 용어만 짧게 풀어 줘.");
};
function setQuote(t, raw, page) {
  state.quote = t; state.quoteRaw = t ? (raw || "") : ""; state.quotePage = t ? (page || null) : null;
  $("#quoteBox").hidden = !t; $("#quoteText").textContent = t;
}
$("#quoteClear").onclick = () => setQuote("");

// ---------- 참고문헌 → arXiv에서 찾아 열기
async function resolveRef(text, at, extra = {}) {
  const box = $("#refPop");
  box.innerHTML = `<div class="muted" style="padding:6px 8px">arXiv에서 찾는 중…</div>`; box.hidden = false;
  box.style.left = Math.max(8, Math.min(at.left, window.innerWidth - 390)) + "px"; box.style.top = Math.max(8, Math.min(at.bottom + 6, window.innerHeight - 330)) + "px";
  logEvent("resolve", { view: state.view });
  try {
    const list = await postJSON("/api/resolve", Object.assign({ text }, extra));
    if (!list.length) { box.innerHTML = `<div class="muted" style="padding:6px 8px">arXiv에서 찾지 못했습니다. 제목 부분만 골라 다시 해 보세요.</div>`; return; }
    box.innerHTML = `<div class="muted" style="padding:4px 8px">열 논문을 고르세요</div>`;
    for (const it of list) {
      const b = document.createElement("button"); b.className = "item";
      b.innerHTML = `<b>${esc(it.title)}</b><small class="muted">${esc(it.id)} · ${esc(it.date)} · ${esc(it.authors)}</small>`;
      b.onclick = () => { logEvent("open", { via: "reference" }); openSrc(it.id); };
      box.appendChild(b);
    }
  } catch (e) { box.innerHTML = `<div class="muted" style="padding:6px 8px">${esc(e.message)}</div>`; }
}

// ---------- 그림 캡처
function clearAttach() { state.attach = []; renderAttach(); }
function renderAttach() {
  const box = $("#attachBox"); box.innerHTML = ""; box.hidden = !state.attach.length;
  state.attach.forEach((a, i) => {
    const w = document.createElement("div"); w.className = "att";
    w.innerHTML = `<img src="${esc(a.thumb)}" alt="첨부 그림"><button type="button" class="x" title="빼기" aria-label="빼기">${ic("x")}</button>`;
    w.querySelector("button").onclick = () => { state.attach.splice(i, 1); renderAttach(); };
    box.appendChild(w);
  });
}
$("#captureBtn").onclick = () => {
  if (!state.paper) return;
  closeMenus(); $("#capOverlay").hidden = false; $("#capRect").style.display = "none"; $("#selPop").hidden = true;
};
(() => {
  const ov = $("#capOverlay"), rect = $("#capRect"); let start = null;
  const box = (e) => { const r = ov.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  ov.addEventListener("mousedown", (e) => { start = box(e); rect.style.display = "block"; Object.assign(rect.style, { left: start[0] + "px", top: start[1] + "px", width: 0, height: 0 }); });
  ov.addEventListener("mousemove", (e) => {
    if (!start) return; const [x, y] = box(e);
    Object.assign(rect.style, { left: Math.min(x, start[0]) + "px", top: Math.min(y, start[1]) + "px", width: Math.abs(x - start[0]) + "px", height: Math.abs(y - start[1]) + "px" });
  });
  ov.addEventListener("mouseup", (e) => {
    if (!start) return; const [x, y] = box(e);
    const sel = { left: Math.min(x, start[0]), top: Math.min(y, start[1]), right: Math.max(x, start[0]), bottom: Math.max(y, start[1]) };
    start = null; ov.hidden = true;
    if (sel.right - sel.left < 12 || sel.bottom - sel.top < 12) return;
    captureRegion(sel);
  });
})();
function inter(a, b) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? { left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom), area: w * h } : null;
}
async function captureRegion(ovSel) {
  const doc = frameDoc(); if (!doc) return;
  // 끈 영역(덮개 기준) → 논문 칸(iframe) 기준 좌표
  const ov = $("#capOverlay").getBoundingClientRect(), fr = $("#paperFrame").getBoundingClientRect(), dx = ov.left - fr.left, dy = ov.top - fr.top;
  const sel = { left: ovSel.left + dx, top: ovSel.top + dy, right: ovSel.right + dx, bottom: ovSel.bottom + dy };
  const before = state.attach.length;
  logEvent("capture", { view: state.view });
  if (state.view === "pdf") {
    // 그 쪽을 높은 해상도로 다시 그려 자른다(화면 해상도에 묶이지 않게); 안 되면 화면 캔버스에서 자른다
    let shot = null;
    try { const pr = framePR(); shot = pr && pr.capture ? await pr.capture(sel) : null; } catch (e) {}
    if (shot && shot.data) state.attach.push({ data: shot.data, thumb: shot.data });
    else {
      let best = null;
      doc.querySelectorAll(".page canvas").forEach((c) => { const cr = c.getBoundingClientRect(); const i = inter(sel, cr); if (i && (!best || i.area > best.i.area)) best = { c, cr, i }; });
      if (best) {
        const { c, cr, i } = best, sx = c.width / cr.width, sy = c.height / cr.height;
        const w = (i.right - i.left) * sx, h = (i.bottom - i.top) * sy, k = Math.min(1, 1600 / w);
        const out = document.createElement("canvas"); out.width = Math.round(w * k); out.height = Math.round(h * k);
        out.getContext("2d").drawImage(c, (i.left - cr.left) * sx, (i.top - cr.top) * sy, w, h, 0, 0, out.width, out.height);
        const data = out.toDataURL("image/png");
        state.attach.push({ data, thumb: data });
      }
    }
  } else {
    // HTML판: 고른 영역 안에 거의 다 들어온 그림(본문 그림·표 안 것 먼저). 로고처럼 살짝 걸친 그림은 빼고, 없으면 가장 많이 겹친 하나
    const selArea = (sel.right - sel.left) * (sel.bottom - sel.top), cands = [];
    doc.querySelectorAll("img").forEach((im) => {
      const r = im.getBoundingClientRect(); if (r.width < 64 || r.height < 48) return;
      const i = inter(sel, r); if (!i) return;
      cands.push({ im, own: i.area / (r.width * r.height), cover: i.area / selArea, fig: !!im.closest(".ltx_figure, .ltx_table, figure") });
    });
    let pick = cands.filter((c) => c.own >= 0.5 && c.fig);
    if (!pick.length) pick = cands.filter((c) => c.own >= 0.5);
    if (!pick.length && cands.length) pick = [cands.sort((a, b) => b.cover - a.cover)[0]];
    for (const c of pick.slice(0, 5)) {
      const src = c.im.currentSrc || c.im.src;
      if (!state.attach.some((a) => a.url === src)) state.attach.push({ url: src, thumb: src });
    }
  }
  if (state.attach.length === before) { toast("이 영역에서 그림을 찾지 못했습니다. 표는 글자를 드래그해서 물어보세요.", 3500); return; }
  renderAttach(); switchTab("chatPane"); $("#askInput").focus();
}

// ---------- 질문 보내기 (SSE) · 중지
function setBusyUI(on) {
  const b = $("#sendBtn");
  b.classList.toggle("stop", on); b.innerHTML = ic(on ? "stop" : "arrowUp");
  b.title = on ? "중지 (Esc)" : "보내기 (Enter)"; b.setAttribute("aria-label", on ? "중지" : "보내기");
}
async function stopAnswer() {
  const b = state.busy; if (!b) return;
  if (b.stopping) { b.ctrl.abort(); return; }
  b.stopping = true; logEvent("stop");
  api("/api/cancel/" + encodeURIComponent(b.pid), { method: "POST" }).catch(() => {});
  setTimeout(() => { if (state.busy === b) b.ctrl.abort(); }, 5000);
}
window.addEventListener("pagehide", () => {
  if (state.busy) fetch("/api/cancel/" + encodeURIComponent(state.busy.pid), { method: "POST", keepalive: true, headers: { "X-PR": "1" } }).catch(() => {});
});
async function ask(question, opts = {}) {
  if (state.busy) { toast("답이 끝난 뒤 보내 주세요. 중지하려면 ■ 를 누르세요."); return; }
  const home = !state.paper, pid = home ? "_home" : state.paper.id;
  question = (question || "").trim();
  if (!question && state.attach.length) question = "이 그림이 무엇을 보여 주는지 논문 내용과 연결해서 설명해 줘.";
  if (!question) return;
  closeMenus();
  const quote = state.quote, quoteRaw = state.quoteRaw, quotePage = state.quotePage, attach = state.attach.slice();
  $$("#messages .empty-chat").forEach((x) => x.remove());
  addMessage("user", question, { quote, images: attach.map((a) => a.thumb) });
  setQuote(""); clearAttach(); $("#askInput").value = ""; autoGrow();
  const box = addMessage("assistant", "");
  const body = box.querySelector(".body"); body.classList.add("cursor");
  $$("#messages .msg.assistant.last").forEach((m) => m.classList.remove("last"));
  const ctrl = new AbortController(), busy = { pid, ctrl };
  state.busy = busy; setBusyUI(true);
  const started = Date.now(), model = state.model, effort = state.effort, msgRef = { index: null, out: null };
  let text = "", failed = null, stopped = false, doneInfo = null, remember = null, shelf = null;
  const wait = (msg) => { if (!text) body.innerHTML = `<span class="waiting">${esc(msg)}</span>`; };
  const paint = () => {
    pending = false; if (!text || finished) return;   // 끝난 뒤 늦게 도는 화면 갱신(숨긴 탭의 rAF)이 링크 풀기를 되돌리지 않게
    body.innerHTML = renderMarkdown(displayText(text, finalPaint, finalPaint && !gotFinal)); enhance(body);
    const m = $("#messages"); if (m.scrollHeight - m.scrollTop - m.clientHeight < 160) m.scrollTop = m.scrollHeight;
  };
  let pending = false, finished = false, finalPaint = false, gotFinal = false;
  try {
    const r = await fetch("/api/ask", { method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json", "X-PR": "1" },
      body: JSON.stringify({ paper_id: pid, question, quote, quote_raw: quoteRaw, page: quotePage, model, effort,
        images: attach.map((a) => (a.data ? { data: a.data } : { url: a.url })) }) });
    if (!r.ok || !r.body) { const j = await r.json().catch(() => ({})); throw new Error(j.error || r.statusText); }
    if (!/^text\/event-stream/i.test(r.headers.get("content-type") || "")) throw new Error("서버 응답이 답 형식(SSE)이 아닙니다.");
    const reader = r.body.getReader(), dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
        // 「event: 이름\ndata: JSON」 — \n으로만 자른다(정규식 . 과 $ 는 U+2028·U+2029에서도 끊겨 JSON이 깨진다)
        const nl = chunk.indexOf("\n"), head = nl < 0 ? chunk : chunk.slice(0, nl), di = chunk.indexOf("\ndata: ");
        if (!head.startsWith("event: ")) continue;
        const ev = head.slice(7);
        let data; try { data = di < 0 ? {} : JSON.parse(chunk.slice(di + 7)); } catch (e) { continue; }   // 깨진 사건 하나 때문에 뒤 사건까지 잃지 않게
        if (ev === "start" && data.first) wait("논문 전문을 읽는 중…");
        if (ev === "thinking") wait("생각하는 중…");
        if (ev === "tools") { toolBox(box, data.items || [], true, data.summary, true); wait("찾아보고 읽는 중…"); }
        if (ev === "aside") { text = ""; body.innerHTML = ""; wait("찾아보고 읽는 중…"); }   // 도구 사이 혼잣말은 위 상자로(서버가 tools에 넣어 준다)
        if (ev === "delta") { text += data.text; if (!pending) { pending = true; requestAnimationFrame(paint); } }
        if (ev === "error") failed = data.message;
        if (ev === "final") { text = data.text || ""; gotFinal = true; }
        if (ev === "stopped") stopped = true;
        if (ev === "remember") remember = data;   // 「되돌리기」·「그래도 저장」 알림은 메모 알림에 덮이지 않게 맨 끝에 띄운다
        if (ev === "shelf") shelf = data;   // 「봐야할 논문에 넣어 줘」 결과(알림은 답이 끝난 뒤에)
        if (ev === "memo") {   // 서버가 이미 묻은 논문의 메모 파일에 넣었다 → 그 논문이 지금 열려 있을 때만 화면 목록에 더한다
          if (state.paper && state.paper.id === pid) { state.notes.push(data.note); renderNotes(); applyNotes(); }
          toast(`메모에 저장했습니다: ${data.note.title || ""}`);
        }
        if (ev === "done") { doneInfo = data; if (data.index != null) msgRef.index = data.index; msgRef.out = data.out || null; }
      }
    }
  } catch (e) { if (e.name === "AbortError") stopped = true; else failed = e.message; }
  if (!doneInfo && !stopped && !failed) failed = "연결이 끊겨 답이 끝나지 않았습니다(저장되지 않았을 수 있습니다).";
  body.classList.remove("cursor");
  if (text) { finalPaint = true; paint(); }
  else if (stopped) body.innerHTML = `<span class="waiting">중지했습니다.</span>`;
  finished = true;
  const tb = box.querySelector("details.tools"); if (tb && text) tb.open = false;
  const secs = ((Date.now() - started) / 1000).toFixed(0);
  if (failed) { box.classList.add("error"); if (!text) body.textContent = "오류: " + failed; }
  if (stopped) box.classList.add("stopped");
  addActions(box, () => text, question, `${runLabel(model, effort)} · ${nowStr()} · ${secs}초${stopped ? " · 중지됨" : ""}${failed && text ? " · 오류: " + failed : ""}`, msgRef);
  if (state.busy === busy) { state.busy = null; setBusyUI(false); }
  markLast();
  if (remember) handleRemember(remember);
  if (shelf) handleShelfEvent(shelf, !!remember);
  if (doneInfo && doneInfo.shelf_moved) handleShelfMoved(doneInfo.shelf_moved, !!remember);
  if (!home) { loadLibrary(); if (state.paper && state.paper.id === pid) pruneJumps(body); }
}
// 🧠 기억: 추가하면 「되돌리기」, 바로 저장하지 않은 규칙은 그 까닭(held_why)과 「그래도 저장」, 이미 있으면 알려만 준다
function handleRemember(d) {
  const added = d.added || d.rules || [], dup = d.dup || [], held = d.held || [], why = held.map((r) => (d.held_why || {})[r]);
  if (added.length) toast(`기억에 추가했습니다: ${added.join(" / ")}`, 8000, { label: "되돌리기", run: () => editMemory((t) => dropRules(t, added), "기억에서 뺐습니다.") });
  else if (held.length) {
    const msg = why.includes("no-intent") ? "「앞으로·기억해 줘」 같은 요청이 없어 바로 저장하지 않았습니다"
      : why.includes("tools") ? "웹·문서를 읽은 답이라 바로 저장하지 않았습니다"
      : why.includes("full") ? "기억 규칙이 다 차서(30개) 바로 저장하지 않았습니다. 설정 → 기억에서 안 쓰는 규칙을 지우세요"
      : "링크·명령이 들었거나 너무 긴 규칙이라 기억하지 않았습니다";   // suspect · too-long
    toast(`${msg}: ${held.map(ruleText).join(" / ").slice(0, 90)}`, 10000, { label: "그래도 저장", run: () => editMemory((t) => addRules(t, held), "기억에 저장했습니다.") });
  }
  else if (dup.length) toast("이미 기억하고 있는 내용입니다.");
  refreshMemCount();
}
async function editMemory(fn, msg) {
  try { const r = await api("/api/memory"); await postJSON("/api/memory", { text: fn(r.text) }); refreshMemCount(); toast(msg); }
  catch (e) { toast(e.message); }
}
// 규칙 글: 주석·앞 글머리표(- • *)·끝 마침표(. 。 !)를 떼고 공백을 한 칸으로(서버 norm_rule과 같게, 비교할 때만 소문자)
const ruleText = (s) => String(s || "").replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/^[\s\-•*]+/, "").trim().replace(/[.。!]+$/, "").trim();
function dropRules(text, rules) {
  const kill = new Set(rules.map((r) => ruleText(r).toLowerCase()));
  return text.split("\n").filter((l) => !(/^\s*-\s/.test(l) && kill.has(ruleText(l).toLowerCase()))).join("\n");
}
// 「그래도 저장」: 한 규칙 = 「- 규칙」 한 줄(글머리표가 겹치지 않게, 이미 있는 규칙은 건너뛴다)
function addRules(text, rules) {
  const seen = new Set(text.split("\n").filter((l) => /^\s*-\s/.test(l)).map((l) => ruleText(l).toLowerCase())), add = [];
  for (const r of rules.map(ruleText)) if (r && !seen.has(r.toLowerCase())) { seen.add(r.toLowerCase()); add.push(r); }
  return add.length ? text.replace(/\s*$/, "\n") + add.map((r) => `- ${r}`).join("\n") + "\n" : text;
}
// 어떤 기능을 실제로 쓰는지 남긴다(이 맥의 library/_events.jsonl에만 · 2주 뒤 필요·불필요를 다시 가르는 근거)
function logEvent(ev, extra = {}) {
  try {
    fetch("/api/event", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json", "X-PR": "1" },
      body: JSON.stringify(Object.assign({ ev, pid: state.paper ? state.paper.id : null }, extra)) }).catch(() => {});
  } catch (e) {}
}
$("#askForm").onsubmit = (e) => { e.preventDefault(); if (state.busy) stopAnswer(); else ask($("#askInput").value); };

// 입력창: 자동 높이 · Enter 보내기 · / 빠른 질문
function autoGrow() { const ta = $("#askInput"); ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, window.innerHeight * 0.4) + "px"; }
const slash = { items: [], sel: 0 };
function updateSlash() {
  const v = $("#askInput").value, menu = $("#slashMenu");
  if (!v.startsWith("/") || v.includes("\n")) { menu.hidden = true; return; }
  const q = v.slice(1).trim().toLowerCase();
  slash.items = prompts().filter((p) => !q || p.label.toLowerCase().includes(q) || p.q.toLowerCase().includes(q));
  if (!slash.items.length) { menu.hidden = true; return; }
  slash.sel = Math.min(slash.sel, slash.items.length - 1);
  menu.innerHTML = "";
  slash.items.forEach((p, i) => {
    const b = document.createElement("button"); b.className = i === slash.sel ? "sel" : "";
    b.innerHTML = `<span>${esc(p.label)}</span>`; b.title = p.q;
    b.onmousedown = (e) => { e.preventDefault(); runSlash(i); };
    menu.appendChild(b);
  });
  $("#runMenu").hidden = true; menu.hidden = false;
}
function runSlash(i) { const p = slash.items[i]; if (!p) return; $("#slashMenu").hidden = true; $("#askInput").value = ""; autoGrow(); logEvent("slash", { key: p.key }); ask(p.q); }
$("#askInput").addEventListener("input", () => { autoGrow(); slash.sel = 0; updateSlash(); });
$("#askInput").addEventListener("keydown", (e) => {
  if (e.isComposing) return;
  const menuOpen = !$("#slashMenu").hidden;
  if (menuOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); slash.sel = (slash.sel + (e.key === "ArrowDown" ? 1 : -1) + slash.items.length) % slash.items.length; updateSlash(); return; }
  if (menuOpen && (e.key === "Enter" || e.key === "Tab")) { e.preventDefault(); runSlash(slash.sel); return; }
  if (e.key === "Escape") { if (menuOpen) { e.preventDefault(); e.stopPropagation(); $("#slashMenu").hidden = true; } return; }
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!state.busy) ask($("#askInput").value); }
});

// 모델 · 노력 (입력창 안 하나의 버튼)
function setRun(model, effort) {
  state.model = MODEL_LABEL[model] ? model : "sonnet"; state.effort = EFFORT_LABEL[effort] ? effort : "auto";
  LS.set("pr_model", state.model); LS.set("pr_effort", state.effort);
  $("#runText").textContent = runLabel(state.model, state.effort);
  $$("#modelSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === state.model));
  $$("#effortSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === state.effort));
}
$("#runBtn").onclick = () => { const m = $("#runMenu"); const open = m.hidden; closeMenus(); m.hidden = !open; };
$$("#modelSeg button").forEach((b) => (b.onclick = () => { setRun(b.dataset.v, state.effort); logEvent("model", { model: state.model, effort: state.effort }); }));
$$("#effortSeg button").forEach((b) => (b.onclick = () => { setRun(state.model, b.dataset.v); logEvent("model", { model: state.model, effort: state.effort }); }));


// ---------- 설정: 설명 방식 기억 · 기본 보기
async function refreshMemCount() {
  try { const r = await api("/api/memory"); $("#memCount").textContent = r.rules.length ? `규칙 ${r.rules.length}개` : ""; return r; } catch (e) { return null; }
}
async function openSettings() {
  closeMenus(); $("#settings").hidden = false;
  $("#kwText").value = LS.get("pr_kw", "");
  const r = await refreshMemCount();
  if (r) { $("#memText").value = r.text; $("#memPath").textContent = r.path; $("#memSave").disabled = true; }
  $$("#viewPref button").forEach((b) => b.classList.toggle("on", b.dataset.v === prefView()));
}
// 내 분야 키워드(이 브라우저에 저장) — 바꾸면 「내 분야」 탭을 다시 불러온다
$("#kwText").addEventListener("change", () => {
  LS.set("pr_kw", $("#kwText").value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12).join(", "));
  logEvent("keywords");
  if (!state.paper && homeSrc() === "mine") renderHome();
});
$("#settingsBtn").onclick = openSettings;
$("#settingsClose").onclick = () => ($("#settings").hidden = true);
$("#settings").addEventListener("mousedown", (e) => { if (e.target.id === "settings") $("#settings").hidden = true; });
$("#memText").addEventListener("input", () => ($("#memSave").disabled = false));
$("#memSave").onclick = async () => {
  try { await postJSON("/api/memory", { text: $("#memText").value }); $("#memSave").disabled = true; refreshMemCount(); toast("저장했습니다. 다음 질문부터 적용됩니다."); logEvent("memory-edit"); }
  catch (e) { toast(e.message); }
};
$$("#viewPref button").forEach((b) => (b.onclick = () => {
  LS.set("pr_view", b.dataset.v); $$("#viewPref button").forEach((x) => x.classList.toggle("on", x === b));
  if (state.paper && state.paper.kind === "html" && state.view !== b.dataset.v) { savePosNow(); LS.set("pr_viewof_" + state.paper.id, b.dataset.v); setView(b.dataset.v); }
}));

// ---------- 너비 조절(기억함) — 기억한 너비는 지금 창에 맞게 줄이고, 위아래로 쌓는 좁은 창에서는 쓰지 않는다
(() => {
  const d = $("#divider"), chat = $("#chat"), stacked = matchMedia("(max-width: 560px)"); let on = false;
  const apply = () => { const w = +LS.get("pr_chatw", 0); chat.style.width = w >= 300 && !stacked.matches ? Math.min(w, innerWidth - 480) + "px" : ""; };
  apply(); window.addEventListener("resize", apply);
  d.addEventListener("mousedown", () => { on = true; document.body.style.userSelect = "none"; $("#paperFrame").style.pointerEvents = "none"; });
  window.addEventListener("mouseup", () => {
    if (!on) return; on = false; document.body.style.userSelect = ""; $("#paperFrame").style.pointerEvents = "";
    LS.set("pr_chatw", parseInt(chat.style.width) || 0);
  });
  window.addEventListener("mousemove", (e) => { if (on) chat.style.width = Math.max(300, Math.min(window.innerWidth * 0.7, window.innerWidth - e.clientX)) + "px"; });
})();

// ---------- 단축키: ⌘K 찾기 · / 빠른 질문 · ⌘+/− 확대 · Esc 닫기/중지
function globalKeys(e) {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && (e.key === "k" || e.key === "K")) { e.preventDefault(); $("#palette").hidden ? openPalette() : closePalette(); return; }
  if (mod && state.paper && ["=", "+", "-", "_", "0"].includes(e.key)) { e.preventDefault(); zoomBy(e.key === "0" ? 0 : e.key === "-" || e.key === "_" ? -1 : 1); return; }
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "") || (e.target && e.target.isContentEditable);
  if (e.key === "/" && !typing && !mod) { e.preventDefault(); switchTab("chatPane"); const ta = $("#askInput"); ta.focus(); ta.value = "/"; autoGrow(); updateSlash(); return; }
  if (e.key === "Escape") {
    if (e.defaultPrevented) return;   // 찾기 창 입력칸처럼 이미 Esc를 처리한 곳(답은 멈추지 않는다)
    if (!$("#capOverlay").hidden) { $("#capOverlay").hidden = true; return; }
    if (!$("#palette").hidden) { closePalette(); return; }
    if (!$("#settings").hidden) { $("#settings").hidden = true; return; }
    const open = ["#tocPanel", "#viewMenu", "#chatMenu", "#runMenu", "#slashMenu", "#refPop", "#citePop", "#selPop", "#shelfMenu"].some((s) => !$(s).hidden);
    const shelfOpen = !$("#shelfMenu").hidden;
    if (open) { closeMenus(); if (shelfOpen && shelfMenu.anchor && shelfMenu.anchor.isConnected) shelfMenu.anchor.focus({ preventScroll: true }); return; }
    if (state.busy) stopAnswer();
  }
}
window.addEventListener("keydown", globalKeys);

// ---------- 시작
(async () => {
  paintIcons();
  setRun(LS.get("pr_model", "sonnet"), LS.get("pr_effort", "auto"));
  refreshMemCount();
  await loadLibrary();
  const m = location.hash.match(/paper=([^&]+)/);
  if (m) {
    const p = state.library.find((x) => x.id === decodeURIComponent(m[1]));
    if (p) return showPaper(p);
  }
  goHome();
})();
