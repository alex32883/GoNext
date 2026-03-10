import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Настройки" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          GoNext
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Дневник туриста. Версия {version}
        </Text>
        <Text variant="bodySmall" style={styles.offline}>
          Приложение работает полностью офлайн. Все данные хранятся локально на устройстве.
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
    marginBottom: 24,
  },
  offline: {
    textAlign: 'center',
    opacity: 0.6,
    paddingHorizontal: 32,
  },
});

