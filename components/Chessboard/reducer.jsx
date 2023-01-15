import range from "lodash-es/range"
import { clearCell, clearPieceFromCells, deletePiece, getPosition, lookForMovements, movePiece, setPieceToCells } from "./chessUtils/simpleUtils"

export const initial = {
  // generate a 8x8 board with null values and a position value with the value of y and x as f8, f7, f6, in all lowercase etc
	board: range(8).map(y => 
    range(8).map(x => 
      {
        return {
          position: `${String.fromCharCode(97 + x)}${8 - y}`,
          piece: null,
        }
      }
  )),
  check: {},
	pieces: [],
  selectedPiece: null,
  selectedPiecePossibleMoves: [],
  turn: 'w',
}

export const reducer = (state, action) => {

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

      if (piece === null) return state

      // Handle castling
      if (piece.id === 'kw' && (point.x === 2 || point.x === 6)) {
        let other;
        if (point.x === 2) {
          other = movePiece({x:0,y:7}, {x:3,y:7}, state);
          piece.castle = true;
        }
        if (point.x === 6) {
          other = movePiece({x:7,y:7}, {x:5,y:7}, state);
        }
        nextState = { ...other };
      }

      // Update piece position and history
      const piecePositionInChess = getPosition({x: piece.x, y: piece.y}, state.board);
      const pointPositionInChess = getPosition(point, state.board);

      nextState.board = clearCell(point, nextState.board);
      nextState.board = clearPieceFromCells(piece, nextState.board);

      piece.x = point.x;
      piece.y = point.y;
      piece.history.push({from: piecePositionInChess, to: pointPositionInChess, attackedPiece});
      
      nextState.board = setPieceToCells(piece, nextState.board);

      // Handle attacked piece
      if (attackedPiece) {
          nextState.pieces = deletePiece(attackedPiece, nextState.pieces);
      }

      // Update possible moves for all pieces and check for check
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

      nextState.turn = nextState.turn === 'w' ? 'b' : 'w'

			return nextState
		}

		default: {
			return state
		}

	}
}
