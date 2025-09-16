import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Trophy, Bot, Users } from 'lucide-react';

type Player = 'X' | 'O' | null;
type Board = Player[];
type GameMode = 'friend' | 'bot';

const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'tie'>(null);
  const [gameMode, setGameMode] = useState<GameMode>('friend');
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

  // Bot AI logic - uses minimax algorithm for optimal play
  const getBestMove = (squares: Board): number => {
    const emptySquares = squares.map((square, index) => square === null ? index : null).filter(val => val !== null) as number[];
    
    // Try to win
    for (const move of emptySquares) {
      const testBoard = [...squares];
      testBoard[move] = 'O';
      if (checkWinner(testBoard) === 'O') {
        return move;
      }
    }
    
    // Block opponent from winning
    for (const move of emptySquares) {
      const testBoard = [...squares];
      testBoard[move] = 'X';
      if (checkWinner(testBoard) === 'X') {
        return move;
      }
    }
    
    // Take center if available
    if (squares[4] === null) {
      return 4;
    }
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => squares[corner] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any remaining move
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  // Effect for bot moves
  useEffect(() => {
    if (gameMode === 'bot' && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const botMove = getBestMove(board);
        if (botMove !== undefined) {
          const newBoard = [...board];
          newBoard[botMove] = 'O';
          setBoard(newBoard);

          const gameWinner = checkWinner(newBoard);
          if (gameWinner) {
            setWinner(gameWinner);
            updateStats(gameWinner);
          } else {
            setCurrentPlayer('X');
          }
        }
      }, 500); // Add slight delay for better UX

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, board, winner]);

  const handleSquareClick = (index: number) => {
    if (board[index] || winner) return;
    
    // In bot mode, only allow human player (X) to click
    if (gameMode === 'bot' && currentPlayer === 'O') return;

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

  const handleGameModeChange = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  };

  const getSquareStyle = (square: Player) => {
    if (square === 'X') return 'text-primary font-bold text-2xl';
    if (square === 'O') return 'text-accent font-bold text-2xl';
    return 'text-muted-foreground';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5" />
          Tic Tac Toe
        </CardTitle>
        
        {/* Game Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Game Mode</label>
          <Select value={gameMode} onValueChange={(value: GameMode) => handleGameModeChange(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friend" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>vs Friend</span>
              </SelectItem>
              <SelectItem value="bot" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span>vs Computer</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              {winner === 'tie' ? "It's a tie!" : 
               gameMode === 'bot' ? 
                 (winner === 'X' ? "You win! 🎉" : "Computer wins! 🤖") :
                 `Player ${winner} wins!`
              }
            </p>
            <Button onClick={resetGame} size="sm" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
          </div>
        ) : (
          <p className="text-center font-medium">
            {gameMode === 'bot' ? (
              currentPlayer === 'X' ? 
                "Your turn (X)" : 
                "Computer thinking... 🤖"
            ) : (
              <>Current Player: <span className="text-primary">{currentPlayer}</span></>
            )}
          </p>
        )}
        
        <div className="grid grid-cols-3 gap-2 mx-auto w-fit">
          {board.map((square, index) => (
            <Button
              key={index}
              variant="outline"
              className={`w-16 h-16 ${getSquareStyle(square)} ${
                gameMode === 'bot' && currentPlayer === 'O' ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={() => handleSquareClick(index)}
              disabled={!!square || !!winner || (gameMode === 'bot' && currentPlayer === 'O')}
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