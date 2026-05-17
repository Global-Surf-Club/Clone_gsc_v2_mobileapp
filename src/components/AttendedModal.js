import React from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {Color, fontFamily} from '../constants/Constants';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AttendedModal = ({
  visible,
  description,
  Yes,
  No,
  Maybe,
  iserror,
  onPressClose,
}) => {
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
            paddingHorizontal: dynamicSize(10),
            paddingVertical: 20,
            alignItems: 'center',
          }}>
          <Pressable
            onPress={() => {
              onPressClose();
            }}
            style={[
              {
                width: 30,
                height: 30,
                alignItems: 'center',
                position: 'absolute',
                justifyContent: 'center',
                right: 6,
                top: 6,
              },
            ]}>
            {/* <Entypo
                                size={18}
                                name="circle-with-cross"
                                style={{
                                    color: Color.lightblue,
                                }}
                            /> */}
            <Ionicons name="close-circle" size={26} color={Color.black} />
          </Pressable>
          {/* <Text
            style={{
              fontSize: getFontSize(18),
              color: 'black',
              fontFamily: fontFamily.ProximaBold,
              marginVertical: dynamicSize(15),
            }}>
              {
                iserror === true ? "Sorry" :  "Success"
              }

          </Text> */}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 5,
            }}>
            <Text
              style={{
                color: 'black',
                marginBottom: dynamicSize(20),
                fontSize: getFontSize(16),
                textAlign: 'center',
                fontFamily: fontFamily.ProximaR,
              }}>
              Are you sure attend the event
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Pressable
              onPress={() => {
                Yes('GoingTo');
              }}
              style={{
                backgroundColor: Color.lightblue,
                width: '30%',
                height: dynamicSize(40),
                borderRadius: dynamicSize(10),
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 5,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: getFontSize(16),
                  fontFamily: fontFamily.ProximaBold,
                }}>
                {'Yes'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Maybe('Maybe');
              }}
              style={{
                backgroundColor: Color.lightblue,
                width: '30%',
                height: dynamicSize(40),
                borderRadius: dynamicSize(10),
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 5,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: getFontSize(16),
                  fontFamily: fontFamily.ProximaBold,
                }}>
                {'Maybe'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                No('No');
              }}
              style={{
                backgroundColor: Color.lightblue,
                width: '30%',
                height: dynamicSize(40),
                borderRadius: dynamicSize(10),
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 5,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: getFontSize(16),
                  fontFamily: fontFamily.ProximaBold,
                }}>
                {'No'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AttendedModal;
