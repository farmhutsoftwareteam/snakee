import React from 'react';
import { View, StyleSheet } from 'react-native';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type Position = { x: number; y: number };

interface SnakeProps {
  segments: Position[];
  cellSize: number;
  isGameOver?: boolean;
  headColor?: string;
  bodyColor?: string;
}

const Snake: React.FC<SnakeProps> = ({
  segments,
  cellSize,
  isGameOver = false,
  headColor = '#00FF00',
  bodyColor = '#00DD00'
}) => {
  return (
    <>
      {segments.map((segment, index) => (
        <View
          key={index}
          style={[
            styles.snakeSegment,
            {
              left: segment.x * cellSize,
              top: segment.y * cellSize,
              width: cellSize - 1,
              height: cellSize - 1,
              backgroundColor: index === 0 ? headColor : bodyColor,
              opacity: isGameOver ? 0.5 : 1
            }
          ]}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  snakeSegment: {
    borderRadius: 2,
    position: 'absolute',
  }
});

export default Snake;

// Utility functions for snake movement
export const moveSnake = (
  snake: Position[],
  direction: Direction,
  gridSize: number,
  hasEaten: boolean = false
): Position[] => {
  // Calculate new head position
  const head = snake[0];
  let newHead: Position;

  switch (direction) {
    case 'up':
      newHead = { x: head.x, y: (head.y - 1 + gridSize) % gridSize };
      break;
    case 'down':
      newHead = { x: head.x, y: (head.y + 1) % gridSize };
      break;
    case 'left':
      newHead = { x: (head.x - 1 + gridSize) % gridSize, y: head.y };
      break;
    case 'right':
      newHead = { x: (head.x + 1) % gridSize, y: head.y };
      break;
  }

  // Create new snake
  const newSnake = [newHead, ...snake];

  // If no food was eaten, remove tail
  if (!hasEaten) {
    newSnake.pop();
  }

  return newSnake;
};

export const checkSelfCollision = (snake: Position[]): boolean => {
  const head = snake[0];
  return snake.some((segment, index) =>
    index !== 0 && segment.x === head.x && segment.y === head.y
  );
};

export const checkFoodCollision = (head: Position, food: Position): boolean => {
  return head.x === food.x && head.y === food.y;
};

export const getRandomPosition = (gridSize: number, exclude: Position[] = []): Position => {
  let position: Position;
  let isValid = false;

  while (!isValid) {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };

    isValid = !exclude.some(pos => pos.x === position.x && pos.y === position.y);
    
    if (isValid) return position;
  }

  // Fallback (should never reach here if gridSize > snake length)
  return { x: 0, y: 0 };
};