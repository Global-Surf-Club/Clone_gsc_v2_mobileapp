//import liraries
import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import { Color, fontFamily, Shadow } from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';
import Popover from 'react-native-popover-view';
import NetInfo from '@react-native-community/netinfo';

// create a component
export const ClubmultiplePopover = props => {
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);
  const openPopover = () => {
    setPopoverVisible(true);
  };
  const closePopover = () => {
    setPopoverVisible(false);
  };
  return (
    <>
      {props.simplebtn ? (
        <TouchableOpacity
          ref={touchableRef}
          style={{ marginBottom: 5 }}
          disabled={!currentNetworkStatus}
          onPress={() => {
            openPopover();
          }}
        >
          <Entypo
            name="dots-three-horizontal"
            color={Color.black}
            size={getFontSize(16)}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          ref={touchableRef}
          style={styles.dotCont}
          disabled={!currentNetworkStatus}
          onPress={() => {
            openPopover();
          }}
        >
          <Entypo
            name="dots-three-vertical"
            color={Color.black}
            size={getFontSize(16)}
          />
        </TouchableOpacity>
      )}
      {/* <TouchableOpacity
                ref={touchableRef}
                style={styles.dotCont}
                onPress={() => {
                    openPopover()
                }}>
                <Entypo
                    name="dots-three-vertical"
                    color={Color.black}
                    size={getFontSize(16)}
                />
            </TouchableOpacity> */}
      <Popover
        isVisible={popoverVisible}
        popoverStyle={styles.content}
        from={touchableRef}
        onRequestClose={() => setPopoverVisible(false)}
      >
        <View style={styles.popupcontainer}>
          <TouchableOpacity
            style={styles.popupitem}
            onPress={() => {
              closePopover();
              props.onPressEdit();
            }}
          >
            <Text style={styles.popupitemtext}>Edit</Text>
          </TouchableOpacity>
          {props.onPressDelete ? (
            <TouchableOpacity
              style={styles.popupitem}
              onPress={() => {
                closePopover();
                props.onPressDelete();
              }}
            >
              <Text style={styles.popupitemtext}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
      </Popover>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  dotCont: {
    position: 'absolute',
    top: dynamicSize(25),
    right: dynamicSize(25),
    zIndex: 5,
    shadowColor: 'black',
    elevation: 5,
    shadowOpacity: 1,
    shadowRadius: 5,
    backgroundColor: 'transparent',
  },
  content: {
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 100,
  },

  backarrow: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginLeft: 10,
    borderRadius: 8,
    marginRight: 5,
    height: 38,
    width: 38,
  },
  popupitemtext: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaR,
    color: Color.cardgray,
    lineHeight: getFontSize(16),
    color: Color.black0,
    textAlign: 'center',
  },
  popupitem: {
    paddingVertical: 10,
  },
});
