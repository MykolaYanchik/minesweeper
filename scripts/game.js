const levels = {
  easy: {
    name: "easy",
    rows: 8,
    columns: 8,
    mines: 10,
  },
  medium: {
    name: "medium",
    rows: 14,
    columns: 14,
    mines: 40,
  },
  hard: {
    name: "hard",
    rows: 20,
    columns: 16,
    mines: 75,
  },
};

function touchDevice() {
  return "ontouchstart" in window;
}

class Game {
  constructor(level, mode) {
    this.matrix = this.getMatrix(level);
    this.mines = this.getMine(level, this.matrix);
    this.createBoard(level, this.matrix, mode);
  }

  getMatrix(level) {
    const matrix = [];
    let id = 0;
    for (let x = 0; x < level.rows; x++) {
      matrix.push([]);
      for (let y = 0; y < level.columns; y++) {
        matrix[x].push({
          x: x,
          y: y,
          id: id++,
          number: 0,
          mine: false,
          flag: false,
          show: false,
          checkZero: false,
        });
      }
    }
    return matrix;
  }

  getFreeCell(matrix) {
    const freeCells = [];
    for (let x = 0; x < matrix.length; x++) {
      for (let y = 0; y < matrix[x].length; y++) {
        if (!matrix[x][y].mine) freeCells.push(matrix[x][y]);
      }
    }
    const index = Math.floor(Math.random() * freeCells.length);
    return freeCells[index];
  }

  getCell(matrix, x, y) {
    if (!matrix[x] || !matrix[x][y]) return;
    return matrix[x][y];
  }

  getAroundCell(matrix, x, y) {
    const aroundCell = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const cell = this.getCell(matrix, x + dx, y + dy);
        if (cell) aroundCell.push(cell);
      }
    }
    return aroundCell;
  }

  getMine(level, matrix) {
    const mines = [];
    for (let i = 0; i < level.mines; i++) {
      const cell = this.getFreeCell(matrix);
      cell.mine = true;
      mines.push(cell);
      let cells = this.getAroundCell(matrix, cell.x, cell.y);
      for (let c of cells) {
        c.number += 1;
      }
    }
    return mines;
  }

  getZeroCell(matrix, x, y) {
    const cells = this.getAroundCell(matrix, x, y);
    for (let cell of cells) {
      if (cell.show || cell.flag) continue;
      const el = document.getElementById(cell.id);
      cell.show = true;
      el.classList.add("show-cell");
      if (cell.number > 0 && !cell.mine) {
        el.textContent = cell.number;
      }
      if (cell.number == 0 && !cell.mine) {
        cell.checkZero = true;
        el.classList.add("show-cell");
      }
      this.checkZeroCell(matrix, cell);
    }
  }

  checkZeroCell(matrix, cell) {
    if (cell.checkZero === false) return;
    cell.checkZero = false;
    this.getZeroCell(matrix, cell.x, cell.y);
  }

  createBoard(level, matrix, mode) {
    const board = document.getElementById("board");
    board.classList.add(level.name);
    for (let x = 0; x < matrix.length; x++) {
      const row = document.createElement("div");
      row.classList.add("board__row");
      board.appendChild(row);
      for (let y = 0; y < matrix[x].length; y++) {
        const cell = document.createElement("div");
        cell.classList.add("board__cell");
        const btn = document.createElement("div");
        btn.classList.add("touch-button");
        const btnFlag = document.createElement("div");
        btnFlag.classList.add("touch-button-flag");
        cell.append(btn, btnFlag);
        cell.id = matrix[x][y].id;
        if (touchDevice()) {
          cell.addEventListener("click", (e) => {
            e.preventDefault();
            this.showTouchCell(matrix[x][y], matrix, btn, btnFlag);
            btn.addEventListener("click", (e) => {
              e.stopImmediatePropagation();
              cell.classList.remove("pulse");
              this.showCell(matrix[x][y], matrix);
            });
            btnFlag.addEventListener("click", (e) => {
              e.stopImmediatePropagation();
              cell.classList.remove("pulse");
              this.setFlag(matrix[x][y]);
            });
          });
        } else {
          cell.addEventListener("click", (e) => {
            e.preventDefault();
            this.showCell(matrix[x][y], matrix);
          });
          cell.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.setFlag(matrix[x][y]);
          });
        }
        row.append(cell);
      }
    }
  }

  showTouchCell(cell, matrix, btn, btnFlag) {
    const el = document.getElementById(cell.id);
    let pulseCell = false;
    for (let x = 0; x < matrix.length; x++) {
      for (let y = 0; y < matrix[x].length; y++) {
        const q = document.getElementById(matrix[x][y].id);
        if (q.classList.contains("pulse")) pulseCell = true;
      }
    }
    if (el.classList.contains("show-cell") || pulseCell) return;
    el.classList.add("pulse");
    if (cell.x <= 2 && cell.y <= 2) {
      btn.classList.add("touch-button__bottom");
      btnFlag.classList.add("touch-button-flag__bottom");
    } else if (cell.x <= 2 && cell.y >= 2) {
      btn.classList.add("touch-button__right");
      btnFlag.classList.add("touch-button-flag__right");
    } else if (cell.x >= 2 && cell.y <= 2) {
      btn.classList.add("touch-button__left");
      btnFlag.classList.add("touch-button-flag__left");
    }
  }

  showCell(cell, matrix) {
    if (cell.flag) return;
    const el = document.getElementById(cell.id);
    cell.show = true;
    el.classList.add("show-cell");
    if (cell.mine) {
      el.classList.add("cell-bomb");
      this.loseGame(this.mines);
    }
    if (cell.number > 0 && !cell.mine) {
      el.textContent = cell.number;
    }
    if (cell.number == 0 && !cell.mine) {
      el.classList.add("show-cell");
      this.getZeroCell(matrix, +cell.x, +cell.y);
    }
  }

  setFlag(cell) {
    if (cell.show) return;
    const el = document.getElementById(cell.id);
    if (cell.flag) {
      cell.flag = false;
      el.classList.remove("cell-flag");
    } else {
      cell.flag = true;
      el.classList.add("cell-flag");
      if (cell.flag && cell.mine)
        document.getElementById("flagCount").textContent--;
    }
    this.winGame();
  }

  loseGame(mines) {
    for (let i = 0; i < mines.length; i++) {
      setTimeout(() => {
        const el = document.getElementById(mines[i].id);
        el.classList.add("cell-bomb__end");
        el.classList.remove("cell-flag");
        if (i === mines.length - 1) {
          document.getElementById("loseModal").style.display = "flex";
        }
      }, i * 100);
    }
  }

  winGame() {
    if (document.getElementById("flagCount").textContent == 0) {
      document.getElementById("winModal").style.display = "flex";
    }
  }
}

function selectLevel(level) {
  document.getElementById("selectLevel").style.display = "none";
  document.getElementById("board").style.display = "flex";
  new Game(levels[level]);
  document.getElementById("flagCount").textContent = levels[level].mines;
}

function playAgain(){
  document.getElementById("board").innerHTML = "";
  document.getElementById("winModal").style.display = "none";
  document.getElementById("loseModal").style.display = "none";
  document.getElementById("selectLevel").style.display = "flex";
  document.getElementById("board").style.display = "none";
}
