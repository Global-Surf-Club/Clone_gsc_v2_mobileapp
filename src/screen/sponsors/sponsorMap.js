import 'react-native-gesture-handler';
import React, { memo, useEffect, useState, useCallback } from 'react';
import { Text, View, Platform, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, {
  Callout,
  MAP_TYPES,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { Color, fontFamily } from '../../constants/Constants';
import { Header } from '../../components/Header';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { color } from 'react-native-elements/dist/helpers';
import { dynamicSize } from '../../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

export const SponsorMap = props => {
  const navigation = useNavigation();
  const [MakerData, setMakerData] = useState(
    props?.route?.params?.MakerData ? props?.route?.params?.MakerData : [],
  );
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const BackButtonClick = item => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../../assets/images/icon/chatting.png')}
        iconRight1={require('../../assets/images/icon/bell1.png')}
        iconRight2={require('../../assets/images/icon/home.png')}
        onPressLeft={BackButtonClick}
        title={'Map'}
        notification={'6'}
        textAlign={'center'}
      />
      {Platform.OS == 'ios' ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          mapType={MAP_TYPES.STANDARD}
          region={{
            latitude: MakerData[0]?.Cordinates?.latitude,
            longitude: MakerData[0]?.Cordinates?.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {MakerData?.length > 0 ? (
            MakerData?.map((item, index) => {
              return (
                <Marker
                  pointerEvents="none"
                  anchor={{ x: 0, y: 0 }}
                  coordinate={item?.Cordinates}
                  pinColor={Color.primary}
                >
                  {item?.isMain ? (
                    <View>
                      <Fontisto
                        name={'map-marker'}
                        color={Color.lightblue}
                        size={40}
                      />
                      <View style={[styles.markerStyle]}>
                        <FastImage
                          source={
                            props?.route?.params?.imagepath
                              ? {
                                  uri: props?.route?.params?.imagepath,
                                  cache: FastImage.cacheControl.immutable,
                                }
                              : require('../../assets/images/logo.png')
                          }
                          style={styles.markerImage}
                        />
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Fontisto
                        name={'map-marker'}
                        color={Color.lightblue}
                        size={40}
                      />
                      <View style={[styles.markerStyleText]}>
                        <Text
                          style={{
                            color: Color.white,
                            fontFamily: fontFamily.ProximaBold,
                            fontSize: 20,
                          }}
                        >
                          P
                        </Text>
                      </View>
                    </View>
                  )}
                </Marker>
              );
            })
          ) : (
            <></>
          )}
        </MapView>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          mapType={MAP_TYPES.STANDARD}
          renderToHardwareTextureAndroid
          region={{
            latitude: MakerData[0]?.Cordinates?.latitude,
            longitude: MakerData[0]?.Cordinates?.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {MakerData?.length > 0 ? (
            MakerData?.map((item, index) => {
              return (
                <Marker
                  pointerEvents="none"
                  anchor={{ x: 0, y: 0 }}
                  coordinate={item?.Cordinates}
                  pinColor={Color.primary}
                  tracksViewChanges={tracksViewChanges}
                >
                  {item?.isMain ? (
                    <View>
                      <Fontisto
                        name={'map-marker'}
                        color={Color.lightblue}
                        size={40}
                      />
                      <View style={[styles.markerStyle]}>
                        <Image
                          key={props?.route?.params?.imagepath}
                          source={
                            props?.route?.params?.imagepath
                              ? { uri: props.route.params.imagepath }
                              : require('../../assets/images/logo.png')
                          }
                          style={styles.markerImage}
                          onLoadStart={() => {
                            setTracksViewChanges(false);
                          }}
                          onLoadEnd={() => {
                            setTimeout(() => {
                              setTracksViewChanges(true);
                            }, 100);
                          }}
                        />
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Fontisto
                        name={'map-marker'}
                        color={Color.lightblue}
                        size={40}
                      />
                      <View style={[styles.markerStyleText]}>
                        <Text
                          style={{
                            color: Color.white,
                            fontFamily: fontFamily.ProximaBold,
                            fontSize: 20,
                          }}
                        >
                          P
                        </Text>
                      </View>
                    </View>
                  )}
                </Marker>
              );
            })
          ) : (
            <></>
          )}
        </MapView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  markerStyle: {
    position: 'absolute',
    top: 7,
    left: 5,
  },

  markerStyleText: {
    position: 'absolute',
    top: 5,
    left: 9,
  },
  markerImage: {
    width: 20,
    height: 20,
    backgroundColor: Color.cardbg,
    borderRadius: 100,
    marginRight: 10,
    alignSelf: 'center',
  },
});
export default SponsorMap;
