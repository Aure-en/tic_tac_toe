"use strict"

const gameBoard = ((size) => {

  const _createBoard = (size) => {
    const board = [];
    for (let i = 0 ; i < size*size ; i++) {
      board.push('');
    }
    return board;
  }

  const board = _createBoard(size);

  const isEmpty = (cell) => board[cell] == "";

  const isFull = () => {
    for (let cell of board) {
      if (cell == "") return false;
    }
    return true;
  }

  const reset = () => {
    for (let cell of board) {
      cell = "";
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

  const play = (gameBoard, cell) => {
    if (gameBoard.isEmpty(cell)) {
      gameBoard.board[cell] = mark;
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

  const board = (board) => {
    
    let boardElem = document.createElement("div");
    boardElem.classList.add("board");

    for (let i = 0 ; i < board.length ; i++) {
      boardElem.innerHTML += `<div class="board__cell" data-cell="cell${i}"></div>`;
    }
    document.querySelector("main").append(boardElem);
  }

  const player = (player) => {
    document.querySelector(".player__name").innerHTML = player.name;
    document.querySelector(".player__mark").innerHTML = player.mark;
    document.querySelector(".player__score").innerHTML = player.score;
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

  const _changePlayer = () => {
    currentPlayer = currentPlayer == player1 ? player2 : player1;
  }

  const checkVictory = (board, player) => {

    const _checkRow = () => {
      for (let i = 0 ; i < board.length ; i += Math.sqrt(board.length)) {
        for (let j = 0 ; j < Math.sqrt(board.length) ; j++) {
          if (board[i + j] != player.mark) return false;
        }
        return true;
      }
    }

    const _checkColumn = () => {
      for (let i = 0 ; i < Math.sqrt(board.length) ; i++) {
        for (let j = 0 ; j < board.length ; j += Math.sqrt(board.length)) {
          if (board[i + j] != player.mark) return false;
        }
        return true;
      }
    }

    const _checkDiagonal1 = () => {
      for (let i = 0 ; i < board.length ; i += Math.sqrt(board.length) + 1) {
        if (board[i] != player.mark) return false;
      }
      return true;
    }

    const _checkDiagonal2 = () => {
      for (let i = Math.sqrt(board.length) - 1 ; i < board.length ; i += Math.sqrt(board.length) - 1) {
        if (board[i] != player.mark) return false;
      }
      return true;
    }

    const result = _checkRow() || _checkColumn() || _checkDiagonal1() || _checkDiagonal2();

    return { result };

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

  const gameRound = () => {
    currentPlayer.play();
    _changePlayer(player1, player2);
  }

  const gameInit = () => {
    
    //Render the empty board and players
      displayController.board(gameBoard.board);
      displayController.player(player1);
      displayController.player(player2);
    
    //Start the game and continues it until there is a win / tie.
    while (!checkVictory(gameBoard.board, currentPlayer) && !checkTie(gameBoard.board)) {
      gameRound();
    }

    //When there is a win / tie, the game ends.
    if (checkVictory(gameBoard.board, currentPlayer)) {
      _win();
    } else {
      _tie();
    }
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

displayController.board(gameBoard.board);