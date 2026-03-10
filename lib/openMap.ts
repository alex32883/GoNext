import { Linking, Platform } from 'react-native';

const latLng = (lat: number, lng: number) =>
  `${lat.toString()},${lng.toString()}`;

/**
 * Открывает координаты в системной карте.
 */
export function openPlaceOnMap(latitude: number, longitude: number): void {
  const ll = latLng(latitude, longitude);
  const url =
    Platform.OS === 'ios'
      ? `maps:?q=${ll}`
      : `geo:${ll}?q=${ll}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps?q=${ll}`);
  });
}

/**
 * Открывает координаты в навигаторе (маршрут до точки).
 */
export function openPlaceInNavigator(latitude: number, longitude: number): void {
  const ll = latLng(latitude, longitude);
  const url =
    Platform.OS === 'ios'
      ? `maps:?daddr=${ll}`
      : Platform.OS === 'android'
        ? `google.navigation:q=${ll}`
        : `https://www.google.com/maps/dir/?api=1&destination=${ll}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${ll}`);
  });
}
