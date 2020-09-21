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

  let score = 0;

  const play = (row, column) => {
      gameBoard.board[row][column] = mark;
  }

  const win = function() { ++score };

  return {
    name,
    mark,
    score,
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
    
    let boardElemHtml = "";

    for (let row = 0 ; row < board.length ; row++) {
      boardElemHtml += `<div class="board__row" data-row="row-${row}">`;

      for (let column = 0 ; column < board.length ; column++) {
        boardElemHtml += `<div class="board__cell" data-cell="cell-${row}-${column}"></div>`;
      }

      boardElemHtml += `</div>`;

    }

    document.querySelector(".board").innerHTML = boardElemHtml;

  }

  const player = (player, number) => {
    document.querySelector(`.player${number} .player__name`).innerHTML = player.name;
    document.querySelector(`.player${number} .player__mark`).innerHTML = player.mark;
    document.querySelector(`.player${number} .player__score`).innerHTML = player.score;
  }

  const play = (player, row, column) => {
    document.querySelector(`[data-cell$="${row}-${column}"`).classList.add(`mark--${player.mark}`, "mark");
    
  }

  const _resultElem = document.querySelector(".result");

  const win = (currentPlayer) => {
    _resultElem.innerHTML = `${currentPlayer.name} won the game.<br>
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
  let randomMove;
  let bestMove;

  const gameInit = () => {
    
    //Render the empty board and players
      displayController.board(gameBoard.board);

    const cells = document.querySelectorAll(".board__cell");
    cells.forEach( cell => cell.addEventListener("click", gameRound));
    document.querySelector(".reset").addEventListener("click", _reset);
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
    if (gameChecks.checkVictory(gameBoard.board, currentPlayer)) {
      _win();
    }

    if (gameChecks.checkTie(gameBoard)) {
      _tie();
    }

    _changePlayer(player1, player2);

    if (currentPlayer == player2 && gameSettings.mode == "computer") {
      // randomMove = computer.randomMove(gameBoard.board);
      // document.querySelector(`[data-cell="cell-${randomMove.row}-${randomMove.column}"`).dispatchEvent(new Event("click"));

      bestMove = computer.bestMove(gameBoard.board);
      document.querySelector(`[data-cell="cell-${bestMove.row}-${bestMove.column}"`).dispatchEvent(new Event("click"));

    }

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

  const _checkRow = (board, player) => {

    let count = 0;

    for (let row = 0 ; row < board.length ; row++) {
      for (let column = 0 ; column < board.length ; column++) {
        if (board[row][column] == player.mark) count++;
        if (count == board.length) return true;
      }
      count = 0;
    }
    return false;
  }

  const _checkColumn = (board, player) => {

    let count = 0;

    for (let column = 0 ; column < board.length ; column++) {
      for (let row = 0 ; row < board.length ; row++) {
        if (board[row][column] == player.mark) count++;
        if (count == board.length) return true;
      }
      count = 0;
    }
    return false;
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

  const checkVictory = (board, player) => {
    return _checkDiagonal(board, player) || _checkAntiDiagonal(board, player) || _checkRow(board, player) || _checkColumn(board, player);
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
    played,
    tied
  }
})();

/*gameSettings:
  - Change the number of players (1 or 2?)
  - Change the computer difficulty (easy or hard)
*/

const gameSettings = (() => {

  const mode = "computer";

  const changeMode = function(mode) {
    mode = mode == "computer" ? "player" : "computer" ;
  }

  return {
    mode,
    changeMode
  }

})();

/*computer Module :
  - Initialize the AI levels
*/

const computer = (() => {

  const _availableSpots = (board) => {
    let available = [];

    for (let i = 0 ; i < board.length ; i++) {
      for (let j = 0 ; j < board.length ; j++) {
        if (board[i][j] == "") available.push({ row: i, column: j});
      }
    }

    return available;

  }

  const randomMove = (board) => {

    let row = Math.floor(Math.random() * board.length);
    let column = Math.floor(Math.random() * board.length);

    while (board[row][column] != "") {
      row = Math.floor(Math.random() * board.length);
      column = Math.floor(Math.random() * board.length);
    }

    return { row, column };

  } 

  const bestMove = (board) => {

    return _minimax(gameBoard.board, gamePlay.player2);

  }

  const _minimax = (board, player) => {

    //The board is full or someone won : the evaluation is returned.

    if (gameChecks.checkVictory(board, gamePlay.player1)) return { score : -10 - _availableSpots(board).length };
    if (gameChecks.checkVictory(board, gamePlay.player2)) return { score : 10 + _availableSpots(board).length };
    if (_availableSpots(board).length == 0) return { score : 0 };

    //Array collecting all the possible moves and their respective score.
    let moves = [];

    for (let spot of _availableSpots(board)) {
      let move = {};
      move.row = spot.row;
      move.column = spot.column;

      board[spot.row][spot.column] = player.mark;

      if (player == gamePlay.player2) {
        let result = _minimax(board, gamePlay.player1);
        move.score = result.score;
      } else {
        let result = _minimax(board, gamePlay.player2);
        move.score = result.score;
      }

      board[spot.row][spot.column] = "";
      moves.push(move);
    }

    let bestMove;

    if (player == gamePlay.player2) {
      let maxEval = -Infinity;

      for (let i = 0 ; i < moves.length ; i++) {
        if (moves[i].score > maxEval) {
          maxEval = moves[i].score;
          bestMove = i;
        }
      }

    } else {
      let minEval = +Infinity;

      for (let i = 0 ; i < moves.length ; i++) {
        if (moves[i].score < minEval) {
          minEval = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];

  }

  return {
    randomMove,
    bestMove
  }


})();

gamePlay.gameInit();
