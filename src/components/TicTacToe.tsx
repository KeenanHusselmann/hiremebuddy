import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trophy } from 'lucide-react';

type Player = 'X' | 'O' | null;
type Board = Player[];

const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'tie'>(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0, ties: 0 });

  const checkWinner = (squares: Board): Player | 'tie' => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return squares.every(square => square !== null) ? 'tie' : null;
  };

  const handleSquareClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      updateStats(gameWinner);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const updateStats = (gameWinner: Player | 'tie') => {
    setStats(prev => ({
      ...prev,
      wins: gameWinner === 'X' ? prev.wins + 1 : prev.wins,
      losses: gameWinner === 'O' ? prev.losses + 1 : prev.losses,
      ties: gameWinner === 'tie' ? prev.ties + 1 : prev.ties
    }));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };

  const getSquareStyle = (square: Player) => {
    if (square === 'X') return 'text-primary font-bold text-2xl';
    if (square === 'O') return 'text-accent font-bold text-2xl';
    return 'text-muted-foreground';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5" />
          Tic Tac Toe
        </CardTitle>
        <div className="flex justify-center gap-4 text-sm">
          <Badge variant="secondary">Wins: {stats.wins}</Badge>
          <Badge variant="outline">Ties: {stats.ties}</Badge>
          <Badge variant="destructive">Losses: {stats.losses}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {winner ? (
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">
              {winner === 'tie' ? "It's a tie!" : `Player ${winner} wins!`}
            </p>
            <Button onClick={resetGame} size="sm" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
          </div>
        ) : (
          <p className="text-center font-medium">
            Current Player: <span className="text-primary">{currentPlayer}</span>
          </p>
        )}
        
        <div className="grid grid-cols-3 gap-2 mx-auto w-fit">
          {board.map((square, index) => (
            <Button
              key={index}
              variant="outline"
              className={`w-16 h-16 ${getSquareStyle(square)}`}
              onClick={() => handleSquareClick(index)}
              disabled={!!square || !!winner}
            >
              {square}
            </Button>
          ))}
        </div>
        
        <Button 
          onClick={resetGame} 
          variant="ghost" 
          size="sm" 
          className="w-full flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Game
        </Button>
      </CardContent>
    </Card>
  );
};

export default TicTacToe;