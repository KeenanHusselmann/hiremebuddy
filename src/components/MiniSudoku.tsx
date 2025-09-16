import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RotateCcw, Brain, CheckCircle } from 'lucide-react';

type SudokuGrid = (number | null)[][];

const MiniSudoku = () => {
  const [grid, setGrid] = useState<SudokuGrid>([]);
  const [initialGrid, setInitialGrid] = useState<SudokuGrid>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState({ completed: 0, attempts: 0 });

  // Generate a simple 4x4 Sudoku puzzle
  const generatePuzzle = (): { puzzle: SudokuGrid; solution: SudokuGrid } => {
    // Simple 4x4 solution
    const solution: SudokuGrid = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 3, 4, 1],
      [4, 1, 2, 3]
    ];

    // Create puzzle by removing some numbers
    const puzzle: SudokuGrid = solution.map(row => [...row]);
    const cellsToRemove = 8; // Remove 8 out of 16 cells
    
    for (let i = 0; i < cellsToRemove; i++) {
      const row = Math.floor(Math.random() * 4);
      const col = Math.floor(Math.random() * 4);
      puzzle[row][col] = null;
    }

    return { puzzle, solution };
  };

  const initializeGame = useCallback(() => {
    const { puzzle } = generatePuzzle();
    setGrid(puzzle);
    setInitialGrid(puzzle.map(row => [...row]));
    setIsComplete(false);
    setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const checkComplete = (currentGrid: SudokuGrid) => {
    // Check if all cells are filled
    const allFilled = currentGrid.every(row => 
      row.every(cell => cell !== null && cell >= 1 && cell <= 4)
    );

    if (!allFilled) return false;

    // Check rows
    for (const row of currentGrid) {
      const uniqueNumbers = new Set(row);
      if (uniqueNumbers.size !== 4) return false;
    }

    // Check columns
    for (let col = 0; col < 4; col++) {
      const column = currentGrid.map(row => row[col]);
      const uniqueNumbers = new Set(column);
      if (uniqueNumbers.size !== 4) return false;
    }

    // Check 2x2 boxes
    for (let boxRow = 0; boxRow < 2; boxRow++) {
      for (let boxCol = 0; boxCol < 2; boxCol++) {
        const box = [];
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            box.push(currentGrid[boxRow * 2 + i][boxCol * 2 + j]);
          }
        }
        const uniqueNumbers = new Set(box);
        if (uniqueNumbers.size !== 4) return false;
      }
    }

    return true;
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (initialGrid[row][col] !== null) return; // Can't edit pre-filled cells

    const num = parseInt(value) || null;
    if (num !== null && (num < 1 || num > 4)) return;

    const newGrid = grid.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? num : c))
    );

    setGrid(newGrid);

    if (checkComplete(newGrid)) {
      setIsComplete(true);
      setStats(prev => ({ ...prev, completed: prev.completed + 1 }));
    }
  };

  const getCellStyle = (row: number, col: number) => {
    const isPreFilled = initialGrid[row][col] !== null;
    const baseStyle = "w-12 h-12 text-center text-lg font-semibold border-2";
    
    if (isPreFilled) {
      return `${baseStyle} bg-muted text-muted-foreground border-muted`;
    }
    
    return `${baseStyle} bg-background border-border focus:border-primary`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Brain className="h-5 w-5" />
          Mini Sudoku (4×4)
        </CardTitle>
        <div className="flex justify-center gap-4 text-sm">
          <Badge variant="secondary">Completed: {stats.completed}</Badge>
          <Badge variant="outline">Attempts: {stats.attempts}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isComplete && (
          <div className="text-center space-y-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
            <p className="text-green-800 dark:text-green-200 font-semibold">
              Congratulations! Puzzle completed!
            </p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-1 mx-auto w-fit">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Input
                key={`${rowIndex}-${colIndex}`}
                className={getCellStyle(rowIndex, colIndex)}
                value={cell || ''}
                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                disabled={initialGrid[rowIndex][colIndex] !== null || isComplete}
                maxLength={1}
              />
            ))
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Fill each row, column, and 2×2 box with numbers 1-4
        </div>

        <Button 
          onClick={initializeGame} 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          New Puzzle
        </Button>
      </CardContent>
    </Card>
  );
};

export default MiniSudoku;