//import liraries
import React, {memo} from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import {UIActivityIndicator} from 'react-native-indicators';
import { Text } from 'react-native-paper';
import {Color} from './Constants';
import {dynamicSize} from './Responsive';

// create a component
const Loader = ({visible, addModal = false,message}) => {
  if (visible) {
    if (addModal) {
      return (
        <Modal visible={visible} transparent={true} animationType={'fade'}>
          <View style={styles.container}>
            <View style={styles.loaderbg}>
              <UIActivityIndicator
                color={Color.themeColor}
                size={dynamicSize(40)}
              />
            </View>
            <Text visible={message != null} style={styles.message}>{message}</Text>
          </View>
        </Modal>
      );
    }
    return (
      <View style={styles.modalContainer}>
        <View style={styles.container}>
          <View style={styles.loaderbg}>
            <UIActivityIndicator
              color={Color.themeColor}
              size={dynamicSize(40)}
            />
          </View>
          <Text visible={message != null} style={styles.message}>{message}</Text>
        </View>
      </View>
    );
  }
  return null;
  // return (
  //   <Modal visible={visible} transparent={true} animationType={'fade'}>
  //     <View style={styles.container}>
  //       <View style={styles.loaderbg}>
  //         <UIActivityIndicator
  //           color={Color.themeColor}
  //           size={dynamicSize(40)}
  //         />
  //       </View>
  //     </View>
  //   </Modal>
  // );
};

// define your styles
const styles = StyleSheet.create({
  loaderbg: {
    height: dynamicSize(70),
    width: dynamicSize(70),
    borderRadius: 5,
    backgroundColor: Color.lightGray,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(225, 225, 225, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 999,
  },
  message: {
    padding: 8,
    textAlign: 'center'
  }
});

//make this component available to the app
export default memo(Loader);
