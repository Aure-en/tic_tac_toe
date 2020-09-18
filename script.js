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

  const play = (gameBoard, row, column) => {
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
  let latestPlay;

  const _changePlayer = () => {
    currentPlayer = currentPlayer == player1 ? player2 : player1;
  }

  const checkVictory = (board, player, cell) => {
  }

  const checkTie = (board) => {
    if (board.isFull()) return true;
    return false;
  }

  const _win = () => {
    currentPlayer.win();
    displayController.win(currentPlayer);
  }

  const _tie = () => {
    displayController.tie();
  }

  const gameRound = (event) => {
    console.log(`${event.target.dataset.cell.split('-')[1]}-${event.target.dataset.cell.split('-')[2]}`);
    currentPlayer.play(gameBoard, event.target.dataset.cell.split('-')[1], event.target.dataset.cell.split('-')[2]);
    document.querySelector(`[data-cell$="${event.target.dataset.cell.split('-')[1]}-${event.target.dataset.cell.split('-')[2]}"`).innerHTML = currentPlayer.mark;
    _changePlayer(player1, player2);
  }

  const gameInit = () => {
    
    //Render the empty board and players
      displayController.board(gameBoard);
      displayController.player(player1, 1);
      displayController.player(player2, 2);

    document.querySelector(".board").addEventListener("click", gameRound);

  }
    
  return {
    checkVictory,
    checkTie,
    gameRound,
    gameInit
  };

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