;`use strict`
const pauseButton = document.getElementById(`pauseButton`)
const levelButton = document.getElementById(`levelButton`)
const timeCounter = document.getElementById(`timeCounter`)
const minefield = document.getElementById(`minefield`)
const mineSwTable = document.getElementById(`mineSwTable`)
const resetButton = document.getElementById(`resetButton`)
const flagModeButton = document.getElementById(`flagModeButton`)
const mineNumber = document.getElementById(`mineNumber`)
const flagCounter = document.getElementById(`flagCounter`)
const tdHtmlCollection = document.getElementsByTagName(`td`)

const countUpTimer = {
  startTime: 0,
  playTime: 0,
  elapsedTime: 0,
  gameClearTime: 0,
  timerID: ``,

  start() {
    this.startTime = new Date().getTime()
    this.startTime -= this.elapsedTime
    pauseButton.value = `start`
    pauseButton.textContent = `再開`
    this.timerID = setInterval(() => {
      this.outputCounter()
    }, 1000)
  },

  outputDisplay() {
    this.playTime = new Date().getTime()
    timeCounter.textContent = this.outputFormat(this.playTime - this.startTime)
  },

  pause() {
    clearInterval(this.timerID)
    this.elapsedTime = this.playTime - this.startTime
    pauseButton.value = `start`
    pauseButton.textContent = `再開`
  },

  reset() {
    clearInterval(this.timerID)
    this.startTime = this.playTime = this.elapsedTime = 0
    pauseButton.value = `start`
    pauseButton.textContent = `スタート`
    timeCounter.textContent = `00:00:00`
  },

  outputFormat(milliSec) {
    const sec = milliSec / 1000
    let ss = sec.toFixed(0)
    let mm = Math.floor(ss / 60)
    ss = ss % 60
    let hh = Math.floor(mm / 60)
    mm = mm % 60
    if (ss < 10) {
      ss = `0${ss}`
    }
    if (mm < 10) {
      mm = `0${mm}`
    }
    if (hh < 10) {
      hh = `0${hh}`
    }
    return `${hh}:${mm}:${ss}`
  },

  setGameClearTime() {
    this.pause()
    this.gameClearTime = this.outputFormat(this.elapsedTime)
  },
}

const mineSweeper = {
  gameLevelConfig: [
    { name: `初級`, cell: 9, mine: 10 },
    { name: `中級`, cell: 16, mine: 40 },
    { name: `上級`, cell: 30, mine: 120 },
    { name: `マニア`, cell: 68, mine: 777 },
  ],
  gameLevel: 0,
  initializingState: true,
  flagSetMode: false,
  flagNumber: 0,
  mineNumber: 10,
  highScoreRanking: [
    { name: `初級`, Gold: `-`, Silver: `-`, Bronze: `-` },
    { name: `中級`, Gold: `-`, Silver: `-`, Bronze: `-` },
    { name: `上級`, Gold: `-`, Silver: `-`, Bronze: `-` },
    { name: `マニア`, Gold: `-`, Silver: `-`, Bronze: `-` },
  ],

  toggleFlagSetMode() {
    if (this.flagSetMode) {
      this.flagSetMode = false
    } else {
      this.flagSetMode = true
    }
    flagModeButton.classList.toggle(`activate`)
  },

  toggleFlagSet(clickCell) {
    switch (clickCell.dataset.status) {
      case `0`:
        clickCell.textContent = `▲`
        clickCell.dataset.status = `2`
        this.flagNumber++
        flagCounter.textContent = this.flagNumber
        break
      case `2`:
        clickCell.textContent = ``
        clickCell.dataset.status = `0`
        this.flagNumber--
        flagCounter.textContent = this.flagNumber
        break
    }
  },

  setGameLevel() {
    if (this.gameLevel === this.gameLevelConfig.length - 1) {
      this.gameLevel = 0
    } else {
      this.gameLevel++
    }
    levelButton.textContent = this.gameLevelConfig[this.gameLevel].name
    this.initialize()
  },
}
