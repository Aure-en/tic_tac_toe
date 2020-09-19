"use strict"

const gameBoard = ((size) => {

  const _createBoard = (size) => {
    const board = [];

    let subBoard = [];
    for (let i = 0 ; i < size ; i++) {
      subBoard.push("");
    }

    for (let i = 0 ; i < size ; i++) {
      board.push(subBoard);
    }

    return board;
  }

  const board = _createBoard(size);

  const isEmpty = (row, column) => board[row][column] == "";

  const isFull = () => {
    for (let cell of board.flat()) {
      if (cell == "") return false;
    }
    return true;
  }

  const reset = () => {
    for (let subBoard of board) {
      for (let cell of subBoard) {
        cell = "";
      }
    }
  }

  return {
    size,
    board,
    isEmpty,
    isFull,
    reset
  };

})(3);

const player = (name, mark) => {
  let winCount = 0;

  const play = (row, column) => {
    if (gameBoard.isEmpty(row, column)) {
      gameBoard.board[row][column] = mark;
    }
  }

  const win = () => ++winCount;

  return {
    name,
    mark,
    winCount,
    play,
    win,
  };
}

const displayController = (() => {

  const board = (gameBoard) => {
    
    let boardElem = document.createElement("div");
    boardElem.classList.add("board");
    let boardElemHtml = "";

    for (let row = 0 ; row < gameBoard.size ; row++) {
      boardElemHtml += `<div class="board__row" data-row="row-${row}">`;

      for (let column = 0 ; column < gameBoard.size ; column++) {
        boardElemHtml += `<div class="board__cell" data-cell="cell-${row}-${column}"></div>`;
      }

      boardElemHtml += `</div>`;

    }

    boardElem.innerHTML = boardElemHtml;
    document.querySelector("main").append(boardElem);

  }

  const player = (player, number) => {
    document.querySelector(`.player${number} .player__name`).innerHTML = player.name;
    document.querySelector(`.player${number} .player__mark`).innerHTML = player.mark;
    document.querySelector(`.player${number} .player__score`).innerHTML = player.winCount;
  }

  const _resultElem = document.querySelector(".result");

  const win = (player) => {
    _resultElem.innerHTML = `${player} won the game.`
  }

  const tie = () => {
    _resultElem.innerHTML = `It's a tie!`
  }

  return {
    player,
    board,
    win,
    tie
  }

})();

const gamePlay = (() => {

  const player1 = player("Player1", "x");
  const player2 = player("Player2", "o");
  let currentPlayer = player1;
  let latestPlay = {};

  const _changePlayer = () => {
    currentPlayer = currentPlayer == player1 ? player2 : player1;
  }

  const gameRound = (event) => {

    latestPlay = { 
      row : event.target.dataset.cell.split('-')[1],
      column : event.target.dataset.cell.split('-')[2]
    };

    currentPlayer.play(latestPlay.row, latestPlay.column);
    console.log(gameBoard.board);
    document.querySelector(`[data-cell$="${latestPlay.row}-${latestPlay.column}"`).innerHTML = currentPlayer.mark;
    console.log(currentPlayer);
    console.log(gameChecks._checkRow(gameBoard.board, latestPlay.row, currentPlayer));
    _changePlayer(player1, player2);
  }

  const gameInit = () => {
    
    //Render the empty board and players
      displayController.board(gameBoard);
      displayController.player(player1, 1);
      displayController.player(player2, 2);

    //Allows the players to click on the board to play the game.  
    document.querySelector(".board").addEventListener("click", gameRound);

  }
    
  return {
    gameRound,
    gameInit
  };

})();

const gameChecks = (() => {

  const _checkRow = (board, row, player) => {
    for (let column = 0 ; column < Math.sqrt(board.length) ; column++) {
      if (board[row][column] != player.mark) return false;
    }
    return true;
  }

  const _checkColumn = (board, column, player) => {
    for (let row = 0 ; row < Math.sqrt(board.length) ; row++) {
      if (board[row][column] != player.mark) return false;
    }
    return true;
  }

  const _checkDiagonal = (board, player) => {
    for (let index = 0 ; index < Math.sqrt(board.length) ; index++) {
      if (board[index][index] != player.mark) return false;
    }
    return true;
  }

  const _checkAntiDiagonal = (board, player) => {
    for (let index = 0 ; index < Math.sqrt(board.length) ; index++) {
        if (board[index][Math.sqrt(board.length) - 1 - index] != player.mark) return false;
      }
    return true;
  }

  const checkTie = (board) => {
    if (board.isFull()) return true;
    return false;
  }

  const checkVictory = (board, player, row, column) => {

    if (row == column && row == Math.sqrt(board.length) - 1 - column) {
      return _checkDiagonal(board, player) || _checkAntiDiagonal(board, player) || _checkRow(board, row, player) || _checkColumn(board, column, player);
    }

    else if (row == column) {
      return _checkDiagonal(board, player) || _checkRow(board, row, player) || _checkColumn(board, column, player);
    }

    else if (row == Math.sqrt(board.length) - 1 - column) {
      return _checkAntiDiagonal(board, player) || _checkRow(board, row, player) || _checkColumn(board, column, player);
    }

    else {
      return _checkRow(board, row, player) || _checkColumn(board, column, player);
    }
  }

  const _win = () => {
    currentPlayer.win();
    displayController.win(currentPlayer);
  }

  const _tie = () => {
    displayController.tie();
  }

  return {
    checkTie,
    checkVictory,
    _checkRow,
    _checkColumn,
    _checkDiagonal,
    _checkAntiDiagonal
  }

})();

const gameStats = (() => {
  const played = 0;
  const tied = 0;

  return {
    player,
    tied
  }
})();

gamePlay.gameInit();