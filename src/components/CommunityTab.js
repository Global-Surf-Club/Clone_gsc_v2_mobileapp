import { useNavigation } from '@react-navigation/native';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { Divider, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import Trip from '../api/Trip';
import { Communityinfo, TripReport } from '../components/CommunityItems';
import { Color, SCREEN_HEIGHT } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { styles } from '../screen/Community';
import CustomFlatList from './CustomFlatList';
import PreviewModal from './PreviewModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  acceptInviteAction,
  deleteInvitedIdTrip,
  getCommunityListDemo,
  getCommunityListFirst,
  getCommunityListisisBottom,
  getCommunityListisTop,
  getInviteeTripsIdsAction,
  rejectInviteAction,
  removeInviteeTripId,
  updateCommunityList,
  updateCommunityPassengersLocal,
} from '../store/tripSlice';
import {
  getCommunityListCount,
  addPendingAction,
  getJoinRequestsFromDB,
  saveJoinRequests,
} from '../database/tripDbHelper';
import ConnectionBanner from './ConnectionBanner';
import StatusMessage from './StatusMessage';
import SyncInfo from './SyncStatus';

let pageNo = 1;
let pageNoTop = 1;
let pageNoBottom = 1;
let isFetching = false;
let isDataLoaded = false;
let isTopLoaded = false;

const CommunityTab = props => {
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const currentItem = useRef(null);
  const isInvite = useRef(false);
  const [inviteLoader, setInviteLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const invitedList = useSelector(state => state.trip?.inviteeTripIds);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [isTopLoading, SetisTopLoading] = useState(false);
  const [joiinedList, setJoiinedList] = useState([]);
  const [reportimagePreviewModal, setreportimagePreviewModal] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [reportselectusersID, setreportselectusersID] = useState('');
  const [ScrollIndex, setScrollIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const communityList = useSelector(state => state.trip.communityList);
  const lastSyncTime = useSelector(state => state.trip?.lastSyncTime);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const onChangeSearch = query => setSearchQuery(query);

  const filteredList =
    searchQuery?.length == 0
      ? communityList
      : communityList.filter(item => {
          if (
            item?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase())
          ) {
            return true;
          }
          if (item?.tripId > 0) {
            if (
              (item?.organizer?.firstName + ' ' + item?.organizer?.lastName)
                ?.toLowerCase()
                ?.includes(searchQuery?.toLowerCase())
            ) {
              return true;
            }
            if (
              item?.destination?.title
                ?.toLowerCase()
                ?.includes(searchQuery?.toLowerCase())
            ) {
              return true;
            }
          }
          if (item?.tripReportId > 0) {
            if (
              (
                item?.trip?.organizer?.firstName +
                ' ' +
                item?.trip?.organizer?.lastName
              )
                ?.toLowerCase()
                ?.includes(searchQuery?.toLowerCase())
            ) {
              return true;
            }
            if (
              item?.trip?.destination?.title
                ?.toLowerCase()
                ?.includes(searchQuery?.toLowerCase())
            ) {
              return true;
            }
          }
          return false;
        });

  useEffect(() => {
    const loadCachedCount = async () => {
      const count = await getCommunityListCount();
      setCachedCount(count);
    };

    loadCachedCount();
  }, [communityList]);

  useEffect(() => {
    getCommunityListdemo();
    const unsubscribe = navigation.addListener('focus', () => {
      getCommunityListdemo();
    });
    return unsubscribe;
  }, []);

  // useEffect(() => {
  //   if (props?.ListIndex === -1) {
  //     alert('The trip is expired');
  //     getCommunityList(true);
  //   } else if (props?.ListIndex == 'ForHome') {
  //     getCommunityList(true);
  //   } else if (props?.ListIndex == 'NoIndex') {
  //     // Don't load
  //   } else if (
  //     props?.ListIndex !== 'NoIndex' &&
  //     props?.ListIndex !== 'ForHome'
  //   ) {
  //     if (parseInt(props?.ListIndex) > 10) {
  //       let modules = parseInt(props?.ListIndex) % 10;
  //       setScrollIndex(modules > 0 ? modules - 1 : 0);
  //       if (modules == 0) {
  //         pageNoTop = parseInt(parseInt(props?.ListIndex) / 10);
  //         pageNoBottom = parseInt(parseInt(props?.ListIndex) / 10);
  //         pageNo = parseInt(parseInt(props?.ListIndex) / 10);
  //         getCommunityList(false, false, false, false, true);
  //       } else {
  //         pageNoTop = parseInt(parseInt(props?.ListIndex) / 10) + 1;
  //         pageNoBottom = parseInt(parseInt(props?.ListIndex) / 10) + 1;
  //         pageNo = parseInt(parseInt(props?.ListIndex) / 10) + 1;
  //         getCommunityList(false, false, false, false, true);
  //       }
  //     } else {
  //       pageNoTop = 1;
  //       pageNoBottom = 1;
  //       pageNo = 1;
  //       setScrollIndex(
  //         parseInt(props?.ListIndex) > 0 ? parseInt(props?.ListIndex) - 1 : 0,
  //       );
  //       getCommunityList(false, false, false, false, true);
  //     }
  //   } else {
  //     getCommunityList(true);
  //   }
  // }, []);

  useEffect(() => {
    getItemLayout();
  }, [ScrollIndex]);

  useEffect(() => {
    getJoinedTrips();
    getInvitedTrips();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        // getCommunityList(true);
        getCommunityListdemo();
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const acceptInvite = async (id, isDriver) => {
    const item = invitedList?.find(
      i => i?.tripId?.toString() == id?.toString(),
    );
    if (!currentNetworkStatus) {
      await addPendingAction({
        actionType: 'ACCEPT_INVITE',
        entityId: item?.inviteId,
        payload: {
          inviteId: item?.inviteId,
          tripId: id,
          isDriver,
          userId: user?.id,
        },
        timestamp: new Date().toISOString(),
      });
      dispatch(removeInviteeTripId(id));
      // dispatch(updateCommunityList(id, user));
      dispatch(deleteInvitedIdTrip(id, user));
      // dispatch(updateCommunityPassengersLocal(id, user));
      return;
    }

    try {
      setIsLoading(true);
      if (item) {
        await Trip.acceptInviteInvite(item?.inviteId, isDriver);
      }
      // dispatch(updateCommunityList(id, user));
      dispatch(removeInviteeTripId(id));
      dispatch(deleteInvitedIdTrip(id, user));
      // dispatch(updateCommunityPassengersLocal(id, user));
      getCommunityListDemo();
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

  const onRefresh = () => {
    if (!currentNetworkStatus) {
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 3000);
      return;
    }

    // getCommunityList(true);
    getCommunityListdemo();
    getJoinedTrips();
    getInvitedTrips();
  };

  // const getCommunityList = (isRefresh, isBottom, isInvite, isTop, First) => {

  //   if (isBottom) {
  //     if (!currentNetworkStatus && pageNoBottom > Math.ceil(cachedCount / 10)) {
  //       setShowOfflineMessage(true);
  //       setTimeout(() => setShowOfflineMessage(false), 3000);
  //       isDataLoaded = true;
  //       return;
  //     }

  //     isFetching = true;
  //     setBottomLodaer(true);
  //     dispatch(
  //       getCommunityListisisBottom(pageNoBottom, (status, isEnded) => {
  //       setBottomLodaer(false);
  //         isFetching = false;
  //         if (isEnded && status) {
  //           isDataLoaded = true;
  //         }
  //       }),
  //     );
  //   } else if (isTop) {
  //     if (!currentNetworkStatus && pageNoTop <= 1) {
  //     isTopLoaded = true;
  //       return;
  //     }

  //     SetisTopLoading(true);
  //     isFetching = true;
  //     dispatch(
  //       getCommunityListisTop(pageNoTop, (status, isEnded) => {
  //        SetisTopLoading(false);
  //         isFetching = false;
  //         if (pageNoTop == 1) {
  //           isTopLoaded = true;
  //         }
  //       }),
  //     );
  //   } else if (First) {
  //     SetshowLoading(true);
  //     isTopLoaded = false;
  //     isFetching = true;
  //     dispatch(
  //       getCommunityListFirst(pageNo, (status, isEnded) => {
  //         SetshowLoading(false);
  //         isFetching = false;
  //         if (pageNoTop > 1 && isEnded && status && currentNetworkStatus) {
  //           // getCommunityList(false, false, false, true);
  //         }
  //         if (pageNo == 1) {
  //           isTopLoaded = true;
  //         }
  //       }),
  //     );
  //   } else if (isRefresh) {
  //     SetshowLoading(true);
  //     isDataLoaded = false;
  //     pageNo = 1;
  //     pageNoBottom = 1;
  //     pageNoTop = 1;
  //     isFetching = true;
  //     dispatch(
  //       getCommunityListFirst(pageNo, (status, isEnded) => {
  //         isFetching = false;
  //         SetshowLoading(false);
  //         if (pageNo == 1) {
  //           isTopLoaded = true;
  //         }
  //       }),
  //     );
  //   } else {
  //     setInviteLoader(true);
  //     isDataLoaded = false;
  //     pageNo = 1;
  //     pageNoBottom = 1;
  //     pageNoTop = 1;
  //     isFetching = true;
  //     dispatch(
  //       getCommunityListFirst(pageNo, (status, isEnded) => {
  //         isFetching = false;
  //         setInviteLoader(false);
  //         if (pageNo == 1) {
  //           isTopLoaded = true;
  //         }
  //       }),
  //     );
  //   }
  // };

  const getCommunityListdemo = () => {
    dispatch(getCommunityListDemo());
  };

  const getInvitedTrips = async () => {
    dispatch(getInviteeTripsIdsAction(user?.id));
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
      setJoiinedList(prev => [...prev, id]);
      return;
    }

    SetshowLoading(true);
    try {
      const param = { tripId: id, isDriver };
      await Trip.sendJoin(param);
      getJoinedTrips();
    } catch (error) {
      alert(error?.detail?.toString());
    } finally {
      SetshowLoading(false);
    }
  };

  const getJoinedTrips = async () => {
    try {
      const cachedRequests = await getJoinRequestsFromDB(user?.id);
      const temp = cachedRequests
        .filter(item => item.status === 0)
        .map(item => Number(item.trip?.id));
      setJoiinedList(temp);

      if (currentNetworkStatus) {
        const trips = JSON.parse(await Trip.getJoins(user?.id));
        await saveJoinRequests(user?.id, trips);
        const tempOnline = trips
          .filter(item => item.status === 0)
          .map(item => item.trip?.id);
        setJoiinedList(tempOnline);
      }
    } catch (error) {}
  };

  const GotoTripReport = item => {
    navigation.navigate('TripReport', { item });
  };

  const GotoTripDetail = item => {
    navigation.navigate('TripDetail', {
      ...item,
      showAll: user?.id == item?.organizer?.id,
    });
  };

  const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    return contentOffset.y <= 0;
  };

  const getItemLayout = (data, index) => ({
    length: 305,
    offset: 305 * index,
    index,
  });

  return (
    <View style={{ flex: 1 }}>
      <Loader
        removeModal
        visible={
          isLoading ||
          (filteredList?.length == 0 && showLoading) ||
          inviteLoader
        }
      />
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -12, marginTop: 5 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSyncTime && !showLoading && currentNetworkStatus && (
        <View style={{ marginBottom: -12 }}>
          <SyncInfo
            lastSyncTime={lastSyncTime}
            showLoading={showLoading}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}

      <View style={[styles.searchcontainer, { marginTop: 10 }]}>
        <Searchbar
          placeholder="Search..."
          selectionColor={Color.gray}
          onChangeText={onChangeSearch}
          value={searchQuery}
          inputStyle={styles.inputStyle}
          style={styles.searchbar}
        />
      </View>

      {filteredList?.length > 0 ? (
        <CustomFlatList
          style={{ flex: 1 }}
          horizontal={false}
          onRefresh={onRefresh}
          refreshing={showLoading}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: getBottomSpace(),
          }}
          data={filteredList}
          getItemLayout={getItemLayout}
          initialScrollIndex={
            ScrollIndex < filteredList.length ? ScrollIndex : 0
          }
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollToOverflowEnabled={true}
          onEndReachedThreshold={0.5}
          fadingEdgeLength={10}
          removeClippedSubviews={false}
          keyExtractor={item => {
            if (item.tripId) {
              return `trip_${item.tripId}`;
            }
            if (item.tripReportId) {
              return `report_${item.tripReportId}`;
            }
            return Math.random().toString();
          }}
          renderItem={({ item, index }) => {
            if (item?.tripId > 0) {
              const passengerList =
                item?.passengers?.map(item => item?.passenger?.id) ?? [];
              const isJoined = passengerList.includes(user?.id);
              if (isJoined || item?.organizer?.id == user?.id) {
                return (
                  <Communityinfo
                    onCardClick={GotoTripDetail}
                    marginHorizontal={5}
                    item={item}
                    key={item?.tripId?.toString()}
                    TripID={props?.TripID}
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
                        acceptInvite(
                          currentItem.current?.id ||
                            currentItem.current?.tripId,
                          false,
                        );
                      }
                    }}
                    onPressDecline={() => {
                      rejectInvite(item?.id || item?.tripId);
                    }}
                    onCardClick={GotoTripDetail}
                    marginHorizontal={5}
                    item={item}
                    TripID={props?.TripID}
                    key={item?.tripId?.toString()}
                  />
                );
              }

              return (
                <Communityinfo
                  onCardClick={GotoTripDetail}
                  marginHorizontal={5}
                  item={item}
                  TripID={props?.TripID}
                  onPressinfobutton={() => {
                    currentItem.current = item;
                    if (user?.carOwner) {
                      currentItem.current = item;
                      isInvite.current = false;
                      setModalVisible(true);
                    } else {
                      sendInvite(
                        currentItem.current?.id || currentItem.current?.tripId,
                        false,
                      );
                    }
                  }}
                  isSended={joiinedList?.includes(item?.tripId)}
                  key={item?.tripId?.toString()}
                />
              );
            }
            return (
              <TripReport
                onPressreportImage={() => {
                  setreportimagePreviewModal(true);
                  setReportUrl(item?.images[0]?.imageUrl);
                  setreportselectusersID(item?.id || item?.tripReportId);
                }}
                TripID={props?.TripID}
                onPressRead={() => {
                  GotoTripReport(item);
                }}
                item={item}
                key={item?.tripReportId?.toString()}
              />
            );
          }}
        />
      ) : (
        !showLoading && (
          <View style={styles.emptyContainer}>
            <StatusMessage
              isOnline={currentNetworkStatus}
              hasData={filteredList?.length > 0}
              title={'No Trips or Reports Available'}
            />
          </View>
        )
      )}

      <PreviewModal
        visible={reportimagePreviewModal}
        onClose={() => {
          setreportimagePreviewModal(false);
        }}
        onOpen={() => {
          setreportimagePreviewModal(true);
        }}
        selectimageID={reportselectusersID}
        photoUrl={reportUrl}
        pageName={'reportimage'}
      />

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
                setModalVisible(false);
                if (isInvite.current) {
                  acceptInvite(
                    currentItem.current?.id || currentItem.current?.tripId,
                    true,
                  );
                } else {
                  sendInvite(
                    currentItem.current?.id || currentItem.current?.tripId,
                    true,
                  );
                }
              }}
            >
              <Text style={styles.modalbtntext}>Driver</Text>
            </Pressable>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                setModalVisible(false);
                if (isInvite.current) {
                  acceptInvite(
                    currentItem.current?.id || currentItem.current?.tripId,
                    false,
                  );
                } else {
                  sendInvite(
                    currentItem.current?.id || currentItem.current?.tripId,
                    false,
                  );
                }
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

const localStyles = {
  offlineBanner: {
    backgroundColor: Color.lightblue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  offlineText: {
    color: Color.white,
    fontSize: getFontSize(12),
    fontFamily: 'ProximaNova-Bold',
  },
  offlineMessage: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    zIndex: 2000,
    elevation: 10,
  },
  offlineMessageText: {
    color: Color.white,
    fontSize: getFontSize(14),
    fontFamily: 'ProximaNova-Regular',
    textAlign: 'center',
  },
  loaderContainer: {
    height: dynamicSize(50),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: getFontSize(16),
    fontFamily: 'ProximaNova-Regular',
    color: Color.cardgray,
    textAlign: 'center',
  },
};

export default memo(CommunityTab);
