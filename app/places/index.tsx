import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Appbar, FAB, List, Searchbar, Text } from 'react-native-paper';
import type { Place } from '../../types';
import { getAllPlaces } from '../../db/places';

export default function PlacesScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    const WEB_DB_TIMEOUT_MS = 8000;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), WEB_DB_TIMEOUT_MS)
    );
    try {
      const data = await Promise.race([getAllPlaces(), timeout]);
      setPlaces(data);
    } catch (e) {
      setPlaces([]);
      setError(
        'Не удалось загрузить данные. На веб-версии база данных может быть недоступна — используйте приложение на телефоне (Expo Go).'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadPlaces();
  }, [loadPlaces]));

  const filtered = search.trim()
    ? places.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      )
    : places;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Места" />
      </Appbar.Header>
      <Searchbar
        placeholder="Поиск..."
        onChangeText={setSearch}
        value={search}
        style={styles.search}
      />
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
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {search.trim() ? 'Ничего не найдено' : 'Нет мест. Добавьте первое!'}
          </Text>
        </View>
      ) : (
        <List.Section style={styles.list}>
          {filtered.map((place) => (
            <List.Item
              key={place.id}
              title={place.name}
              description={place.description || undefined}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={place.visitlater ? 'map-marker' : 'map-marker-check'}
                />
              )}
              right={(props) =>
                place.liked ? (
                  <List.Icon {...props} icon="heart" color="#e91e63" />
                ) : null
              }
              onPress={() => router.push(`/places/${place.id}`)}
            />
          ))}
        </List.Section>
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/places/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  search: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  list: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
