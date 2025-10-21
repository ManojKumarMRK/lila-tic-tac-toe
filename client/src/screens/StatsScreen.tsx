import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import nakamaService from '../services/NakamaService';
import { PlayerStats } from '../types';

const StatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const playerStats = await nakamaService.getPlayerStats();
      setStats(playerStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWinRate = () => {
    if (!stats || stats.totalGames === 0) return 0;
    return ((stats.wins / stats.totalGames) * 100);
  };

  const calculateLossRate = () => {
    if (!stats || stats.totalGames === 0) return 0;
    return ((stats.losses / stats.totalGames) * 100);
  };

  const calculateDrawRate = () => {
    if (!stats || stats.totalGames === 0) return 0;
    return ((stats.draws / stats.totalGames) * 100);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 1200) return '#27ae60';
    if (rating >= 1000) return '#f39c12';
    return '#e74c3c';
  };

  const getRatingTier = (rating: number) => {
    if (rating >= 1500) return 'Master';
    if (rating >= 1300) return 'Expert';
    if (rating >= 1100) return 'Advanced';
    if (rating >= 900) return 'Intermediate';
    return 'Beginner';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Player Stats</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Player Stats</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load stats</Text>
          <TouchableOpacity onPress={loadStats} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Player Stats</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Rating Card */}
        <View style={styles.ratingCard}>
          <Text style={styles.cardTitle}>Current Rating</Text>
          <Text style={[styles.ratingValue, { color: getRatingColor(stats.rating) }]}>
            {stats.rating}
          </Text>
          <Text style={styles.ratingTier}>{getRatingTier(stats.rating)}</Text>
        </View>

        {/* Games Overview */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Games Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalGames}</Text>
              <Text style={styles.statLabel}>Total Games</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#27ae60' }]}>{stats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#e74c3c' }]}>{stats.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#f39c12' }]}>{stats.draws}</Text>
              <Text style={styles.statLabel}>Draws</Text>
            </View>
          </View>
        </View>

        {/* Win Rate Analysis */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Performance Analysis</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Win Rate</Text>
              <Text style={styles.progressValue}>{calculateWinRate().toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${calculateWinRate()}%`, backgroundColor: '#27ae60' }
                ]} 
              />
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Loss Rate</Text>
              <Text style={styles.progressValue}>{calculateLossRate().toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${calculateLossRate()}%`, backgroundColor: '#e74c3c' }
                ]} 
              />
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Draw Rate</Text>
              <Text style={styles.progressValue}>{calculateDrawRate().toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${calculateDrawRate()}%`, backgroundColor: '#f39c12' }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Achievement Goals */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Next Goals</Text>
          <View style={styles.goalsList}>
            {stats.totalGames < 10 && (
              <Text style={styles.goalText}>🎯 Play 10 games ({stats.totalGames}/10)</Text>
            )}
            {stats.wins < 5 && (
              <Text style={styles.goalText}>🏆 Win 5 games ({stats.wins}/5)</Text>
            )}
            {stats.rating < 1100 && (
              <Text style={styles.goalText}>⭐ Reach 1100 rating ({stats.rating}/1100)</Text>
            )}
            {stats.rating < 1300 && stats.rating >= 1100 && (
              <Text style={styles.goalText}>🚀 Reach Expert tier (1300 rating)</Text>
            )}
            {calculateWinRate() < 60 && stats.totalGames >= 5 && (
              <Text style={styles.goalText}>📈 Achieve 60% win rate</Text>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={loadStats} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Refresh Stats</Text>
        </TouchableOpacity>
      </ScrollView>
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingTier: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '22%',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalsList: {
    gap: 10,
  },
  goalText: {
    fontSize: 14,
    color: '#2c3e50',
    paddingVertical: 4,
  },
  refreshButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StatsScreen;