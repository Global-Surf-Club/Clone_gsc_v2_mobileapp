import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Color, fontFamily } from '../constants/Constants';

const ConnectionBanner = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>No Connection</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginTop: 5,
    marginBottom: 5,
    alignSelf: 'center',
  },
  bannerText: {
    color: Color.gray,
    fontSize: 11,
    fontFamily: fontFamily.ProximaR,
  },
});

export default ConnectionBanner;
