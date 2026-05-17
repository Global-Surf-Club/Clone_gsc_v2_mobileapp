import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import {Color, fontFamily, Shadow} from '../constants/Constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TextInput} from 'react-native-paper';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import {ButtonRound} from '../components/Buttons';

export const ReportBlocknotification = props => {
  const {setModalVisible, modalVisible, titletext, blockreport} = props;
  return (
    <Modal
      animationType="slide"
      hasBackdrop={true}
      backdropOpacity={0.6}
      backdropColor={'black'}
      transparent={true}
      isVisible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.modalcontainer}>
        <View style={styles.modalsubcontainer}>
          <Pressable
            style={styles.close}
            onPress={() => {
              setModalVisible(false);
            }}>
            <Ionicons name="close-circle" size={26} color={Color.black} />
          </Pressable>
          <View
            style={[
              styles.mx2,
              {paddingRight: dynamicSize(40), marginTop: dynamicSize(30)},
            ]}>
            <Text style={styles.formtitle}>{titletext}</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginHorizontal: 10,
            }}>
            <View style={styles.buttoncontainer}>
              <ButtonRound
                title={'Ok'}
                onPress={() => {
                  setModalVisible(false);
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
export const Unblocknotification = props => {
  const {setModalVisible, modalVisible, titletext, onPressOk} = props;
  return (
    <Modal
      animationType="slide"
      hasBackdrop={true}
      backdropOpacity={0.6}
      backdropColor={'black'}
      transparent={true}
      isVisible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.modalcontainer}>
        <View style={styles.modalsubcontainer}>
          <Pressable
            style={styles.close}
            onPress={() => {
              setModalVisible(false);
            }}>
            <Ionicons name="close-circle" size={26} color={Color.black} />
          </Pressable>
          <View
            style={[
              styles.mx2,
              {paddingRight: dynamicSize(40), marginTop: dynamicSize(30)},
            ]}>
            <Text style={styles.formtitle}>{titletext}</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginHorizontal: 10,
            }}>
            <View style={styles.buttoncontainer}>
              <ButtonRound
                title={'Cancel'}
                onPress={() => {
                  setModalVisible(false);
                }}
              />
            </View>
            <View style={styles.buttoncontainer}>
              <ButtonRound
                title={'Ok'}
                onPress={() => {
                  onPressOk();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  buttoncontainer: {
    width: '40%',
    paddingHorizontal: 5,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  close: {
    position: 'absolute',
    right: 10,
    top: 8,
    height: dynamicSize(40),
    width: dynamicSize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  formtitle: {
    fontSize: getFontSize(17),
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: fontFamily.ProximaBold,
    marginTop: 10,
  },
  mx2: {
    marginHorizontal: dynamicSize(10),
  },
  mt2: {
    marginTop: dynamicSize(10),
  },
  modalflatlist: {
    flex: 1,
    marginTop: 7,
  },
  modalsubcontainer: {
    backgroundColor: Color.white,
    minHeight: dynamicSize(150),
    borderRadius: 8,
    justifyContent: 'space-between',
    paddingBottom: dynamicSize(10),
  },
  modalcontainer: {
    // alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
});
