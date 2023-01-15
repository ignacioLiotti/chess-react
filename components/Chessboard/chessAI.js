import { getPiece, lookForMovements } from './chessUtils/simpleUtils'
import movements from "./movements"
import { getPieceValue, simulateMove } from './chessUtils/AIUtils';

// Constants for the different difficulty levels
const DIFFICULTY_LEVELS = {
  NORMAL: 1,
  HARD: 2,
  IMPOSSIBLE: 3
};

// The AI player function, which takes in the current board state and the desired difficulty level,
// and returns a recommended move for the AI player
export default function aiPlayer(board, difficultyLevel) {

  if (board === null) return null;

  function alphaBeta(board, depth, alpha, beta, isMaximizing) {

    let bestMove = null;

    if (depth === 0 || gameOver(board)) {
        return { score: evaluatePosition(board, 'b'), move: bestMove };
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let move of generateMoves(board, 'b')) {
            let newBoard = simulateMove(board, move);
            let result = alphaBeta(newBoard, depth - 1, alpha, beta, false);
            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = move;
            }
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) {
                break;
            }
        }
        return { score: bestScore, move: bestMove };
    } else {
        let bestScore = Infinity;
        for (let move of generateMoves(board, 'w')) {
            let newBoard = simulateMove(board, move);
            let result = alphaBeta(newBoard, depth - 1, alpha, beta, true);
            if (result.score < bestScore) {
                bestScore = result.score;
                bestMove = move;
            }
            beta = Math.min(beta, bestScore);
            if (beta <= alpha) {
                break;
            }
        }
        return { score: bestScore, move: bestMove };
    }
}
  
  // Function to generate all possible moves for the current board state
  function generateMoves(board, color) {
    
    let moves = [];

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {

        let cell = board[i][j];
        
        if (cell.piece !== null && cell.piece.color === color) {

          const from = { row: i, col: j };
          const possibleMoves = lookForMovements(cell.piece, board);

          for (let move of possibleMoves) {
            moves.push({from: from, to: move});
          }

        }

      }
    }
    return moves;
}

  
  
  // Function to evaluate the current position on the board
  function evaluatePosition(board, color) {
    let score = 0;
    // Material advantage
    score += getMaterialScore(board, color);
    // Mobility
    score += getMobilityScore(board, color);
    // King safety
    score += getKingSafetyScore(board, color);
    // Pawn structure
    score += getPawnStructureScore(board, color);
    // Attacking opponent's pieces
    score += getAttackScore(board, color);
    // Control of the center
    score += getCenterControlScore(board, color);
    // King attack
    score += getKingAttackScore(board, color);

    return score;
  }

  function getMaterialScore(board) {
    let score = 0;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].piece) {
          score += getPieceValue(board[i][j].piece);
        }
      }
    }
    return score;
  }

  function getMobilityScore(piece, board) {
    let mobilityScore = 0;
    const possibleMoves = lookForMovements(piece, board);
    // for each possible move, increment the mobility score
    possibleMoves.forEach(move => {
        mobilityScore++;
    });
    return mobilityScore;
  }

  function getKingSafetyScore(board, color) {
    let score = 0;
    let king;
    // find the king on the board
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].piece && board[i][j].piece.type === "k" && board[i][j].piece.color === color) {
          king = board[i][j].piece;
          break;
        }
      }
    }

    // check if the king is in check
    if (lookForCheck(king, board)) {
        score -= 100;
    }

    // check if the king is in checkmate
    if (lookForCheckmate(king, board)) {
        score -= 1000;
    }

    // check if the king is in a safe position
    let safeSquares = 0;
    for (let move of lookForMovements(king, board)) {
        if (!move.attack) {
            safeSquares++;
        }
    }
    score += safeSquares * 10;

    // check if the king is surrounded by friendly pieces
    let friendlySurrounding = 0;
    for (let move of lookForMovements(king, board)) {
        if (move.piece && move.piece.color === color) {
            friendlySurrounding++;
        }
    }
    score += friendlySurrounding * 5;

    return score;
  }
  
  // Function to determine if the game is over
  function gameOver(board) {
    // ...
  }
  
  // Set the maximum search depth based on the desired difficulty level
  let searchDepth;
  switch (difficultyLevel) {
    case DIFFICULTY_LEVELS.NORMAL:
      searchDepth = 3;
      break;
    case DIFFICULTY_LEVELS.HARD:
      searchDepth = 1;
      break;
    case DIFFICULTY_LEVELS.IMPOSSIBLE:
      searchDepth = 9;
      break;
  }
  
  // Run the minimax algorithm to find the best move
    let bestMove = alphaBeta(board, searchDepth, true, -Infinity, Infinity, 'b');
    console.log(bestMove);

  return bestMove.move;
}