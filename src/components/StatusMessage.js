import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Color } from '../constants/Constants';

const StatusMessage = ({ isOnline, hasData, color, title }) => {
  if (hasData) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: color ? color : Color.gray }]}>
        {isOnline
          ? title
            ? title
            : 'Not Available'
          : 'Currently Signal Is Unavailable'}
      </Text>

      <Text style={[styles.subtitle, { color: color ? color : Color.gray }]}>
        {isOnline ? '' : 'Refresh once you have Wi-Fi or mobile data 👍'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    color: '#6B7280',
    textAlign: 'center',
    width: '75%',
  },
});

export default StatusMessage;
