import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function TripsScreen() {
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Поездки" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          Экран «Поездки»
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Здесь позже появится список поездок.
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

