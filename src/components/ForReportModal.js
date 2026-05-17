import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {Color, fontFamily} from '../constants/Constants';
import {dynamicSize, getFontSize} from '../constants/Responsive';

const ForReportModal = ({visible, description, onClose, iserror}) => {
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
            marginHorizontal: dynamicSize(40),
            borderRadius: dynamicSize(10),
            padding: dynamicSize(10),
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: getFontSize(18),
              color: 'black',
              fontFamily: fontFamily.ProximaBold,
              marginVertical: dynamicSize(15),
            }}>
            {iserror === true ? 'Sorry' : 'Success'}
          </Text>
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
          <Pressable
            onPress={() => {
              onClose && onClose();
            }}
            style={{
              backgroundColor: Color.lightblue,
              width: '60%',
              height: dynamicSize(50),
              borderRadius: dynamicSize(10),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: 'white', fontSize: getFontSize(16)}}>
              {'Okay'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ForReportModal;
