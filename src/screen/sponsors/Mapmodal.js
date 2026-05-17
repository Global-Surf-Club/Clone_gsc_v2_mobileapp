import React from 'react';
import {Modal, Pressable, Text, View, StyleSheet, Image} from 'react-native';
import {Color, Shadow, fontFamily} from '../../constants/Constants';
import {dynamicSize, getFontSize} from '../../constants/Responsive';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createOpenLink} from 'react-native-open-maps';
import FastImage from 'react-native-fast-image';

const Mapmodal = ({visible, description, onClose, iserror, Lat, Long}) => {
  const end = '131 Manchester Rd, Northwich,Cheshire , United Kingdom CW9 7LS';
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
            marginHorizontal: dynamicSize(20),
            borderRadius: dynamicSize(10),
            // padding: dynamicSize(10),
            paddingVertical: 10,
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: getFontSize(18),
              color: 'black',
              fontFamily: fontFamily.ProximaBold,
              marginBottom: 10,
            }}>
            Location
          </Text>
          <Pressable
            onPress={() => {
              onClose && onClose();
            }}
            style={{
              height: 30,
              width: 30,
              backgroundColor: Color.white,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              zIndex: 99,
              position: 'absolute',
              right: dynamicSize(5),
              top: dynamicSize(5),
            }}>
            <FastImage
              source={require('../../assets/images/icon/Close.png')}
              resizeMode="contain"
              style={{height: 15, width: 15}}
            />
          </Pressable>
          <View
            pointerEvents="none"
            style={[
              {
                height: dynamicSize(200),
                width: '100%',
                backgroundColor: Color.lightblue,
                // borderTopRightRadius: 20,
                // borderTopLeftRadius: 20,
                // borderRadius:20,
                overflow: 'hidden',
                marginBottom: dynamicSize(15),
              },
            ]}>
            <MapView
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              zoomControlEnabled={false}
              scrollDuringRotateOrZoomEnabled={false}
              initialRegion={{
                // latitude: 37.78825,
                // longitude: -122.4324,
                latitude: Lat,
                longitude: Long,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              mapType={'standard'}>
              <Marker
                coordinate={{
                  latitude: 37.78825,
                  longitude: -122.4324,
                }}
              />
            </MapView>
          </View>
          <View style={{marginHorizontal: 5}}>
            <Text
              style={{
                color: 'black',
                marginBottom: dynamicSize(20),
                fontSize: getFontSize(16),
                textAlign: 'center',
                fontFamily: fontFamily.ProximaR,
              }}>
              {/* 131 Manchester Rd, Northwich,Cheshire , United Kingdom CW9 7LS */}
              {description ? description : 'N/A'}
            </Text>
          </View>

          <Pressable
            onPress={createOpenLink({end: description, provider: 'google'})}
            style={{
              backgroundColor: Color.lightblue,
              width: '60%',
              height: dynamicSize(50),
              borderRadius: dynamicSize(10),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: getFontSize(16),
                fontFamily: fontFamily.ProximaBold,
              }}>
              {'Directions'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default Mapmodal;
