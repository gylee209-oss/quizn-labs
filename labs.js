/* ============================================================
   SoftN Labs — 공통 데이터 & 로직 (목록·상세 공유)
   - MODELS: 모델 8개 데이터
   - 테마(light/dark) · 인증(member/guest) localStorage 유지
   - 헤더 토글 / 비로그인 게이트 / DOM 유틸
   ============================================================ */

const MODELS = [
  {
    key: 'media_teller', name: '미디어텔러', status: 'beta', statusKo: '베타', category: 'ext',
    rating: 4.32, count: 127, version: '1.4.0', versions: 5, updated: '2026-05-20', posts: 84, commentCount: 312,
    desc: 'AI가 영상에서 핵심 장면만 추려 요약 영상을 만들어주는 도구. 유튜브, 강의, 회의 녹화에 모두 적용 가능합니다.',
    dist: { 5: 59, 4: 42, 3: 18, 2: 5, 1: 3 }
  },
  {
    key: 'debate', name: '토론 시스템', status: 'live', statusKo: '정식', category: 'ext',
    rating: 4.71, count: 312, version: '2.1.0', versions: 8, updated: '2026-05-28', posts: 156, commentCount: 540,
    desc: '주제 하나에 다중 시점 의견을 트리로 정리해 보는 실험. 찬반·중립 논거를 한눈에 비교합니다.',
    dist: { 5: 210, 4: 70, 3: 22, 2: 6, 1: 4 }
  },
  {
    key: 'dbms_manager', name: 'DBMS 매니저', status: 'hold', statusKo: '보류', category: 'idea',
    rating: 3.95, count: 48, version: '0.9.2', versions: 3, updated: '2026-05-12', posts: 31, commentCount: 95,
    desc: '여러 DB 인스턴스를 통합 관리하는 어드민(실험 중). MySQL, PostgreSQL을 한 화면에서 다룹니다.',
    dist: { 5: 18, 4: 16, 3: 9, 2: 3, 1: 2 }
  },
  {
    key: 'erd_v2', name: 'ERD 디자인 v2', status: 'archived', statusKo: '보관', category: 'idea',
    rating: 4.10, count: 89, version: '1.0.0', versions: 4, updated: '2026-03-30', posts: 52, commentCount: 140,
    desc: '관계형 스키마 시각 편집 + DDL 자동 생성. 보관 단계로 곧 신규 버전으로 대체됩니다.',
    dist: { 5: 40, 4: 28, 3: 14, 2: 4, 1: 3 }
  },
  {
    key: 'prompt_lab', name: '프롬프트 랩', status: 'live', statusKo: '정식', category: 'idea',
    rating: 4.55, count: 201, version: '1.8.0', versions: 6, updated: '2026-05-25', posts: 110, commentCount: 388,
    desc: '동일 입력에 대해 여러 LLM의 응답을 나란히 비교하는 워크벤치. 프롬프트 버전 관리도 지원합니다.',
    dist: { 5: 130, 4: 48, 3: 15, 2: 5, 1: 3 }
  },
  {
    key: 'code_archio', name: '코드 아키오', status: 'beta', statusKo: '베타', category: 'idea',
    rating: 4.20, count: 76, version: '0.6.0', versions: 2, updated: '2026-05-08', posts: 40, commentCount: 122,
    desc: '오래된 코드베이스의 의도와 변화 흐름을 자연어로 설명해주는 분석 도구. 신규 합류자 온보딩에 유용합니다.',
    dist: { 5: 38, 4: 24, 3: 9, 2: 3, 1: 2 }
  },
  {
    key: 'notion_bridge', name: '노션 브릿지', status: 'live', statusKo: '정식', category: 'ext',
    rating: 4.63, count: 158, version: '1.5.0', versions: 5, updated: '2026-05-22', posts: 88, commentCount: 274,
    desc: '노션 DB를 BlogN 포스트로 양방향 동기화하는 업데이트. 작가가 노션에서 쓰면 블로그에 그대로 반영됩니다.',
    dist: { 5: 100, 4: 38, 3: 13, 2: 4, 1: 3 }
  },
  {
    key: 'voice_memo', name: '보이스 메모 to 글', status: 'beta', statusKo: '베타', category: 'idea',
    rating: 4.08, count: 64, version: '0.7.1', versions: 3, updated: '2026-05-02', posts: 36, commentCount: 108,
    desc: '음성 메모를 받아 글 초안으로 변환. 화자별 분리, 핵심 자동 요약, 자동 문단 정리를 제공합니다.',
    dist: { 5: 30, 4: 20, 3: 9, 2: 3, 1: 2 }
  }
];

const STATUS_KO = { beta: '베타', live: '정식', hold: '보류', archived: '보관' };

// 카테고리 (모델 분류) — 키:한글
const CATEGORY_KO = { ext: '퀴즈앤 확장기능', idea: '아이디어' };

// 비활성 상태(보류·보관): 참여·의견 불가, '진행 중' 카운트 제외
function isInactiveStatus(s) { return s === 'hold' || s === 'archived'; }

// 권한 관리용 사용자 더미 (Staff 전용 화면) — 닉네임·이메일 기준, 소속은 빈칸
const ROLE_KO = { guest: '비로그인', member: '일반', staff: '운영' };
const USERS = [
  { nick: '퀴잰용용', email: 'gy.lee@softn.kr', org: '', role: 'staff', me: true },
  { nick: '하늘다람쥐', email: 'sky.squirrel@quizn.app', org: '', role: 'staff' },
  { nick: '민트초코', email: 'mint.choco@quizn.app', org: '', role: 'member' },
  { nick: '구름빵', email: 'cloud.bread@quizn.app', org: '', role: 'member' },
  { nick: '별헤는밤', email: 'starry.night@quizn.app', org: '', role: 'member' },
  { nick: '코딩하는곰', email: 'coding.bear@quizn.app', org: '', role: 'member' }
];

/* ── DOM 유틸 ─────────────────────────────────── */
function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
function icon(name) { const i = document.createElement('i'); i.className = 'icon-' + name; return i; }
function getModel(key) {
  let customs = [];
  try { customs = JSON.parse(localStorage.getItem('labs_custom_models') || '[]'); } catch (e) {}
  return customs.concat(MODELS).find(m => m.key === key);   // 등록(커스텀) 모델 포함 조회
}
function isCustomModel(key) {
  try { return JSON.parse(localStorage.getItem('labs_custom_models') || '[]').some(m => m.key === key); } catch (e) { return false; }
}

/* 별점 텍스트 (★ 채움 + ☆ 빈, 반올림) */
function starString(score) {
  const full = Math.round(score);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}

/* ── 공용 페이지네이션 렌더 ───────────────────── */
function renderPager(container, total, per, page, onGo) {
  const pages = Math.ceil(total / per);
  container.replaceChildren();
  if (pages <= 1) return;
  const mk = (label, target, opts = {}) => {
    const b = el('button', null, label);
    if (opts.active) b.classList.add('active');
    if (opts.disabled) b.disabled = true;
    else b.addEventListener('click', () => onGo(target));
    return b;
  };
  container.append(mk('‹', page - 1, { disabled: page === 0 }));
  for (let i = 0; i < pages; i++) container.append(mk(String(i + 1), i, { active: i === page }));
  container.append(mk('›', page + 1, { disabled: page === pages - 1 }));
}

/* ── 테마 (light/dark) ────────────────────────── */
// 다크모드 토글 아이콘 (인라인 SVG — SoftN Labs 전용. Fontello에 moon/sun 글리프 없음)
const ICON_MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const ICON_SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
function getTheme() { return localStorage.getItem('labs_theme') || 'light'; }
function applyTheme(t) { document.documentElement.setAttribute('data-mode', t); }
function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem('labs_theme', next);
  applyTheme(next);
  syncThemeToggle();
}
function syncThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = getTheme() === 'dark' ? ICON_SUN : ICON_MOON;  // 정적 SVG 상수만 삽입 (동적 데이터 금지)
}

/* ── 인증 (guest / member / staff) ──────────────── */
function getAuth() { return localStorage.getItem('labs_auth') || 'guest'; }
function setAuth(a) { localStorage.setItem('labs_auth', a); }
function isMember() { return getAuth() !== 'guest'; }   // 로그인 사용자(멤버·스태프 공통)
function isStaff() { return getAuth() === 'staff'; }    // 운영/작성 권한

/* ── 헤더/게이트 초기화 ───────────────────────── */
function initChrome(onAuthChange) {
  applyTheme(getTheme());
  syncThemeToggle();

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const authBtn = document.getElementById('auth-toggle');
  const roleToggle = document.getElementById('role-toggle');
  function syncAuth() {
    const member = isMember();
    if (authBtn) {
      authBtn.classList.toggle('member', member);
      authBtn.querySelector('.auth-label').textContent = member ? '로그아웃' : '로그인';
    }
    if (roleToggle) {
      roleToggle.hidden = !member;                       // 로그인 상태에서만 역할 전환 노출
      const cur = getAuth();
      roleToggle.querySelectorAll('.rt-btn').forEach(b => b.classList.toggle('active', b.dataset.role === cur));
    }
    const adminLink = document.getElementById('admin-link');
    if (adminLink) adminLink.hidden = !isStaff();         // 관리 진입은 Staff만
    document.documentElement.classList.toggle('is-staff', isStaff());
    const gate = document.getElementById('gate');
    if (gate) gate.classList.toggle('show', !member);
    if (onAuthChange) onAuthChange(member);
  }
  // 로그인/로그아웃: guest ↔ member (로그아웃 시 guest로 복귀)
  if (authBtn) authBtn.addEventListener('click', () => { setAuth(isMember() ? 'guest' : 'member'); syncAuth(); });
  // 역할 전환: member ↔ staff (로그인 상태에서만)
  if (roleToggle) roleToggle.querySelectorAll('.rt-btn').forEach(b => b.addEventListener('click', () => {
    if (!isMember()) return;
    setAuth(b.dataset.role); syncAuth();
  }));

  // 게이트의 "QuizN 계정으로 로그인"은 <a href="quizn-home.html">로 QuizN 화면 이동 (별도 핸들러 불필요)

  syncAuth();
}

/* ── 헤더 마크업 (문자열) — 각 페이지가 삽입 ────
   주의: 정적 마크업 전용. 사용자 입력 등 동적 데이터를 이 문자열에 절대 보간하지 말 것(XSS). */
function headerHTML() {
  const acc = (function () { try { return JSON.parse(localStorage.getItem('quizn_account')); } catch (e) { return null; } })();
  const nick = acc && acc.nick ? acc.nick : '퀴잰용용';   // QuizN 계정 닉네임을 따라감 (없으면 기본)
  return `
  <header class="labs-header">
    <div class="inner">
      <a class="lh-logo" href="labs.html">
        <span class="s-mark">S</span>
        <span class="brand">SoftN</span>
        <span class="labs-tag">LABS</span>
      </a>
      <div class="lh-right">
        <button class="icon-toggle" id="theme-toggle" aria-label="다크모드 전환">${ICON_MOON}</button>
        <button class="auth-toggle" id="auth-toggle"><span class="dot"></span><span class="auth-label">로그인</span></button>
        <div class="role-toggle" id="role-toggle" hidden>
          <button class="rt-btn active" data-role="member">Member</button>
          <button class="rt-btn" data-role="staff">Staff</button>
        </div>
        <a class="admin-link" id="admin-link" href="labs-admin.html" hidden><i class="icon-cog-1"></i> 관리</a>
        <div class="profile"><span class="avatar">${nick.charAt(0)}</span><span class="pname">${nick}</span><span class="chev"><i class="icon-down-open"></i></span></div>
      </div>
    </div>
  </header>`;
}

/* ── 게이트 마크업 (문자열) ───────────────────── */
function gateHTML() {
  return `
  <div class="gate-overlay" id="gate">
    <div class="gate-box">
      <div class="g-icon"><i class="icon-lock-filled"></i></div>
      <h2>QuizN 로그인이 필요합니다</h2>
      <p>SoftN Labs는 로그인하신 사용자만 확인하실 수 있습니다.<br>QuizN 계정으로 로그인 후 이용해 주세요.</p>
      <a class="btn primary" id="gate-login" href="quizn-home.html">QuizN 계정으로 로그인</a>
      <p class="asset-note">본 페이지의 모든 콘텐츠는 SoftN의 자산입니다.</p>
    </div>
  </div>`;
}

/* ── 푸터 ─────────────────────────────────────── */
function footerHTML() {
  return `
  <footer class="labs-footer">
    <div class="inner">
      <nav class="ft-policy">
        <a data-doc="이용약관">이용약관</a>
        <span class="ft-sep">|</span>
        <a data-doc="개인정보 취급방침">개인정보 취급방침</a>
      </nav>
      <div class="ft-info">
        서울특별시 강남구 논현로 102길 55, 2층<span class="ft-sep">|</span>주식회사 소프트앤<span class="ft-sep">|</span>QuizN ver 3.0<br>
        사업자등록번호 : 659-81-00422<span class="ft-sep">|</span>통신판매번호 : 제2020-서울강남-00042호<span class="ft-sep">|</span>고객센터번호 : 02-6925-OOOO<span class="ft-sep">|</span>E-mail : OOO@softn.kr
      </div>
      <div class="ft-copy">Copyright © 2019 Softn, Inc. All Rights Reserved.</div>
    </div>
  </footer>`;
}
function injectFooter(slotId) {
  document.getElementById(slotId).outerHTML = footerHTML();
  // 약관·처리방침은 시안: 클릭 시 QuizN 문서로 새 탭 열림 안내만
  document.querySelectorAll('.ft-policy a').forEach(a => a.addEventListener('click', () => {
    toastText('새 탭으로 퀴즈앤 ' + a.dataset.doc + '이 열릴 예정입니다 (시안)');
  }));
}

/* ── 토스트 ──────────────────────────────────── */
function ensureToast() {
  let t = document.getElementById('toast');
  if (!t) { t = el('div', 'toast'); t.id = 'toast'; t.append(el('span', null, '')); document.body.append(t); }
  return t;
}
let _labsToastTimer;
function toast(...nodes) {
  const t = ensureToast();
  const span = t.querySelector('span');
  span.replaceChildren(...nodes);
  t.classList.add('show');
  clearTimeout(_labsToastTimer);
  _labsToastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function toastText(s) { toast(document.createTextNode(s)); }
function strongNode(text) { const s = document.createElement('strong'); s.textContent = text; return s; }
