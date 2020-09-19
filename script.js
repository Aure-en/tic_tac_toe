"use strict"

/*gameBoard Module:
  - Create the board
  - Check its state: is it full? Is a cell empty?
  - Reset the board
*/

const gameBoard = ((size) => {

  const _createBoard = (size) => {
    const board = [];

    for (let i = 0 ; i < size ; i++) {
      board.push(Array(size).fill(""));
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
      subBoard.fill("");
    }
  }

  return {
    board,
    isEmpty,
    isFull,
    reset
  };

})(3);

/*player Factory:
  - Create the players: give them a name, mark, win count and ability to play.
*/

const player = (name, mark) => {

  let winCount = 0;

  const play = (row, column) => {
      gameBoard.board[row][column] = mark;
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

/*displayController Module:
  - Display the board, players, results on the DOM.
  - Modify the DOM board when a player plays.
*/

const displayController = (() => {

  const board = (board) => {
    
    let boardElem = document.createElement("div");
    boardElem.classList.add("board");
    let boardElemHtml = "";

    for (let row = 0 ; row < board.length ; row++) {
      boardElemHtml += `<div class="board__row" data-row="row-${row}">`;

      for (let column = 0 ; column < board.length ; column++) {
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

  const play = (player, row, column) => {
    document.querySelector(`[data-cell$="${row}-${column}"`).innerHTML = player.mark;
  }

  const _resultElem = document.querySelector(".result");

  const win = (currentPlayer) => {
    _resultElem.innerHTML = `${currentPlayer.name} won the game.
    Click anywhere to start a new game.`
  }

  const tie = () => {
    _resultElem.innerHTML = `It's a tie!
    Click anywhere to start a new game.`
  }

  const reset = () => {
    document.querySelectorAll(".board__cell").forEach (cell => cell.innerHTML = "");
  }

  return {
    player,
    board,
    play,
    win,
    tie,
    reset
  }

})();

/*gamePlay Module (handles the game flow):
  - Initialize the game (board, players)
  - Start new rounds until a result is reached.
  - End the game when a result is reached.
*/

const gamePlay = (() => {

  const player1 = player("Player1", "x");
  const player2 = player("Player2", "o");
  let currentPlayer = player1;
  let latestPlay = {};

  const gameInit = () => {
    
    //Render the empty board and players
      displayController.board(gameBoard.board);
      displayController.player(player1, 1);
      displayController.player(player2, 2);

    const cells = document.querySelectorAll(".board__cell");
    cells.forEach( cell => cell.addEventListener("click", gameRound));
  }

  const gameRound = (event) => {

    latestPlay = { 
      row : event.target.dataset.cell.split('-')[1],
      column : event.target.dataset.cell.split('-')[2]
    };

    //If the cell chosen is already occupied, nothing is done until the player chooses an empty cell.
    if (gameBoard.board[latestPlay.row][latestPlay.column] != "") return false;

    //Add the player mark on the board array and displayed board.
    currentPlayer.play(latestPlay.row, latestPlay.column);
    displayController.play(currentPlayer, latestPlay.row, latestPlay.column);

    //Checks for a win / tie : if there is one, the game ends.
    if (gameChecks.checkVictory(gameBoard.board, currentPlayer, latestPlay.row, latestPlay.column)) {
      _win();
      _reset();
    }

    if (gameChecks.checkTie(gameBoard)) {
      _tie();
      _reset();
    }

    _changePlayer(player1, player2);

  }

  const _changePlayer = () => {
    currentPlayer = currentPlayer == player1 ? player2 : player1;
  }

  const _win = () => {
    currentPlayer.win();
    displayController.win(currentPlayer);
  }

  const _tie = () => {
    displayController.tie(currentPlayer);
  }

  const _reset = () => {
    gameBoard.reset();
    displayController.reset();
  }
    
  return {
    player1,
    player2,
    gameRound,
    gameInit
  };

})();

/*gameChecks Module:
  - Check if a player won
  - Check if there is a tie.
*/

const gameChecks = (() => {

  const _checkRow = (board, row, player) => {
    for (let column = 0 ; column < board.length ; column++) {
      if (board[row][column] != player.mark) return false;
    }
    return true;
  }

  const _checkColumn = (board, column, player) => {
    for (let row = 0 ; row < board.length ; row++) {
      if (board[row][column] != player.mark) return false;
    }
    return true;
  }

  const _checkDiagonal = (board, player) => {
    for (let index = 0 ; index < board.length ; index++) {
      if (board[index][index] != player.mark) return false;
    }
    return true;
  }

  const _checkAntiDiagonal = (board, player) => {
    for (let index = 0 ; index < board.length ; index++) {
        if (board[index][board.length - 1 - index] != player.mark) return false;
      }
    return true;
  }

  const checkTie = (board) => {
    if (board.isFull()) return true;
    return false;
  }

  const checkVictory = (board, player, row, column) => {

    if (row == column && row == board.length - 1 - column) {
      return _checkDiagonal(board, player) || _checkAntiDiagonal(board, player) || _checkRow(board, row, player) || _checkColumn(board, column, player);
    }

    else if (row == column) {
      return _checkDiagonal(board, player) || _checkRow(board, row, player) || _checkColumn(board, column, player);
    }

    else if (row == board.length - 1 - column) {
      return _checkAntiDiagonal(board, player) || _checkRow(board, row, player) || _checkColumn(board, column, player);
    }

    else {
      return _checkRow(board, row, player) || _checkColumn(board, column, player);
    }
  }

  return {
    checkTie,
    checkVictory
  }

})();

/*gameStats Module:
  - Counts the number of game played / ties
*/

const gameStats = (() => {
  const played = 0;
  const tied = 0;

  return {
    player,
    tied
  }
})();

gamePlay.gameInit();