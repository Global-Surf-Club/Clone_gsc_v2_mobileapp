import React, {memo} from 'react';
import {Platform, StyleSheet} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import CustomMarker from './CustomMarker';

const CustomMapView = ({location, currentForcast}) => {
  if (Platform.OS == 'ios') {
    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        mapType={'satellite'}
        zoomEnabled
        cacheEnabled
        renderToHardwareTextureAndroid
        pitchEnabled
        scrollEnabled
        toolbarEnabled
        zoomTapEnabled
        zoomControlEnabled
        userLocationCalloutEnabled
        loadingEnabled
        rotateEnabled={false}
        region={{
          ...location,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        <Marker
          pointerEvents="none"
          anchor={Platform.OS == 'android' ? {y: 0.5} : {x: 0.5, y: 0.5}}
          coordinate={location}>
          <CustomMarker currentForcast={currentForcast} />
        </Marker>
      </MapView>
    );
  }
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{flex: 1}}
      mapType={'satellite'}
      renderToHardwareTextureAndroid
      rotateEnabled={false}
      region={{
        ...location,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}>
      <Marker
        pointerEvents="none"
        anchor={Platform.OS == 'android' ? {y: 0.5} : {x: 0.5, y: 0.5}}
        coordinate={location}>
        <CustomMarker currentForcast={currentForcast} />
      </Marker>
    </MapView>
  );
};

export default memo(CustomMapView);

const styles = StyleSheet.create({});
