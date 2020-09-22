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
  - Modify the displayed board when a player plays.
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
    for (let cell in board) {
      board[cell].classList.remove("mark--x", "mark--o");
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
  - End the game when a result is reached and start a new game.
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
      boardElem[cell].addEventListener("click", (event) => gameRound(event, board, boardElem));
    }

    return { board, boardElem };

  }

  let board = boardInit(3);

  const gameRound = (event, board, boardElem) => {

    //If the game ended, the board is reset before the next play.
    if (gameChecks.checkVictory(board.board, player1) || gameChecks.checkVictory(board.board, player2) || gameChecks.checkTie(board)) {
      gamePlay.reset(gamePlay.board);
    }

    //The player chooses a celL.
    let latestPlay = { 
      row : event.target.dataset.cell.split('-')[1],
      column : event.target.dataset.cell.split('-')[2]
    };

    //If the cell chosen is already occupied, nothing happens until the player chooses an empty cell.
    if (board.board[latestPlay.row][latestPlay.column] != "") return false;

    //Add the player mark on the board array and displayed board.
    gamePlay.currentPlayer.play(board.board, latestPlay.row, latestPlay.column);
    displayController.play(boardElem, latestPlay.row, latestPlay.column, gamePlay.currentPlayer);

    //Checks for a win / tie : if there is one, the game ends.
    if (gameChecks.checkVictory(board.board, currentPlayer)) {
      _win();
      _end();
    }

    else if (gameChecks.checkTie(board)) {
      _tie();
      _end();
    }

    //It is now the other player's turn.
    _changePlayer(player1, player2);

    if (gamePlay.currentPlayer == player2 && settings.mode == "computer") {

      if (gameChecks.checkVictory(board.board, player1) || gameChecks.checkVictory(board.board, player2) || gameChecks.checkTie(board)) {
        setTimeout( () => boardElem[`cell-${Math.floor(Math.random() * gamePlay.board.board.board.length)}-${Math.floor(Math.random() * gamePlay.board.board.board.length)}`].dispatchEvent(new Event("click")), 300);
        return false;
      }

      if (settings.difficulty == "normal") {
        let randomMove = computer.randomMove(board.board);
        setTimeout( () => boardElem[`cell-${randomMove.row}-${randomMove.column}`].dispatchEvent(new Event("click")), 300);
      } else {
        let bestMove = computer.bestMove(board.board);
        setTimeout( () => boardElem[`cell-${bestMove.row}-${bestMove.column}`].dispatchEvent(new Event("click")), 300);
      }
    }
  }

  const _changePlayer = () => {
    gamePlay.currentPlayer = gamePlay.currentPlayer == player1 ? player2 : player1;
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
    board.board.reset();
    displayController.reset(board.boardElem);
  }
    
  return {
    board,
    player1,
    player2,
    currentPlayer,
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

/*settings Module:
  - Make the buttons work
  - Make the settings menu work
*/

const settings = (() => {

  let mode = "player";
  let difficulty = "normal";

  const _changeMode = function() {
    settings.mode = settings.mode == "computer" ? "player" : "computer" ;

    if (gamePlay.currentPlayer == gamePlay.player2 && settings.mode == "computer") {

      if (gameChecks.checkVictory(gamePlay.board.board, gamePlay.player1) || gameChecks.checkVictory(gamePlay.board.board, gamePlay.player2) || gameChecks.checkTie(gamePlay.board)) {
        setTimeout( () => gamePlay.board.boardElem[`cell-${Math.floor(Math.random() * gamePlay.board.board.board.length)}-${Math.floor(Math.random() * gamePlay.board.board.board.length)}`].dispatchEvent(new Event("click")), 300);
        return false;
      }

      if (settings.difficulty == "normal") {
        let randomMove = computer.randomMove(gamePlay.board.board);
        setTimeout( () => gamePlay.board.boardElem[`cell-${randomMove.row}-${randomMove.column}`].dispatchEvent(new Event("click")), 300);
      } else {
        let bestMove = computer.bestMove(gamePlay.board.board);
        setTimeout( () => gamePlay.board.boardElem[`cell-${bestMove.row}-${bestMove.column}`].dispatchEvent(new Event("click")), 300);
      }
    }
  }

  const openSettingsBtn = () => {
    document.querySelector('[data-toggle="settings"]').addEventListener("click", () => {
      document.querySelector(".settings").classList.toggle("hidden");
    })
  }

  const closeSettingsBtn = () => {
    document.querySelector(".close").addEventListener("click", () => {
      document.querySelector(".settings").classList.add("hidden");
    })
  }

  const applySettingsBtn = () => {
    document.querySelector(".settings__apply").addEventListener("click", _applySettings);
  }

  const _applySettings = () => {
    _changeName(1);
    _changeName(2);
    _changeSize();
    _changeDifficulty();
  }

  const _changeName = (num) => {
    const newName = document.querySelector(`#player${num}_name`);

    if (newName.value != "") {
      gamePlay[`player${num}`].name = newName.value;
      displayController.setName(displayController[`player${num}`], newName.value);
    }
  }

  const _changeSize = () => {
    const newSize = document.querySelector("#board_size");

    if (newSize.value != gamePlay.board.board.board.length) {
      gamePlay.board = gamePlay.boardInit(+newSize.value);
    }

    //Minimax takes too long when the board is bigger than 3x3, so it is disabled.
    if (settings.difficulty == "hard") {
      settings.difficulty = "normal";
    }

  }

  const _changeDifficulty = () => {
    const newDifficulty = document.querySelector("#difficulty");

    if (settings.difficulty != newDifficulty.value) {
      settings.difficulty = newDifficulty.value;
    }

    //Minimax takes too long when the board is bigger than 3x3, so it is disabled.
    if (gamePlay.board.board.board.length > 3) {
      settings.difficulty = "normal";
    }

  }

  const _changePlayer = () => {
    _changeImage();
    _changeMode();
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
    document.querySelector(".reset").addEventListener("click", () => gamePlay.reset(gamePlay.board));
  }

  return {
    mode,
    difficulty,
    resetBtn,
    changePlayerBtn,
    openSettingsBtn,
    closeSettingsBtn,
    applySettingsBtn,
    _changeDifficulty
  }

})();

settings.resetBtn();
settings.changePlayerBtn();
settings.openSettingsBtn();
settings.closeSettingsBtn();
settings.applySettingsBtn();