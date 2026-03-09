import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Appbar, Button } from 'react-native-paper';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

