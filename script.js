"use strict"

const gameBoard = ((size) => {

  const _createBoard = (size) => {
    const board = [];
    for (let i = 0 ; i < size ; i++) {
      board.push('');
    }
    return board;
  }

  const board = _createBoard(size);

  const isEmpty = (cell) => cell == "";

  const isFull = () => {
    for (let square of board) {
      if (square == "") return false;
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

const players = (name, mark) => {
  const winCount = 0;

  const play = (board, cell) => {
    if (board.isEmpty(cell)) {
      board[cell] = mark;
    }
  }

  const win = () => ++winCount;

  return {
    name,
    mark,
    winCount,
    play,
    win,
    lose
  };

}

const displayController = (() => {

})();

const gamePlay = (() => {

  const _currentTurn = 1;
  const currentPlayer = _currentTurn % 2 + 1;

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

  return {
    currentPlayer,
    checkVictory,
    checkTie
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