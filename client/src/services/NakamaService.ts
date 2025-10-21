import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  rating: number;
}

export interface GameState {
  board: number[];
  currentPlayer: number;
  players: { [userId: string]: number };
  winner: number | null;
  gameOver: boolean;
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

class NakamaService {
  private client: Client | null = null;
  private session: Session | null = null;
  private socket: Socket | null = null;
  private matchId: string | null = null;
  private listeners: { [key: string]: Function[] } = {};

  // Configuration
  private readonly serverKey = 'defaultkey';
  private readonly host = this.getServerHost(); // Dynamic host based on environment
  private readonly port = '7350';
  private readonly useSSL = false;

  /**
   * Get the appropriate server host based on platform
   */
  private getServerHost(): string {
    // Check if running on web
    if (typeof window !== 'undefined') {
      return '127.0.0.1'; // Web can use localhost
    }
    
    // For mobile devices, use the network IP
    return '192.168.31.242';
  }

  /**
   * Initialize the Nakama client and authenticate
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔧 Initializing Nakama client...');
      console.log(`📡 Connecting to: ${this.useSSL ? 'https' : 'http'}://${this.host}:${this.port}`);
      
      // Create client
      this.client = new Client(this.serverKey, this.host, this.port, this.useSSL);

      // Get or create device ID
      let deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem('deviceId', deviceId);
      }

      // Authenticate
      this.session = await this.client.authenticateDevice(deviceId, true);
      
      // Store user ID
      if (this.session.user_id) {
        await AsyncStorage.setItem('userId', this.session.user_id);
      }

      // Create socket connection
      this.socket = this.client.createSocket(this.useSSL, false);
      await this.socket.connect(this.session, true);

      // Setup socket event handlers
      this.setupSocketHandlers();

      console.log('🎮 Nakama initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Nakama:', error);
      return false;
    }
  }

  /**
   * Generate a unique device ID
   */
  private generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Setup socket event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.onmatchdata = (data) => {
      this.emit('matchData', data);
    };

    this.socket.onmatchmakermatched = (matched) => {
      this.emit('matchmakerMatched', matched);
    };

    this.socket.ondisconnect = () => {
      console.log('🔌 Socket disconnected');
      this.emit('disconnect');
    };

    this.socket.onerror = (error) => {
      console.error('🚨 Socket error:', error);
      this.emit('error', error);
    };
  }

  /**
   * Find or create a match
   */
  async findMatch(): Promise<string | null> {
    try {
      if (!this.client || !this.session) {
        throw new Error('Client not initialized');
      }

      const result = await this.client.rpc(this.session, 'find_match', {});
      const response = JSON.parse(result.payload as any);
      
      if (response.matchIds && response.matchIds.length > 0) {
        this.matchId = response.matchIds[0];
        
        if (this.socket && this.matchId) {
          await this.socket.joinMatch(this.matchId);
          console.log('🎯 Joined match:', this.matchId);
        }
        
        return this.matchId;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to find match:', error);
      return null;
    }
  }

  /**
   * Make a move in the current match
   */
  async makeMove(position: number): Promise<boolean> {
    try {
      if (!this.socket || !this.matchId) {
        throw new Error('No active match');
      }

      const moveData = JSON.stringify({ position });
      await this.socket.sendMatchState(this.matchId, 4, moveData);
      console.log('📤 Move sent:', position);
      return true;
    } catch (error) {
      console.error('❌ Failed to make move:', error);
      return false;
    }
  }

  /**
   * Leave the current match
   */
  async leaveMatch(): Promise<void> {
    try {
      if (this.socket && this.matchId) {
        await this.socket.leaveMatch(this.matchId);
        this.matchId = null;
        console.log('👋 Left match');
      }
    } catch (error) {
      console.error('❌ Failed to leave match:', error);
    }
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(): Promise<PlayerStats | null> {
    try {
      if (!this.client || !this.session) {
        throw new Error('Client not initialized');
      }

      const result = await this.client.rpc(this.session, 'get_player_stats', {});
      return JSON.parse(result.payload as any);
    } catch (error) {
      console.error('❌ Failed to get player stats:', error);
      return null;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(): Promise<any[] | null> {
    try {
      if (!this.client || !this.session) {
        throw new Error('Client not initialized');
      }

      const result = await this.client.rpc(this.session, 'get_leaderboard', {});
      const response = JSON.parse(result.payload as any);
      return response.leaderboard || [];
    } catch (error) {
      console.error('❌ Failed to get leaderboard:', error);
      return null;
    }
  }

  /**
   * Get current user information
   */
  getUserId(): string | null {
    return this.session?.user_id || null;
  }

  /**
   * Get current match ID
   */
  getMatchId(): string | null {
    return this.matchId;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return !!this.socket;
  }

  /**
   * Event listener system
   */
  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Cleanup resources
   */
  async disconnect(): Promise<void> {
    try {
      if (this.socket) {
        this.socket.disconnect(true);
        this.socket = null;
      }
      this.client = null;
      this.session = null;
      this.matchId = null;
      this.listeners = {};
      console.log('🔌 Disconnected from Nakama');
    } catch (error) {
      console.error('❌ Error during disconnect:', error);
    }
  }
}

// Export singleton instance
export const nakamaService = new NakamaService();
export default nakamaService;