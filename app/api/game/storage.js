// ذخیره موقت در حافظه - مشترک بین همه routeها
let games = new Map()

export function getGames() {
  return games
}

export function setGame(id, game) {
  games.set(id, game)
  console.log('بازی ذخیره شد:', { id, game })
}

export function getGame(id) {
  const game = games.get(id)
  console.log('بازی دریافت شد:', { id, game })
  return game
}

export function deleteGame(id) {
  games.delete(id)
}

export function getAllGames() {
  const gameList = Array.from(games.values())
  console.log('همه بازی‌ها:', gameList)
  return gameList
}