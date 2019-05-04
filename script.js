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

const countUpTimer = {
  startTime: 0,
  playTime: 0,
  elapsedTime: 0,
  gameClearTime: 0,
  timerID: ``,

  start() {
    this.startTime = new Date().getTime()
    this.startTime -= this.elapsedTime
    pauseButton.value = `pause`
    pauseButton.textContent = `一時停止`
    this.timerID = setInterval(() => {
      this.outputDisplay()
    }, 1000)
  },

  outputDisplay() {
    this.playTime = new Date().getTime()
    timeCounter.textContent = this.convertFormat(this.playTime - this.startTime)
  },

  pause() {
    clearInterval(this.timerID)
    this.elapsedTime = this.playTime - this.startTime
    pauseButton.value = `start`
    pauseButton.textContent = `再開`
  },

  reset() {
    clearInterval(this.timerID)
    this.startTime = this.playTime = this.elapsedTime = this.gameClearTime = 0
    pauseButton.value = `start`
    pauseButton.textContent = `再開`
    timeCounter.textContent = `00:00:00`
  },

  convertFormat(milliSec) {
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
    this.gameClearTime = this.convertFormat(this.elapsedTime)
  },
}

const mineSweeper = {
  levelConfig: [
    { name: `初級`, cell: 9, mine: 10, clearTimeRank: { Gold: `-`, Silver: `-`, Bronze: `-` } },
    { name: `中級`, cell: 16, mine: 40, clearTimeRank: { Gold: `-`, Silver: `-`, Bronze: `-` } },
    { name: `上級`, cell: 30, mine: 120, clearTimeRank: { Gold: `-`, Silver: `-`, Bronze: `-` } },
    { name: `マニア`, cell: 68, mine: 777, clearTimeRank: { Gold: `-`, Silver: `-`, Bronze: `-` } },
  ],
  gameLevel: 0,
  initialization: true,
  flagSetMode: false,
  flagNumber: 0,
  mineNumber: 10,

  toggleFlagSetMode() {
    if (this.flagSetMode) {
      this.flagSetMode = false
      flagModeButton.classList.remove(`activate`)
    } else {
      this.flagSetMode = true
      flagModeButton.classList.add(`activate`)
    }
  },

  toggleFlagSet(clickCell) {
    switch (clickCell.dataset.status) {
      case `0`:
        clickCell.classList.add(`flag`)
        clickCell.textContent = `▲`
        clickCell.dataset.status = `2`
        this.flagNumber++
        flagCounter.textContent = this.flagNumber
        break
      case `2`:
        clickCell.classList.remove(`flag`)
        clickCell.textContent = ``
        clickCell.dataset.status = `0`
        this.flagNumber--
        flagCounter.textContent = this.flagNumber
        break
    }
  },

  setGameLevel() {
    if (this.gameLevel === this.levelConfig.length - 1) {
      this.gameLevel = 0
    } else {
      this.gameLevel++
    }
    levelButton.textContent = this.levelConfig[this.gameLevel].name

    this.initialize()
  },

  setMinesRandomlyToCells() {
    const cellArray = Array.from(document.getElementsByTagName(`td`))

    for (let i = cellArray.length - 1; i >= 0; i--) {
      const g = Math.floor(Math.random() * (i + 1))
      const tmp = cellArray[i]
      cellArray[i] = cellArray[g]
      cellArray[g] = tmp
    }

    for (let i = 0; i < this.levelConfig[this.gameLevel].mine; i++) {
      if (document.getElementById(cellArray[i].id).dataset.status === `1`) {
        cellArray.splice(i, 1)
        i--
        continue
      }
      document.getElementById(cellArray[i].id).dataset.mine = `1`
    }
  },

  countMineNumber() {
    const cellArray = Array.from(document.getElementsByTagName(`td`))

    cellArray.forEach(targetCell => {
      const cellId = targetCell.id
      const cellIdSplit = cellId.split(`-`)
      const targetCellTr = Number(cellIdSplit[1])
      const targetCellTd = Number(cellIdSplit[2])
      let mineNum = ``

      if (targetCell.dataset.mine === `1`) {
        return
      }

      for (let trNum = targetCellTr - 1; trNum <= targetCellTr + 1; trNum++) {
        for (let tdNum = targetCellTd - 1; tdNum <= targetCellTd + 1; tdNum++) {
          let adjacentCell = document.getElementById(`cell-${trNum}-${tdNum}`)
          if ((trNum === targetCellTr && tdNum === targetCellTd) || adjacentCell === null) {
            continue
          }
          let adjacentCellMine = adjacentCell.dataset.mine
          if (adjacentCellMine === `1`) {
            mineNum++
          }
        }
      }
      targetCell.dataset.value = `${mineNum}`
    })
  },

  createMineSwTarble() {
    const table = document.createElement(`table`)
    table.id = `mineSwTable`
    for (let i = 0; i < this.levelConfig[this.gameLevel].cell; i++) {
      const tr = document.createElement(`tr`)
      tr.id = `tr-${i}`
      for (let j = 0; j < this.levelConfig[this.gameLevel].cell; j++) {
        const td = document.createElement(`td`)
        td.id = `cell-${i}-${j}`
        td.dataset.status = `0`
        td.dataset.mine = `0`
        td.dataset.value = ``
        tr.appendChild(td)
      }
      table.appendChild(tr)
    }
    minefield.appendChild(table)
  },

  deleteMineSwTarble() {
    while (minefield.firstChild) {
      minefield.removeChild(minefield.firstChild)
    }
  },

  openMineCell(clickCell) {
    clickCell.dataset.status = `1`
    clickCell.classList.add(`mine`)
    clickCell.textContent = '●'
  },

  openEmptyCell(clickCell) {
    clickCell.dataset.status = `1`
    clickCell.classList.add(`empty`)
    clickCell.textContent = document.getElementById(clickCell.id).dataset.value
  },

  openAllCells() {
    const cellArray = Array.from(document.getElementsByTagName(`td`))

    cellArray.forEach(targetCell => {
      if (targetCell.dataset.status === `1`) {
        return
      }

      if (targetCell.dataset.mine === `1`) {
        this.openMineCell(targetCell)
        return
      }

      this.openEmptyCell(targetCell)
    })
  },

  compareClearTimeRank() {
    const clearTime = countUpTimer.gameClearTime

    const toSec = time => {
      if (time === `-`) {
        return 0
      }
      const timeSplit = time.split(':')
      const hour = Number(timeSplit[0])
      const minute = Number(timeSplit[1])
      const second = Number(timeSplit[2])

      return hour * 60 * 60 + minute * 60 + second
    }

    for (let key in this.levelConfig[this.gameLevel].clearTimeRank) {
      if (this.levelConfig[this.gameLevel].clearTimeRank[key] === `-`) {
        this.levelConfig[this.gameLevel].clearTimeRank[key] = clearTime
        break
      }

      if (toSec(this.levelConfig[this.gameLevel].clearTimeRank[key]) > toSec(clearTime)) {
        this.levelConfig[this.gameLevel].clearTimeRank[key] = clearTime
        break
      }
    }
  },

  confirmResult(judge) {
    const gameClearMessage = `
    クリア!
    ${countUpTimer.gameClearTime}
    〜ランキング〜
    難易度[${this.levelConfig[this.gameLevel].name}]
    Gold [${this.levelConfig[this.gameLevel].clearTimeRank.Gold}]
    Silver [${this.levelConfig[this.gameLevel].clearTimeRank.Silver}]
    Bronze [${this.levelConfig[this.gameLevel].clearTimeRank.Bronze}]
    リトライする?`

    const gameOverMessage = `
    ゲームオーバー
    リトライする？`

    let result = ``

    switch (judge) {
      case `gameClear`:
        result = confirm(gameClearMessage)
        break
      case `gameOver`:
        result = confirm(gameOverMessage)
        break
    }

    return result
  },

  judgeGameClear() {
    const cellArray = Array.from(document.getElementsByTagName(`td`))

    let gameClear = true

    for (targetCell of cellArray) {
      if ((targetCell.dataset.status === `0` || targetCell.dataset.status === `2`) && targetCell.dataset.mine === `0`) {
        gameClear = false
        break
      }
    }
    return gameClear
  },

  endGame() {
    countUpTimer.pause()
    this.openAllCells()
    setTimeout(() => {
      if (this.confirmResult(`gameOver`)) {
        this.initialize()
      } else {
        pauseButton.disabled = true
        flagModeButton.disabled = true
      }
    }, 1000)
  },

  startGame() {
    countUpTimer.start()
    this.setMinesRandomlyToCells()
    this.countMineNumber()
    this.initialization = false
    resetButton.disabled = false
    pauseButton.disabled = false
    flagModeButton.disabled = false
    levelButton.disabled = true
  },

  isMineCell(cellIdArray) {
    let mineCell = false

    for (cellId of cellIdArray) {
      let adjacentCell = document.getElementById(cellId)
      if (adjacentCell.dataset.mine === `1`) {
        mineCell = true
        break
      }
    }
    return mineCell
  },

  clearGame() {
    countUpTimer.setGameClearTime()
    this.openAllCells()
    this.compareClearTimeRank()
    setTimeout(() => {
      if (this.confirmResult(`gameClear`)) {
        this.initialize()
      } else {
        pauseButton.disabled = true
        flagModeButton.disabled = true
      }
    }, 1000)
  },

  openAdjacentEmptyCell(clickCell) {
    const clickCellId = clickCell.id
    const clickCellIdSplit = clickCellId.split(`-`)
    const clickTrNum = Number(clickCellIdSplit[1])
    const clickTdNum = Number(clickCellIdSplit[2])
    const adjacentCellIdArray = []

    for (let tr = clickTrNum - 1; tr <= clickTrNum + 1; tr++) {
      for (let td = clickTdNum - 1; td <= clickTdNum + 1; td++) {
        if (
          `cell-${tr}-${td}` === clickCellId ||
          document.getElementById(`cell-${tr}-${td}`) === null ||
          document.getElementById(`cell-${tr}-${td}`).dataset.status === `1`
        ) {
          continue
        }
        adjacentCellIdArray.push(`cell-${tr}-${td}`)
      }
    }

    if (adjacentCellIdArray.length === 0 || this.isMineCell(adjacentCellIdArray)) {
      return
    }
    for (id of adjacentCellIdArray) {
      let adjacentCell = document.getElementById(id)
      if (adjacentCell === null) {
        continue
      }
      this.openEmptyCell(adjacentCell)
      this.openAdjacentEmptyCell(adjacentCell)
    }
  },

  judgeCellState(clickCell) {
    if (this.initialization) {
      clickCell.dataset.status = `1`
      clickCell.classList.add(`empty`)
      this.startGame()
      this.openAdjacentEmptyCell(clickCell)
      clickCell.textContent = document.getElementById(clickCell.id).dataset.value
      return
    }

    switch (clickCell.dataset.status) {
      case `0`:
        if (this.flagSetMode) {
          this.toggleFlagSet(clickCell)
          return
        }
        if (clickCell.dataset.mine === `1`) {
          this.openMineCell(clickCell)
          this.endGame()
          return
        }
        this.openEmptyCell(clickCell)
        this.openAdjacentEmptyCell(clickCell)
        break
      case `1`:
        break
      case `2`:
        if (this.flagSetMode) {
          this.toggleFlagSet(clickCell)
        }
        break
    }

    if (this.judgeGameClear()) {
      this.clearGame()
    }
  },

  initialize() {
    this.initialization = true
    resetButton.disabled = true
    pauseButton.disabled = true
    flagModeButton.disabled = true
    levelButton.disabled = false
    this.flagSetMode = false
    this.flagNumber = 0
    flagModeButton.classList.remove(`activate`)
    flagCounter.textContent = this.flagNumber
    this.mineNumber = this.levelConfig[this.gameLevel].mine
    mineNumber.textContent = this.mineNumber
    countUpTimer.reset()
    this.deleteMineSwTarble()
    this.createMineSwTarble()
    this.addEventToCell()
  },

  addEventToCell() {
    const cellArray = Array.from(document.getElementsByTagName(`td`))

    cellArray.forEach(cell => {
      cell.addEventListener(
        'click',
        () => {
          mineSweeper.judgeCellState(cell)
        },
        false
      )
    })
  },
}

document.addEventListener(
  `DOMContentLoaded`,
  () => {
    mineSweeper.initialize()

    levelButton.addEventListener(
      `click`,
      () => {
        mineSweeper.setGameLevel()
      },
      false
    )

    pauseButton.addEventListener(
      `click`,
      () => {
        switch (pauseButton.value) {
          case `start`:
            countUpTimer.start()
            break
          case `pause`:
            countUpTimer.pause()
            flagModeButton.disabled = true
            break
        }
        resetButton.disabled = false
      },
      false
    )

    flagModeButton.addEventListener(
      `click`,
      () => {
        mineSweeper.toggleFlagSetMode()
      },
      false
    )

    resetButton.addEventListener(
      `click`,
      () => {
        mineSweeper.initialize()
      },
      false
    )
  },
  false
)
