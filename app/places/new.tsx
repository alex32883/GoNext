import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Appbar,
  Button,
  Checkbox,
  TextInput,
} from 'react-native-paper';
import { createPlace } from '../../db/places';
import type { PlaceInsert } from '../../types';

export default function NewPlaceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latStr, setLatStr] = useState('');
  const [lngStr, setLngStr] = useState('');

  const parseCoord = (s: string): number | null => {
    const n = parseFloat(s.trim());
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название места');
      return;
    }
    setLoading(true);
    try {
      const data: PlaceInsert = {
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        latitude: parseCoord(latStr),
        longitude: parseCoord(lngStr),
        photos: [],
      };
      await createPlace(data);
      router.back();
    } catch (e) {
      Alert.alert('Ошибка', String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Новое место" />
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
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Сохранить
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  row: { marginBottom: 8 },
  button: { marginTop: 16 },
});
