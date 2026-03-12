import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

const PuzzleBoard = ({ image, gridSize, resetTrigger, onMove, onSolve, isSolved }) => {
  const [tiles, setTiles] = useState([]);
  
  // Total number of tiles including the empty space
  const tileCount = gridSize * gridSize;

  // Fisher-Yates Shuffle
  const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  // Check if puzzle is solvable (Standard 15-puzzle solvability rules)
  const isSolvable = (tilesArr, size) => {
    let inversions = 0;
    const arrayWithoutEmpty = tilesArr.filter(t => t !== size * size - 1);
    
    for (let i = 0; i < arrayWithoutEmpty.length - 1; i++) {
      for (let j = i + 1; j < arrayWithoutEmpty.length; j++) {
        if (arrayWithoutEmpty[i] > arrayWithoutEmpty[j]) {
          inversions++;
        }
      }
    }

    if (size % 2 !== 0) {
      return inversions % 2 === 0;
    } else {
      const emptyIndex = tilesArr.indexOf(size * size - 1);
      const emptyRow = Math.floor(emptyIndex / size) + 1; 
      const emptyRowFromBottom = size - emptyRow + 1; 

      if (emptyRowFromBottom % 2 !== 0) {
         return inversions % 2 === 0;
      } else {
         return inversions % 2 !== 0;
      }
    }
  };

  const isWinning = (currentTiles) => {
    for (let i = 0; i < currentTiles.length; i++) {
      if (currentTiles[i] !== i) return false;
    }
    return true;
  };

  // Handle Game Start / Shuffle
  const initializeGame = () => {
    let newTiles;
    do {
      newTiles = shuffle([...Array(tileCount).keys()]);
    } while (!isSolvable(newTiles, gridSize) || isWinning(newTiles));
    
    setTiles(newTiles);
  };

  // Initialize and shuffle tiles whenever gridSize or resetTrigger changes
  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize, resetTrigger]);

  const handleTileClick = (index) => {
    if (isSolved) return;

    const emptyIndex = tiles.indexOf(tileCount - 1); // The last index is the empty tile

    // Calculate row and col
    const clickedRow = Math.floor(index / gridSize);
    const clickedCol = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    // Check if adjacent (Manhattan distance = 1)
    const isAdjacent = Math.abs(clickedRow - emptyRow) + Math.abs(clickedCol - emptyCol) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      // Swap tiles
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      onMove();

      // Check win condition
      if (isWinning(newTiles)) {
        onSolve();
      }
    }
  };

  // Dynamic grid setup using inline styles based on gridSize
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
    gap: '2px', // tiny gap between tiles
    width: '100%',
    aspectRatio: '1 / 1', // Force square
    maxWidth: '500px',
  };

  return (
    <div className="relative w-full flex items-center justify-center">
      <div 
        style={{...gridStyle, touchAction: 'none'}} 
        className={`bg-slate-800 p-1 rounded-xl shadow-2xl transition-all duration-500
          ${isSolved ? 'ring-4 ring-emerald-400/50 shadow-emerald-500/20' : ''}
        `}
      >
        {tiles.map((tileValue, index) => {
          const isEmptyTile = tileValue === tileCount - 1;
          
          // Calculate background position
          // original tile's designated row and col
          const originalRow = Math.floor(tileValue / gridSize);
          const originalCol = tileValue % gridSize;
          
          // Background pos percentages setup
          const bgPosX = (originalCol / (gridSize - 1)) * 100;
          const bgPosY = (originalRow / (gridSize - 1)) * 100;

          // Show the empty region unless the puzzle is completely solved
          let showTile = true;
          if (!isSolved && isEmptyTile) {
             showTile = false;
          }

          return (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              onTouchStart={(e) => {
                e.preventDefault(); // Prevent default scroll when tapping
                handleTileClick(index);
              }}
              className={`
                relative w-full h-full rounded-sm overflow-hidden select-none
                ${showTile ? 'cursor-pointer hover:brightness-110 active:scale-95' : 'cursor-default opacity-0'}
                transition-all duration-200 ease-in-out
              `}
              style={{
                backgroundImage: showTile ? `url(${image})` : 'none',
                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                // Box shadow gives tiles a slightly 3D raised look
                boxShadow: showTile ? 'inset 0 0 0 1px rgba(255,255,255,0.1), inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.2)' : 'none'
              }}
            />
          );
        })}
      </div>

      {/* Win Overlay */}
      {isSolved && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-xl z-10 animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-center bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl">
             <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
               <Trophy className="w-8 h-8 text-emerald-400" />
             </div>
             <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
               퍼즐 완성!
             </h2>
             <p className="text-slate-400 text-center text-sm">
               축하합니다! {gridSize}x{gridSize} 퍼즐을 성공적으로 맞추셨습니다.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleBoard;
