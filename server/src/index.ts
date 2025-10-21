/**
 * Lila Tic-Tac-Toe Nakama Server Runtime
 * 
 * This file serves as the entry point for the Nakama server runtime.
 * It initializes all the game logic, RPC functions, and match handlers.
 */

// Game state interfaces
interface GameState {
    board: number[];
    currentPlayer: number;
    players: { [userId: string]: number };
    winner: number | null;
    gameOver: boolean;
    startTime: number;
}

interface PlayerMove {
    position: number;
}

// Game constants
const BOARD_SIZE = 9;
const PLAYER_1 = 1; // X
const PLAYER_2 = 2; // O
const EMPTY_CELL = 0;

// Match labels
const MatchLabel = {
    OPEN: 'open',
    PLAYING: 'playing'
};

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    logger.info('🎮 Initializing Lila Tic-Tac-Toe Server Runtime');

    // Register RPC functions
    initializer.registerRpc('find_match', rpcFindMatch);
    initializer.registerRpc('get_leaderboard', rpcGetLeaderboard);
    initializer.registerRpc('get_player_stats', rpcGetPlayerStats);

    // Register match handler
    initializer.registerMatch('tic_tac_toe', {
        matchInit,
        matchJoinAttempt,
        matchJoin,
        matchLeave,
        matchLoop,
        matchSignal,
        matchTerminate
    });

    // Register hooks
    initializer.registerAfterAuthenticateDevice(afterAuthenticateDevice);

    logger.info('✅ Server runtime initialization complete');
}

/**
 * RPC: Find Match
 * Creates or joins a Tic-Tac-Toe match
 */
const rpcFindMatch: nkruntime.RpcFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
    logger.info('🔍 Finding match for user: ' + ctx.userId);

    const query = `+label.mode:tic_tac_toe +label.status:${MatchLabel.OPEN}`;
    const matches = nk.matchList(10, true, undefined, undefined, 1, query);
    
    if (matches.length > 0) {
        // Join existing match
        const match = matches[0];
        logger.info('🔗 Joining existing match: ' + match.matchId);
        return JSON.stringify({ matchIds: [match.matchId] });
    } else {
        // Create new match
        const matchId = nk.matchCreate('tic_tac_toe', {});
        logger.info('🆕 Created new match: ' + matchId);
        return JSON.stringify({ matchIds: [matchId] });
    }
};

/**
 * RPC: Get Leaderboard
 * Retrieves the current leaderboard standings
 */
const rpcGetLeaderboard: nkruntime.RpcFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
    const leaderboardId = 'global_leaderboard';
    const limit = 20;
    
    try {
        const records = nk.leaderboardRecordsList(leaderboardId, [], limit);
        return JSON.stringify({ leaderboard: records });
    } catch (error: any) {
        logger.error('Error fetching leaderboard: ' + error.message);
        return JSON.stringify({ error: 'Failed to fetch leaderboard' });
    }
};

/**
 * RPC: Get Player Stats
 * Retrieves player statistics
 */
const rpcGetPlayerStats: nkruntime.RpcFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) {
    try {
        const objects = nk.storageRead([{
            collection: 'player_stats',
            key: 'stats',
            userId: ctx.userId
        }]);

        if (objects.length > 0) {
            return objects[0].value;
        } else {
            // Return default stats if none exist
            const defaultStats = {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0,
                rating: 1000
            };
            return JSON.stringify(defaultStats);
        }
    } catch (error: any) {
        logger.error('Error fetching player stats: ' + error.message);
        return JSON.stringify({ error: 'Failed to fetch player stats' });
    }
};

/**
 * Match Init: Initialize a new match
 */
const matchInit: nkruntime.MatchInitFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}): {state: nkruntime.MatchState, tickRate: number, label: string} {
    logger.info('🎲 Initializing new Tic-Tac-Toe match');

    const gameState: GameState = {
        board: new Array(BOARD_SIZE).fill(EMPTY_CELL),
        currentPlayer: PLAYER_1,
        players: {},
        winner: null,
        gameOver: false,
        startTime: Date.now()
    };

    const label = JSON.stringify({
        mode: 'tic_tac_toe',
        status: MatchLabel.OPEN
    });

    return {
        state: gameState,
        tickRate: 10, // 10 FPS
        label: label
    };
};

/**
 * Match Join Attempt: Validate if a player can join
 */
const matchJoinAttempt: nkruntime.MatchJoinAttemptFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presence: nkruntime.Presence, metadata: {[key: string]: any}): {state: nkruntime.MatchState, accept: boolean, rejectMessage?: string} | null {
    const gameState = state as GameState;
    const playerCount = Object.keys(gameState.players).length;

    if (playerCount >= 2) {
        return {
            state: gameState,
            accept: false,
            rejectMessage: 'Match is full'
        };
    }

    if (gameState.gameOver) {
        return {
            state: gameState,
            accept: false,
            rejectMessage: 'Game has ended'
        };
    }

    return {
        state: gameState,
        accept: true
    };
};

/**
 * Match Join: Handle player joining the match
 */
const matchJoin: nkruntime.MatchJoinFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]): {state: nkruntime.MatchState} | null {
    const gameState = state as GameState;
    
    presences.forEach(presence => {
        const playerNumber = Object.keys(gameState.players).length + 1;
        gameState.players[presence.userId] = playerNumber;
        
        logger.info(`👤 Player ${playerNumber} joined: ${presence.userId}`);
    });

    // Start game if we have 2 players
    if (Object.keys(gameState.players).length === 2) {
        gameState.startTime = Date.now();
        
        // Update match label to playing
        const label = JSON.stringify({
            mode: 'tic_tac_toe',
            status: MatchLabel.PLAYING
        });
        dispatcher.matchLabelUpdate(label);

        // Send game start message
        const gameStartMessage = {
            type: 'game_start',
            players: gameState.players,
            currentPlayer: gameState.currentPlayer,
            board: gameState.board
        };

        dispatcher.broadcastMessage(1, JSON.stringify(gameStartMessage));
        logger.info('🚀 Game started with 2 players');
    }

    return { state: gameState };
};

/**
 * Match Leave: Handle player leaving the match
 */
const matchLeave: nkruntime.MatchLeaveFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]): {state: nkruntime.MatchState} | null {
    const gameState = state as GameState;

    presences.forEach(presence => {
        delete gameState.players[presence.userId];
        logger.info(`👋 Player left: ${presence.userId}`);
    });

    // End game if a player leaves during gameplay
    if (Object.keys(gameState.players).length < 2 && !gameState.gameOver) {
        gameState.gameOver = true;
        
        const gameEndMessage = {
            type: 'game_end',
            reason: 'player_left',
            winner: null
        };

        dispatcher.broadcastMessage(3, JSON.stringify(gameEndMessage));
    }

    return { state: gameState };
};

/**
 * Match Loop: Main game loop
 */
const matchLoop: nkruntime.MatchLoopFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]): {state: nkruntime.MatchState} | null {
    const gameState = state as GameState;

    // Process player moves
    messages.forEach(message => {
        if (message.opCode === 4) { // Player move
            try {
                const moveData: PlayerMove = JSON.parse(message.data);
                const result = processPlayerMove(gameState, message.sender.userId, moveData.position, logger, nk, dispatcher);
                if (result) {
                    Object.assign(gameState, result);
                }
            } catch (error: any) {
                logger.error('Error processing move: ' + error.message);
            }
        }
    });

    return { state: gameState };
};

/**
 * Match Signal: Handle external signals
 */
const matchSignal: nkruntime.MatchSignalFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, data: string): {state: nkruntime.MatchState, data?: string} | null {
    const gameState = state as GameState;
    logger.info('📡 Match signal received: ' + data);
    
    return { state: gameState };
};

/**
 * Match Terminate: Clean up when match ends
 */
const matchTerminate: nkruntime.MatchTerminateFunction = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, graceSeconds: number): {state: nkruntime.MatchState} | null {
    const gameState = state as GameState;
    logger.info('🏁 Match terminated');
    
    return { state: gameState };
};

/**
 * Process a player move
 */
function processPlayerMove(gameState: GameState, userId: string, position: number, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher): Partial<GameState> | null {
    // Validate move
    if (gameState.gameOver) {
        return null;
    }

    if (position < 0 || position >= BOARD_SIZE) {
        return null;
    }

    if (gameState.board[position] !== EMPTY_CELL) {
        return null;
    }

    const playerNumber = gameState.players[userId];
    if (!playerNumber || playerNumber !== gameState.currentPlayer) {
        return null;
    }

    // Make move
    gameState.board[position] = playerNumber;
    
    // Check for winner
    const winner = checkWinner(gameState.board);
    if (winner) {
        gameState.winner = winner;
        gameState.gameOver = true;
        
        // Update player stats
        updatePlayerStats(gameState, nk, logger);
        
        const gameEndMessage = {
            type: 'game_end',
            board: gameState.board,
            winner: winner,
            players: gameState.players
        };
        
        dispatcher.broadcastMessage(3, JSON.stringify(gameEndMessage));
        logger.info(`🏆 Game ended, winner: Player ${winner}`);
    } else if (gameState.board.every(cell => cell !== EMPTY_CELL)) {
        // Draw
        gameState.gameOver = true;
        
        updatePlayerStats(gameState, nk, logger);
        
        const gameEndMessage = {
            type: 'game_end',
            board: gameState.board,
            winner: null,
            players: gameState.players,
            draw: true
        };
        
        dispatcher.broadcastMessage(3, JSON.stringify(gameEndMessage));
        logger.info('🤝 Game ended in a draw');
    } else {
        // Continue game
        gameState.currentPlayer = gameState.currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
        
        const moveMessage = {
            type: 'move',
            board: gameState.board,
            currentPlayer: gameState.currentPlayer,
            position: position,
            player: playerNumber
        };
        
        dispatcher.broadcastMessage(2, JSON.stringify(moveMessage));
    }

    return gameState;
}

/**
 * Check for winner
 */
function checkWinner(board: number[]): number | null {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] !== EMPTY_CELL && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return null;
}

/**
 * Update player statistics after game
 */
function updatePlayerStats(gameState: GameState, nk: nkruntime.Nakama, logger: nkruntime.Logger) {
    Object.keys(gameState.players).forEach(userId => {
        try {
            const objects = nk.storageRead([{
                collection: 'player_stats',
                key: 'stats',
                userId: userId
            }]);

            let stats = {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0,
                rating: 1000
            };

            if (objects.length > 0) {
                stats = JSON.parse(objects[0].value);
            }

            const playerNumber = gameState.players[userId];
            stats.totalGames++;

            if (gameState.winner === playerNumber) {
                stats.wins++;
                stats.rating += 25; // ELO increase for win
            } else if (gameState.winner === null) {
                stats.draws++;
                // Rating unchanged for draw
            } else {
                stats.losses++;
                stats.rating = Math.max(100, stats.rating - 15); // ELO decrease for loss, minimum 100
            }

            // Save updated stats
            nk.storageWrite([{
                collection: 'player_stats',
                key: 'stats',
                userId: userId,
                value: stats
            }]);

            // Update leaderboard
            nk.leaderboardRecordWrite('global_leaderboard', userId, undefined, stats.rating, stats.rating);

        } catch (error: any) {
            logger.error(`Error updating stats for ${userId}: ` + error.message);
        }
    });
}

/**
 * Hook: After Device Authentication
 * Initialize player data when they first authenticate
 */
const afterAuthenticateDevice: nkruntime.AfterHookFunction<nkruntime.AuthenticateDeviceRequest> = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, data: nkruntime.AuthenticateDeviceRequest) {
    logger.info('👤 User authenticated: ' + ctx.userId);
    
    // Initialize player stats if they don't exist
    try {
        const objects = nk.storageRead([{
            collection: 'player_stats',
            key: 'stats',
            userId: ctx.userId
        }]);

        if (objects.length === 0) {
            const initialStats = {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0,
                rating: 1000,
                createdAt: Date.now()
            };

            nk.storageWrite([{
                collection: 'player_stats',
                key: 'stats',
                userId: ctx.userId,
                value: initialStats
            }]);

            // Initialize leaderboard entry
            nk.leaderboardRecordWrite('global_leaderboard', ctx.userId, undefined, 1000, 1000);

            logger.info('📊 Initialized stats for new player: ' + ctx.userId);
        }
    } catch (error: any) {
        logger.error('Error initializing player stats: ' + error.message);
    }
};

// Export the initialization function
// @ts-ignore
!InitModule && InitModule.bind(null);