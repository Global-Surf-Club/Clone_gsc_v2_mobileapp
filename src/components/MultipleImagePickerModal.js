import React, { memo } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  Color,
  CURRENT_HEIGHT,
  CURRENT_WIDTH,
  fontFamily,
} from '../constants/Constants';
import { SafeAreaView } from 'react-native-safe-area-context';

const MultipleImagePickerModal = ({
  visible,
  onCancel,
  onSelect,
  onSelectURI,
}) => {
  const openCamera = async () => {
    try {
      const response = await launchCamera({ quality: 1 });
      handleRes(response);
    } catch (error) {}
  };

  const handleRes = response => {
    if (response.didCancel) {
      return;
    }
    if (response.error) {
      return;
    }
    if (response.errorCode) {
      Alert.alert(
        'Permission',
        'You denied camera permission. Please go to settings and enable it.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Setting',
            onPress: () => {
              Linking.openSettings();
            },
          },
        ],
      );
      return;
    }
    if (response.assets[0].uri) {
      let list = [];
      let list1 = [];
      for (let i = 0; i < response.assets.length; i++) {
        const item = response.assets[i];
        list.push({
          uri: item?.uri,
          type: item?.type,
          name: item?.fileName,
        });
        list1.push({
          imageUrl: item?.uri,
          thumbnailImageUrl: item?.uri,
        });
      }
      // const photo = {
      //   uri: response.assets[0]?.uri,
      //   type: response.assets[0]?.type,
      //   name: response.assets[0]?.fileName,
      // };
      onSelect(list);
      onSelectURI(list1);
      onCancel();
    }
  };

  const openGallery = async () => {
    try {
      const response = await launchImageLibrary({
        selectionLimit: 30,
        quality: 1,
      });
      handleRes(response);
    } catch (error) {}
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onCancel}
      animationType="slide"
    >
      <TouchableWithoutFeedback onPress={onCancel} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.background} />
          <View style={styles.combineButton}>
            <Pressable
              onPress={openCamera}
              activeOpacity={0.8}
              style={[
                styles.button,
                { borderBottomWidth: 1, borderBottomColor: Color.gray },
              ]}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: Color.black0,
                  fontFamily: fontFamily.ProximaR,
                }}
              >
                Open Camera
              </Text>
            </Pressable>
            <Pressable
              onPress={openGallery}
              activeOpacity={0.8}
              style={styles.button}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: Color.black0,
                  fontFamily: fontFamily.ProximaR,
                }}
              >
                Select From Gallery
              </Text>
            </Pressable>
          </View>
          <Pressable
            activeOpacity={0.8}
            onPress={onCancel}
            style={[styles.button, { marginVertical: 10, borderRadius: 10 }]}
          >
            <Text
              style={{
                fontSize: 16,
                color: 'red',
                fontFamily: fontFamily.ProximaR,
              }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default memo(MultipleImagePickerModal);

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  combineButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  background: {
    backgroundColor: 'black',
    opacity: 0.4,
    height: CURRENT_HEIGHT,
    width: CURRENT_WIDTH,
    position: 'absolute',
  },
});
