import React, {useRef} from 'react';
import {RefreshControl as RNRefreshControl} from 'react-native';
import {createNativeWrapper, FlatList} from 'react-native-gesture-handler';

const RefreshControl = createNativeWrapper(RNRefreshControl, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});

export default function CustomFlatList({
  refreshing = false,
  onRefresh = () => {},
  ...props
}) {
  const refreshRef = useRef(null);
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      {...props}
      waitFor={refreshRef}
      refreshControl={
        <RefreshControl
          ref={refreshRef}
          refreshing={false}
          onRefresh={onRefresh}
        />
      }
      overScrollMode={'always'}
    />
  );
}
