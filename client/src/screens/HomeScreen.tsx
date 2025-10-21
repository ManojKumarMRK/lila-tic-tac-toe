import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import nakamaService from '../services/NakamaService';
import { RootStackParamList, PlayerStats } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    initializeNakama();
    return () => {
      nakamaService.disconnect();
    };
  }, []);

  const initializeNakama = async () => {
    setIsConnecting(true);
    try {
      const success = await nakamaService.initialize();
      setIsConnected(success);
      
      if (success) {
        loadPlayerStats();
      } else {
        Alert.alert('Connection Error', 'Failed to connect to game server');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize game client');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadPlayerStats = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await nakamaService.getPlayerStats();
      setPlayerStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleFindMatch = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please wait for connection to establish');
      return;
    }

    setIsConnecting(true);
    try {
      const matchId = await nakamaService.findMatch();
      if (matchId) {
        navigation.navigate('Game', { matchId });
      } else {
        Alert.alert('Error', 'Failed to find or create a match');
      }
    } catch (error) {
      console.error('Find match error:', error);
      Alert.alert('Error', 'Failed to find match');
    } finally {
      setIsConnecting(false);
    }
  };

  const renderStats = () => {
    if (isLoadingStats) {
      return <ActivityIndicator size="small" color="#3498db" />;
    }

    if (playerStats) {
      const winRate = playerStats.totalGames > 0 
        ? ((playerStats.wins / playerStats.totalGames) * 100).toFixed(1)
        : '0.0';

      return (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Rating:</Text>
            <Text style={styles.statValue}>{playerStats.rating}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Games:</Text>
            <Text style={styles.statValue}>{playerStats.totalGames}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Win Rate:</Text>
            <Text style={styles.statValue}>{winRate}%</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{playerStats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{playerStats.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{playerStats.draws}</Text>
              <Text style={styles.statLabel}>Draws</Text>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Lila Tic-Tac-Toe</Text>
        <Text style={styles.subtitle}>Multiplayer Battle Arena</Text>

        {renderStats()}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.playButton,
              (!isConnected || isConnecting) && styles.buttonDisabled
            ]}
            onPress={handleFindMatch}
            disabled={!isConnected || isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.playButtonText}>
                {isConnected ? 'Find Match' : 'Connecting...'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              !isConnected && styles.buttonDisabled
            ]}
            onPress={() => navigation.navigate('Leaderboard')}
            disabled={!isConnected}
          >
            <Text style={styles.secondaryButtonText}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              !isConnected && styles.buttonDisabled
            ]}
            onPress={() => navigation.navigate('Stats')}
            disabled={!isConnected}
          >
            <Text style={styles.secondaryButtonText}>Detailed Stats</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator,
            isConnected ? styles.statusConnected : styles.statusDisconnected
          ]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 15,
  },
  playButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  secondaryButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: '#27ae60',
  },
  statusDisconnected: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default HomeScreen;