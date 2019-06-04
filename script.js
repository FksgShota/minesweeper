;`use strict`
const pauseButton = document.getElementById(`pauseButton`)
const levelButton = document.getElementById(`levelButton`)
const timeCounter = document.getElementById(`timeCounter`)
const minefield = document.getElementById(`minefield`)
const resetButton = document.getElementById(`resetButton`)
const flagModeButton = document.getElementById(`flagModeButton`)
const mineCounter = document.getElementById(`mineCounter`)
const flagCounter = document.getElementById(`flagCounter`)

const countUpTimer = {
  startTime: 0,
  playTime: 0,
  elapsedTime: 0,
  gameClearTime: 0,
  gameClearTimeToString: 0,
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
    this.startTime = this.playTime = this.elapsedTime = this.gameClearTime = this.gameClearTimeToString = 0
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
    this.gameClearTime = this.elapsedTime
    this.gameClearTimeToString = this.convertFormat(this.elapsedTime)
  },
}

const mineSweeper = {
  levelConfig: [
    {
      name: `初級`,
      cell: 9,
      mine: 10,
      clearTimeRank: {
        Gold: { time: `00:00:10`, toMilliSec: 10000 },
        Silver: { time: `00:00:30`, toMilliSec: 30000 },
        Bronze: { time: `00:00:50`, toMilliSec: 50000 },
      },
    },
    {
      name: `中級`,
      cell: 16,
      mine: 40,
      clearTimeRank: {
        Gold: { time: `00:00:20`, toMilliSec: 20000 },
        Silver: { time: `00:01:00`, toMilliSec: 60000 },
        Bronze: { time: `00:01:40`, toMilliSec: 100000 },
      },
    },
    {
      name: `上級`,
      cell: 30,
      mine: 120,
      clearTimeRank: {
        Gold: { time: `00:01:00`, toMilliSec: 60000 },
        Silver: { time: `00:02:00`, toMilliSec: 120000 },
        Bronze: { time: `00:03:00`, toMilliSec: 18000 },
      },
    },
    {
      name: `マニア`,
      cell: 68,
      mine: 777,
      clearTimeRank: {
        Gold: { time: `01:00:00`, toMilliSec: 3600000 },
        Silver: { time: `02:00:00`, toMilliSec: 7200000 },
        Bronze: { time: `03:00:00`, toMilliSec: 10800000 },
      },
    },
  ],
  cellStatus: { default: `0`, opened: `1`, flagOn: `2` },
  mineStatus: { mineOff: `0`, mineOn: `1` },
  gameLevel: 0,
  isInitialize: true,
  flagSetMode: false,
  flagCount: 0,
  mineCount: 10,

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
    switch (clickCell.dataset.state) {
      case this.cellStatus.default:
        clickCell.classList.add(`flag`)
        clickCell.textContent = `▲`
        clickCell.dataset.state = this.cellStatus.flagOn
        this.flagCount++
        flagCounter.textContent = this.flagCount
        break
      case this.cellStatus.flagOn:
        clickCell.classList.remove(`flag`)
        clickCell.textContent = ``
        clickCell.dataset.state = this.cellStatus.default
        this.flagCount--
        flagCounter.textContent = this.flagCount
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

      ;[cellArray[i], cellArray[g]] = [cellArray[g], cellArray[i]]
    }

    for (let i = 0; i < this.levelConfig[this.gameLevel].mine; i++) {
      if (document.getElementById(cellArray[i].id).dataset.state === this.cellStatus.opened) {
        cellArray.splice(i, 1)
        i--
        continue
      }
      document.getElementById(cellArray[i].id).dataset.mine = this.mineStatus.mineOn
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

      if (targetCell.dataset.mine === this.mineStatus.mineOn) {
        return
      }

      for (let trNum = targetCellTr - 1; trNum <= targetCellTr + 1; trNum++) {
        for (let tdNum = targetCellTd - 1; tdNum <= targetCellTd + 1; tdNum++) {
          let adjacentCell = document.getElementById(`cell-${trNum}-${tdNum}`)
          if ((trNum === targetCellTr && tdNum === targetCellTd) || !adjacentCell) {
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
        td.dataset.state = this.cellStatus.default
        td.dataset.mine = this.mineStatus.mineOff
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
    clickCell.dataset.state = this.cellStatus.opened
    clickCell.classList.add(`mine`)
    clickCell.textContent = '●'
  },

  openEmptyCell(clickCell) {
    clickCell.dataset.state = this.cellStatus.opened
    clickCell.classList.add(`empty`)
    clickCell.textContent = document.getElementById(clickCell.id).dataset.value
  },

  openAllCells() {
    const cellArray = Array.from(document.getElementsByTagName(`td`))

    cellArray.forEach(targetCell => {
      if (targetCell.dataset.state === this.cellStatus.opened) {
        return
      }

      if (targetCell.dataset.mine === this.mineStatus.mineOn) {
        this.openMineCell(targetCell)
        return
      }

      this.openEmptyCell(targetCell)
    })
  },

  compareClearTimeRank() {
    for (let key in this.levelConfig[this.gameLevel].clearTimeRank) {
      if (this.levelConfig[this.gameLevel].clearTimeRank[key].toMilliSec > countUpTimer.gameClearTime) {
        this.levelConfig[this.gameLevel].clearTimeRank[key].time = `${
          countUpTimer.gameClearTimeToString
        }   あなたの記録`
        break
      }
    }
  },

  judgeGameClear() {
    const cellArray = Array.from(document.getElementsByTagName(`td`))

    for (targetCell of cellArray) {
      if (
        (targetCell.dataset.state === this.cellStatus.default || targetCell.dataset.state === this.cellStatus.flagOn) &&
        targetCell.dataset.mine === this.mineStatus.mineOff
      ) {
        return false
      }
    }
    return true
  },

  endGame() {
    countUpTimer.pause()
    this.openAllCells()

    const gameOverMessage = `
    ゲームオーバー
    リトライする？`

    // openAllCellsのレンダリングがconfirmより遅れることがあるため、対策として遅延処理を追加
    setTimeout(() => {
      if (confirm(gameOverMessage)) {
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
    this.isInitialize = false
    resetButton.disabled = false
    pauseButton.disabled = false
    flagModeButton.disabled = false
    levelButton.disabled = true
  },

  isMineCell(cellIdArray) {
    for (cellId of cellIdArray) {
      let adjacentCell = document.getElementById(cellId)
      if (adjacentCell.dataset.mine === this.mineStatus.mineOn) {
        return true
      }
    }
    return false
  },

  clearGame() {
    countUpTimer.setGameClearTime()
    this.openAllCells()
    this.compareClearTimeRank()

    const gameClearMessage = `
    クリア!
    ${countUpTimer.gameClearTimeToString}
    〜ランキング〜
    難易度[${this.levelConfig[this.gameLevel].name}]
    Gold [${this.levelConfig[this.gameLevel].clearTimeRank.Gold.time}]
    Silver [${this.levelConfig[this.gameLevel].clearTimeRank.Silver.time}]
    Bronze [${this.levelConfig[this.gameLevel].clearTimeRank.Bronze.time}]
    リトライする?`

    // openAllCellsのレンダリングがconfirmより遅れることがあるため、対策として遅延処理を追加
    setTimeout(() => {
      if (confirm(gameClearMessage)) {
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
          !document.getElementById(`cell-${tr}-${td}`) ||
          document.getElementById(`cell-${tr}-${td}`).dataset.state === this.cellStatus.opened
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
      if (!adjacentCell) {
        continue
      }
      this.openEmptyCell(adjacentCell)
      this.openAdjacentEmptyCell(adjacentCell)
    }
  },

  judgeCellState(clickCell) {
    if (this.isInitialize) {
      clickCell.dataset.state = this.cellStatus.opened
      clickCell.classList.add(`empty`)
      this.startGame()
      this.openAdjacentEmptyCell(clickCell)
      clickCell.textContent = document.getElementById(clickCell.id).dataset.value
      return
    }

    switch (clickCell.dataset.state) {
      case this.cellStatus.default:
        if (this.flagSetMode) {
          this.toggleFlagSet(clickCell)
          return
        }
        if (clickCell.dataset.mine === this.mineStatus.mineOn) {
          this.openMineCell(clickCell)
          this.endGame()
          return
        }
        this.openEmptyCell(clickCell)
        this.openAdjacentEmptyCell(clickCell)
        break
      case this.cellStatus.opened:
        break
      case this.cellStatus.flagOn:
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
    this.isInitialize = true
    resetButton.disabled = true
    pauseButton.disabled = true
    flagModeButton.disabled = true
    levelButton.disabled = false
    this.flagSetMode = false
    this.flagCount = 0
    flagModeButton.classList.remove(`activate`)
    flagCounter.textContent = this.flagCount
    this.mineCount = this.levelConfig[this.gameLevel].mine
    mineCounter.textContent = this.mineCount
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
