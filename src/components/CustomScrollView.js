import React, {useRef} from 'react';
import {RefreshControl as RNRefreshControl} from 'react-native';
import {createNativeWrapper, ScrollView} from 'react-native-gesture-handler';

const RefreshControl = createNativeWrapper(RNRefreshControl, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});

export default function CustomScrollView({
  children,
  refreshing = false,
  refs,
  onRefresh = () => {},
  ...props
}) {
  const refreshRef = useRef(null);

  return (
    <ScrollView
      {...props}
      waitFor={refreshRef}
      refreshControl={
        <RefreshControl
          ref={refreshRef}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      ref={refs}>
      {children}
    </ScrollView>
  );
}
