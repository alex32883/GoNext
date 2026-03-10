import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Appbar, FAB, List, Text } from 'react-native-paper';
import type { Trip } from '../../types';
import { getAllTrips } from '../../db/trips';

function formatDate(s: string): string {
  if (!s) return '';
  const d = s.split('T')[0];
  return d; // YYYY-MM-DD
}

export default function TripsScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    const WEB_DB_TIMEOUT_MS = 8000;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), WEB_DB_TIMEOUT_MS)
    );
    try {
      const data = await Promise.race([getAllTrips(), timeout]);
      setTrips(data);
    } catch (e) {
      setTrips([]);
      setError(
        'Не удалось загрузить данные. На веб-версии база данных может быть недоступна — используйте приложение на телефоне (Expo Go).'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadTrips();
  }, [loadTrips]));

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Поездки" />
      </Appbar.Header>
      {loading ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge">Загрузка...</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Text variant="bodyMedium" style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Нет поездок. Создайте первую!
          </Text>
        </View>
      ) : (
        <List.Section style={styles.list}>
          {trips.map((trip) => (
            <List.Item
              key={trip.id}
              title={trip.title}
              description={`${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}${
                trip.current ? ' • Текущая' : ''
              }`}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={trip.current ? 'map-marker-check' : 'map-marker'}
                />
              )}
              right={(props) =>
                trip.current ? (
                  <List.Icon {...props} icon="star" color="#ffc107" />
                ) : null
              }
              onPress={() => router.push(`/trips/${trip.id}`)}
            />
          ))}
        </List.Section>
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/trips/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: { textAlign: 'center', opacity: 0.7 },
  errorText: {
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 16,
  },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
