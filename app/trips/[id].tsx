import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Alert,
  Image,
  Modal,
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
  List,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';
import {
  getTripById,
  updateTrip,
  deleteTrip,
} from '../../db/trips';
import {
  getTripPlacesByTripId,
  createTripPlace,
  updateTripPlace,
  deleteTripPlace,
  reorderTripPlaces,
} from '../../db/tripPlaces';
import { getAllPlaces } from '../../db/places';
import {
  getTripPlacePhotosDir,
  savePhotoFile,
  deletePhotoFile,
} from '../../lib/photoStorage';
import { PhotoViewerModal } from '../../components/PhotoViewerModal';
import type { Trip } from '../../types';
import type { TripPlace } from '../../types';
import type { Place } from '../../types';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tripId = id ? parseInt(id, 10) : NaN;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripPlaces, setTripPlaces] = useState<TripPlace[]>([]);
  const [placesMap, setPlacesMap] = useState<Record<number, Place>>({});
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([]);
  const [editingTripPlace, setEditingTripPlace] = useState<TripPlace | null>(null);
  const [photoViewerUri, setPhotoViewerUri] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!Number.isFinite(tripId)) return;
    setLoading(true);
    try {
      const [t, tpList, allPlaces] = await Promise.all([
        getTripById(tripId),
        getTripPlacesByTripId(tripId),
        getAllPlaces(),
      ]);
      setTrip(t);
      setTripPlaces(tpList);
      const map: Record<number, Place> = {};
      allPlaces.forEach((p) => { map[p.id] = p; });
      setPlacesMap(map);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  useEffect(() => {
    if (addModalVisible) {
      getAllPlaces().then((list) => {
        const added = new Set(tripPlaces.map((tp) => tp.placeId));
        setAvailablePlaces(list.filter((p) => !added.has(p.id)));
      });
    }
  }, [addModalVisible, tripPlaces]);

  const handleAddPlace = async (place: Place) => {
    setAddModalVisible(false);
    try {
      await createTripPlace({
        tripId,
        placeId: place.id,
        order: tripPlaces.length + 1,
        visited: false,
        visitDate: null,
        notes: '',
        photos: [],
      });
      await loadData();
    } catch (e) {
      Alert.alert('Ошибка', String(e));
    }
  };

  const handleRemovePlace = (tp: TripPlace) => {
    Alert.alert(
      'Удалить место?',
      `Удалить «${placesMap[tp.placeId]?.name ?? 'место'}» из маршрута?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await deleteTripPlace(tp.id);
            await loadData();
          },
        },
      ]
    );
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const ids = tripPlaces.map((tp) => tp.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    await reorderTripPlaces(tripId, ids);
    await loadData();
  };

  const handleMoveDown = async (index: number) => {
    if (index >= tripPlaces.length - 1) return;
    const ids = tripPlaces.map((tp) => tp.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    await reorderTripPlaces(tripId, ids);
    await loadData();
  };

  const handleToggleVisited = async (tp: TripPlace) => {
    const now = new Date().toISOString().split('T')[0];
    await updateTripPlace(tp.id, {
      visited: !tp.visited,
      visitDate: !tp.visited ? now : null,
    });
    await loadData();
  };

  const handleUpdateNotes = async (tp: TripPlace, notes: string) => {
    await updateTripPlace(tp.id, { notes });
    setEditingTripPlace(null);
    await loadData();
  };

  const handleSetCurrent = async (value: boolean) => {
    if (!trip) return;
    await updateTrip(trip.id, { current: value });
    await loadData();
  };

  const handleDeleteTrip = () => {
    if (!trip) return;
    Alert.alert(
      'Удалить поездку?',
      `Удалить «${trip.title}»?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await deleteTrip(trip.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleAddPhoto = async (tp: TripPlace) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нужен доступ', 'Разрешите доступ к фото');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const dir = getTripPlacePhotosDir(tp.id);
    const path = await savePhotoFile(result.assets[0].uri, dir);
    await updateTripPlace(tp.id, { photos: [...tp.photos, path] });
    await loadData();
  };

  const handleRemovePhoto = async (tp: TripPlace, path: string) => {
    await deletePhotoFile(path);
    await updateTripPlace(tp.id, {
      photos: tp.photos.filter((p) => p !== path),
    });
    await loadData();
  };

  if (loading || !trip) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Загрузка..." />
        </Appbar.Header>
        <View style={styles.center}>
          <Text>{loading ? 'Загрузка...' : 'Поездка не найдена'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={trip.title} />
        <Appbar.Action icon="delete" onPress={handleDeleteTrip} />
      </Appbar.Header>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <Text variant="bodyMedium">
            {trip.startDate} — {trip.endDate}
          </Text>
          <View style={styles.currentRow}>
            <Text variant="bodyMedium">Текущая: </Text>
            <Switch
              value={trip.current}
              onValueChange={handleSetCurrent}
            />
          </View>
        </View>
        {trip.description ? (
          <Text variant="bodySmall" style={styles.desc}>
            {trip.description}
          </Text>
        ) : null}
        <View style={styles.section}>
          <Text variant="titleMedium">Маршрут</Text>
          <Button
            mode="outlined"
            icon="plus"
            onPress={() => setAddModalVisible(true)}
            style={styles.addBtn}
          >
            Добавить место
          </Button>
          {tripPlaces.length === 0 ? (
            <Text variant="bodySmall" style={styles.hint}>
              Добавьте места из базы «Места»
            </Text>
          ) : (
            tripPlaces.map((tp, index) => (
              <View key={tp.id} style={styles.tpRow}>
                <View style={styles.tpMain}>
                  <Checkbox.Item
                    label={placesMap[tp.placeId]?.name ?? `Место #${tp.placeId}`}
                    status={tp.visited ? 'checked' : 'unchecked'}
                    onPress={() => handleToggleVisited(tp)}
                    style={styles.checkbox}
                  />
                  <View style={styles.tpActions}>
                    <IconButton
                      icon="chevron-up"
                      size={20}
                      disabled={index === 0}
                      onPress={() => handleMoveUp(index)}
                    />
                    <IconButton
                      icon="chevron-down"
                      size={20}
                      disabled={index === tripPlaces.length - 1}
                      onPress={() => handleMoveDown(index)}
                    />
                    <IconButton
                      icon="image-plus"
                      size={20}
                      onPress={() => handleAddPhoto(tp)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleRemovePlace(tp)}
                    />
                  </View>
                </View>
                {tp.visited && tp.visitDate ? (
                  <Text variant="bodySmall" style={styles.visitDate}>
                    Посещено: {tp.visitDate}
                  </Text>
                ) : null}
                {editingTripPlace?.id === tp.id ? (
                  <View style={styles.notesEdit}>
                    <TextInput
                      label="Заметки"
                      value={editingTripPlace.notes}
                      onChangeText={(v) =>
                        setEditingTripPlace({ ...editingTripPlace, notes: v })
                      }
                      mode="outlined"
                      multiline
                      style={styles.notesInput}
                    />
                    <View style={styles.notesBtns}>
                      <Button onPress={() => setEditingTripPlace(null)}>
                        Отмена
                      </Button>
                      <Button
                        onPress={() =>
                          handleUpdateNotes(editingTripPlace, editingTripPlace.notes)
                        }
                      >
                        Сохранить
                      </Button>
                    </View>
                  </View>
                ) : (
                  <View style={styles.notesRow}>
                    {tp.notes ? (
                      <Text variant="bodySmall">{tp.notes}</Text>
                    ) : null}
                    <Button
                      compact
                      onPress={() => setEditingTripPlace(tp)}
                    >
                      {tp.notes ? 'Изменить заметки' : 'Добавить заметки'}
                    </Button>
                  </View>
                )}
                {tp.photos.length > 0 ? (
                  <View style={styles.photosRow}>
                    {tp.photos.map((path) => (
                      <View key={path} style={styles.photoWrap}>
                        <TouchableOpacity onPress={() => setPhotoViewerUri(path)}>
                          <Image
                            source={{
                              uri: path.startsWith('file://') ? path : `file://${path}`,
                            }}
                            style={styles.photoBox}
                          />
                        </TouchableOpacity>
                        <IconButton
                          icon="close"
                          size={16}
                          style={styles.photoRemove}
                          onPress={() => handleRemovePhoto(tp, path)}
                        />
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge">Выбрать место</Text>
              <IconButton
                icon="close"
                onPress={() => setAddModalVisible(false)}
              />
            </View>
            {availablePlaces.length === 0 ? (
              <Text style={styles.modalEmpty}>
                Нет доступных мест. Добавьте места в разделе «Места».
              </Text>
            ) : (
              <ScrollView>
                {availablePlaces.map((p) => (
                  <List.Item
                    key={p.id}
                    title={p.name}
                    description={p.description || undefined}
                    onPress={() => handleAddPlace(p)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  currentRow: { flexDirection: 'row', alignItems: 'center' },
  desc: { marginBottom: 16, opacity: 0.8 },
  section: { marginTop: 8 },
  addBtn: { marginVertical: 12 },
  hint: { marginTop: 8, opacity: 0.7 },
  tpRow: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  tpMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkbox: { flex: 1, margin: 0 },
  tpActions: { flexDirection: 'row' },
  visitDate: { marginLeft: 16, marginTop: 4, opacity: 0.7 },
  notesRow: { marginLeft: 16, marginTop: 4 },
  notesEdit: { marginLeft: 16, marginTop: 8 },
  notesInput: { marginBottom: 8 },
  notesBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginLeft: 16 },
  photoWrap: { position: 'relative' },
  photoBox: { width: 64, height: 64, borderRadius: 8 },
  photoRemove: { position: 'absolute', top: -8, right: -8, margin: 0 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalEmpty: { padding: 24, textAlign: 'center' },
});
