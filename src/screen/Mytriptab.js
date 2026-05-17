//import liraries
import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { Image } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Trip from '../api/Trip';
import { Communityinfo } from '../components/CommunityItems';
import CustomFlatList from '../components/CustomFlatList';
import { Color, fontFamily, Shadow } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import {
  acceptInviteAction,
  deleteInvitedIdTrip,
  fetchJoinedTrips,
  getInvitedTripsAction,
  getInviteeTripsIdsAction,
  getSuggestedTripsAction,
  getSuggestedTripsByPostCodeAction,
  getTripsPage,
  rejectInviteAction,
  removeInviteeTripId,
  sendJoinRequestAction,
  setJoinedTripIds,
  updateSuggestedTripPassengersLocal,
  updateSuggestedTrips,
} from '../store/tripSlice';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';
import StatusMessage from '../components/StatusMessage';
import SyncInfo from '../components/SyncStatus';
import {
  addPendingAction,
  getJoinRequestsFromDB,
  saveJoinRequests,
} from '../database/tripDbHelper';
import FastImage from 'react-native-fast-image';

export const MyTAb = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const trips = useSelector(state => state?.trip?.trips);
  const lastSyncTime = useSelector(state => state.trip.lastSyncTime);
  const [isLoading, setIsLoading] = useState(false);
  const scrollToIndex = useRef(0);
  const scrollViewRef = useRef();
  const dataSourceCords = useRef([]);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [TopLodaer, setTopLodaer] = useState(false);
  const user = useSelector(state => state.auth.user);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const pageNo = useRef(1);
  const pageNoTop = useRef(1);
  const pageNoBottom = useRef(1);
  const isFetching = useRef(false);
  const isDataLoaded = useRef(false);
  const isTopLoaded = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (
      props?.ListIndex !== undefined &&
      props?.ListIndex !== null &&
      props?.ListIndex !== ''
    ) {
      if (props?.ListIndex === -1) {
        alert('The trip is Expird');
        getmyTrips(true);
      } else {
        if (parseInt(props?.ListIndex) > 10) {
          let modules = parseInt(props?.ListIndex) % 10;

          if (modules == 0) {
            pageNoTop.current = parseInt(parseInt(props?.ListIndex) / 10);
            pageNoBottom.current = parseInt(parseInt(props?.ListIndex) / 10);
            pageNo.current = parseInt(parseInt(props?.ListIndex) / 10);
            scrollToIndex.current = 9;
            getmyTrips(false, false, false, true);
          } else {
            pageNoTop.current = parseInt(parseInt(props?.ListIndex) / 10) + 1;
            pageNoBottom.current =
              parseInt(parseInt(props?.ListIndex) / 10) + 1;
            pageNo.current = parseInt(parseInt(props?.ListIndex) / 10) + 1;
            scrollToIndex.current = modules > 0 ? modules - 1 : 0;
            getmyTrips(false, false, false, true);
          }
        } else {
          pageNoTop.current = 1;
          pageNoBottom.current = 1;
          pageNo.current = 1;
          scrollToIndex.current =
            parseInt(props?.ListIndex) > 0 ? parseInt(props?.ListIndex) - 1 : 0;
          getmyTrips(false, false, false, true);
        }
      }
    } else {
      getmyTrips(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getmyTrips(true);
    });
    return unsubscribe;
  }, []);

  const getmyTrips = (isRefresh, isBottom, isTop, isStart) => {
    try {
      if (isBottom) {
        setBottomLodaer(true);
      } else if (isTop) {
        setTopLodaer(true);
      } else if (isStart) {
        isDataLoaded.current = false;
        isTopLoaded.current = false;
        setIsLoading(true);
      } else if (isRefresh) {
        isDataLoaded.current = false;
        pageNo.current = 1;
        pageNoBottom.current = 1;
        pageNoTop.current = 1;
        setIsLoading(true);
      } else {
        setIsLoading(true);
      }
      isFetching.current = true;
      dispatch(
        getTripsPage(
          false,
          isBottom
            ? pageNoBottom.current
            : isTop
            ? pageNoTop.current
            : pageNo.current,
          isStart,
          isBottom,
          isTop,
          user?.id,
          (status, isEnded, start) => {
            if (!isMounted.current) return;
            setIsLoading(false);
            setBottomLodaer(false);
            isFetching.current = false;
            if (status && isEnded && start) {
              pageNoTop.current -= 1;
              getmyTrips(false, false, true);
            }
            if (isEnded && status) {
              isDataLoaded.current = true;
            }
            if (pageNo.current == 1 || pageNoTop.current == 1) {
              isTopLoaded.current = true;
            }
            if (isTop) {
              if (dataSourceCords.current?.length > 10) {
                scrollViewRef.current.scrollTo({
                  x: 0,
                  y: dataSourceCords.current[10],
                  animated: true,
                });
              }
              setTopLodaer(false);
            }
          },
        ),
      );
    } catch (error) {}
  };

  const GotoTripDetail = item => {
    navigation.navigate('TripDetail', { ...item, showAll: true });
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    return contentOffset.y <= 0;
  };

  return (
    <View style={[styles.tabbartab1, { flex: 1 }]}>
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -5, marginTop: -12 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSyncTime && !isLoading && currentNetworkStatus && (
        <View style={{ marginBottom: -5, marginTop: -15 }}>
          <SyncInfo
            lastSyncTime={lastSyncTime}
            showLoading={isLoading}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}
      <Loader visible={isLoading && trips?.length == 0} />

      <ScrollView
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            if (!isFetching.current && !isDataLoaded.current) {
              pageNoBottom.current += 1;
              getmyTrips(false, true);
            }
          } else if (isCloseToTop(nativeEvent)) {
            if (!isFetching.current && !isTopLoaded.current) {
              if (pageNoTop.current > 1) {
                pageNoTop.current -= 1;
                getmyTrips(false, false, true);
              }
            }
          }
        }}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              getmyTrips(true);
            }}
          />
        }
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        ref={scrollViewRef}
      >
        {TopLodaer ? (
          <View
            style={{
              height: dynamicSize(50),
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color={Color.black0} />
          </View>
        ) : (
          <></>
        )}
        {trips?.length > 0
          ? trips?.map((item, index) => {
              return (
                <Communityinfo
                  onCardClick={GotoTripDetail}
                  showAll
                  marginHorizontal={5}
                  item={item}
                  key={item.id}
                  TripID={props?.TripID}
                  onLayout={event => {
                    const layout = event.nativeEvent.layout;
                    dataSourceCords.current[index] = layout.y;
                    dataSourceCords.current = dataSourceCords.current;
                    if (
                      dataSourceCords.current?.length > 0 &&
                      dataSourceCords.current?.length < 11
                    ) {
                      scrollViewRef.current.scrollTo({
                        x: 0,
                        y: dataSourceCords.current[scrollToIndex.current],
                        animated: true,
                      });
                    }
                  }}
                />
              );
            })
          : !isLoading && (
              <View style={styles.emptyContainer}>
                <StatusMessage
                  isOnline={currentNetworkStatus}
                  hasData={trips?.length > 0}
                  title={'No Trips Available'}
                />
              </View>
            )}
        {bottomLodaer ? (
          <View
            style={{
              height: dynamicSize(50),
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color={Color.black0} />
          </View>
        ) : (
          <></>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabbartab1: {
    marginTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  inputcontainer: {
    paddingHorizontal: 20,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,

    backgroundColor: Color.lightGray,
    borderRadius: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
  },
  btnText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 20,
  },
  modalbtntext: {
    textAlign: 'center',
    fontSize: 17,
    fontFamily: fontFamily.ProximaR,
    fontWeight: '400',
    color: Color.lightblue,
  },
  divider: {
    marginVertical: 13,
    height: 1.5,
    backgroundColor: Color.cardbg,
  },
  modalbutton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  modaltext: {
    fontSize: 13,
    color: Color.gray,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 18,
  },
  modaltitle: {
    color: Color.gray,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 18,
  },
  bottommodal: {
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: Color.black.concat('50'),
  },
  modalView: {
    backgroundColor: Color.white,
    paddingVertical: 10,
    borderRadius: 10,
    textAlign: 'center',
  },

  mt2: {
    marginTop: 10,
  },
  profileimg: {
    width: 50,
    height: 50,
    borderRadius: 100,
    marginRight: 10,
    alignSelf: 'center',
    backgroundColor: Color.gray,
  },
  passengerimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    borderBottomColor: Color.cardbg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },

  searchbar: {
    borderRadius: 10,
    height: 40,
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  inputStyle: {
    paddingVertical: 0,
  },
  searchcontainer: {
    paddingHorizontal: 8,
    borderBottomColor: Color.cardbg,
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
    paddingBottom: 10,
  },
});

export const SuggestedTab = props => {
  const { jumpTo } = props;
  const lastSyncTime = useSelector(state => state.trip.lastSyncTime);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [locationStatus, setLocationStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const suggestedTrips = useSelector(state => state.trip.suggestedTrips);
  const suggestedTripsbyPostCode = useSelector(
    state => state.trip.suggestedTripsbyPostCode,
  );
  const user = useSelector(state => state.auth.user);
  const [selection, setSelection] = useState(1);
  const [isModalVisible, setModalVisible] = useState(false);
  const invitedList = useSelector(state => state?.trip?.inviteeTripIds);
  const joinedTripIds = useSelector(state => state?.trip?.joinedTripIds);
  const currentItem = useRef(null);
  const isInvite = useRef(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      getOneTimeLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This App needs to Access your location',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const enableResult = await promptForEnableLocationIfNeeded();

          if (enableResult == 'enabled' || enableResult == 'already-enabled') {
            setTimeout(() => {
              getOneTimeLocation();
            }, 1000);
          }
        } else {
          setLocationStatus(false);
        }
      } catch (err) {}
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getSuggestedTripByPostCodes();
    });
    return unsubscribe;
  }, []);

  const getJoinedTrips = async () => {
    dispatch(fetchJoinedTrips(user?.id));
  };

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        if (!isMounted.current) return;
        setLocationStatus(true);
        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);
        getSuggestedTrip(currentLatitude, currentLongitude);
      },
      error => {},
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 1000,
      },
    );
  };

  const getSuggestedTripByPostCodes = async () => {
    setRefreshing(true);
    dispatch(
      getSuggestedTripsByPostCodeAction(user?.zipCode, () => {
        setRefreshing(false);
      }),
    );
  };

  const getSuggestedTrip = (lat, long) => {
    setRefreshing(true);
    dispatch(
      getSuggestedTripsAction(lat, long, () => {
        setRefreshing(false);
      }),
    );
  };

  const GotoTripDetail = item => {
    navigation.navigate('TripDetail', item);
  };

  const sendInvite = async (id, isDriver) => {
    if (!currentNetworkStatus) {
      await addPendingAction({
        actionType: 'SEND_INVITE',
        entityId: id,
        payload: { isDriver },
        module: 'trip',
        timestamp: new Date().toISOString(),
      });
      dispatch(setJoinedTripIds([...joinedTripIds, id]));
      return;
    }

    setIsLoading(true);
    try {
      const param = { tripId: id, isDriver };
      await Trip.sendJoin(param);
      getJoinedTrips();
    } catch (error) {
      alert(error?.detail?.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const getInvitedTrips = async () => {
    dispatch(getInviteeTripsIdsAction(user?.id));
  };

  const acceptInvite = async (id, isDriver) => {
    const item = invitedList?.find(
      i => i?.tripId?.toString() == id?.toString(),
    );
    if (!currentNetworkStatus) {
      await addPendingAction({
        actionType: 'ACCEPT_INVITE',
        entityId: item,
        payload: { item, tripId: id, isDriver, userId: user?.id },
        timestamp: new Date().toISOString(),
      });
      dispatch(updateSuggestedTrips(id, user));
      dispatch(removeInviteeTripId(id));
      dispatch(deleteInvitedIdTrip(id, user));
      dispatch(updateSuggestedTripPassengersLocal(id, user));
      return;
    }

    try {
      setIsLoading(true);

      if (item) {
        await Trip.acceptInviteInvite(item?.inviteId, isDriver);
      }
      dispatch(updateSuggestedTrips(id, user));
      dispatch(removeInviteeTripId(id));
      dispatch(deleteInvitedIdTrip(id, user));
      dispatch(updateSuggestedTripPassengersLocal(id, user));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (error?.toString()?.toLowerCase()?.trim() !== 'network error') {
      }
    }
  };

  const rejectInvite = async id => {
    const item = invitedList?.find(
      i => i?.tripId?.toString() == id?.toString(),
    );
    if (!currentNetworkStatus) {
      await addPendingAction({
        actionType: 'REJECT_INVITE',
        entityId: item?.inviteId,
        payload: { inviteId: item?.inviteId, userId: user?.id },
        timestamp: new Date().toISOString(),
      });
      dispatch(removeInviteeTripId(id));
      dispatch(deleteInvitedIdTrip(id, user));
      return;
    }

    try {
      setIsLoading(true);
      if (item) {
        await Trip.rejectInviteInvite(item?.inviteId);
      }
      dispatch(removeInviteeTripId(id));
      dispatch(deleteInvitedIdTrip(id, user));
      setIsLoading(false);
    } catch (error) {
      if (error?.toString()?.toLowerCase()?.trim() !== 'network error') {
        alert(error?.toString());
      }
      setIsLoading(false);
    }
  };

  return (
    <View style={tab2styles.tabbartab1}>
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -10, marginTop: -12 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSyncTime && !isLoading && currentNetworkStatus && (
        <View style={{ marginBottom: -10, marginTop: -12 }}>
          <SyncInfo
            lastSyncTime={lastSyncTime}
            showLoading={isLoading}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}
      <View style={[styles.inputcontainer]}>
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={[
              styles.btn,
              selection === 1
                ? { backgroundColor: Color.lightblue, ...Shadow.boxShadow }
                : null,
            ]}
            onPress={() => {
              getSuggestedTripByPostCodes();
              setSelection(1);
            }}
          >
            <Text
              style={[
                styles.btnText,
                selection === 1 ? { color: 'white' } : null,
              ]}
            >
              My Postcode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.btn,
              selection === 2
                ? { backgroundColor: Color.lightblue, ...Shadow.boxShadow }
                : null,
            ]}
            onPress={() => {
              requestLocationPermission();
              setSelection(2);
            }}
          >
            <Text
              style={[
                styles.btnText,
                selection === 2 ? { color: 'white' } : null,
              ]}
            >
              By Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <CustomFlatList
        horizontal={false}
        data={selection === 1 ? suggestedTripsbyPostCode : suggestedTrips}
        refreshing={refreshing}
        onRefresh={() => {
          getJoinedTrips();
          getInvitedTrips();
          if (selection === 1) {
            getSuggestedTripByPostCodes();
          } else {
            requestLocationPermission();
          }
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100 + getBottomSpace(),
          paddingTop: 10,
        }}
        renderItem={({ item, index }) => {
          if (item?.organizer?.id == user?.id) {
            return null;
          }
          if (item?.id > 0) {
            const passengerList =
              item?.passengers?.map(item => item?.passenger?.id) ?? [];
            const isJoined = passengerList.includes(user?.id);
            if (isJoined || item?.organizer?.id == user?.id) {
              return (
                <Communityinfo
                  onCardClick={GotoTripDetail}
                  marginHorizontal={5}
                  item={item}
                  key={item.id}
                />
              );
            }
            const isGotInvite = invitedList?.find(
              i =>
                i?.tripId?.toString() ==
                (item?.id?.toString() || item?.tripId?.toString()),
            );
            if (isGotInvite) {
              return (
                <Communityinfo
                  onPressAccept={() => {
                    currentItem.current = item;
                    if (user?.carOwner) {
                      currentItem.current = item;
                      isInvite.current = true;
                      setModalVisible(true);
                    } else {
                      acceptInvite(currentItem.current?.id, false);
                    }
                  }}
                  onPressDecline={() => {
                    rejectInvite(item?.id);
                  }}
                  onCardClick={GotoTripDetail}
                  marginHorizontal={5}
                  item={item}
                  key={item.id}
                />
              );
            }
            return (
              <Communityinfo
                onCardClick={GotoTripDetail}
                marginHorizontal={5}
                item={item}
                onPressinfobutton={() => {
                  currentItem.current = item;

                  if (user?.carOwner) {
                    currentItem.current = item;
                    isInvite.current = false;
                    setModalVisible(true);
                  } else {
                    sendInvite(currentItem.current?.id, false);
                  }
                }}
                isSended={joinedTripIds?.includes(item?.id)}
                key={item.id}
              />
            );
          }
        }}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={() =>
          !isLoading && (
            <View style={styles.emptyContainer}>
              <StatusMessage
                isOnline={currentNetworkStatus}
                hasData={suggestedTrips?.length > 0}
                title={'No Suggested Trips Available'}
              />
            </View>
          )
        }
      />

      <Loader removeModal visible={isLoading && suggestedTrips?.length == 0} />
      <Modal transparent animationType="slide" visible={isModalVisible}>
        <View style={styles.bottommodal}>
          <View style={[styles.modalView]}>
            <Text style={styles.modaltitle}>Invite to Trip</Text>
            <Text style={styles.modaltext}>
              Do you want to Join as driver or passenger?{' '}
            </Text>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                if (isInvite.current) {
                  acceptInvite(currentItem.current?.id, true);
                } else {
                  sendInvite(currentItem.current?.id, true);
                }
                setTimeout(
                  () => {
                    setModalVisible(false);
                  },
                  Platform.OS === 'ios' ? 900 : 0,
                );
              }}
            >
              <Text style={styles.modalbtntext}>Driver</Text>
            </Pressable>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                if (isInvite.current) {
                  acceptInvite(currentItem.current?.id, false);
                } else {
                  sendInvite(currentItem.current?.id, false);
                }
                setTimeout(
                  () => {
                    setModalVisible(false);
                  },
                  Platform.OS === 'ios' ? 900 : 0,
                );
              }}
            >
              <Text style={styles.modalbtntext}>Passenger</Text>
            </Pressable>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text style={[styles.modalbtntext, { color: 'red' }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const tab2styles = StyleSheet.create({
  tabbartab1: {
    marginVertical: 10,
    flex: 1,
  },
});

const ListEmptyComponent = () => (
  <View style={Invitationsstyle.tabbartab1}>
    <View style={Invitationsstyle.logocontainer}>
      <FastImage
        source={require('../assets/images/logo.png')}
        style={Invitationsstyle.profileimg}
      />
    </View>
  </View>
);

export const InvitationsTab = props => {
  const { jumpTo } = props;
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const invitedTrips = useSelector(state => state?.trip?.invitedTrips);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const currentItem = useRef({});
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const lastSyncTime = useSelector(state => state.trip.lastSyncTime);
  const isMounted = useRef(true);
  const invitedTripsLength = invitedTrips?.length ?? 0;
  const safeScrollIndex = Math.max(
    0,
    Math.min(
      props?.ListIndex !== undefined && props?.ListIndex > 0
        ? props?.ListIndex - 1
        : 0,
      invitedTripsLength - 1,
    ),
  );

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    getInvitedTrips();
    const unsubscribe = navigation.addListener('focus', () => {
      getInvitedTrips();
    });
    return unsubscribe;
  }, []);

  const getInvitedTrips = () => {
    setRefreshing(true);
    setIsLoading(true);
    dispatch(
      getInvitedTripsAction(user?.id, status => {
        setRefreshing(false);
        setIsLoading(false);
      }),
    );
  };

  const getmyTrips = () => {
    dispatch(
      getTripsPage(
        false,
        1,
        true,
        false,
        false,
        user?.id,
        (status, isEnded, start) => {},
      ),
    );
  };

  const GotoTripDetail = item => {
    navigation.navigate('TripDetail', item);
  };

  const acceptInvite = async (inviteId, tripId, isDriver) => {
    try {
      setIsLoading(true);

      await dispatch(acceptInviteAction(inviteId, tripId, isDriver, user));

      getInvitedTrips();
      getmyTrips();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (error?.toString()?.toLowerCase()?.trim() !== 'network error') {
        Alert.alert('Error', error?.toString());
      }
    }
  };

  const rejectInvite = async inviteId => {
    try {
      setIsLoading(true);

      await dispatch(rejectInviteAction(inviteId, user?.id));

      getInvitedTrips();
      getmyTrips();
      setIsLoading(false);
    } catch (error) {
      if (error?.toString()?.toLowerCase()?.trim() !== 'network error') {
        Alert.alert('Error', error?.toString());
      }
      setIsLoading(false);
    }
  };

  const getItemLayout = (data, index) => ({
    length: 305,
    offset: 305 * index,
    index,
  });

  return (
    <View style={tab2styles.tabbartab1}>
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -15, marginTop: -5 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSyncTime && !isLoading && currentNetworkStatus && (
        <View style={{ marginBottom: -15, marginTop: -5 }}>
          <SyncInfo
            lastSyncTime={lastSyncTime}
            showLoading={isLoading}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}
      <CustomFlatList
        refreshing={refreshing}
        onRefresh={getInvitedTrips}
        horizontal={false}
        data={invitedTrips}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        initialScrollIndex={safeScrollIndex}
        contentContainerStyle={{
          paddingBottom: 50 + getBottomSpace(),
          paddingTop: 10,
        }}
        renderItem={({ item, index }) => {
          if (item?.status != 1) {
            return (
              <Communityinfo
                onPressAccept={() => {
                  if (user?.carOwner) {
                    currentItem.current = item;
                    setModalVisible(true);
                  } else {
                    acceptInvite(item?.id, item?.tripId, false);
                  }
                }}
                onPressDecline={() => {
                  rejectInvite(item?.id);
                }}
                onCardClick={GotoTripDetail}
                marginHorizontal={5}
                item={item.trip}
                key={item.id}
                TripID={props?.TripID}
              />
            );
          } else {
            return null;
          }
        }}
        keyExtractor={({ item }, index) => index.toString()}
        ListEmptyComponent={() =>
          !isLoading && (
            <View style={styles.emptyContainer}>
              <StatusMessage
                isOnline={currentNetworkStatus}
                hasData={invitedTrips?.length > 0}
                title={'No Invited Trips Available'}
              />
            </View>
          )
        }
      />

      <Modal transparent animationType="slide" visible={isModalVisible}>
        <View style={styles.bottommodal}>
          <View style={[styles.modalView]}>
            <Text style={styles.modaltitle}>Invite to Trip</Text>
            <Text style={styles.modaltext}>
              Do you want to Join as driver or passenger?
            </Text>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                setModalVisible(false);
                acceptInvite(
                  currentItem.current?.id,
                  currentItem.current?.tripId,
                  true,
                );
              }}
            >
              <Text style={styles.modalbtntext}>Driver</Text>
            </Pressable>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                setModalVisible(false);
                acceptInvite(
                  currentItem.current?.id,
                  currentItem.current?.tripId,
                  false,
                );
              }}
            >
              <Text style={styles.modalbtntext}>Passenger</Text>
            </Pressable>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text style={[styles.modalbtntext, { color: 'red' }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Loader removeModal visible={isLoading && invitedTrips?.length == 0} />
    </View>
  );
};

const Invitationsstyle = StyleSheet.create({
  logocontainer: {},
  tabbartab1: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  profileimg: {
    height: 120,
    width: 120,
    borderRadius: 100,
    alignSelf: 'center',
    opacity: 0.2,
  },

  modalbtntext: {
    textAlign: 'center',
    fontSize: 17,
    fontFamily: fontFamily.ProximaR,
    fontWeight: '400',
    color: Color.lightblue,
  },
  divider: {
    marginVertical: 13,
    height: 1.5,
    backgroundColor: Color.cardbg,
  },
  modalbutton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  modaltext: {
    fontSize: 13,
    color: Color.gray,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 18,
  },
  modaltitle: {
    color: Color.gray,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 18,
  },
  bottommodal: {
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: Color.white,
    paddingVertical: 10,
    borderRadius: 10,
    textAlign: 'center',
  },

  mt2: {
    marginTop: 10,
  },
  profileimg: {
    width: 50,
    height: 50,
    borderRadius: 100,
    marginRight: 10,
    alignSelf: 'center',
    backgroundColor: Color.gray,
  },
  passengerimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    borderBottomColor: Color.cardbg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },

  searchbar: {
    borderRadius: 10,
    height: 40,
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  inputStyle: {
    paddingVertical: 0,
  },
  searchcontainer: {
    paddingHorizontal: 8,
    borderBottomColor: Color.cardbg,
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
    paddingBottom: 10,
  },
});
