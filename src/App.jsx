import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, RefreshCcw, LayoutGrid, Eye } from 'lucide-react';
import PuzzleBoard from './components/PuzzleBoard';

// The default generated character image
const DEFAULT_IMAGE = `${import.meta.env.BASE_URL}default-character.png`; 

function App() {
  const [image, setImage] = useState(DEFAULT_IMAGE);
  const [gridSize, setGridSize] = useState(3);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [time, setTime] = useState(0);

  // Timer logic
  useEffect(() => {
    let timer;
    // Only start timer after the first move
    if (!isSolved && moves > 0) {
      timer = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSolved, moves]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setResetTrigger(prev => prev + 1);
      setIsSolved(false);
      setMoves(0);
      setTime(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  });

  const handleStart = () => {
    setResetTrigger(prev => prev + 1);
    setIsSolved(false);
    setMoves(0);
    setTime(0);
  };

  const handleGridChange = (size) => {
    if (size === gridSize) return;
    setGridSize(size);
    setResetTrigger(prev => prev + 1);
    setIsSolved(false);
    setMoves(0);
    setTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            슬라이딩 & 솔브
          </h1>
          <p className="text-slate-400 text-lg">원하시는 이미지를 업로드하고 타일을 움직여 퍼즐을 맞춰보세요!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Image Upload Zone */}
            <div 
              {...getRootProps()} 
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 glass-panel
                ${isDragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-white/5'}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-3">
                <ImagePlus className={`w-10 h-10 ${isDragActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {isDragActive ? (
                  <p className="text-emerald-400 font-medium">이미지를 여기에 놓아주세요...</p>
                ) : (
                  <p className="text-slate-300 text-sm">자신만의 이미지를 드래그 앤 드롭 하거나, 클릭해서 찾아보세요</p>
                )}
              </div>
            </div>

            {/* Game Controls */}
            <div className="p-6 rounded-2xl glass-panel space-y-6">
              
              <div className="space-y-3">
                <label className="text-sm text-slate-400 font-medium flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> 퍼즐 크기
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 5].map(size => (
                    <button
                      key={size}
                      onClick={() => handleGridChange(size)}
                      className={`py-2 rounded-lg font-medium transition-colors duration-200
                        ${gridSize === size
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                      `}
                    >
                      {size}x{size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50 flex flex-col gap-3">
                <button
                  onClick={handleStart}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <RefreshCcw className="w-5 h-5" />
                  퍼즐 다시 섞기
                </button>
                
                {/* Hint Button (Hover to show original) */}
                <div className="group relative w-full">
                  <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                    <Eye className="w-5 h-5" />
                    꾹 눌러서 원본 보기
                  </button>
                  {/* Hover Image Reveal */}
                  <div className="absolute top-0 right-full mr-4 p-2 glass-panel rounded-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                     <img src={image} alt="Original Hint" className="w-64 h-64 object-cover rounded-lg shadow-2xl" />
                  </div>
                </div>
              </div>

            </div>

             {/* Stats */}
             <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl glass-panel text-center">
                 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">이동 횟수</p>
                 <p className="text-3xl font-bold text-white">{moves}</p>
               </div>
               <div className="p-4 rounded-2xl glass-panel text-center">
                 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">진행 시간</p>
                 <p className="text-3xl font-bold text-white max-w-[5rem] mx-auto truncate tabular-nums">{formatTime(time)}</p>
               </div>
             </div>

          </div>

          {/* Puzzle Board Area */}
          <div className="lg:col-span-2 flex items-center justify-center p-8 rounded-3xl glass-panel relative overflow-hidden min-h-[500px]">
            {/* Ambient glow behind puzzle */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 pointer-events-none" />
            
            <PuzzleBoard 
              image={image} 
              gridSize={gridSize} 
              resetTrigger={resetTrigger} 
              onMove={() => setMoves(m => m + 1)}
              onSolve={() => setIsSolved(true)}
              isSolved={isSolved}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
