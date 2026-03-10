import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconButton } from 'react-native-paper';

type PhotoViewerModalProps = {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
};

export function PhotoViewerModal({
  visible,
  uri,
  onClose,
}: PhotoViewerModalProps) {
  if (!uri) return null;
  const imageUri = uri.startsWith('file://') ? uri : `file://${uri}`;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.content}>
          <IconButton
            icon="close"
            size={28}
            style={styles.closeBtn}
            onPress={onClose}
          />
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.imageWrap}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 8,
    zIndex: 10,
  },
  imageWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
