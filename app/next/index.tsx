import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Text,
} from 'react-native-paper';
import { getCurrentTrip } from '../../db/trips';
import { getTripPlacesByTripId } from '../../db/tripPlaces';
import { getPlaceById } from '../../db/places';
import { openPlaceOnMap, openPlaceInNavigator } from '../../lib/openMap';
import type { Trip } from '../../types';
import type { TripPlace } from '../../types';
import type { Place } from '../../types';

type NextPlaceData = {
  trip: Trip;
  tripPlace: TripPlace;
  place: Place;
};

export default function NextPlaceScreen() {
  const router = useRouter();
  const [data, setData] = useState<NextPlaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadNextPlace = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    setData(null);
    const WEB_DB_TIMEOUT_MS = 8000;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), WEB_DB_TIMEOUT_MS)
    );
    try {
      const trip = await Promise.race([getCurrentTrip(), timeout]);
      if (!trip) {
        setMessage('Нет текущей поездки. Выберите поездку в разделе «Поездки» и отметьте её как текущую.');
        return;
      }
      const tripPlaces = await Promise.race([
        getTripPlacesByTripId(trip.id),
        timeout,
      ]);
      const next = tripPlaces.find((tp) => !tp.visited);
      if (!next) {
        setMessage('Все места в текущей поездке посещены. Отличная работа!');
        return;
      }
      const place = await Promise.race([getPlaceById(next.placeId), timeout]);
      if (!place) {
        setMessage('Место не найдено.');
        return;
      }
      if (place.latitude == null || place.longitude == null) {
        setMessage(`У места «${place.name}» не указаны координаты. Добавьте их в карточке места.`);
        return;
      }
      setData({ trip, tripPlace: next, place });
    } catch (e) {
      setMessage(
        'Не удалось загрузить данные. На веб-версии база данных может быть недоступна — используйте приложение на телефоне (Expo Go).'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadNextPlace();
  }, [loadNextPlace]));

  const hasCoords = data?.place && data.place.latitude != null && data.place.longitude != null;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Следующее место" />
        <Appbar.Action icon="refresh" onPress={loadNextPlace} />
      </Appbar.Header>
      {loading ? (
        <View style={styles.center}>
          <Text variant="bodyLarge">Загрузка...</Text>
        </View>
      ) : message ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={styles.message}>
            {message}
          </Text>
          {message.includes('Нет текущей поездки') && (
            <Button
              mode="contained-tonal"
              icon="map-marker-path"
              onPress={() => router.push('/trips')}
              style={styles.actionButton}
            >
              Перейти в Поездки
            </Button>
          )}
        </View>
      ) : data ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <Card.Title title={data.place.name} subtitle={data.trip.title} />
            <Card.Content>
              {data.place.description ? (
                <Text variant="bodyMedium" style={styles.desc}>
                  {data.place.description}
                </Text>
              ) : null}
              {hasCoords ? (
                <Text variant="bodySmall" style={styles.coords}>
                  {data.place.latitude?.toFixed(5)}, {data.place.longitude?.toFixed(5)}
                </Text>
              ) : null}
              {data.place.photos.length > 0 ? (
                <Image
                  source={{
                    uri: data.place.photos[0].startsWith('file://')
                      ? data.place.photos[0]
                      : `file://${data.place.photos[0]}`,
                  }}
                  style={styles.photo}
                />
              ) : null}
            </Card.Content>
            {hasCoords && (
              <Card.Actions>
                <Button
                  icon="map-marker"
                  onPress={() =>
                    openPlaceOnMap(
                      data.place.latitude!,
                      data.place.longitude!
                    )
                  }
                >
                  Открыть на карте
                </Button>
                <Button
                  icon="navigation"
                  onPress={() =>
                    openPlaceInNavigator(
                      data.place.latitude!,
                      data.place.longitude!
                    )
                  }
                >
                  В навигатор
                </Button>
              </Card.Actions>
            )}
          </Card>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: { textAlign: 'center', opacity: 0.8, marginBottom: 16 },
  actionButton: { marginTop: 8 },
  card: { marginBottom: 16 },
  desc: { marginBottom: 8 },
  coords: { marginBottom: 12, opacity: 0.7 },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
});
