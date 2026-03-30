import './style.css'

// ─── CMS LOADER ───
// 1차: localStorage (즉시 로드)
let cqipCMS = (() => {
  try { const s = localStorage.getItem('cqip_cms'); return s ? JSON.parse(s) : null } catch { return null }
})()

// 2차: DB에서 비동기 로드 후 반영
import('./db.js').then(async ({ dbLoad, isConfigured }) => {
  if (!isConfigured) return
  const data = await dbLoad()
  if (!data || Object.keys(data).length === 0) return
  localStorage.setItem('cqip_cms', JSON.stringify(data))
  cqipCMS = data
  // i18n, gameStats 재빌드 후 DOM 전체 재적용
  rebuildAll()
}).catch(() => {})

function applyCMSImages() {
  if (!cqipCMS) return
  // Game cards
  cqipCMS.games?.forEach((g, i) => {
    const img  = document.getElementById(`gameCardImg${i}`)
    const link = document.getElementById(`gameCardLink${i}`)
    if (img  && g.image) img.src   = g.image
    if (link && g.link)  link.href = g.link
  })
  // News cards
  cqipCMS.news?.forEach((n, i) => {
    const imgEl  = document.getElementById(`newsCardImg${i}`)
    const linkEl = document.getElementById(`newsCardLink${i}`)
    const dateEl = document.getElementById(`newsCardDate${i}`)
    const titleEl = i < 4
      ? document.querySelector(`#newsCardLink${i} .news-title--clamp`)
      : document.getElementById(`newsTitle${i}`)
    if (imgEl  && n.image) imgEl.style.backgroundImage = `url('${n.image}')`
    if (linkEl && n.link)  linkEl.href = n.link
    if (dateEl && n.date)  dateEl.textContent = n.date
    if (titleEl && n.titleKr) titleEl.textContent = n.titleKr
  })
  // Recruit boxes
  cqipCMS.recruit?.cards?.forEach((c, i) => {
    const box  = document.getElementById(`recruitBox${i}`)
    const num  = document.getElementById(`recruitNum${i}`)
    const text = document.getElementById(`recruitText${i}`)
    if (box  && c.image) { box.style.backgroundImage = `url('${c.image}')`; box.style.backgroundSize = 'cover'; box.style.backgroundPosition = 'center' }
    if (num  && c.num)   num.textContent  = c.num
    if (text && c.text)  text.textContent = c.text
  })
  // Studio images
  cqipCMS.studio?.forEach((url, i) => {
    if (!url) return
    const items = document.querySelectorAll('.marquee-item-inner')
    if (items[i])     items[i].style.backgroundImage     = `url('${url}')`
    if (items[i + 7]) items[i + 7].style.backgroundImage = `url('${url}')`
  })
  // Contact email
  if (cqipCMS.contact?.email) {
    const emailEl = document.querySelector('.contact-email span')
    const emailLink = document.querySelector('.contact-email')
    if (emailEl) emailEl.textContent = cqipCMS.contact.email
    if (emailLink) emailLink.href = `mailto:${cqipCMS.contact.email}`
  }
  // Footer address
  if (cqipCMS.contact?.addrKr) {
    const addrEl = document.getElementById('footerAddress')
    if (addrEl) addrEl.textContent = cqipCMS.contact.addrKr
  }
}

// Apply images after DOM ready
document.addEventListener('DOMContentLoaded', applyCMSImages)

// ─── 0. HERO VIDEO CROSSFADE ───
const vid1 = document.getElementById('heroVid1')
const vid2 = document.getElementById('heroVid2')

if (vid1 && vid2) {
  vid1.addEventListener('ended', () => {
    vid2.currentTime = 0
    vid2.play()
    vid1.style.opacity = '0'
    vid2.style.opacity = '0.7'
  })
  vid2.addEventListener('ended', () => {
    vid1.currentTime = 0
    vid1.play()
    vid2.style.opacity = '0'
    vid1.style.opacity = '0.7'
  })
}

// ─── 1. 3D LOGO MOUSE PARALLAX ───
const logoImg = document.getElementById('heroLogoImg')
let logoTargetX = 0, logoTargetY = 0
let logoCurX = 0, logoCurY = 0
const MAX_TILT = 18

document.addEventListener('mousemove', e => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1
  const ny = (e.clientY / window.innerHeight) * 2 - 1
  logoTargetY = nx * MAX_TILT
  logoTargetX = -ny * MAX_TILT
})

function animateLogo() {
  logoCurX += (logoTargetX - logoCurX) * 0.07
  logoCurY += (logoTargetY - logoCurY) * 0.07
  if (logoImg) {
    logoImg.style.transform = `perspective(800px) rotateX(${logoCurX}deg) rotateY(${logoCurY}deg) scale3d(1,1,1)`
  }
  requestAnimationFrame(animateLogo)
}
animateLogo()

document.querySelector('.hero').addEventListener('mouseleave', () => {
  logoTargetX = 0
  logoTargetY = 0
})

// ─── LANGUAGE STATE ───
let currentLang = 'kr'

// ─── 2. NAV SCROLL EFFECT ───
const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10)
})

// ─── 3. HERO SCROLL PARALLAX ───
const heroContent = document.querySelector('.hero-content')
const heroGridEl  = document.querySelector('.hero-grid')
const scrollIndEl = document.querySelector('.scroll-indicator')

function onScroll() {
  const scrollY  = window.scrollY
  const progress = Math.min(scrollY / window.innerHeight, 1)

  if (heroContent) {
    heroContent.style.opacity  = String(Math.max(0, 1 - progress * 1.8))
    heroContent.style.transform = `translateY(${progress * -70}px) scale(${1 - progress * 0.05})`
  }
  if (heroGridEl)  heroGridEl.style.opacity  = String(Math.max(0, 1 - progress * 1.4))
  if (scrollIndEl) scrollIndEl.style.opacity = String(Math.max(0, 1 - progress * 5))
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// ─── 4. NEWS DRAG SCROLL ───
const newsTrack = document.querySelector('.news-scroll-track')
if (newsTrack) {
  let isDragging = false
  let dragStartX = 0
  let dragScrollLeft = 0

  newsTrack.addEventListener('mousedown', e => {
    isDragging = true
    dragStartX = e.pageX - newsTrack.offsetLeft
    dragScrollLeft = newsTrack.scrollLeft
    newsTrack.style.cursor = 'grabbing'
  })
  window.addEventListener('mouseup', () => {
    isDragging = false
    newsTrack.style.cursor = ''
  })
  newsTrack.addEventListener('mousemove', e => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - newsTrack.offsetLeft
    newsTrack.scrollLeft = dragScrollLeft - (x - dragStartX)
  })
}

// ─── 5. REVEAL ANIMATION ───
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible')
  })
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

// ─── 5. SMOOTH ANCHOR SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href')
    if (!href || href === '#') return
    const target = document.querySelector(href)
    if (target) {
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
})

// ─── 6. GAME CARD SLIDER ───
const gameCards    = document.querySelectorAll('#cardStack .game-card')
const showcaseDesc = document.getElementById('showcaseDesc')
const cardDots     = document.querySelectorAll('.card-dot')
const btnPrev      = document.getElementById('cardPrev')
const btnNext      = document.getElementById('cardNext')
const total        = gameCards.length
let current        = 0
let autoRoll

const gameDescs = [
  '미르의 전설2는 1세대 온라인 게임의 흐름을 바꾼 상징적인 작품입니다. 탄탄한 세계관과 전투 시스템, 그리고 무협의 미학을 바탕으로 MMORPG 장르의 가능성을 처음으로 제시했습니다.',
  '미르의 전설3은 미르의 전설2의 정통성을 계승한 후속작으로, 확장된 세계와 향상된 그래픽, 새롭게 설계된 전투와 퀘스트를 통해 더 깊은 무협의 재미를 선사합니다.',
  '더 넓어진 전장과 발전된 시스템으로 진화를 이뤄냈습니다. 향상된 그래픽, 정교해진 전투, 다채로운 콘텐츠를 통해 한층 깊이 있는 무협 MMORPG의 완성도를 새롭게 정의합니다.'
]

let gameStats = []

function buildGameStats() {
  const base = [
    { players: '2억+',  playersLabel: 'Total Players', revenue: '2.2조', revenueLabel: 'Total Revenue', showRevenue: true,  service: '25y', serviceLabel: 'In Service', color: '#c0392b' },
    { players: '60만+', playersLabel: 'CONCURRENTS',   revenue: '2.2조', revenueLabel: 'Total Revenue', showRevenue: false, service: '23y', serviceLabel: 'In Service', color: '#8e44ad' },
    { players: '200+',  playersLabel: 'TEAM MEMBERS',  revenue: '4',     revenueLabel: 'YEARS IN DEV',  showRevenue: true,  service: 'UE5', serviceLabel: 'ENGINE',     color: '#c9a44a' },
  ]
  if (cqipCMS?.games) {
    cqipCMS.games.forEach((g, i) => {
      if (!base[i]) return
      if (g.players)       base[i].players      = g.players
      if (g.playersLabel)  base[i].playersLabel  = g.playersLabel
      if (g.revenue)       base[i].revenue       = g.revenue
      if (g.revenueLabel)  base[i].revenueLabel  = g.revenueLabel
      if (g.showRevenue !== undefined) base[i].showRevenue = g.showRevenue
      if (g.service)       base[i].service       = g.service
      if (g.serviceLabel)  base[i].serviceLabel  = g.serviceLabel
      if (g.color)         base[i].color         = g.color
    })
  }
  gameStats = base
}
buildGameStats()

const statPlayers      = document.getElementById('statPlayers')
const statPlayersLabel = document.getElementById('statPlayersLabel')
const statRevenue      = document.getElementById('statRevenue')
const statRevenueLabel = document.getElementById('statRevenueLabel')
const statRevenueWrap  = document.getElementById('statRevenueWrap')
const statService      = document.getElementById('statService')
const statServiceLabel = document.getElementById('statServiceLabel')

function updateStats(idx) {
  const s = gameStats[idx]
  if (statPlayers)      statPlayers.textContent      = s.players
  if (statPlayersLabel) statPlayersLabel.textContent  = s.playersLabel
  if (statRevenue)      statRevenue.textContent       = s.revenue
  if (statRevenueLabel) statRevenueLabel.textContent  = s.revenueLabel
  if (statRevenueWrap)  statRevenueWrap.style.display = s.showRevenue ? '' : 'none'
  if (statService)      statService.textContent       = s.service
  if (statServiceLabel) statServiceLabel.textContent  = s.serviceLabel
  // 수치 컬러 적용
  ;[statPlayers, statRevenue, statService].forEach(el => {
    if (el) el.style.color = s.color
  })
}

function goToCard(idx, dir = 1) {
  const prev = current
  current = (idx + total) % total

  // 진입 카드: 방향에 맞게 오프스크린에서 시작
  gameCards[current].style.transition = 'none'
  gameCards[current].style.transform  = `translateX(${dir > 0 ? '100%' : '-100%'})`
  gameCards[current].style.opacity    = '0'

  requestAnimationFrame(() => requestAnimationFrame(() => {
    // 이전 카드: 반대 방향으로 퇴장
    gameCards[prev].style.transition = 'transform 0.85s cubic-bezier(0.76,0,0.24,1), opacity 0.85s ease'
    gameCards[prev].style.transform  = `translateX(${dir > 0 ? '-100%' : '100%'})`
    gameCards[prev].style.opacity    = '0'

    // 새 카드: 중앙으로 진입
    gameCards[current].style.transition = 'transform 0.85s cubic-bezier(0.76,0,0.24,1), opacity 0.85s ease'
    gameCards[current].style.transform  = 'translateX(0%)'
    gameCards[current].style.opacity    = '1'
  }))

  // 나머지 카드 즉시 오프스크린 처리
  gameCards.forEach((c, i) => {
    if (i !== prev && i !== current) {
      c.style.transition = 'none'
      c.style.transform  = 'translateX(100%)'
      c.style.opacity    = '0'
    }
  })

  // dots 업데이트
  cardDots.forEach((d, i) => d.classList.toggle('active', i === current))

  // 설명 텍스트 + 스탯 업데이트
  if (showcaseDesc) {
    showcaseDesc.classList.add('fade')
    setTimeout(() => {
      showcaseDesc.textContent = i18n[currentLang].gameDescs[current]
      showcaseDesc.classList.remove('fade')
    }, 420)
  }
  updateStats(current)
}

function startAutoRoll() {
  clearInterval(autoRoll)
  autoRoll = setInterval(() => goToCard(current + 1, 1), 5000)
}

btnNext?.addEventListener('click', () => { goToCard(current + 1,  1); startAutoRoll() })
btnPrev?.addEventListener('click', () => { goToCard(current - 1, -1); startAutoRoll() })
cardDots.forEach((dot, i) => {
  dot.addEventListener('click', () => { goToCard(i, i >= current ? 1 : -1); startAutoRoll() })
})

// 초기화
gameCards.forEach((c, i) => {
  c.style.transition = 'none'
  c.style.transform  = i === 0 ? 'translateX(0%)' : 'translateX(100%)'
  c.style.opacity    = i === 0 ? '1' : '0'
})
if (showcaseDesc) showcaseDesc.textContent = gameDescs[0]
updateStats(0)
startAutoRoll()

// ─── 7. I18N ───
let i18n = {}

function buildI18n() {
  const base = {
  kr: {
    gameDescs: [
      '미르의 전설2는 1세대 온라인 게임의 흐름을 바꾼 상징적인 작품입니다. 탄탄한 세계관과 전투 시스템, 그리고 무협의 미학을 바탕으로 MMORPG 장르의 가능성을 처음으로 제시했습니다.',
      '미르의 전설3은 미르의 전설2의 정통성을 계승한 후속작으로, 확장된 세계와 향상된 그래픽, 새롭게 설계된 전투와 퀘스트를 통해 더 깊은 무협의 재미를 선사합니다.',
      '더 넓어진 전장과 발전된 시스템으로 진화를 이뤄냈습니다. 향상된 그래픽, 정교해진 전투, 다채로운 콘텐츠를 통해 한층 깊이 있는 무협 MMORPG의 완성도를 새롭게 정의합니다.'
    ],
    heroSub: '경계를 허무는 상상력, 미르 IP의 무한한 확장<br>게임을 넘어 문화와 플랫폼을 잇는 글로벌 IP 리더로 도약합니다.',
    recruitBody: 'We Dare, We Create, We Transform.<br>25년의 게임 개발 경험을 바탕으로 AI와 블록체인 기술을 접목해 게임의 새로운 패러다임을 만들어갑니다. 함께 상상을 현실로 만들어 나갈 인재를 기다립니다.',
    perks: [
      '월 26만 식사포인트 + 무료 사내 카페 음료',
      '연 200만 복지포인트',
      '매년 종합건강검진 · 사내 스포츠센터 · 제휴 휴양시설',
      '본인 및 가족 단체상해보험',
      '자녀 유치원~대학교 학자금 지원',
      '장기근속축하금 · 경조금 및 경조휴가',
      '직무 관련 교육 · 수면실 · 샤워룸 등 사내 편의시설'
    ],
    recruitBtn: '채용 공고 보기',
    newsTitles: [
      "위메이드, '미르의 전설2' 서비스 25주년 기념 대규모 이벤트",
      "'미르의 전설2', 중레벨 성장 시스템 업데이트 및 2026 로드맵 발표",
      "위메이드, '미르의 전설2' 신규 필드 '백룡담촌' 업데이트 실시",
      "위메이드 '미르의 전설3', 신규 시공 던전 '망의 숲 심연' 업데이트"
    ],
    address: '성남시 분당구 대왕판교로644번길 49 위믹스타워 6F',
    privacy: '개인정보처리방침',
    terms: '이용약관'
  },
  en: {
    gameDescs: [
      'The Legend of Mir 2 is an iconic title that reshaped the first generation of online gaming. Built on a rich world, refined combat, and martial arts aesthetics, it first revealed the true potential of the MMORPG genre.',
      'The Legend of Mir 3 carries forward the legacy of its predecessor with expanded worlds, enhanced graphics, and redesigned combat and quests for a deeper martial arts gaming experience.',
      'An evolution with expanded battlefields and advanced systems. Defining a new standard of open-world MMORPG excellence through enhanced visuals, refined combat, and diverse content.'
    ],
    heroSub: 'Imagination Beyond Boundaries — The Infinite Expansion of Mir IP<br>Rising as a Global IP Leader Connecting Games, Culture and Platforms.',
    recruitBody: 'We Dare, We Create, We Transform.<br>Building on 25 years of game development, we integrate AI and blockchain to forge a new gaming paradigm. We are looking for visionaries ready to turn imagination into reality.',
    perks: [
      'Monthly ₩260K meal points + free in-house café',
      'Annual ₩2M welfare points',
      'Annual health checkup · Sports center · Affiliated resorts',
      'Group accident insurance for employee & family',
      'Child education support (kindergarten through university)',
      'Long-service bonus · Family event allowance & leave',
      'Job training · Nap room · Shower room & in-house facilities'
    ],
    recruitBtn: 'View Job Openings',
    newsTitles: [
      "Wemade Hosts Grand Event to Celebrate 25th Anniversary of 'The Legend of Mir 2'",
      "'Legend of Mir 2' Mid-Level Growth System Update & 2026 Roadmap Revealed",
      "Wemade Launches New Field 'Baekryongdam Village' Update for 'Legend of Mir 2'",
      "Wemade's 'Legend of Mir 3' Introduces New Dungeon 'Forest of Oblivion: Abyss'"
    ],
    address: 'Weemix Tower 6F, 49 Daewangpangyo-ro 644beon-gil, Bundang-gu, Seongnam, Korea',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service'
  }
  }
  // CMS 오버라이드
  if (cqipCMS) {
    const c = cqipCMS
    const has = v => v != null  // 빈 문자열("")도 반영, undefined/null만 제외
    if (c.hero) {
      if (has(c.hero.subKr)) base.kr.heroSub = c.hero.subKr.replace(/\n/g, '<br>')
      if (has(c.hero.subEn)) base.en.heroSub = c.hero.subEn.replace(/\n/g, '<br>')
    }
    if (c.games) {
      c.games.forEach((g, i) => {
        if (has(g.descKr)) base.kr.gameDescs[i] = g.descKr
        if (has(g.descEn)) base.en.gameDescs[i] = g.descEn
      })
    }
    if (c.recruit) {
      if (has(c.recruit.bodyKr)) base.kr.recruitBody = c.recruit.bodyKr.replace(/\n/g, '<br>')
      if (has(c.recruit.bodyEn)) base.en.recruitBody = c.recruit.bodyEn.replace(/\n/g, '<br>')
      if (has(c.recruit.btnKr))  base.kr.recruitBtn  = c.recruit.btnKr
      if (has(c.recruit.btnEn))  base.en.recruitBtn  = c.recruit.btnEn
      c.recruit.perks?.forEach((p, i) => {
        if (has(p.kr)) base.kr.perks[i] = p.kr
        if (has(p.en)) base.en.perks[i] = p.en
      })
    }
    if (c.news) {
      c.news.forEach((n, i) => {
        if (i < 4) {
          if (has(n.titleKr)) base.kr.newsTitles[i] = n.titleKr
          if (has(n.titleEn)) base.en.newsTitles[i] = n.titleEn
        }
      })
    }
    if (c.contact) {
      if (has(c.contact.addrKr)) base.kr.address = c.contact.addrKr
      if (has(c.contact.addrEn)) base.en.address = c.contact.addrEn
    }
  }
  i18n = base
}
buildI18n()

function setLang(lang) {
  currentLang = lang
  document.documentElement.lang = lang === 'kr' ? 'ko' : 'en'
  document.getElementById('langKR').classList.toggle('active', lang === 'kr')
  document.getElementById('langEN').classList.toggle('active', lang === 'en')

  const t = i18n[lang]

  // Hero subtitle
  const heroSubEl = document.querySelector('.hero-sub')
  if (heroSubEl) heroSubEl.innerHTML = t.heroSub

  // Game description (현재 카드)
  if (showcaseDesc) showcaseDesc.textContent = t.gameDescs[current]

  // Recruit body
  const recruitBodyEl = document.querySelector('.recruit-section .section-body')
  if (recruitBodyEl) recruitBodyEl.innerHTML = t.recruitBody

  // Perks
  document.querySelectorAll('.perk-text').forEach((el, i) => {
    if (t.perks[i]) el.textContent = t.perks[i]
  })

  // Recruit CTA button
  const recruitBtnEl = document.querySelector('.btn-primary span')
  if (recruitBtnEl) recruitBtnEl.textContent = t.recruitBtn

  // News titles (링크된 4개 카드)
  document.querySelectorAll('.news-title--clamp').forEach((el, i) => {
    if (t.newsTitles[i]) el.textContent = t.newsTitles[i]
  })

  // Footer
  const addrEl = document.getElementById('footerAddress')
  if (addrEl) addrEl.textContent = t.address
  const privEl = document.getElementById('footerPrivacy')
  if (privEl) privEl.textContent = t.privacy
  const termsEl = document.getElementById('footerTerms')
  if (termsEl) termsEl.textContent = t.terms
}

document.getElementById('langKR')?.addEventListener('click', () => setLang('kr'))
document.getElementById('langEN')?.addEventListener('click', () => setLang('en'))

// DB 로드 후 전체 재빌드
function rebuildAll() {
  buildI18n()
  buildGameStats()
  applyCMSImages()
  setLang(currentLang)
  updateStats(current)
}

// ─── 8. RECRUIT CARD ROLLING ───
const rBoxes   = Array.from(document.querySelectorAll('.recruit-visual .recruit-box'))
const rClasses = ['rb-1', 'rb-2', 'rb-3']
const rZIndex  = { 'rb-1': 3, 'rb-2': 2, 'rb-3': 1 }
let rOffset = 0

setInterval(() => {
  rOffset = (rOffset + 1) % 3
  rBoxes.forEach((box, i) => {
    const next = rClasses[(i + rOffset) % 3]
    box.classList.remove('rb-1', 'rb-2', 'rb-3')
    box.style.zIndex = rZIndex[next]
    box.classList.add(next)
  })
}, 4000)

