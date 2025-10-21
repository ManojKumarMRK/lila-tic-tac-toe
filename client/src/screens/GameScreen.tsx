import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import GameBoard from '../components/GameBoard';
import nakamaService, { MatchData } from '../services/NakamaService';
import { 
  RootStackParamList, 
  GameStatus, 
  PLAYER_X, 
  PLAYER_O, 
  EMPTY_CELL 
} from '../types';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

const GameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<GameScreenRouteProp>();
  const { matchId } = route.params;

  // Game state
  const [board, setBoard] = useState<number[]>(Array(9).fill(EMPTY_CELL));
  const [currentPlayer, setCurrentPlayer] = useState<number>(PLAYER_X);
  const [myPlayerNumber, setMyPlayerNumber] = useState<number | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING_FOR_OPPONENT);
  const [winner, setWinner] = useState<number | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    setupMatchListeners();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Update turn indicator when current player or my player number changes
    if (myPlayerNumber !== null) {
      setIsMyTurn(currentPlayer === myPlayerNumber);
    }
  }, [currentPlayer, myPlayerNumber]);

  const setupMatchListeners = useCallback(() => {
    nakamaService.on('matchData', handleMatchData);
    nakamaService.on('disconnect', handleDisconnect);
  }, []);

  const handleMatchData = useCallback((data: any) => {
    try {
      const matchData: MatchData = JSON.parse(data.data);
      console.log('📥 Match data received:', matchData);

      switch (data.op_code) {
        case 1: // Game start
          handleGameStart(matchData);
          break;
        case 2: // Move update
          handleMoveUpdate(matchData);
          break;
        case 3: // Game end
          handleGameEnd(matchData);
          break;
        default:
          console.log('Unknown op code:', data.op_code);
      }
    } catch (error) {
      console.error('Error parsing match data:', error);
    }
  }, []);

  const handleGameStart = (data: MatchData) => {
    if (data.players) {
      const userId = nakamaService.getUserId();
      if (userId && data.players[userId]) {
        setMyPlayerNumber(data.players[userId]);
        
        // Find opponent
        const opponentUserId = Object.keys(data.players).find(id => id !== userId);
        if (opponentUserId) {
          setOpponentId(opponentUserId);
        }
      }
    }

    if (data.board) {
      setBoard(data.board);
    }
    
    if (data.currentPlayer) {
      setCurrentPlayer(data.currentPlayer);
    }

    setGameStatus(GameStatus.PLAYING);
  };

  const handleMoveUpdate = (data: MatchData) => {
    if (data.board) {
      setBoard(data.board);
    }
    
    if (data.currentPlayer) {
      setCurrentPlayer(data.currentPlayer);
    }
  };

  const handleGameEnd = (data: MatchData) => {
    if (data.board) {
      setBoard(data.board);
    }

    setGameStatus(GameStatus.GAME_OVER);
    
    if (data.draw) {
      setIsDraw(true);
      showGameResult('It\'s a Draw!', 'Good game! 🤝');
    } else if (data.winner) {
      setWinner(data.winner);
      const isWinner = data.winner === myPlayerNumber;
      showGameResult(
        isWinner ? 'You Won! 🎉' : 'You Lost 😔',
        isWinner ? 'Congratulations!' : 'Better luck next time!'
      );
    }
  };

  const handleDisconnect = useCallback(() => {
    setGameStatus(GameStatus.DISCONNECTED);
    Alert.alert(
      'Connection Lost',
      'You have been disconnected from the game.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  }, [navigation]);

  const showGameResult = (title: string, message: string) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Play Again', onPress: handlePlayAgain },
        { text: 'Go Home', onPress: () => navigation.navigate('Home') }
      ]
    );
  };

  const handlePlayAgain = async () => {
    try {
      await nakamaService.leaveMatch();
      const newMatchId = await nakamaService.findMatch();
      if (newMatchId) {
        // Reset game state
        resetGameState();
        // We're already in the game screen, just reset the state
      } else {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error starting new game:', error);
      navigation.navigate('Home');
    }
  };

  const resetGameState = () => {
    setBoard(Array(9).fill(EMPTY_CELL));
    setCurrentPlayer(PLAYER_X);
    setMyPlayerNumber(null);
    setOpponentId(null);
    setGameStatus(GameStatus.WAITING_FOR_OPPONENT);
    setWinner(null);
    setIsDraw(false);
    setIsMyTurn(false);
  };

  const handleCellPress = async (index: number) => {
    if (
      gameStatus !== GameStatus.PLAYING ||
      board[index] !== EMPTY_CELL ||
      !isMyTurn
    ) {
      return;
    }

    try {
      await nakamaService.makeMove(index);
    } catch (error) {
      console.error('Error making move:', error);
      Alert.alert('Error', 'Failed to make move');
    }
  };

  const handleLeaveGame = async () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              await nakamaService.leaveMatch();
              navigation.goBack();
            } catch (error) {
              console.error('Error leaving match:', error);
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  const cleanup = async () => {
    nakamaService.off('matchData', handleMatchData);
    nakamaService.off('disconnect', handleDisconnect);
  };

  const getStatusText = () => {
    switch (gameStatus) {
      case GameStatus.WAITING_FOR_OPPONENT:
        return 'Waiting for opponent...';
      case GameStatus.PLAYING:
        if (isMyTurn) {
          return 'Your turn';
        } else {
          return 'Opponent\'s turn';
        }
      case GameStatus.GAME_OVER:
        if (isDraw) {
          return 'Game ended in a draw';
        } else if (winner === myPlayerNumber) {
          return 'You won!';
        } else {
          return 'You lost';
        }
      case GameStatus.DISCONNECTED:
        return 'Disconnected';
      default:
        return '';
    }
  };

  const getPlayerSymbol = (playerNumber: number) => {
    return playerNumber === PLAYER_X ? '×' : '○';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeaveGame} style={styles.leaveButton}>
          <Text style={styles.leaveButtonText}>← Leave</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tic-Tac-Toe</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.gameContainer}>
        <View style={styles.statusContainer}>
          {gameStatus === GameStatus.WAITING_FOR_OPPONENT ? (
            <ActivityIndicator size="small" color="#3498db" />
          ) : (
            <View style={[
              styles.turnIndicator,
              isMyTurn ? styles.myTurn : styles.opponentTurn
            ]} />
          )}
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {myPlayerNumber && (
          <View style={styles.playerInfo}>
            <Text style={styles.playerText}>
              You are: <Text style={styles.playerSymbol}>
                {getPlayerSymbol(myPlayerNumber)}
              </Text>
            </Text>
          </View>
        )}

        <GameBoard
          board={board}
          onCellPress={handleCellPress}
          disabled={gameStatus !== GameStatus.PLAYING}
          isMyTurn={isMyTurn}
        />

        {gameStatus === GameStatus.PLAYING && (
          <View style={styles.gameInfo}>
            <Text style={styles.currentPlayerText}>
              Current Player: <Text style={styles.playerSymbol}>
                {getPlayerSymbol(currentPlayer)}
              </Text>
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  leaveButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSpacer: {
    width: 60, // Same width as leave button for centering
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  turnIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  myTurn: {
    backgroundColor: '#27ae60',
  },
  opponentTurn: {
    backgroundColor: '#f39c12',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  playerInfo: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playerText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  playerSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  gameInfo: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentPlayerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default GameScreen;