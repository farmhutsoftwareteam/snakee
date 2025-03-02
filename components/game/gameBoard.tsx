import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Snake, { Position, Direction } from './snake';
import Food, { FoodType } from './food';

interface GameBoardProps {
  gridSize: number;
  cellSize: number;
  snake: Position[];
  food?: {
    position: Position;
    type: FoodType;
    value: number;
  };
  isGameOver?: boolean;
  isDemo?: boolean; // Flag to indicate if this is the demo on start screen
}

const GameBoard: React.FC<GameBoardProps> = ({
  gridSize,
  cellSize,
  snake,
  food,
  isGameOver = false,
  isDemo = false
}) => {
  // Calculate board dimensions
  const boardWidth = gridSize * cellSize;
  const boardHeight = gridSize * cellSize;

  return (
    <View 
      style={[
        styles.board, 
        {
          width: boardWidth,
          height: boardHeight,
          opacity: isDemo ? 0.4 : 1
        }
      ]}
    >
      {/* Render grid lines for visual reference (optional) */}
      {!isDemo && Array.from({ length: gridSize + 1 }).map((_, index) => (
        <React.Fragment key={`grid-${index}`}>
          {/* Horizontal lines */}
          <View 
            style={[
              styles.gridLine, 
              styles.horizontalLine, 
              { 
                top: index * cellSize,
                width: boardWidth 
              }
            ]} 
          />
          {/* Vertical lines */}
          <View 
            style={[
              styles.gridLine, 
              styles.verticalLine, 
              { 
                left: index * cellSize,
                height: boardHeight 
              }
            ]} 
          />
        </React.Fragment>
      ))}

      {/* Render food if provided */}
      {food && (
        <Food 
          position={food.position}
          cellSize={cellSize}
          type={food.type}
        />
      )}
      
      {/* Render snake */}
      <Snake 
        segments={snake} 
        cellSize={cellSize} 
        isGameOver={isGameOver}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#001800',
    borderWidth: 2,
    borderColor: '#00FF00',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  horizontalLine: {
    height: 1,
  },
  verticalLine: {
    width: 1,
  }
});

export default GameBoard;