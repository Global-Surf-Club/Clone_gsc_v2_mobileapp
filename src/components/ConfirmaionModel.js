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

const ConfirmaionModel = ({ visible, onCancel, onPressYes, message }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onCancel}
      animationType="slide">
      <TouchableWithoutFeedback onPress={onCancel} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.background} />
          <View style={styles.combineButton}>
            <View
              activeOpacity={0.8}
              style={styles.messageContainer}>
              <Text
                style={{
                  fontSize: 14,
                  color: Color.black0,
                  fontFamily: fontFamily.ProximaBold,
                }}>
                {message}
              </Text>
            </View>
            <Pressable
              onPress={onPressYes}
              activeOpacity={0.8}
              style={styles.button}>
              <Text
                style={{
                  fontSize: 16,
                  color: Color.primary,
                  fontFamily: fontFamily.ProximaR,
                }}>
                yes
              </Text>
            </Pressable>
          </View>
          <Pressable
            activeOpacity={0.8}
            onPress={onCancel}
            style={[styles.button, { marginVertical: 10, borderRadius: 10 }]}>
            <Text
              style={{
                fontSize: 16,
                color: 'red',
                fontFamily: fontFamily.ProximaR,
              }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConfirmaionModel;

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
  messageContainer: {
    backgroundColor: 'white',
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth:1,
    borderBottomColor:Color.gray
  }
});
