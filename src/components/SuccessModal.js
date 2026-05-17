import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {Color, fontFamily} from '../constants/Constants';
import {dynamicSize, getFontSize} from '../constants/Responsive';

const SuccessModal = ({visible, description, onClose, iserror, isbusiness}) => {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: Color.black0.concat('9'),
          justifyContent: 'center',
        }}>
        <View
          style={{
            backgroundColor: Color.white,
            marginHorizontal: dynamicSize(isbusiness == true ? 20 : 40),
            borderRadius: dynamicSize(10),
            padding: dynamicSize(10),
            alignItems: 'center',
          }}>
          {isbusiness !== true ? (
            <Text
              style={{
                fontSize: getFontSize(18),
                color: 'black',
                fontFamily: fontFamily.ProximaBold,
                marginVertical: dynamicSize(15),
              }}>
              {iserror === true ? 'Sorry' : 'Success'}
            </Text>
          ) : (
            <View style={{marginVertical: dynamicSize(10)}}></View>
          )}
          <View style={{marginHorizontal: 5}}>
            <Text
              style={{
                color: 'black',
                marginBottom: dynamicSize(20),
                fontSize: getFontSize(16),
                textAlign: 'center',
                fontFamily: fontFamily.ProximaR,
              }}>
              {description}
            </Text>
          </View>
          {isbusiness == true ? (
            <View style={{marginVertical: dynamicSize(5)}}></View>
          ) : (
            <></>
          )}
          <Pressable
            onPress={() => {
              onClose && onClose();
            }}
            style={{
              backgroundColor: Color.lightblue,
              width: isbusiness == true ? '25%' : '60%',
              height: dynamicSize(50),
              borderRadius: dynamicSize(isbusiness == true ? 20 : 10),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: getFontSize(16),
                fontFamily: fontFamily.ProximaBold,
              }}>
              {isbusiness == true ? 'OK' : 'Okay'}
            </Text>
          </Pressable>
          {isbusiness == true ? (
            <View style={{marginVertical: dynamicSize(10)}}></View>
          ) : (
            <></>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;
