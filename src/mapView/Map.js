import 'react-native-gesture-handler';
import React, { memo, useEffect, useState, useCallback } from 'react';
import { Text, View, Platform, SafeAreaView } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import MapView, {
  Callout,
  MAP_TYPES,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { dynamicSize } from '../constants/Responsive';
import { Color, fontFamily } from '../constants/Constants';
import { Header } from '../components/Header';
import { TextInput } from 'react-native-gesture-handler';

export const Map = props => {
  hermesEnabled = false;

  const navigation = useNavigation();
  const [MakerData, setMakerData] = useState([
    // {
    //     Cordinates: {
    //         latitude: 22.9919394,
    //         longitude: 72.3577611,
    //     }
    // },
    // {
    //     Cordinates: {
    //         latitude: 22.9833179,
    //         longitude: 72.5090481,
    //     }
    // },
    // {
    //     Cordinates: {
    //         latitude: 23.2625586,
    //         longitude: 72.6008747,
    //     }
    // },
    // {
    //     Cordinates: {
    //         latitude: 23.0661518,
    //         longitude: 72.5731682,
    //     }
    // },
    // {
    //     Cordinates: {
    //         latitude: 23.0690984,
    //         longitude: 72.6432542,
    //     }
    // }
  ]);

  useEffect(() => {
    if (props?.route?.params?.latLongArray?.length > 0) {
      let temp = [];
      props?.route?.params?.latLongArray?.map((item, i) => {
        let tep = {
          Cordinates: {
            latitude: item?.locationLat,
            longitude: item?.locationLng,
          },
          address: item?.formattedAddress,
        };
        temp?.push(tep);
      });
      setMakerData(temp);
    }
  }, [props?.route?.params?.latLongArray]);

  const BackButtonClick = item => {
    if (!item) {
      navigation.goBack();
      return;
    }
    const { routes } = navigation.getState();
    const prevRoute = routes[routes.length - 2];

    if (prevRoute?.key) {
      navigation.dispatch({
        ...CommonActions.setParams({
          coordinate: item?.Cordinates,
          item: props?.route?.params?.item,
        }),
        source: prevRoute.key,
      });
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        iconRight2={require('../assets/images/icon/home.png')}
        onPressLeft={BackButtonClick}
        title={'Map'}
        notification={'6'}
        // messagenotification={'6'}
        textAlign={'center'}
      />
      {/* <View style={{ position:'absolute',top: 10, left: 20,zIndex:999 }}>
                <Pressable onPress={BackButtonClick}>
                    <MaterialCommunityIcons
                        name={'chevron-left-circle'}
                        size={dynamicSize(22)}
                        color={Color.black}
                    />
                </Pressable>
            </View> */}
      {Platform.OS == 'ios' ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          mapType={MAP_TYPES.STANDARD}
          // zoomEnabled
          // cacheEnabled
          // renderToHardwareTextureAndroid
          // pitchEnabled
          // scrollEnabled
          // toolbarEnabled
          // zoomTapEnabled
          // zoomControlEnabled
          // userLocationCalloutEnabled
          // loadingEnabled
          // rotateEnabled={true}
          region={{
            latitude: props?.route?.params?.Lat,
            longitude: props?.route?.params?.Lang,
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
                  image={require('../assets/images/icon/maker3.png')}
                  // onPress={() => {
                  //     BackButtonClick(item)
                  // }}
                >
                  <Callout
                    onPress={() => {
                      BackButtonClick(item);
                    }}
                  >
                    <View style={{ padding: 10, width: 240 }}>
                      <Text
                        style={{
                          color: Color.primary,
                          fontFamily: fontFamily.ProximaAB,
                        }}
                      >
                        {item?.address?.toString()}
                      </Text>
                    </View>
                  </Callout>
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
            latitude: props?.route?.params?.Lat,
            longitude: props?.route?.params?.Lang,
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
                  image={require('../assets/images/icon/maker3.png')}
                  // onPress={() => {
                  //     BackButtonClick(item)
                  // }}
                >
                  <Callout
                    onPress={() => {
                      BackButtonClick(item);
                    }}
                  >
                    <View style={{ padding: 10, width: 240 }}>
                      <Text
                        style={{
                          color: Color.primary,
                          fontFamily: fontFamily.ProximaAB,
                        }}
                      >
                        {item?.address}
                      </Text>
                    </View>
                  </Callout>
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
export default Map;
