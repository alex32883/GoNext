import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Appbar, Button, Checkbox, TextInput } from 'react-native-paper';
import { createTrip } from '../../db/trips';
import type { TripInsert } from '../../types';

export default function NewTripScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название поездки');
      return;
    }
    if (!startDate.trim() || !endDate.trim()) {
      Alert.alert('Ошибка', 'Укажите даты начала и окончания');
      return;
    }
    setLoading(true);
    try {
      const data: TripInsert = {
        title: title.trim(),
        description: description.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        current,
      };
      await createTrip(data);
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
        <Appbar.Content title="Новая поездка" />
      </Appbar.Header>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TextInput
          label="Название *"
          value={title}
          onChangeText={setTitle}
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
        <TextInput
          label="Дата начала *"
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
        <TextInput
          label="Дата окончания *"
          value={endDate}
          onChangeText={setEndDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
        <View style={styles.row}>
          <Checkbox.Item
            label="Текущая поездка"
            status={current ? 'checked' : 'unchecked'}
            onPress={() => setCurrent(!current)}
          />
        </View>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Создать
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
