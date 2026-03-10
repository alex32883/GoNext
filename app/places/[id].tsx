import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Appbar,
  Button,
  Checkbox,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import { getPlaceById, updatePlace, deletePlace } from '../../db/places';
import { getPlacePhotosDir, savePhotoFile, deletePhotoFile } from '../../lib/photoStorage';
import { openPlaceOnMap } from '../../lib/openMap';
import { PhotoViewerModal } from '../../components/PhotoViewerModal';
import type { Place } from '../../types';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latStr, setLatStr] = useState('');
  const [lngStr, setLngStr] = useState('');
  const [photoViewerUri, setPhotoViewerUri] = useState<string | null>(null);

  const placeId = id ? parseInt(id, 10) : NaN;

  const loadPlace = useCallback(async () => {
    if (!Number.isFinite(placeId)) return;
    setLoading(true);
    try {
      const p = await getPlaceById(placeId);
      setPlace(p);
      if (p) {
        setName(p.name);
        setDescription(p.description);
        setVisitlater(p.visitlater);
        setLiked(p.liked);
        setLatStr(p.latitude != null ? String(p.latitude) : '');
        setLngStr(p.longitude != null ? String(p.longitude) : '');
      }
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    loadPlace();
  }, [loadPlace]);

  const parseCoord = (s: string): number | null => {
    const n = parseFloat(s.trim());
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = async () => {
    if (!place || !name.trim()) {
      Alert.alert('Ошибка', 'Введите название места');
      return;
    }
    setSaving(true);
    try {
      await updatePlace(place.id, {
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        latitude: parseCoord(latStr),
        longitude: parseCoord(lngStr),
      });
      await loadPlace();
    } catch (e) {
      Alert.alert('Ошибка', String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!place) return;
    Alert.alert(
      'Удалить место?',
      `Удалить «${place.name}»?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await deletePlace(place.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleOpenMap = () => {
    if (!place?.latitude || !place?.longitude) {
      Alert.alert('Нет координат', 'Укажите широту и долготу места');
      return;
    }
    openPlaceOnMap(place.latitude, place.longitude);
  };

  const handlePickPhoto = async () => {
    if (!place) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нужен доступ', 'Разрешите доступ к фото для добавления изображений');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const uri = result.assets[0].uri;
    const dir = getPlacePhotosDir(place.id);
    const path = await savePhotoFile(uri, dir);
    const updated = await updatePlace(place.id, {
      photos: [...place.photos, path],
    });
    if (updated) setPlace(updated);
  };

  const handleRemovePhoto = async (path: string) => {
    if (!place) return;
    await deletePhotoFile(path);
    const newPhotos = place.photos.filter((p) => p !== path);
    const updated = await updatePlace(place.id, { photos: newPhotos });
    if (updated) setPlace(updated);
  };

  if (loading || !place) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={loading ? 'Загрузка...' : 'Место'} />
        </Appbar.Header>
        <View style={styles.center}>
          <Text>{loading ? 'Загрузка...' : 'Место не найдено'}</Text>
        </View>
      </View>
    );
  }

  const hasCoords = place.latitude != null && place.longitude != null;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} />
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TextInput
          label="Название *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <View style={styles.row}>
          <Checkbox.Item
            label="Хочу посетить"
            status={visitlater ? 'checked' : 'unchecked'}
            onPress={() => setVisitlater(!visitlater)}
          />
        </View>
        <View style={styles.row}>
          <Checkbox.Item
            label="Понравилось"
            status={liked ? 'checked' : 'unchecked'}
            onPress={() => setLiked(!liked)}
          />
        </View>
        <TextInput
          label="Широта (Decimal Degrees)"
          value={latStr}
          onChangeText={setLatStr}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder="55.7558"
          style={styles.input}
        />
        <TextInput
          label="Долгота (Decimal Degrees)"
          value={lngStr}
          onChangeText={setLngStr}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder="37.6173"
          style={styles.input}
        />
        <Button
          mode="contained-tonal"
          icon="map-marker"
          onPress={handleOpenMap}
          disabled={!hasCoords}
          style={styles.button}
        >
          Открыть на карте
        </Button>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Фотографии
        </Text>
        <View style={styles.photosRow}>
          {place.photos.map((path) => (
            <View key={path} style={styles.photoWrap}>
              <TouchableOpacity onPress={() => setPhotoViewerUri(path)}>
                <Image source={{ uri: path.startsWith('file://') ? path : `file://${path}` }} style={styles.photo} />
              </TouchableOpacity>
              <IconButton
                icon="close"
                size={20}
                style={styles.photoRemove}
                onPress={() => handleRemovePhoto(path)}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.photoAdd} onPress={handlePickPhoto}>
            <IconButton icon="camera-plus" size={32} />
          </TouchableOpacity>
        </View>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.button}
        >
          Сохранить
        </Button>
      </ScrollView>
      <PhotoViewerModal
        visible={!!photoViewerUri}
        uri={photoViewerUri}
        onClose={() => setPhotoViewerUri(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: { marginBottom: 12 },
  row: { marginBottom: 8 },
  button: { marginTop: 8 },
  sectionTitle: { marginTop: 24, marginBottom: 8 },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  photoWrap: { position: 'relative' },
  photo: { width: 80, height: 80, borderRadius: 8 },
  photoRemove: {
    position: 'absolute',
    top: -8,
    right: -8,
    margin: 0,
  },
  photoAdd: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
