const STORAGE_KEY = 'memory-game-results'

function getResults() {
  const savedResults = localStorage.getItem(STORAGE_KEY)

  if (!savedResults) return []

  try {
    return JSON.parse(savedResults)
  } catch {
    return []
  }
}

function saveResult(moves) {
  const results = getResults()
  const now = new Date()

  results.push({
    moves,
    date: now.toLocaleDateString('ru-RU'),
    timestamp: now.getTime(),
  })

  results.sort((firstResult, secondResult) => {
    if (firstResult.moves !== secondResult.moves) {
      return firstResult.moves - secondResult.moves
    }

    return firstResult.timestamp - secondResult.timestamp
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(results.slice(0, 10)))
}

export { getResults, saveResult }
