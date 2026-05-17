// AllTabsScreen.js
// import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  InteractionManager,
  Platform,
} from 'react-native';
import { Color, fontFamily, Shadow, text } from '../constants/Constants';
import SuccessModal from '../components/SuccessModal';
import { useSelector, useDispatch } from 'react-redux';
import ClubApi from '../api/ClubApi';
import Loader from '../constants/Loader';
import CustomFlatList from '../components/CustomFlatList';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import AttendedModal from '../components/AttendedModal';
import EventMaybeGoingModel from '../components/EventMaybeGoingModal';
import { Eventlist } from '../components/ClubComponentitem';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  fetchEvents,
  fetchMyEvents,
  likeEvent,
  mergeEvent,
  updateEventAttendance,
} from '../store/eventSlice';
import NetInfo from '@react-native-community/netinfo';
import { Text } from 'react-native';
import ConnectionBanner from '../components/ConnectionBanner';
import StatusMessage from '../components/StatusMessage';
import SyncInfo from '../components/SyncStatus';
import { FlashList } from '@shopify/flash-list';
let pageNo = 1;
let pageNoTop = 1;
let pageNoBottom = 1;

let isFetching = false;
let isDataLoaded = false;
let isDataLoadedTop = false;

let pageNoOrganiser = 1;
let isFetchingOrganiser = false;
let isDataLoadedOrganiser = false;

export const AllTab = props => {
  const EMPTY_ARRAY = [];
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const events = useSelector(state => state.event.events ?? EMPTY_ARRAY);
  const loadingFromStore = useSelector(state => state.event.loading);
  const lastSyncTime = useSelector(state => state.event.lastSyncTime);
  const user = useSelector(state => state.auth.user);
  const scrollToIndex = useRef(0);
  const isFromNotification = useRef(false);
  const [showLoading, setShowLoading] = useState(false);
  const [bottomLoader, setBottomLoader] = useState(false);
  const [topLoader, setTopLoader] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const [MaybeGoing, setMaybeGoing] = useState(false);
  const [AttendEventID, setAttendEventID] = useState('');
  const [Maybe, setMaybe] = useState('');
  const [IsAttended, setIsAttended] = useState(false);
  const hasReachedEnd = useRef(false);

  useEffect(() => {
    if (
      props?.ListIndex !== undefined &&
      props?.ListIndex !== null &&
      props?.ListIndex !== ''
    ) {
      isFromNotification.current = true;
      if (props?.ListIndex === -1) {
        alert('The Event is Expird');
        getAllEvent();
      } else {
        if (parseInt(props?.ListIndex) > 10) {
          let modules = parseInt(props?.ListIndex) % 10;

          if (modules == 0) {
            pageNoTop = parseInt(parseInt(props?.ListIndex) / 10);
            pageNoBottom = parseInt(parseInt(props?.ListIndex) / 10);
            pageNo = parseInt(parseInt(props?.ListIndex) / 10);
            scrollToIndex.current = 9;
            getAllEvent(false, false, false, true);
          } else {
            pageNoTop = parseInt(parseInt(props?.ListIndex) / 10) + 1;
            pageNoBottom = parseInt(parseInt(props?.ListIndex) / 10) + 1;
            pageNo = parseInt(parseInt(props?.ListIndex) / 10) + 1;
            scrollToIndex.current = modules > 0 ? modules - 1 : 0;
            getAllEvent(false, false, false, true);
          }
        } else {
          pageNoTop = 1;
          pageNoBottom = 1;
          pageNo = 1;
          scrollToIndex.current =
            parseInt(props?.ListIndex) > 0 ? parseInt(props?.ListIndex) - 1 : 0;
          getAllEvent(false, false, false, true);
        }
      }
    } else {
      getAllEvent();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !currentNetworkStatus) {
        pageNo = 1;
        getAllEvent();
      }
      setCurrentNetworkStatus(state.isConnected);
    });
    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const getAllEvent = async (
    isRefresh = false,
    isBottom = false,
    isTop = false,
    isStart = false,
  ) => {
    try {
      if (isBottom) setBottomLoader(true);
      else if (isTop) setTopLoader(true);
      else setShowLoading(true);

      isFetching = true;

      const pageToFetch = isBottom ? pageNoBottom : isTop ? pageNoTop : pageNo;
      const mode =
        isStart || isRefresh
          ? 'replace'
          : isBottom
          ? 'append'
          : isTop
          ? 'prepend'
          : 'replace';
      dispatch(
        fetchEvents(pageToFetch, 10, mode, (success, isLast) => {
          isFetching = false;
          setBottomLoader(false);
          setTopLoader(false);
          setShowLoading(false);

          if (!success) return;
          if (isLast) {
            isDataLoaded = true;
            hasReachedEnd.current = true;
          }
          if (pageToFetch === 1) isDataLoadedTop = true;
        }),
      );
    } catch {
      isFetching = false;
      setBottomLoader(false);
      setTopLoader(false);
      setShowLoading(false);
    }
  };

  const gotoeventdetail = useCallback(
    id => {
      navigation.navigate('EventViewDetail', {
        EventId: id,
        clubid: -999,
        isPublish: 'isPublish',
      });
    },
    [navigation],
  );

  const onEventLikeClick = useCallback(
    (id, type) => {
      dispatch(likeEvent({ eventId: id, type }, id));
    },
    [dispatch],
  );

  const handleEventComment = useCallback(
    (id, onlyAdminCommentOnly, organizerId) => {
      navigation.navigate('ClubEventComments', {
        EventId: id,
        clubid: -999,
        isPublish: 'isPublish',
        onlyAdminCommentOnly,
        organizerId,
      });
    },
    [navigation],
  );

  const OnGoingMaybeClick = async (id, status) => {
    try {
      let data = {
        eventId: id,
        memberId: user?.id,
        status: status,
      };
      let response = await ClubApi.clubEventMember(data);
      if (response) {
        const eventDetails = await ClubApi.getclubseventDetails(id);
        const updatedEvent = JSON.parse(eventDetails);
        dispatch(
          mergeEvent({
            id: id,
            data: updatedEvent,
          }),
        );
      }
    } catch (err) {}
  };

  const onScroll = ({ nativeEvent }) => {
    if (
      nativeEvent.contentOffset.y <= 0 &&
      !isFetching &&
      !isDataLoadedTop &&
      pageNoTop > 1
    ) {
      pageNoTop -= 1;
      getAllEvent(false, false, true);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Loader visible={events.length === 0 && showLoading} />

      {!currentNetworkStatus && <ConnectionBanner isOnline={false} />}

      {lastSyncTime && currentNetworkStatus && !showLoading && (
        <SyncInfo lastSyncTime={lastSyncTime} />
      )}

      {events?.length > 0 ? (
        <FlashList
          estimatedItemSize={305}
          horizontal={false}
          data={events}
          onRefresh={() => {
            getAllEvent(true);
          }}
          refreshing={events?.length == 0 && (showLoading || loadingFromStore)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop:
              lastSyncTime || !currentNetworkStatus
                ? Platform.OS === 'ios'
                  ? 5
                  : 0
                : 10,
            paddingBottom: getBottomSpace(),
          }}
          initialScrollIndex={scrollToIndex > 0 ? scrollToIndex : undefined}
          onEndReached={() => {
            if (hasReachedEnd.current) return;
            if (isFetching) return;
            pageNoBottom += 1;
            getAllEvent(false, true);
          }}
          onEndReachedThreshold={0.2}
          onScroll={onScroll}
          overrideItemLayout={(layout, item) => {
            if (item.images?.length > 0) {
              layout.size = 400;
            } else {
              layout.size = 260;
            }
          }}
          ListFooterComponent={() => {
            if (bottomLoader) {
              return (
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
              );
            } else {
              return null;
            }
          }}
          ListHeaderComponent={() => {
            if (topLoader) {
              return (
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
              );
            } else {
              return null;
            }
          }}
          renderItem={({ item, index }) => (
            <Eventlist
              item={item}
              key={item?.id ?? index}
              userId={user?.id}
              marginHorizontal={5}
              EventIDH={props?.EventIDH}
              onCardClick={gotoeventdetail}
              onEventLikeClick={onEventLikeClick}
              onEventCommentClick={handleEventComment}
              Maybe={id => {
                setAttendEventID(id);
                setMaybeGoing(true);
                setMaybe('Maybe');
              }}
              GoingTo={id => {
                setAttendEventID(id);
                setMaybeGoing(true);
                setMaybe('GoingTo');
              }}
              AttendClub={id => {
                setAttendEventID(id);
                setIsAttended(true);
              }}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />
      ) : (
        !showLoading && (
          <View style={styles.emptyContainer}>
            <StatusMessage
              isOnline={currentNetworkStatus}
              hasData={false}
              title="No Events Available"
            />
          </View>
        )
      )}

      <AttendedModal
        visible={IsAttended}
        Yes={v => {
          setIsAttended(false);
          OnGoingMaybeClick(AttendEventID, v);
        }}
        No={v => {
          setIsAttended(false);
          OnGoingMaybeClick(AttendEventID, v);
        }}
        Maybe={v => {
          setIsAttended(false);
          OnGoingMaybeClick(AttendEventID, v);
        }}
        onPressClose={() => setIsAttended(false)}
      />

      <EventMaybeGoingModel
        visible={MaybeGoing}
        EventID={AttendEventID}
        Maybe={Maybe}
        onPressClose={() => setMaybeGoing(false)}
      />
    </View>
  );
};

export const MyOrganiser = props => {
  const EMPTY_ARRAY = [];
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showLoading, SetshowLoading] = useState(false);
  const user = useSelector(state => state.auth.user);
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const myEvents = useSelector(state => state.event.myEvents ?? EMPTY_ARRAY);
  const lastSyncTime = useSelector(state => state.event.lastSyncTime);
  const [EventItemList, SetEventItemListLocal] = useState([]);
  const [MaybeGoing, setMaybeGoing] = useState(false);
  const [AttendEventID, setAttendEventID] = useState('');
  const [Maybe, setMaybe] = useState('');
  const [IsAttended, setIsAttended] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  useEffect(() => {
    GetMyallEvent();
    const unsubscribe = navigation.addListener('focus', () => {
      pageNoOrganiser = 1;
      GetMyallEvent(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (myEvents && Array.isArray(myEvents)) {
      SetEventItemListLocal(myEvents);
    }
  }, [myEvents]);

  const GetMyallEvent = async (isRefresh, isBottom) => {
    try {
      if (isBottom) {
        setBottomLodaer(true);
      } else if (isRefresh) {
        isDataLoadedOrganiser = false;
        pageNoOrganiser = 1;
        SetshowLoading(true);
      }
      isFetchingOrganiser = true;

      dispatch(
        fetchMyEvents(pageNoOrganiser, 10, (successFlag, isLastPageFlag) => {
          SetshowLoading(false);
          setBottomLodaer(false);
          if (!successFlag) {
            isFetchingOrganiser = false;
            return;
          }
          if (isLastPageFlag) {
            isDataLoadedOrganiser = true;
          }
          isFetchingOrganiser = false;
        }),
      );
    } catch (error) {
      SetEventItemListLocal([]);
      SetshowLoading(false);
      setBottomLodaer(false);
      isDataLoadedOrganiser = false;
      isFetchingOrganiser = false;
      pageNoOrganiser = 1;
    }
  };

  const OnGoingMaybeClick = async (id, status) => {
    try {
      let data = {
        eventId: id,
        memberId: user?.id,
        status: status,
      };
      let response = await ClubApi.clubEventMember(data);
      if (response) {
        const eventDetails = await ClubApi.getclubseventDetails(id);
        const updatedEvent = JSON.parse(eventDetails);
        dispatch(
          mergeEvent({
            id: id,
            data: updatedEvent,
          }),
        );
      }
    } catch (err) {}
  };

  const onEventLikeClick = async (Id, type = 'like') => {
    try {
      const payload = { eventId: Id, type: type };
      dispatch(likeEvent(payload, Id));
    } catch (err) {}
  };

  const onEventCommentClick = (EventId, onlyAdminCommentOnly, organizerId) => {
    navigation.navigate('ClubEventComments', {
      EventId,
      clubid: -999,
      isPublish: 'isPublish',
      onlyAdminCommentOnly,
      organizerId,
    });
  };

  const gotoeventdetail = EventId => {
    let clubid = -999;
    let isPublish = 'isPublish';
    navigation.navigate('EventViewDetail', { EventId, clubid, isPublish });
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        pageNoOrganiser = 1;
        GetMyallEvent();
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  return (
    <View style={{ flex: 1 }}>
      <Loader visible={myEvents?.length == 0 && showLoading} />
      {!currentNetworkStatus && (
        <View>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}
      {lastSyncTime && !showLoading && currentNetworkStatus && (
        <View>
          <SyncInfo
            lastSyncTime={lastSyncTime}
            showLoading={showLoading}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}
      {EventItemList?.length > 0 ? (
        <CustomFlatList
          horizontal={false}
          data={EventItemList}
          onRefresh={() => {
            pageNoOrganiser = 1;
            GetMyallEvent(true);
          }}
          refreshing={showLoading}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: lastSyncTime || currentNetworkStatus ? 0 : 10,
            paddingBottom: 20 + getBottomSpace(),
          }}
          onEndReached={() => {
            if (!isFetchingOrganiser && !isDataLoadedOrganiser) {
              pageNoOrganiser += 1;
              GetMyallEvent(false, true);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (bottomLodaer) {
              return (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={Color.black0} />
                </View>
              );
            }
            return null;
          }}
          renderItem={({ item, index }) => (
            <Eventlist
              EventIDH={props?.EventIDH}
              onCardClick={Id => {
                gotoeventdetail(Id);
              }}
              onEventLikeClick={(Id, type) => {
                onEventLikeClick(Id, type);
              }}
              onEventCommentClick={(Id, onlyAdminCommentOnly, organizerId) => {
                onEventCommentClick(Id, onlyAdminCommentOnly, organizerId);
              }}
              Maybe={item => {
                setAttendEventID(item);
                setMaybeGoing(true);
                setMaybe('Maybe');
              }}
              GoingTo={item => {
                setAttendEventID(item);
                setMaybeGoing(true);
                setMaybe('GoingTo');
              }}
              AttendClub={item => {
                setAttendEventID(item);
                setIsAttended(true);
              }}
              marginHorizontal={5}
              item={item}
              key={index}
              userId={user?.id}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : (
        !showLoading && (
          <View style={styles.emptyContainer}>
            <StatusMessage
              isOnline={currentNetworkStatus}
              hasData={EventItemList?.length > 0}
              title={'No Events Available'}
            />
          </View>
        )
      )}
      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          pageNoOrganiser = 1;
          GetMyallEvent();
        }}
        description={successdescription}
        iserror={iserror}
      />
      <AttendedModal
        visible={IsAttended}
        Yes={item => {
          setIsAttended(false);
          OnGoingMaybeClick(AttendEventID, item);
        }}
        No={item => {
          setIsAttended(false);
          OnGoingMaybeClick(AttendEventID, item);
        }}
        Maybe={item => {
          setIsAttended(false);
          OnGoingMaybeClick(AttendEventID, item);
        }}
        onPressClose={() => {
          setIsAttended(false);
        }}
      />
      <EventMaybeGoingModel
        visible={MaybeGoing}
        onPressClose={() => {
          setMaybeGoing(false);
        }}
        Maybe={Maybe}
        EventID={AttendEventID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  offlineIndicator: {
    backgroundColor: Color.lightblue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 6,
    fontFamily: fontFamily.ProximaAB,
  },
  syncInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
  },
  syncInfoText: {
    fontSize: 11,
    color: Color.gray,
    marginLeft: 4,
    fontFamily: fontFamily.ProximaR,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loaderContainer: {
    height: dynamicSize(50),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
