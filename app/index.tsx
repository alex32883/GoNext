import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Snackbar, Text } from 'react-native-paper';

export default function HomeScreen() {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const onDismissSnackbar = () => setSnackbarVisible(false);
  const onPressButton = () => setSnackbarVisible(true);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.text}>
          Привет, React Native Paper!
        </Text>
        <Button mode="contained" onPress={onPressButton}>
          Нажми меня
        </Button>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={onDismissSnackbar}
        action={{
          label: 'OK',
          onPress: onDismissSnackbar,
        }}
      >
        Кнопка нажата
      </Snackbar>
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
    gap: 24,
    paddingHorizontal: 24,
  },
  text: {
    textAlign: 'center',
  },
});
