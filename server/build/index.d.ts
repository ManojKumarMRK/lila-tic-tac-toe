/**
 * Lila Tic-Tac-Toe Nakama Server Runtime
 *
 * This file serves as the entry point for the Nakama server runtime.
 * It initializes all the game logic, RPC functions, and match handlers.
 */
interface GameState {
    board: number[];
    currentPlayer: number;
    players: {
        [userId: string]: number;
    };
    winner: number | null;
    gameOver: boolean;
    startTime: number;
}
interface PlayerMove {
    position: number;
}
declare const BOARD_SIZE = 9;
declare const PLAYER_1 = 1;
declare const PLAYER_2 = 2;
declare const EMPTY_CELL = 0;
declare const MatchLabel: {
    OPEN: string;
    PLAYING: string;
};
declare function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer): void;
/**
 * RPC: Find Match
 * Creates or joins a Tic-Tac-Toe match
 */
declare const rpcFindMatch: nkruntime.RpcFunction;
/**
 * RPC: Get Leaderboard
 * Retrieves the current leaderboard standings
 */
declare const rpcGetLeaderboard: nkruntime.RpcFunction;
/**
 * RPC: Get Player Stats
 * Retrieves player statistics
 */
declare const rpcGetPlayerStats: nkruntime.RpcFunction;
/**
 * Match Init: Initialize a new match
 */
declare const matchInit: nkruntime.MatchInitFunction;
/**
 * Match Join Attempt: Validate if a player can join
 */
declare const matchJoinAttempt: nkruntime.MatchJoinAttemptFunction;
/**
 * Match Join: Handle player joining the match
 */
declare const matchJoin: nkruntime.MatchJoinFunction;
/**
 * Match Leave: Handle player leaving the match
 */
declare const matchLeave: nkruntime.MatchLeaveFunction;
/**
 * Match Loop: Main game loop
 */
declare const matchLoop: nkruntime.MatchLoopFunction;
/**
 * Match Signal: Handle external signals
 */
declare const matchSignal: nkruntime.MatchSignalFunction;
/**
 * Match Terminate: Clean up when match ends
 */
declare const matchTerminate: nkruntime.MatchTerminateFunction;
/**
 * Process a player move
 */
declare function processPlayerMove(gameState: GameState, userId: string, position: number, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher): Partial<GameState> | null;
/**
 * Check for winner
 */
declare function checkWinner(board: number[]): number | null;
/**
 * Update player statistics after game
 */
declare function updatePlayerStats(gameState: GameState, nk: nkruntime.Nakama, logger: nkruntime.Logger): void;
/**
 * Hook: After Device Authentication
 * Initialize player data when they first authenticate
 */
declare const afterAuthenticateDevice: nkruntime.AfterHookFunction<nkruntime.AuthenticateDeviceRequest>;
//# sourceMappingURL=index.d.ts.map