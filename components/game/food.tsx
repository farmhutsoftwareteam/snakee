import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Position } from './snake';

export type FoodType = 'regular' | 'bonus' | 'speed' | 'slow' | 'danger';

interface FoodProps {
  position: Position;
  cellSize: number;
  type?: FoodType;
  value?: number;
}

const Food: React.FC<FoodProps> = ({
  position,
  cellSize,
  type = 'regular',
  value = 1
}) => {
  // For uniformity, make food the same shape as snake segments
  return (
    <View
      style={[
        styles.food,
        {
          left: position.x * cellSize,
          top: position.y * cellSize,
          width: cellSize - 1,
          height: cellSize - 1,
          backgroundColor: '#FF0000', // Red color to distinguish from snake
          borderRadius: 2, // Same border radius as snake segments
        }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  food: {
    position: 'absolute',
  }
});

export default Food;

// Utility functions for food
export const generateFood = (
  gridSize: number, 
  snake: Position[], 
  type: FoodType = 'regular'
): { position: Position, type: FoodType, value: number } => {
  // Generate random position
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (snake.some(segment => segment.x === position.x && segment.y === position.y));

  // Determine value based on type
  let value = 1;
  switch (type) {
    case 'bonus':
      value = 3;
      break;
    case 'speed':
    case 'slow':
      value = 2;
      break;
    case 'danger':
      value = -1;
      break;
    default:
      value = 1;
  }

  return { position, type, value };
};