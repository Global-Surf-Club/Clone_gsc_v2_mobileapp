import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Color} from '../constants/Constants';
import CustomArrow from './CustomArrow';

const CustomMarker = ({currentForcast}) => {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.circle}>
        <View style={styles.hLine} />
        <View style={styles.vLine} />
      </View>
      <CustomArrow
        color={Color.lightblue}
        deg={currentForcast?.swellDirection?.sg?.toFixed(2) ?? 0}
        value={`${currentForcast?.swellHeight?.sg?.toFixed(
          2,
        )}m ${currentForcast?.swellPeriod?.sg?.toFixed(2)}s`}
        text="Swell"
      />
      <CustomArrow
        color={Color.starbg}
        deg={currentForcast?.secondarySwellDirection?.sg?.toFixed(2) ?? 0}
        value={`${currentForcast?.secondarySwellHeight?.sg?.toFixed(
          2,
        )}m ${currentForcast?.secondarySwellPeriod?.sg?.toFixed(2)}s`}
        text="Swell 2"
      />
      <CustomArrow
        color={Color.lightGray}
        deg={currentForcast?.windDirection?.sg?.toFixed(2) ?? 0}
        value={`${(currentForcast?.windSpeed?.sg?.toFixed(2) * 2.23694).toFixed(
          1,
        )} mph`}
        text="Wind"
      />
      <Text style={styles.north}>N</Text>
      <Text style={styles.south}>S</Text>
      <Text style={styles.east}>E</Text>
      <Text style={styles.west}>W</Text>
    </View>
  );
};

export default memo(CustomMarker);

const styles = StyleSheet.create({
  container: {
    height: 180,
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    // marginBottom: -90,
    // overflow: 'visible'
  },
  circle: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'white',
  },
  hLine: {
    height: 1,
    width: 120,
    backgroundColor: 'white',
    position: 'absolute',
    top: 60,
    bottom: 60,
    left: 0,
    right: 0,
  },
  vLine: {
    height: 120,
    width: 1,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 60,
    right: 60,
  },
  north: {
    position: 'absolute',
    fontSize: 16,
    top: 10,
    color: 'white',
  },
  south: {
    position: 'absolute',
    fontSize: 16,
    bottom: 10,
    color: 'white',
  },
  east: {
    position: 'absolute',
    fontSize: 16,
    right: 10,
    color: 'white',
  },
  west: {
    position: 'absolute',
    fontSize: 16,
    left: 10,
    color: 'white',
  },
});
