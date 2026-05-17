import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import {Color, Shadow} from '../constants/Constants';

export const ModalItem = props => {
  const {setModalVisible, modalVisible, btntext, text} = props;
  return (
    <Modal
      animationType="slide"
      hasBackdrop={true}
      backdropOpacity={0.6}
      backdropColor={'black'}
      transparent={true}
      isVisible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{text}</Text>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalVisible(!modalVisible)}>
            <Text style={styles.textStyle}>{btntext}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  buttonOpen: {
    alignSelf: 'center',
    backgroundColor: Color.lightblue,
    width: '50%',
    borderRadius: 10,
    paddingVertical: 10,
  },
  buttonClose: {
    backgroundColor: Color.lightblue,
    paddingHorizontal: 40,
    borderRadius: 10,
    paddingVertical: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 13,
  },
  modalText: {
    marginVertical: 40,
    textAlign: 'center',
    color: 'black',
    fontWeight: '600',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 30,
    alignItems: 'center',
    ...Shadow.boxShadow,
    // opacity:0.5
  },
});
