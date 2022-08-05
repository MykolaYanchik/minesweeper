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

class Game {
  constructor(level) {
    this.matrix = this.getMatrix(level);
    this.getMine(level, this.matrix);
    this.createBoard(level, this.matrix);
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
    for (let i = 0; i < level.mines; i++) {
      const cell = this.getFreeCell(matrix);
      cell.mine = true;
      let cells = this.getAroundCell(matrix, cell.x, cell.y);
      for (let c of cells) {
        c.number += 1;
      }
    }
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

  createBoard(level, matrix) {
    const board = document.getElementById("board");
    board.classList.add(level.name);
    for (let x = 0; x < matrix.length; x++) {
      const row = document.createElement("div");
      row.classList.add("board__row");
      board.appendChild(row);
      for (let y = 0; y < matrix[x].length; y++) {
        const cell = document.createElement("div");
        cell.classList.add("board__cell");
        cell.id = matrix[x][y].id;
        cell.addEventListener("click", (e) => {
          e.preventDefault();
          this.showCell(matrix[x][y], matrix);
        });
        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.setFlag(matrix[x][y]);
        });
        row.append(cell);
      }
    }
  }

  showCell(cell, matrix) {
    if (cell.flag) return;
    const el = document.getElementById(cell.id);
    cell.show = true;
    el.classList.add("show-cell");
    if (cell.mine) {
      el.classList.add("cell-bomb");
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
    }
  }
}

function selectLevel(level) {
  document.getElementById("selectLevel").style.display = "none";
  document.getElementById("board").style.display = "flex";
  new Game(levels[level]);
}
