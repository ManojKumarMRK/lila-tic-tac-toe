// Simplified Nakama types for development
declare namespace nkruntime {
    interface Context {
        userId: string;
        username: string;
        sessionId: string;
    }

    interface Logger {
        info(message: string): void;
        warn(message: string): void;
        error(message: string): void;
        debug(message: string): void;
    }

    interface Nakama {
        matchCreate(module: string, params?: any): string;
        matchList(limit: number, authoritative?: boolean, label?: string, minCount?: number, maxCount?: number, query?: string): any[];
        storageRead(keys: any[]): any[];
        storageWrite(objects: any[]): void;
        leaderboardRecordsList(id: string, owners?: string[], limit?: number, cursor?: string): any;
        leaderboardRecordWrite(id: string, owner: string, username?: string, score?: number, subscore?: number): void;
    }

    interface Initializer {
        registerRpc(id: string, fn: RpcFunction): void;
        registerMatch(name: string, handlers: MatchHandler): void;
        registerAfterAuthenticateDevice(fn: AfterHookFunction<AuthenticateDeviceRequest>): void;
    }

    interface Presence {
        userId: string;
        sessionId: string;
        username: string;
        status: string;
    }

    interface MatchMessage {
        sender: Presence;
        opCode: number;
        data: string;
        reliable: boolean;
    }

    interface MatchDispatcher {
        broadcastMessage(opCode: number, data: string, presences?: Presence[], sender?: Presence, reliable?: boolean): void;
        matchLabelUpdate(label: string): void;
    }

    type MatchState = any;

    type RpcFunction = (ctx: Context, logger: Logger, nk: Nakama, payload: string) => string;
    
    type MatchInitFunction = (ctx: Context, logger: Logger, nk: Nakama, params: {[key: string]: string}) => {state: MatchState, tickRate: number, label: string};
    
    type MatchJoinAttemptFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, presence: Presence, metadata: {[key: string]: any}) => {state: MatchState, accept: boolean, rejectMessage?: string} | null;
    
    type MatchJoinFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, presences: Presence[]) => {state: MatchState} | null;
    
    type MatchLeaveFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, presences: Presence[]) => {state: MatchState} | null;
    
    type MatchLoopFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, messages: MatchMessage[]) => {state: MatchState} | null;
    
    type MatchSignalFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, data: string) => {state: MatchState, data?: string} | null;
    
    type MatchTerminateFunction = (ctx: Context, logger: Logger, nk: Nakama, dispatcher: MatchDispatcher, tick: number, state: MatchState, graceSeconds: number) => {state: MatchState} | null;

    interface MatchHandler {
        matchInit: MatchInitFunction;
        matchJoinAttempt: MatchJoinAttemptFunction;
        matchJoin: MatchJoinFunction;
        matchLeave: MatchLeaveFunction;
        matchLoop: MatchLoopFunction;
        matchSignal: MatchSignalFunction;
        matchTerminate: MatchTerminateFunction;
    }

    type AfterHookFunction<T> = (ctx: Context, logger: Logger, nk: Nakama, data: T) => void;

    interface AuthenticateDeviceRequest {
        id: string;
        create?: boolean;
        username?: string;
    }
}