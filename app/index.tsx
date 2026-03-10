import { ImageBackground, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Appbar, Button } from 'react-native-paper';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/background/gonext-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="GoNext" />
        </Appbar.Header>
        <View style={styles.content}>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push('/places')}
        >
          Места
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push('/trips')}
        >
          Поездки
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push('/next')}
        >
          Следующее место
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push('/settings')}
        >
          Настройки
        </Button>
      </View>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 16,
    paddingHorizontal: 24,
  },
  button: {
    alignSelf: 'stretch',
  },
});

