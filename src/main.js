import './style.css'

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

const gameStats = [
  { players: '2억+',  playersLabel: 'Total Players', revenue: '2.2조', revenueLabel: 'Total Revenue', showRevenue: true,  service: '25y', serviceLabel: 'In Service', color: '#c0392b' },
  { players: '60만+', playersLabel: 'CONCURRENTS',   revenue: '2.2조', revenueLabel: 'Total Revenue', showRevenue: false, service: '23y', serviceLabel: 'In Service', color: '#8e44ad' },
  { players: '200+',  playersLabel: 'TEAM MEMBERS',  revenue: '4',     revenueLabel: 'YEARS IN DEV',  showRevenue: true,  service: 'UE5', serviceLabel: 'ENGINE',     color: '#c9a44a' },
]

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
      showcaseDesc.textContent = gameDescs[current]
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

// ─── 7. RECRUIT CARD ROLLING ───
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

