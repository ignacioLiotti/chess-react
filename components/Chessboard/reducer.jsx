import range from "lodash-es/range"
import { Chess } from "chess.js"
import movements from "./movements"
import next from "next"
import { startCase } from "lodash-es"
// import { Item, Cells, Point, Inventory } from "./types"

export const initial = {
	board: range(8).map(y => range(8).map(x => {
    // generate a 8x8 board with null values and a position value with the value of y and x as f8, f7, f6, in all lowercase etc
    return {
      position: `${String.fromCharCode(97 + x)}${8 - y}`,
      piece: null,
    }
  })),
  check: {},
	pieces: [],
  selectedPiece: null,
  selectedPiecePossibleMoves: [],
}

export const reducer = (state, action) => {

  // O(1) FUNTIONS TO GET AND SET VALUES IN THE BOARD

  function getPosition(point){
    return state.board[point?.y][point?.x].position
  }

  function getPiece(point){
    return state.board[point?.y][point?.x].piece
  }

  function clearPieceFromCells(piece, cells) {

		const next = [...cells]

		next[piece?.y][piece?.x].piece = null 

		return next 
	}

  function clearCell(point, cells) {
		const next = [...cells]

		next[point?.y][point?.x].piece = null
    
		return next 
	}

	function setPieceToCells(piece, cells) {
		const next = [...cells]
    
		next[piece?.y][piece?.x].piece = piece
		return next
	}

  // ------------------------------

  // O(n) FUNCTIONS TO GET AND SET VALUES IN THE BOARD

  function deletePiece(piece, pieces) {
    const next = [...pieces]
    const index = next.findIndex(item => item.id === piece?.id && item.x === piece?.x && item.y === piece?.y)
    index > -1 ? next.splice(index, 1) : null
    return next
  }

  // ------------------------------

  function movePiece(from, to, state){
    const piece = getPiece(from)
    const pieceToTake = getPiece(to)
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

  function getMovement(piece){
    // get the movement of a piece based on its id, and if it is a pawn, check if it is the first move and if it is, add the movement of 2 steps forward and check its color
    let movement = []

    function isRookInStartingPosition(point){
      const rook = getPiece(point)

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
        return getPiece({ x: 1, y }) === null &&
               getPiece({ x: 2, y }) === null &&
               getPiece({ x: 3, y }) === null &&
               isRookInStartingPosition({ x: 0, y });
      }
      
      function canCastleRight(y) {
        return getPiece({ x: 5, y }) === null &&
               getPiece({ x: 6, y }) === null &&
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
      return movements[piece?.id]
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

  function checkSingleDirectionRepeatedly(piece, board, direction) {
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

	function lookForMovements(piece, board) {
    // check all the movements a piece can make
    // return an array of all the possible points it can move to
    const { x, y } = piece

    const possibleMoves = []

    const pieceMovementsDetails = getMovement(piece)

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
          possibleMoves.push({ x: newX, y: newY, attack: true, attackedPiece: board[newY][newX] })
        }
      })
    }

    return possibleMoves
 
  }

  // ------------------ REDUCER ACTIONS ------------------

	switch (action.type) {
    case "ADD_PIECES": {
      const nextState = { ...state }
      const { pieces } = action.payload

      nextState.pieces = pieces

      pieces.forEach(piece => {
        nextState.board = setPieceToCells(piece, nextState.board)
      })

      return nextState
    }
		case "ADD_PIECE": {
			const nextState = { ...state }
			const { piece } = action.payload

			nextState.board = setPieceToCells(piece, nextState.board)

			return nextState
		}
    case "CLICKED":{
        // show the piece's possible movements
        const nextState = { ...state }
        const piece = action.payload

        nextState.selectedPiece = piece

        nextState.selectedPiecePossibleMoves = lookForMovements(piece, nextState.board)


        return nextState
    }
    case "CLEAR_POSSIBLE_MOVEMENTS":{
      const nextState = { ...state }
      
      nextState.selectedPiecePossibleMoves = []

      return nextState
    }
    case "MOVE_PIECE": {

			const { piece, point, attackedPiece } = action.payload
      let nextState = { ...state }
      let other = {}

      // if king castles to the left move the left rook

      if (piece.id === 'kw' && point.x === 2){
        other = movePiece({x:0,y:7}, {x:3,y:7}, state)
        piece.castle = true
        nextState = { ...other }
      }

      // if king castles to the right move the right rook

      if (piece.id === 'kw' && point.x === 6){
        other = movePiece({x:7,y:7}, {x:5,y:7}, state)
        nextState = { ...other }
      }

      nextState.board = clearCell(point, nextState.board)
      nextState.pieces = deletePiece(attackedPiece, nextState.pieces)

			nextState.board = clearPieceFromCells(piece, nextState.board)

      const piecePositionInChess = getPosition({x: piece.x, y: piece.y})
      const pointPositionInChess = getPosition(point)

			piece.x = point.x
			piece.y = point.y

      piece.history.push({from: piecePositionInChess, to: pointPositionInChess, attackedPiece: attackedPiece})

			nextState.board = setPieceToCells(piece, nextState.board)

      // after moving the piece, go through all the pieces and update, if an update is needed, update the possible movements of the piece

      let flag = false 
      nextState.pieces.forEach(piece => {
        piece.possibleMoves = lookForMovements(piece, nextState.board)
        piece.possibleMoves.forEach(point => {
          if (point.attack && point?.attackedPiece?.piece?.type === 'k'){
            flag = true
            nextState.check = {king: point.attackedPiece.piece.id}
          }
        })
      })

      if (!flag){
        nextState.check = undefined
      }
      
      nextState.selectedPiecePossibleMoves = []

      console.log(nextState)

			return nextState
		}
    case "ATTACK":{
      const nextState = { ...state }
      const { piece, point, attackedPiece } = action.payload

      nextState.board = clearCell(point, nextState.board)
      nextState.pieces = deletePiece(attackedPiece, nextState.pieces)

      nextState.board = clearPieceFromCells(piece, nextState.board)

			piece.x = point.x
			piece.y = point.y

			nextState.board = setPieceToCells(piece, nextState.board)

      return nextState
    }
		default: {
			return state
		}
	}
}
