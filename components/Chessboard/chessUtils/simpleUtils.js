export function getPosition(point,board){
  return board[point?.y][point?.x].position
}

export function getPiece(point,board){
  return board[point?.y][point?.x].piece
}

export function clearPieceFromCells(piece, cells) {

  const next = [...cells]

  next[piece?.y][piece?.x].piece = null 

  return next 
}

export function clearCell(point, cells) {
  const next = [...cells]

  next[point?.y][point?.x].piece = null
  
  return next 
}

export function setPieceToCells(piece, cells) {
  const next = [...cells]
  
  next[piece?.y][piece?.x].piece = piece
  return next
}