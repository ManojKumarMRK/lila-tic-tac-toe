// Game types
export interface GameState {
  board: number[];
  currentPlayer: number;
  players: { [userId: string]: number };
  winner: number | null;
  gameOver: boolean;
}

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  rating: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
}

export interface MatchData {
  type: string;
  board?: number[];
  currentPlayer?: number;
  position?: number;
  player?: number;
  winner?: number | null;
  players?: { [userId: string]: number };
  draw?: boolean;
  reason?: string;
}

// Game constants
export const PLAYER_X = 1;
export const PLAYER_O = 2;
export const EMPTY_CELL = 0;

// Game status
export enum GameStatus {
  WAITING_FOR_OPPONENT = 'waiting_for_opponent',
  PLAYING = 'playing',
  GAME_OVER = 'game_over',
  DISCONNECTED = 'disconnected'
}

// Screen navigation types
export type RootStackParamList = {
  Home: undefined;
  Game: { matchId: string };
  Leaderboard: undefined;
  Stats: undefined;
};

export interface GameResult {
  winner: number | null;
  isDraw: boolean;
  winnerUserId?: string;
}