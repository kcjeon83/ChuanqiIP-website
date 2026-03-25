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
  nav.classList.toggle('scrolled', window.scrollY > 60)
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

// ─── 4. REVEAL ANIMATION ON SCROLL ───
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

// ─── 6. GAME CARDS ROLLING ───
const gameCards = document.querySelectorAll('#cardStack .game-card')
let cardPositions = ['pos-1', 'pos-2', 'pos-3']

function updateCards() {
  gameCards.forEach((card, i) => {
    card.className = 'game-card ' + cardPositions[i]
  })
}

updateCards()
setInterval(() => {
  cardPositions.unshift(cardPositions.pop())
  updateCards()
}, 4500)
