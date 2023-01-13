import { lookForMovements } from './chessUtils/simpleUtils'

// The AI player function, which takes in the current board state and the desired number of iterations,
// and returns a recommended move for the AI player
export default function aiPlayer(board, iterations) {
  if (board === null) return null;

  let root = new Node(null, board);

  for (let i = 0; i < iterations; i++) {
    let node = root;

    // Select
    while (!node.isLeaf()) {
      node = node.select();
    }

    // Expand
    if (!node.isTerminal()) {
      node = node.expand();
    }

    // Simulate
    let result = simulate(node.board);

    // Backpropagate
    while (node !== null) {
      node.update(result);
      node = node.parent;
    }
  }

  // Return the best move
  return root.bestChild();
}

class Node {
  constructor(parent, board) {
    this.parent = parent;
    this.board = structuredClone(board);
    this.children = [];
    this.visits = 0;
    this.wins = 0;
  }

  isLeaf() {
    return this.children.length === 0;
  }

  isTerminal() {
    return gameOver(this.board);
  }

  select() {
    let bestChild = null;
    let bestUCB = -Infinity;
    for (let child of this.children) {
      let ucb = child.wins / child.visits + Math.sqrt(2 * Math.log(this.visits) / child.visits);
      if (ucb > bestUCB) {
        bestChild = child;
        bestUCB = ucb;
      }
    }
    return bestChild;
  }

  expand() {
    let moves = generateMoves(this.board);
    for (let move of moves) {
      let newBoard = applyMove(this.board, move);
      let child = new Node(this, newBoard);
      this.children.push(child);
    }
    return this.children[Math.floor(Math.random() * this.children.length)];
  }

  update(result) {
    this.visits++;
    this.wins += result;
  }

  bestChild() {
    let bestChild = null;
    let bestWinRate = -Infinity;
    for (let child of this.children) {
      let winRate = child.wins / child.visits;
      if (winRate > bestWinRate) {
        bestChild = child;
        bestWinRate = winRate;
      }
    }
    return bestChild.move;
  }
}

function gameOver(board) {
  let whiteKing = null;
  let blackKing = null;
  
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      let piece = board[i][j].piece;
      if (piece !== null) {
        if (piece.type === "king" && piece.color === "w") {
          whiteKing = piece;
        } else if (piece.type === "king" && piece.color === "b") {
          blackKing = piece;
        }
      }
    }
  }
  
  if (whiteKing === null || blackKing === null) {
    return true;
  }
  
  return false;
}

function evaluatePosition(board) {
  let score = 0;

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      let piece = board[i][j].piece;
      if (piece !== null) {
        if (piece.color === "w") {
          score += piece.value;
        } else {
          score -= piece.value;
        }
      }
    }
  }

  return score;
}

function generateMoves(board) {
  let moves = [];

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      let cell = board[i][j];
      const from = { row: i, col: j };

      if (cell.piece === null || cell.piece.color === 'w') {
        continue;
      }
    
      for (let move of lookForMovements(cell.piece, board)) {
        moves.push({from: from, to: move});
      }
    }
  }

  return moves;
  }
  
  function applyMove(board, move) {
  let newBoard = structuredClone(board);
  
  let piece = newBoard[move.from.row][move.from.col].piece;
  newBoard[move.from.row][move.from.col].piece = null;
  newBoard[move.to.y][move.to.x].piece = piece;
  
  return newBoard;
  }
  
  function simulate(board) {
  let currentBoard = structuredClone(board);
  while (!gameOver(currentBoard)) {
  let moves = generateMoves(currentBoard);
  let move = moves[Math.floor(Math.random() * moves.length)];
  currentBoard = applyMove(currentBoard, move);
  }
  return evaluatePosition(currentBoard);
  }