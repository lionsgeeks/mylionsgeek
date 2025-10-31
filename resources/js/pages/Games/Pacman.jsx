import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const BOARD = [
  // 0=empty, 1=wall, 2=dot
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,2,1],
  [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,1],
  [1,2,1,2,1,2,1,1,1,2,1,2,1,2,1,2,1,1],
  [1,2,1,2,1,2,2,2,2,2,1,2,2,2,1,2,2,1],
  [1,2,1,2,1,1,1,1,1,2,1,1,1,2,1,2,1,1],
  [1,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const ROWS = BOARD.length;
const COLS = BOARD[0].length;
const CELL_SIZE = 28;
const INIT_POS = { row: 7, col: 8 };
const INIT_GHOST = { row: 1, col: 1, dir: 1 };

const DIRS = {
  ArrowUp:    { dRow: -1, dCol:  0 },
  ArrowDown:  { dRow:  1, dCol:  0 },
  ArrowLeft:  { dRow:  0, dCol: -1 },
  ArrowRight: { dRow:  0, dCol:  1 },
};

function canMove(board, {row, col}) {
  return board[row][col] !== 1;
}

export default function PacmanGame() {
  const [board, setBoard] = useState(() => BOARD.map(r => [...r]));
  const [pacman, setPacman] = useState(INIT_POS);
  const [dir, setDir] = useState('ArrowLeft');
  const [pendingDir, setPendingDir] = useState('ArrowLeft');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ghost, setGhost] = useState(INIT_GHOST);
  const chompSound = useRef();
  const deathSound = useRef();

  // Pacman movement logic
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      let newDir = dir;
      let testMove = {
        row: pacman.row + DIRS[pendingDir].dRow,
        col: pacman.col + DIRS[pendingDir].dCol
      };
      if (DIRS[pendingDir] && canMove(board, testMove)) {
        newDir = pendingDir;
      } else {
        testMove = {
          row: pacman.row + DIRS[dir].dRow,
          col: pacman.col + DIRS[dir].dCol
        };
        if (!canMove(board, testMove)) return;
      }
      let { row, col } = testMove;
      let updatedBoard = board.map(r => [...r]);
      if (updatedBoard[row][col] === 2) {
        updatedBoard[row][col] = 0;
        setScore(s => s + 10);
        if (chompSound.current) { chompSound.current.currentTime = 0; chompSound.current.play(); }
      }
      setDir(newDir);
      setPacman({ row, col });
      setBoard(updatedBoard);
      // Game win check
      if (updatedBoard.flat().every(cell => cell !== 2)) setGameOver(true);
    }, 140); // classic pace
    return () => clearInterval(interval);
  }, [pacman, dir, pendingDir, board, gameOver]);

  // Ghost random movement logic, minimal AI
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      // Try random direction
      let next = { ...ghost };
      let options = Object.entries(DIRS).filter(([_, mv]) =>
        canMove(board, { row: ghost.row + mv.dRow, col: ghost.col + mv.dCol })
      );
      if (options.length) {
        let [k, mv] = options[Math.floor(Math.random() * options.length)];
        next.row += mv.dRow;
        next.col += mv.dCol;
        next.dir = k;
      }
      setGhost(next);
      // Collision logic
      if (next.row === pacman.row && next.col === pacman.col) {
        setGameOver(true);
        if (deathSound.current) { deathSound.current.currentTime = 0; deathSound.current.play(); }
      }
    }, 190);
    return () => clearInterval(interval);
  }, [ghost, pacman, board, gameOver]);

  // Key listeners
  useEffect(() => {
    const onDown = e => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        setPendingDir(e.key);
      }
    };
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, []);

  const cellStyle = (row, col) => {
    if (board[row][col] === 1)
      return { background: '#145ad6', borderRadius: 5 };
    if (row === pacman.row && col === pacman.col)
      return { position:'relative', background:'black' };
    if (row === ghost.row && col === ghost.col)
      return { position:'relative', background: 'transparent' };
    return { background: 'black' };
  };

  // Pacman SVG
  const PacSVG = ({ size = 25, direction = dir }) => {
    let rotate = 0;
    if      (direction === 'ArrowUp')    rotate = 270;
    else if (direction === 'ArrowDown')  rotate = 90;
    else if (direction === 'ArrowLeft')  rotate = 180;
    else if (direction === 'ArrowRight') rotate = 0;
    return (
      <svg width={size} height={size} style={{transform:`rotate(${rotate}deg)`}}>
        <circle cx={size/2} cy={size/2} r={size/2} fill="#ffe600" />
        <path d={`M${size/2},${size/2} L${size} 0 A${size/2},${size/2} 0 1 1 0,${size} Z`} fill="black" />
      </svg>
    );
  };
  // Ghost SVG
  const GhostSVG = ({ size = 23 }) => (
    <svg width={size} height={size}>
      <ellipse cx={size/2} cy={size/2-2} rx={size/2-2} ry={size/2-4} fill="#00e0ff" />
      <rect x={2} y={size/2-2} width={size-4} height={size/2} fill="#00e0ff" />
      <circle cx={size/2-4} cy={size/2} r={3} fill="#fff" />
      <circle cx={size/2+4} cy={size/2} r={3} fill="#fff" />
      <circle cx={size/2-4} cy={size/2} r={1.2} fill="#222" />
      <circle cx={size/2+4} cy={size/2} r={1.2} fill="#222" />
    </svg>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/games" className="inline-flex text-yellow-400 hover:text-yellow-600 mb-4">← Back to Games</Link>
          <h1 className="text-4xl font-bold text-yellow-400 mb-6">🟡 Pac-Man</h1>
          <div className="mb-4 text-yellow-200 text-lg font-bold">Score: {score}</div>
          <div
            style={{
              width: COLS * CELL_SIZE,
              height: ROWS * CELL_SIZE,
              background:'#181848',
              display:'grid',
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              outline: '6px solid #0f69fc',
              borderRadius: 16,
              boxShadow: '0 8px 30px #132',
            }}
          >
            {board.map((rowArr, rowIdx) => rowArr.map((cell, colIdx) => (
              <div key={rowIdx+"-"+colIdx} style={{ width:CELL_SIZE, height:CELL_SIZE, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', ...cellStyle(rowIdx, colIdx) }}>
                {(rowIdx === pacman.row && colIdx === pacman.col) && <PacSVG />}
                {(rowIdx === ghost.row && colIdx === ghost.col) && <GhostSVG />}
                {cell === 2 && <div style={{width:7,height:7,background:'#ffe600',borderRadius:4}} />}
              </div>
            )))}
          </div>
          {gameOver && (
            <div className="mt-6 text-3xl font-bold text-red-400 text-center">{score > 0 ? 'Game Over!':'You Win!'}<br/><button className="mt-2 px-6 py-3 bg-yellow-400 rounded-lg text-black font-bold" onClick={()=>{setBoard(BOARD.map(r=>[...r]));setPacman(INIT_POS);setScore(0);setGameOver(false);setDir('ArrowLeft');setPendingDir('ArrowLeft'); setGhost(INIT_GHOST);}}>Restart</button></div>
          )}
          {/* Pacman sounds: use your local assets or web links below */}
          <audio ref={chompSound} src="https://freesound.org/data/previews/341/341695_6260246-lq.mp3" />{/* classic chomp */}
          <audio ref={deathSound} src="https://freesound.org/data/previews/69/69514_634166-lq.mp3" />{/* classic death */}
        </div>
      </div>
    </AppLayout>
  );
}

