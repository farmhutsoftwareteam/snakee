import { View, StyleSheet, Text } from "react-native";
import { useState } from "react";
import StartGameScreen from "../components/home/startGame";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
    // We'll implement the actual game in the next steps
  };

  return (
    <View style={styles.container}>
      {!gameStarted ? (
        <StartGameScreen onStartGame={handleStartGame} />
      ) : (
        <View>
          <Text>Game will go here</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
