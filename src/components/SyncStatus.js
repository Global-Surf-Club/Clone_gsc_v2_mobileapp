import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Color, fontFamily } from '../constants/Constants';

const SyncInfo = ({ lastSyncTime, showLoading, currentNetworkStatus }) => {
  if (!lastSyncTime || showLoading) return null;

  return (
    <View style={styles.syncInfoContainer}>
      <Ionicons
        name={currentNetworkStatus ? 'cloud-done' : 'cloud-offline'}
        size={12}
        color={Color.gray}
      />
      <Text style={styles.syncInfoText}>
        Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  syncInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 4,
    gap: 5,
  },
  syncInfoText: {
    fontSize: 11,
    color: Color.gray,
    marginLeft: 4,
    fontFamily: fontFamily.ProximaR,
  },
});

export default SyncInfo;
