import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { PLAYER_X, PLAYER_O, EMPTY_CELL } from '../types';

interface GameBoardProps {
  board: number[];
  onCellPress: (index: number) => void;
  disabled: boolean;
  isMyTurn: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  onCellPress, 
  disabled,
  isMyTurn 
}) => {
  const renderCell = (index: number) => {
    const value = board[index];
    let symbol = '';
    let symbolStyle = {};

    if (value === PLAYER_X) {
      symbol = '×';
      symbolStyle = styles.xSymbol;
    } else if (value === PLAYER_O) {
      symbol = '○';
      symbolStyle = styles.oSymbol;
    }

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.cell,
          value !== EMPTY_CELL && styles.cellFilled,
          !isMyTurn && styles.cellDisabled
        ]}
        onPress={() => onCellPress(index)}
        disabled={disabled || value !== EMPTY_CELL || !isMyTurn}
      >
        <Text style={[styles.symbol, symbolStyle]}>{symbol}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {Array.from({ length: 9 }, (_, index) => renderCell(index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 3,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cell: {
    width: '33.33%',
    height: '33.33%',
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  cellFilled: {
    backgroundColor: '#e8f4f8',
  },
  cellDisabled: {
    opacity: 0.6,
  },
  symbol: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  xSymbol: {
    color: '#e74c3c',
  },
  oSymbol: {
    color: '#3498db',
  },
});

export default GameBoard;