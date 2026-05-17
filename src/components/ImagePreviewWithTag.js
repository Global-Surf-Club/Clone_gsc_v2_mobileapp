import React from 'react';
import {
  View,
  Modal,
  FlatList,
  Image,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

const Color = {
  black0: '#000',
  primary: '#007bff',
  white: '#fff',
  red: '#ef4444',
};
const fontFamily = { ProximaAB: 'System' };

const { width, height } = Dimensions.get('window');

const ImagePreviewModal = ({
  visible,
  images,
  onClose,
  onSend,
  updateTag,
  currentIndex,
  setCurrentIndex,
}) => {
  const flatListRef = React.useRef();

  const handleSend = () => {
    onSend(images);
    onClose();
  };

  const handleScroll = e => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(contentOffsetX / width);
    setCurrentIndex(idx);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {images?.length > 0 && (
        <SafeAreaView style={styles.safeArea}>
          {/* Cancel button */}
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </Pressable>

          {/* 🖼️ Image Carousel (NO touch wrapper) */}
          <View style={styles.imageContainer}>
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.imageWrapper}>
                  <FastImage
                    source={{
                      uri: item.uri,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.fullImage}
                    resizeMode={'contain'}
                  />
                </View>
              )}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
          </View>

          {/* ✏️ Footer */}
          <KeyboardStickyView style={styles.footerContainer}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.footerContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    placeholder="Add a caption..."
                    placeholderTextColor="#ccc"
                    value={images[currentIndex]?.tag}
                    onChangeText={text => updateTag(currentIndex, text)}
                    style={styles.captionInput}
                  />
                  <Pressable style={styles.sendBtn} onPress={handleSend}>
                    <Text style={styles.sendBtnText}>Send</Text>
                  </Pressable>
                </View>

                <Text style={styles.counterText}>
                  {currentIndex + 1} / {images.length}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardStickyView>
        </SafeAreaView>
      )}
    </Modal>
  );
};

export default ImagePreviewModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.black0,
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imageWrapper: {
    width,
    // height: height * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height - 150,
    resizeMode: 'contain',
  },
  footerContainer: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // keeps above home bar
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  captionInput: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: Color.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  sendBtnText: {
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    fontSize: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30, // ✅ inside safe area for iOS notch
    right: 16, // ✅ moved to left like WhatsApp
    zIndex: 2,
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  closeBtnText: {
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    fontSize: 16,
  },
  counterText: {
    color: '#bbb',
    textAlign: 'center',
    paddingTop: 4,
  },
});
