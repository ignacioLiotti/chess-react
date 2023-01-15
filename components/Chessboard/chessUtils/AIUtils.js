import { lookForMovements } from "./simpleUtils";

export function getPieceValue(piece) {
  if (!piece) {
    return 0;
  }

  switch (piece.type) {
    case "p":
      return 1;
    case "n":
      return 3;
    case "b":
      return 3;
    case "r":
      return 5;
    case "q":
      return 9;
    case "k":
      return 0;
    default:
      return 0;
  }
}

export function simulateMove(board, move) {

  let newBoard = structuredClone(board);

  let piece = newBoard[move.from.row][move.from.col].piece;
  newBoard[move.from.row][move.from.col].piece = null;
  newBoard[move.to.y][move.to.x].piece = piece;

  return newBoard;

}

export function lookForCheck(king, board) {
  let attackedSquares = getAttackedSquares(king, board);
  let check = false;
  for (let square of attackedSquares) {
    if (square.attacker.color !== king.color) {
      check = true;
      break;
    }
  }
  return check;
}

export function getAttackedSquares(piece, board) {
  const attackedSquares = []
  for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
          const square = board[i][j]
          if (square.piece && square.piece.color !== piece.color) {
              const opponentPiece = square.piece
              const opponentPieceMoves = lookForMovements(opponentPiece, board)
              opponentPieceMoves.forEach(move => {
                  if (move.to.x === piece.x && move.to.y === piece.y) {
                      attackedSquares.push(square)
                  }
              })
          }
      }
  }
  return attackedSquares
}

export function generateMoves(board, color) {
  const moves = []
  for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
          const square = board[i][j]
          if (square.piece && square.piece.color === color) {
              const pieceMoves = lookForMovements(square.piece, board)
              pieceMoves.forEach(move => {
                  moves.push({ from: { x: square.piece.x, y: square.piece.y }, to: move.to })
              })
          }
      }
  }
  return moves
}

export function lookForCheckmate(king, board) {
  let legalMoves = generateMoves(board, king.color);
  let checkmate = true;
  for (let move of legalMoves) {
    let newBoard = simulateMove(board, move);
    if (!lookForCheck(king, newBoard)) {
      checkmate = false;
      break;
    }
  }
  return checkmate;
}