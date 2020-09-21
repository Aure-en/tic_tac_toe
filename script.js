"use strict"

/*gameBoard Factory:
  - Create the board array
  - Check its state: is it full? Is a cell empty?
  - Reset the board array
*/

const gameBoard = (size) => {

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

};

/*player Factory:
  - Create the players: give them a name, mark, win count and ability to play.
*/

const player = (name, mark) => {

  let score = 0;
  let played = 0;

  const play = (board, row, column) => {
      board[row][column] = mark;
  }

  const win = function() { ++this.score };
  const incPlay = function () { ++this.played };

  const setName = function(name) {
    this.name = name;
  }

  return {
    name,
    mark,
    score,
    play,
    win,
    played,
    incPlay,
    setName
  };
}

/*displayController Module:
  - Setups the buttons
  - Display the board, players, results.
  - Modify the DOM board when a player plays.
*/

const displayController = (() => {

  const setBoard = (board) => {
    
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

  const getBoard = (board) => {

    let boardCells = {};

    for (let row = 0 ; row < board.length ; row++) {
      for (let column = 0 ; column < board.length ; column++) {
        boardCells[`cell-${row}-${column}`] = document.querySelector(`[data-cell$="${row}-${column}"`);
      }
    }

    return boardCells;

  }

  const _getPlayer = (num) => { 
    return {
      name: document.querySelector(`.player${num} .player__name`),
      played: document.querySelector(`.player${num} .player__played`),
      win: document.querySelector(`.player${num} .player__won`),
      loss: document.querySelector(`.player${num} .player__lost`)
    }
  }
  
  const player1 = _getPlayer(1);
  const player2 = _getPlayer(2);

  const setName = (player, name) => {
    player.name.innerHTML = name;
  }

  const setStats = (player, played, win, loss) => {
    player.played.innerHTML = played;
    player.win.innerHTML = win;
    player.loss.innerHTML = loss;
  }

  const play = (board, row, column, player) => {
    board[`cell-${row}-${column}`].classList.add(`mark--${player.mark}`, "mark");
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

  const reset = (board) => {
    for (let cell of board) {
      cell.innerHTML = "";
      cell.classList.remove("mark--x", "mark--o");
    }
  }

  return {
    player1,
    player2,
    setName,
    setStats,
    setBoard,
    getBoard,
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
  - Restart the game if wanted.
*/

const gamePlay = (() => {

  const player1 = player("Player1", "x");
  const player2 = player("Player2", "o");
  let currentPlayer = player1;

  const boardInit = (size) => {

    let board = gameBoard(size);
    displayController.setBoard(board.board);
    let boardElem = displayController.getBoard(board.board);

    for (let cell in boardElem) {
      boardElem[cell].addEventListener("click", () => gameRound(event, board, boardElem));
    }
  }

  const gameRound = (event, board, boardElem) => {

    let latestPlay = { 
      row : event.target.dataset.cell.split('-')[1],
      column : event.target.dataset.cell.split('-')[2]
    };

    //If the cell chosen is already occupied, nothing is done until the player chooses an empty cell.
    if (board.board[latestPlay.row][latestPlay.column] != "") return false;

    //Add the player mark on the board array and displayed board.
    currentPlayer.play(board.board, latestPlay.row, latestPlay.column);
    displayController.play(boardElem, latestPlay.row, latestPlay.column, currentPlayer);

    //Checks for a win / tie : if there is one, the game ends.
    if (gameChecks.checkVictory(board.board, currentPlayer)) {
      _win();
      _end();
    }

    if (gameChecks.checkTie(board)) {
      _tie();
      _end();
    }

    //It is now the other player's turn.
    _changePlayer(player1, player2);

    if (currentPlayer == player2 && gameSettings.mode == "computer") {

      if (gameSettings.difficulty == "normal") {
        let randomMove = computer.randomMove(board.board);
        setTimeout( () => boardElem[`cell-${randomMove.row}-${randomMove.column}`].dispatchEvent(new Event("click")), 200);
      } else {
        let bestMove = computer.bestMove(board.board);
        setTimeout( () => boardElem[`cell-${bestMove.row}-${bestMove.column}`].dispatchEvent(new Event("click")), 200);
      }
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
    displayController.tie();
  }

  const _end = () => {
    player1.incPlay();
    player2.incPlay();
    displayController.setStats(displayController.player1, player1.played, player1.score, player1.played - player1.score);
    displayController.setStats(displayController.player2, player2.played, player2.score, player2.played - player1.score);
  }

  const reset = (board) => {
    board.reset();
    displayController.reset(board);
  }
    
  return {
    player1,
    player2,
    gameRound,
    boardInit,
    reset
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

/*gameSettings:
  - Change the number of players (1 or 2?)
  - Change the computer difficulty (easy or hard)
*/

const gameSettings = (() => {

  const mode = "computer";
  const difficulty = "normal";

  const changeMode = function() {
    this.mode = this.mode == "computer" ? "player" : "computer" ;
  }

  const changeDifficulty = function() {
    this.difficulty = this.difficulty == "normal" ? "hard" : "normal" ;
  }

  return {
    mode,
    changeMode,
    difficulty,
    changeDifficulty
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

    return _minimax(board, gamePlay.player2);

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

const settings = (() => {

  const _changePlayer = () => {
    _changeImage();
    gameSettings.changeMode();
  }

  const _changeImage = () => {

    let playerImage = document.querySelector(".player2 .player__image");

    if (playerImage.alt == "Character Icon") {
      playerImage.src = "sass/assets/computer.png";
      playerImage.alt = "Computer Icon";
    } else {
      playerImage.src = "sass/assets/person.png";
      playerImage.alt = "Character Icon";
    }
    
  }

  const changePlayerBtn = () => {
    document.querySelectorAll(".player__change").forEach(button => button.addEventListener("click", _changePlayer));
  }

  const resetBtn = () => {
    document.querySelector(".reset").addEventListener("click", gamePlay.reset);
  }

  return {
    resetBtn,
    changePlayerBtn
  }

})();

settings.resetBtn();
settings.changePlayerBtn();
gamePlay.boardInit(3);
