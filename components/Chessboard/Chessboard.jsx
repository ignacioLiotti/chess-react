// make a chessboard with only css and react components

import * as React from "react"
// import "./styles.css"
import { motion } from "framer-motion"
import { initial, reducer } from "./reducer"
import { Chess } from 'chess.js'
import styles from './chessboard.module.css'
import aiPlayer from './chessAI'
import { getPiece } from "./chessUtils/simpleUtils"

export default function App({rotation}) {
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
		// console.log('CHECK',state.check)
	}, [state])

	React.useEffect(() => {
		if (state.turn === 'b') {

			const predictedMove = aiPlayer(state.board, 2)

			const movingPiece = getPiece({x: predictedMove.from.col, y: predictedMove.from.row}, state.board )

			setTimeout(() => {
				console.log('moving piece', movingPiece, predictedMove)
				dispatch({ type: "MOVE_PIECE", payload: {piece: movingPiece, point: {x: predictedMove.to.x, y: predictedMove.to.y}, attackedPiece: predictedMove.attackedPiece } })
			}, 1000)
		}
	}, [state.turn])

	return (
		<motion.div className={styles.chessWrapper}
			// initial={{"--turn-rotation": state.turn === 'w' ? '180deg' : 0}}
			// animate={{"--turn-rotation": state.turn === 'w' ? 0 : '180deg'}}
		>
			<div className={styles.chessGrid}>
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
				{state?.pieces?.map(piece => {
					return(
						<ChessPiece
							piece={piece}
							dispatch={dispatch}
							state={state}
							rotation={rotation}
							/>
					)
				})}
			</div>

      {/* make the cells that should appear green as to show that the clicked item can move on those positions */}
      
				
		</motion.div>
	)
}

const ChessPiece = ({ piece, dispatch, state, rotation }) => {
					const x = piece.x * 46
					const y = piece.y * 46
					const isDragging = piece.id === state.dragging?.id
					const pieceColor = piece.color === 'w' ? '#fcfcfc' : '#131313'
					const pieceSideColor = piece.color === 'w' ? '#e0e0e0' : '#1f1f1f'
					const pieceInverseColor = piece.color === 'w' ? '#000' : '#fff'
					const pieceHeight = ((rotation / 10) * 1.25 ) ;
					const shadowHeight = (((rotation ** (1.15)) / 10) * 1.25 ) + 'px' ;
					// const shadowHeight = (((rotation ** (state.turn === 'w' ? 1.15 : 1)) / 10) * 1.25 ) + 'px' ;
					const elevation = rotation / 7
					// const turnOrientation = state.turn === 'w' ? 1 : -1
					const turnOrientation = 1
					const possibleMoves = state.selectedPiecePossibleMoves

					return (
							<motion.div
								key={piece.id}
								tabIndex={0}
                onFocus={() => {   
									if (piece.color === state.turn) {   
                  	dispatch({type: 'CLICKED', payload: piece})
									}
								}}
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
									if (piece.color === state.turn) {   
										dispatch({type: 'CLICKED', payload: piece})
									}
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


								className={styles.chessPiece}
								style={{
									"--side-color": pieceSideColor,
									"--piece-color": pieceColor,
									"--dragging-index": isDragging ? 1 : 0,
									"--text-color": pieceInverseColor,
									"--side-height": pieceHeight,
									"--shadow-height": shadowHeight,
									"--turn-orientation": turnOrientation,
									// elevate 3d the piece depending on elevation
									transform: `translateZ(${elevation}px)`,
									top: y,
									left: x,
								}}
							>
                {piece.id.toUpperCase()}
							</motion.div>
					)
}

const ChessCell = ({ x,y, dispatch, state }) => {
// if (state.selectedPiece) {
              const cellColor = (x + y) % 2 === 0 ? '#fcfcfc' : '#0f0f0f'
							const possibleMoves = state.selectedPiecePossibleMoves
							const willFit = possibleMoves?.some(point => point.x === x && point.y === y)
							const isAnAttack = possibleMoves?.some(point => point.x === x && point.y === y && point.attack === true)
							const attackedPiece = state.pieces?.find(piece => piece.x === x && piece.y === y)

							const handleMovement = () => {
								dispatch({ type: "MOVE_PIECE", payload: { piece: state.selectedPiece, point: {x, y}, attackedPiece: attackedPiece } })
							}

							return (
								<div
									onClick={handleMovement}
									key={`${y}_${x}`}
									className={styles.chessCell}
									style={{
										backgroundColor: willFit ? isAnAttack ? 'blue' : 'green' : cellColor,
										pointerEvents: willFit ? 'all' : 'none',
									}}
								>
								</div>
							)
						// }
}

