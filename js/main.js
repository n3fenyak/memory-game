import { openModal, closeModal } from './modal.js'
import { getResults, saveResult } from './leaderboard.js'

const HEROES = [
  { name: 'Pudge', image: './assets/images/heroes/pudge.png' },
  { name: 'Invoker', image: './assets/images/heroes/invoker.png' },
  { name: 'Juggernaut', image: './assets/images/heroes/juggernaut.png' },
  {
    name: 'Crystal Maiden',
    image: './assets/images/heroes/crystal-maiden.png',
  },
  { name: 'Axe', image: './assets/images/heroes/axe.png' },
  { name: 'Shadow Fiend', image: './assets/images/heroes/shadow-fiend.png' },
  { name: 'Lina', image: './assets/images/heroes/lina.png' },
  { name: 'Anti-Mage', image: './assets/images/heroes/anti-mage.png' },
]

let firstCard = null
let secondCard = null
let moves = 0
let matchedPairs = 0
let isLocked = false
let mismatchTimeoutId = null
let isGameFinished = false
let currentGameSaved = false

function createElement(tag, className, text) {
  const element = document.createElement(tag)

  if (className) element.className = className
  if (text !== undefined) element.textContent = text

  return element
}

function shuffle(array) {
  const shuffledArray = [...array]

  for (let i = shuffledArray.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[i],
    ]
  }

  return shuffledArray
}

function createDeck() {
  return shuffle([...HEROES, ...HEROES])
}

const app = createElement('main', 'app')
const header = createElement('header', 'header')
const title = createElement('h1', 'header__title', 'DOTA 2 MEMORY')
const controls = createElement('div', 'header__controls')
const movesElement = createElement('span', 'header__counter', `Moves: ${moves}`)
const pairsElement = createElement(
  'span',
  'header__counter',
  `Pairs: ${matchedPairs} / ${HEROES.length}`
)
const newGameButton = createElement('button', 'button', 'NEW GAME')
const leaderboardButton = createElement('button', 'button', 'LEADERBOARD')
const board = createElement('section', 'board')

newGameButton.type = 'button'
leaderboardButton.type = 'button'

controls.append(movesElement, pairsElement, newGameButton, leaderboardButton)
header.append(title, controls)

function updateCounters() {
  movesElement.textContent = `Moves: ${moves}`
  pairsElement.textContent = `Pairs: ${matchedPairs} / ${HEROES.length}`
}

function createCard(hero) {
  const card = createElement('button', 'card')
  const cardInner = createElement('span', 'card__inner')
  const cardBack = createElement('span', 'card__face card__back', 'DOTA')
  const cardFront = createElement('span', 'card__face card__front')
  const heroImage = document.createElement('img')
  const heroName = createElement('span', 'card__name', hero.name)

  card.type = 'button'
  card.dataset.hero = hero.name
  card.setAttribute('aria-label', `${hero.name} card`)

  heroImage.classList.add('card__image')
  heroImage.src = hero.image
  heroImage.alt = hero.name

  cardFront.append(heroImage, heroName)
  cardInner.append(cardBack, cardFront)
  card.append(cardInner)

  card.addEventListener('click', () => handleCardClick(card))

  return card
}

function renderBoard() {
  board.replaceChildren()

  const deck = createDeck()
  deck.forEach((hero) => board.append(createCard(hero)))
}

function resetSelectedCards() {
  firstCard = null
  secondCard = null
}

function finishGame() {
  isGameFinished = true

  if (!currentGameSaved) {
    saveResult(moves)
    currentGameSaved = true
  }

  const modalTitle = createElement('h2', 'modal__title', 'VICTORY')
  const modalText = createElement(
    'p',
    'modal__text',
    `You won in ${moves} moves!`
  )
  const modalActions = createElement('div', 'modal__actions')
  const playAgainButton = createElement('button', 'button', 'NEW GAME')
  const closeButton = createElement(
    'button',
    'button button--secondary',
    'CLOSE'
  )

  playAgainButton.type = 'button'
  closeButton.type = 'button'

  playAgainButton.addEventListener('click', () => {
    closeModal()
    startNewGame()
  })

  closeButton.addEventListener('click', closeModal)
  modalActions.append(playAgainButton, closeButton)
  openModal([modalTitle, modalText, modalActions])
}

function handleMatch() {
  firstCard.classList.add('is-matched')
  secondCard.classList.add('is-matched')
  matchedPairs += 1

  updateCounters()
  resetSelectedCards()

  if (matchedPairs === HEROES.length) finishGame()
}

function handleMismatch() {
  isLocked = true

  mismatchTimeoutId = setTimeout(() => {
    firstCard.classList.remove('is-open')
    secondCard.classList.remove('is-open')
    resetSelectedCards()
    isLocked = false
    mismatchTimeoutId = null
  }, 1000)
}

function checkPair() {
  if (firstCard.dataset.hero === secondCard.dataset.hero) {
    handleMatch()
    return
  }

  handleMismatch()
}

function handleCardClick(card) {
  if (
    isLocked ||
    isGameFinished ||
    card === firstCard ||
    card.classList.contains('is-matched') ||
    card.classList.contains('is-open')
  ) {
    return
  }

  card.classList.add('is-open')

  if (!firstCard) {
    firstCard = card
    return
  }

  secondCard = card
  moves += 1

  updateCounters()
  checkPair()
}

function startNewGame() {
  if (mismatchTimeoutId) {
    clearTimeout(mismatchTimeoutId)
    mismatchTimeoutId = null
  }

  firstCard = null
  secondCard = null
  moves = 0
  matchedPairs = 0
  isLocked = false
  isGameFinished = false
  currentGameSaved = false

  updateCounters()
  renderBoard()
}

function showLeaderboard() {
  const results = getResults()
  const modalTitle = createElement('h2', 'modal__title', 'LEADERBOARD')
  const leaderboard = createElement('div', 'leaderboard')
  const modalActions = createElement('div', 'modal__actions')
  const closeButton = createElement(
    'button',
    'button button--secondary',
    'CLOSE'
  )

  if (results.length === 0) {
    leaderboard.append(createElement('p', 'modal__text', 'No results yet'))
  } else {
    const headerRow = createElement(
      'div',
      'leaderboard__row leaderboard__row--header'
    )

    headerRow.append(
      createElement('span', '', '#'),
      createElement('span', '', 'MOVES'),
      createElement('span', '', 'DATE')
    )

    leaderboard.append(headerRow)

    results.forEach((result, index) => {
      const row = createElement('div', 'leaderboard__row')

      row.append(
        createElement('span', '', index + 1),
        createElement('span', '', result.moves),
        createElement('span', '', result.date)
      )

      leaderboard.append(row)
    })
  }

  closeButton.type = 'button'
  closeButton.addEventListener('click', closeModal)
  modalActions.append(closeButton)

  openModal([modalTitle, leaderboard, modalActions])
}

newGameButton.addEventListener('click', () => {
  closeModal()
  startNewGame()
})

leaderboardButton.addEventListener('click', showLeaderboard)

app.append(header, board)
document.body.append(app)

startNewGame()
