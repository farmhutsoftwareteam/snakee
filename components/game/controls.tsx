// components/game/Controls.tsx
import React from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent } from 'react-native';
import { Direction } from '../../types/index';

interface ControlsProps {
  onDirectionChange: (direction: Direction) => void;
  currentDirection: Direction;
}

const Controls: React.FC<ControlsProps> = ({ onDirectionChange, currentDirection }) => {
  // Create pan responder for swipe controls
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt: GestureResponderEvent, gestureState: any) => {
      const { dx, dy } = gestureState;
      
      // Only trigger direction change on significant movement
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        let newDirection: Direction;
        
        // Determine swipe direction
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          newDirection = dx > 0 ? 'right' : 'left';
        } else {
          // Vertical swipe
          newDirection = dy > 0 ? 'down' : 'up';
        }
        
        // Prevent 180-degree turns
        const opposites: Record<Direction, Direction> = {
          'up': 'down',
          'down': 'up',
          'left': 'right',
          'right': 'left'
        };
        
        if (newDirection !== opposites[currentDirection]) {
          onDirectionChange(newDirection);
        }
      }
    }
  });
  
  return (
    <View 
      style={styles.container}
      {...panResponder.panHandlers}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  }
});

export default Controls;