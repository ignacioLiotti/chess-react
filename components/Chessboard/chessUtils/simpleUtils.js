  // O(1) FUNTIONS TO GET AND SET VALUES IN THE BOARD

  import movements from "../movements"


  export function getPosition(point, board){

    if (point.x > 7 || point.y > 7 || point.x < 0 || point.y < 0) return null

    return board[point?.y][point?.x].position
  }

  export function getPiece(point, board){

    if (point.x > 7 || point.y > 7 || point.x < 0 || point.y < 0) return null

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

  // ------------------------------

  // O(n) FUNCTIONS TO GET AND SET VALUES IN THE BOARD

  export function deletePiece(piece, pieces) {
    const next = [...pieces]
    const index = next.findIndex(item => item.id === piece?.id && item.x === piece?.x && item.y === piece?.y)
    index > -1 ? next.splice(index, 1) : null
    return next
  }

  // ------------------------------

  export function movePiece(from, to, state){
    const piece = getPiece(from, state.board)
    const pieceToTake = getPiece(to, state.board)
    const nextState = {...state}

    if (piece){

      nextState.board = clearCell(to, nextState.board)
      pieceToTake ? nextState.pieces = deletePiece(pieceToTake, nextState.pieces) : null

      nextState.board = clearPieceFromCells(piece, nextState.board)

      piece.x = to.x
      piece.y = to.y

      nextState.board = setPieceToCells(piece, nextState.board)

    }
    return nextState
  }

  export function getMovement(piece, board){
    // get the movement of a piece based on its id, and if it is a pawn, check if it is the first move and if it is, add the movement of 2 steps forward and check its color
    let movement = []

    function isRookInStartingPosition(point){
      const rook = getPiece(point, board)

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

    const isKingInStartingPosition = ( piece?.type === 'k' && piece.history.length === 0 ) ? true : false

    function canCastle(){
      let castleMovement = []

      if(isKingInStartingPosition){
        const y = piece?.color === 'w' ? 7 : 0
        if (canCastleLeft(y)){
          castleMovement.push('left')
        }
        if (canCastleRight(y)){
          castleMovement.push('right')
        }
      }
      function canCastleLeft(y) {
        return getPiece({ x: 1, y }, board) === null &&
               getPiece({ x: 2, y }, board) === null &&
               getPiece({ x: 3, y }, board) === null &&
               isRookInStartingPosition({ x: 0, y });
      }
      
      function canCastleRight(y) {
        return getPiece({ x: 5, y }, board) === null &&
               getPiece({ x: 6, y }, board) === null &&
               isRookInStartingPosition({ x: 7, y });
      }

      return castleMovement
    }

    if(piece?.type === 'p' && piece?.y === 6 && piece?.color === 'w'){
      return (
        {
          movements:[
            {
              x: 0,
              y: -2,
            },
            {
              x: 0,
              y: -1,
            }
          ],
          multipleSteps: false,
        }
      )
    }
    if(piece?.type === 'p' && piece?.y === 1 && piece?.color === 'b'){
      return (
        {
          movements:[
            {
              x: 0,
              y: 2,
            },
            {
              x: 0,
              y: 1,
            }
          ],
          multipleSteps: false,
        }
      )
    }

    if(piece?.type === 'p'){
    //check if there is an oponent piece either diagonally or on its sides, and add an attack move 

      const right = getPiece({ x: piece?.x + 1, y: piece?.y + (piece?.color === 'w' ? -1 : 1) }, board)
      const left = getPiece({ x: piece?.x - 1, y: piece?.y + (piece?.color === 'w' ? -1 : 1) }, board)

      let pieceMovements = structuredClone(movements[piece?.id])

      if(right?.color !== piece?.color && right !== null){
        pieceMovements.movements.push({
          x: 1,
          y: (piece?.color === 'w' ? -1 : 1),
        })
      }
      if(left?.color !== piece?.color && left !== null){
        pieceMovements.movements.push({
          x: -1,
          y: (piece?.color === 'w' ? -1 : 1),
        })
      }

      return pieceMovements
    }

    if(piece?.castle){
      movement.movements=[
        {
          "x": 1,
          "y": 0
        }, {
          "x": 0,
          "y": 1
        }, {
          "x": 1,
          "y": 1
        }, {
          "x": -1,
          "y": 0
        }, {
          "x": 0,
          "y": -1
        }, {
          "x": -1,
          "y": -1
        }, {
          "x": 1,
          "y": -1
        }, {
          "x": -1,
          "y": 1
        }
      ]

      return movement
    }

    if(piece?.type === 'k' && canCastle()){
      let kingsMovement = movements[piece?.type]

      if (canCastle().includes('left')){
        // check if the movement has already been added

        kingsMovement.movements.some(movement => movement.x === -2 && movement.y === 0) ? null : (
          kingsMovement.movements.push({
          x: -2,
          y: 0,
      }))  
      } else {
        kingsMovement.movements.some(movement => movement.x === -2 && movement.y === 0) ? kingsMovement.movements.splice(kingsMovement.movements.findIndex(movement => movement.x === -2 && movement.y === 0), 1) : null
      }
      if (canCastle().includes('right')){
        // check if the movement has already been added
        kingsMovement.movements.some(movement => movement.x === 2 && movement.y === 0) ? null : (
        kingsMovement.movements.push({
        x: 2,
        y: 0,
      }))
      } else {
        kingsMovement.movements.some(movement => movement.x === 2 && movement.y === 0) ? kingsMovement.movements.splice(kingsMovement.movements.findIndex(movement => movement.x === 2 && movement.y === 0), 1) : null
      }

      return kingsMovement
    }

    movement = movements[piece?.type]
    
    return movement
  }

  export function checkSingleDirectionRepeatedly(piece, board, direction) {
    // check all the movements a piece can make in a single direction 
    // return an array of all the possible points it can move to

    let possibleMoves = []
    let flag = true
    let loop = 0
    let { x: movementX, y: movementY } = direction

    // given a direction, check if the piece can move in that direction multiple times and add all the possible points to the array, if a piece of the same color is in the way, stop checking that direction until the point before the piece, if a piece of the opposite color is in the way, add that point to the array and stop checking that direction

    while (flag) {
      loop++
      let newX = piece.x + movementX * loop
      let newY = piece.y + movementY * loop
      // check if the new position is off the board
      if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) {
        flag = false
        break
      }

      // check if the new position is empty
      if (board[newY][newX].piece === null) {
        possibleMoves.push({ x: newX, y: newY, attack: false, attackedPiece: undefined })
      } else if (board[newY][newX].piece.color !== piece.color) {
        possibleMoves.push({ x: newX, y: newY, attack: true, attackedPiece: board[newY][newX] })
        flag = false
      } else { 
        flag = false
      }
      
    }
    
    return possibleMoves
  }

	export function lookForMovements(piece, board) {

    if (piece === null) return null
    // check all the movements a piece can make
    // return an array of all the possible points it can move to
    const { x, y } = piece

    const possibleMoves = []

    const pieceMovementsDetails = getMovement(piece, board)

    if (pieceMovementsDetails === null) return null

    if (pieceMovementsDetails.multipleSteps) {
      // check all if the piece can move multiple steps in a direction and add all the possible points to the array, if a piece of the same color is in the way, stop checking that direction until the point before the piece, if a piece of the opposite color is in the way, add that point to the array and stop checking that direction
      pieceMovementsDetails?.movements?.forEach(direction => {
        possibleMoves.push(...checkSingleDirectionRepeatedly(piece, board, direction))
      })
    } else {
      // check all if the piece can move once in a direction and add all the possible points to the array, if a piece of the same color is in the way, stop checking that direction, if a piece of the opposite color is in the way, add that point to the array and stop checking that direction

      pieceMovementsDetails?.movements?.forEach(direction => {
        let { x: movementX, y: movementY } = direction
        let newX = x + movementX
        let newY = y + movementY

        // check if the new position is off the board
        if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) return

        // check if the new position is empty
        if (board[newY][newX].piece === null) {
          possibleMoves.push({ x: newX, y: newY, attack: false, attackedPiece: undefined })
        } else if (board[newY][newX].piece.color !== piece.color) {
            if (piece.type === 'p' && (movementX === 0)) return
            possibleMoves.push({ x: newX, y: newY, attack: true, attackedPiece: board[newY][newX] })
        }
      })
    }

    return possibleMoves
 
  }