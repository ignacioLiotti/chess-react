import { getPiece } from './simpleUtils'

export function canCastle(piece){
  let castleMovement = []

  const isKingInStartingPosition = ( piece?.type === 'k' && piece.history.length === 0 ) ? true : false

  if(isKingInStartingPosition){
    const y = piece?.color === 'w' ? 7 : 0
    if (canCastleLeft(y)){
      castleMovement.push('left')
    }
    if (canCastleRight(y)){
      castleMovement.push('right')
    }
  }
  return castleMovement
}

function canCastleLeft(y) {
  return getPiece({ x: 1, y },nextState.board) === null &&
         getPiece({ x: 2, y },nextState.board) === null &&
         getPiece({ x: 3, y },nextState.board) === null &&
         isRookInStartingPosition({ x: 0, y });
}

function canCastleRight(y) {
  return getPiece({ x: 5, y },nextState.board) === null &&
         getPiece({ x: 6, y },nextState.board) === null &&
         isRookInStartingPosition({ x: 7, y });
}

function isRookInStartingPosition(point){
  const rook = getPiece(point,nextState.board)

  if (piece?.color === 'w'){
    if(rook?.history.length === 0 && rook?.id === 'rw'){
      return true
    }
  } else if (piece?.color === 'b'){
    if(rook?.history.length === 0 && rook?.id === 'rb'){
      return true
    }
  }

  return false
}
