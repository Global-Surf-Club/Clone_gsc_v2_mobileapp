import React, {memo} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Color,
  CURRENT_HEIGHT,
  CURRENT_WIDTH,
  fontFamily,
} from '../constants/Constants';
import {getFontSize} from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

const ListModal = ({
  visible,
  onCancel,
  onPressDelete,
  onPressReport,
  outheruser,
  isself,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onCancel}
      animationType="slide">
      <TouchableWithoutFeedback onPress={onCancel} style={{flex: 1}}>
        <View style={styles.container}>
          <View style={styles.background} />

          <View style={styles.combineButton}>
            {outheruser && (
              <Pressable
                onPress={onPressReport}
                activeOpacity={0.8}
                style={[
                  styles.button,
                  // {borderBottomWidth: 1, borderBottomColor: Color.gray},
                ]}>
                <Text
                  style={{
                    fontSize: getFontSize(15),
                    lineHeight: getFontSize(21),
                    fontFamily: fontFamily.ProximaR,
                    color: Color.black,
                    fontFamily: fontFamily.ProximaR,
                  }}>
                  Report
                </Text>
              </Pressable>
            )}
            {isself && (
              <Pressable
                onPress={onPressDelete}
                activeOpacity={0.8}
                style={[
                  styles.button,
                  // {borderBottomWidth: 1, borderBottomColor: Color.gray},
                ]}>
                <Text
                  style={{
                    fontSize: 16,
                    color: Color.black,
                    fontFamily: fontFamily.ProximaR,
                  }}>
                  Delete
                </Text>
              </Pressable>
            )}
          </View>
          <Pressable
            activeOpacity={0.8}
            onPress={onCancel}
            style={[styles.button, {marginVertical: 10, borderRadius: 10}]}>
            <Text
              style={{
                color: 'red',
                fontSize: getFontSize(15),
                lineHeight: getFontSize(21),
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

export default memo(ListModal);

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
