import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function NextPlaceScreen() {
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Экран «Следующее место»
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Здесь позже будет показано следующее место текущей поездки.
        </Text>
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
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

