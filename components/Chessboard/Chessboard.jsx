// make a chessboard with only css and react components

import * as React from "react"
// import "./styles.css"
import { motion } from "framer-motion"
import { initial, reducer } from "./reducer"
import { Chess } from 'chess.js'

export default function App() {
	const [state, dispatch] = React.useReducer(reducer, initial)

		const myChess = new Chess()

		const pieces = myChess.board().map((row, y) => row.map((piece, x) => {
			if (piece) {
				return {
					id: piece.type + piece.color,
					color: piece.color,
					type: piece.type,
					x,
					y,
					history: [],
					castle: false,
					possibleMoves: [],
				}
			}
		})).flat().filter(Boolean)

	React.useEffect(() => {
		// add the pieces from the chess object to the state
		dispatch({ type: "ADD_PIECES", payload: {pieces} })
	}, [])

	React.useEffect(() => {
		console.log('CHECK',state.check)
	}, [state])

	return (
		<div className="chessWrapper">
			<div className="chessGrid">
				{state.board.map((row, y) =>
					row.map((_, x) => {
						return(
							<ChessCell
								key={`${x}-${y}`}
								x={x}
								y={y}
								state={state}
								dispatch={dispatch}
							/>
						)
					})
				)}
			</div>

      {/* make the cells that should appear green as to show that the clicked item can move on those positions */}
      
				{state?.pieces?.map(piece => {
					return(
						<ChessPiece
							piece={piece}
							dispatch={dispatch}
							state={state}
							/>
					)
				})}
		</div>
	)
}

const ChessPiece = ({ piece, dispatch, state }) => {
					const x = piece.x * 46
					const y = piece.y * 46
					const isDragging = piece.id === state.dragging?.id
					const pieceColor = piece.color === 'w' ? '#fff' : '#000'
					const pieceInverseColor = piece.color === 'w' ? '#000' : '#fff'
					const possibleMoves = state.selectedPiecePossibleMoves

					return (
							<motion.div
								key={piece.id}
								tabIndex={0}
                onFocus={() => {      
                  dispatch({type: 'CLICKED', payload: piece})
                }}
								// onBlur={(event, info) => {
								// 	console.log(state.selectedPiece, piece)
								// 	if (state.selectedPiece !== piece){
								// 		setTimeout(() => {
								// 			dispatch({type: 'CLEAR_POSSIBLE_MOVEMENTS', payload: piece})
								// 		}, 100)
								// 	}
								// 	// dispatch({type: 'CLEAR_POSSIBLE_MOVEMENTS', payload: piece})
								// }}
								drag
								dragTransition={{
									power: 0,
									restDelta: 9.5,
									min: 0,
									max: 0,
									bounceDamping: 1000,
									bounceStiffness: 100000,
									modifyTarget: target => Math.round(target / 46) * 46
								}}
								onDragStart={() => { 
									dispatch({type: 'CLICKED', payload: piece})
								}}
								onDragEnd={(event, info) => {
									const draggedX = Math.round(info.offset.x / 46) 
									const draggedY = Math.round(info.offset.y / 46) 

									const newPoint = {x: draggedX + piece.x, y: draggedY + piece.y}
									const attackedPiece = state.pieces?.find(piece => piece.x === newPoint.x && piece.y === newPoint.y)

									console.log('attackedPiece', newPoint, {x:piece.x,y: piece.y})


									if (possibleMoves.some(point => point.x === newPoint.x && point.y === newPoint.y)) {
										dispatch({type: 'MOVE_PIECE', payload: {piece:piece, point: newPoint, attackedPiece: attackedPiece}})
									}
								}}


								className="chessPiece"
								style={{
									top: y,
									left: x,
									backgroundColor: pieceColor,
									color: pieceInverseColor,
									zIndex: isDragging ? 99 : 1,
								}}
							>
                {piece.id.toUpperCase()}
							</motion.div>
					)
}

const ChessCell = ({ x,y, dispatch, state }) => {
// if (state.selectedPiece) {
							// get the possible moves for the clicked item
							const possibleMoves = state.selectedPiecePossibleMoves
							// check if the current cell is in the possible moves array
							// const willFit = possibleMoves.some(point => point.x === x && point.y === y)
							const willFit = possibleMoves?.some(point => point.x === x && point.y === y)

							const isAnAttack = possibleMoves?.some(point => point.x === x && point.y === y && point.attack === true)

							const attackedPiece = state.pieces?.find(piece => piece.x === x && piece.y === y)

							const handleMovement = () => {
								console.log('BOLAS', {x:state.selectedPiece.x,y:state.selectedPiece.y}, {x,y})
								dispatch({ type: "MOVE_PIECE", payload: { piece: state.selectedPiece, point: {x, y}, attackedPiece: attackedPiece } })
							}

							return (
								<div
									onClick={handleMovement}
									key={`${y}_${x}`}
									className="chessCell"
									style={{
										backgroundColor: willFit ? isAnAttack ? 'blue' : 'green' : '',
										pointerEvents: willFit ? 'all' : 'none',
									}}
								>
								</div>
							)
						// }
}

