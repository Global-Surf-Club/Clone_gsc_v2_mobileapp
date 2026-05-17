import React, { useEffect, useState, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { Color, fontFamily } from '../constants/Constants';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import ClubsAPi from '../api/ClubApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loader from '../constants/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as dbHelper from '../database/eventDbHelper';
import NetInfo from '@react-native-community/netinfo';
import { useSelector } from 'react-redux';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );
let pageNoEvent = 1;
let isFetchingEvent = false;
let isDataLoadedEvent = false;
const EventMaybeGoingModel = ({ visible, onPressClose, Maybe, EventID }) => {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const [showLoading, SetshowLoading] = useState(false);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [GoingToList, setGoingToList] = useState([]);
  const [MaybeList, setMaybeList] = useState([]);
  useEffect(() => {
    setMaybeList([]);
    setGoingToList([]);
    pageNoEvent = 1;
    isFetchingEvent = false;
    isDataLoadedEvent = false;
    if (visible) {
      if (Maybe === 'Maybe') {
        getMaybeList(EventID, true);
      } else if (Maybe === 'GoingTo') {
        getGoingToList(EventID, true);
      }
    }
  }, [visible]);
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
  const getGoingToList = async (eventID, isRefresh, isBottom) => {
    try {
      // Load from local DB first
      const localMembers = await dbHelper.getEventMembers(
        eventID,
        'going',
        pageNoEvent,
        10000,
      );
      if (pageNoEvent === 1) {
        setGoingToList(localMembers);
      } else {
        let GoingToOld = [...GoingToList];
        localMembers.map(item => {
          GoingToOld.push(item);
        });
        setBottomLodaer(false);
        setGoingToList(GoingToOld);
        if (localMembers?.length !== 10) {
          isDataLoadedEvent = true;
        }
      }

      // Check if online
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        if (isBottom) {
          setBottomLodaer(true);
        } else if (isRefresh) {
          isDataLoadedEvent = false;
          pageNoEvent = 1;
          SetshowLoading(true);
        }
        isFetchingEvent = true;
        SetshowLoading(true);

        const response = await ClubsAPi.getAllGoingToList(
          eventID,
          pageNoEvent,
          10000,
        );
        const data = JSON.parse(response);
        await dbHelper.bulkInsertEventMembers(
          eventID,
          data,
          'going',
          pageNoEvent,
        );
        if (pageNoEvent === 1) {
          setGoingToList(data);
        } else {
          let GoingToOld = [...GoingToList];
          data.map(item => {
            GoingToOld.push(item);
          });
          setBottomLodaer(false);
          setGoingToList(GoingToOld);
          if (data?.length !== 10) {
            isDataLoadedEvent = true;
          }
        }
      }
      SetshowLoading(false);
      isFetchingEvent = false;
    } catch (error) {
      setGoingToList([]);
      SetshowLoading(false);
      isDataLoadedEvent = false;
      pageNoEvent = 1;
    }
  };

  const getMaybeList = async (eventID, isRefresh, isBottom) => {
    try {
      // Load from local DB first
      const localMembers = await dbHelper.getEventMembers(
        eventID,
        'maybe',
        pageNoEvent,
        10000,
      );
      if (pageNoEvent === 1) {
        setMaybeList(localMembers);
      } else {
        let MaybeOld = [...MaybeList];
        localMembers.map(item => {
          MaybeOld.push(item);
        });
        setBottomLodaer(false);
        setMaybeList(MaybeOld);
        if (localMembers?.length !== 10) {
          isDataLoadedEvent = true;
        }
      }

      // Check if online
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        if (isBottom) {
          setBottomLodaer(true);
        } else if (isRefresh) {
          isDataLoadedEvent = false;
          pageNoEvent = 1;
          SetshowLoading(true);
        }
        isFetchingEvent = true;
        SetshowLoading(true);

        const response = await ClubsAPi.getAllMaybeList(
          eventID,
          pageNoEvent,
          10000,
        );
        const data = JSON.parse(response);
        await dbHelper.bulkInsertEventMembers(
          eventID,
          data,
          'maybe',
          pageNoEvent,
        );
        if (pageNoEvent === 1) {
          setMaybeList(data);
        } else {
          let MaybeOld = [...MaybeList];
          data.map(item => {
            MaybeOld.push(item);
          });
          setBottomLodaer(false);
          setMaybeList(MaybeOld);
          if (data?.length !== 10) {
            isDataLoadedEvent = true;
          }
        }
      }
      SetshowLoading(false);
      isFetchingEvent = false;
    } catch (error) {
      setMaybeList([]);
      SetshowLoading(false);
      isDataLoadedEvent = false;
      pageNoEvent = 1;
    }
  };
  const getMemberName = member => {
    const memberId = member?.id;

    const isDeleted =
      Array.isArray(user?.inActiveUsers) &&
      user.inActiveUsers.some(id => String(id) === String(memberId));

    if (isDeleted) return 'Deletion Requested';

    const firstName = member?.firstName || '';
    const lastName = member?.lastName || '';

    return `${firstName} ${lastName}`.trim() || 'Unknown';
  };

  const list =
    Maybe === 'Maybe' ? MaybeList : Maybe === 'GoingTo' ? GoingToList : [];
  return (
    <Modal
      isVisible={visible}
      deviceWidth={deviceWidth}
      deviceHeight={deviceHeight}
    >
      <Loader visible={showLoading} />
      <View style={styles.modalcontainer}>
        <View style={styles.modalsubcontainer}>
          <View style={[styles.mx2, styles.modalheader]}>
            <Text style={styles.formtitle}>
              {Maybe === 'GoingTo' ? 'Going' : Maybe}
            </Text>
            <Pressable
              style={styles.close}
              onPress={() => {
                onPressClose();
              }}
            >
              <Ionicons name="close-circle" size={26} color={Color.black} />
            </Pressable>
          </View>
          <ScrollView
            onScroll={({ nativeEvent }) => {
              if (isCloseToBottom(nativeEvent) === true) {
                if (!isFetchingEvent && !isDataLoadedEvent) {
                  pageNoEvent += 1;
                  if (Maybe === 'Maybe') {
                    getMaybeList(EventID, true);
                  } else if (Maybe === 'GoingTo') {
                    getGoingToList(EventID, true);
                  }
                }
              }
            }}
            bounces={true}
            alwaysBounceVertical={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            {/* {Maybe === 'Maybe' ? (
              MaybeList?.length > 0 ? (
                MaybeList?.map(item => (
                  <View style={styles.modalflatlist}>
                    <Text style={styles.listitemtext}>
                      {item?.member?.firstName + ' ' + item?.member?.lastName}
                    </Text>
                  </View>
                ))
              ) : (
                <></>
              )
            ) : Maybe === 'GoingTo' ? (
              GoingToList?.length > 0 ? (
                GoingToList?.map(item => (
                  <View style={styles.modalflatlist}>
                    <Text style={styles.listitemtext}>
                      {item?.member?.firstName + ' ' + item?.member?.lastName}
                    </Text>
                  </View>
                ))
              ) : (
                <></>
              )
            ) : (
              <></>
            )} */}
            {list?.length > 0 &&
              list.map((item, index) => (
                <View key={index} style={styles.modalflatlist}>
                  <Text style={styles.listitemtext}>
                    {getMemberName(item?.member)}
                  </Text>
                </View>
              ))}
            <View style={styles.modalflatlist}>
              <Text style={styles.listitemtext}></Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  close: {
    position: 'absolute',
    right: -5,
    top: 4,
    height: dynamicSize(40),
    width: dynamicSize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalheader: {},
  mx2: {
    marginHorizontal: dynamicSize(10),
  },
  modalflatlist: {
    flex: 1,
    marginTop: 7,
    marginHorizontal: 10,
  },
  modalsubcontainer: {
    backgroundColor: Color.white,
    minHeight: dynamicSize(170),
    borderRadius: 8,
    paddingBottom: dynamicSize(10),
  },
  listitemtext: {
    fontSize: getFontSize(16),
    color: Color.black0,
  },
  listitem: {
    paddingVertical: dynamicSize(15),
    // borderBottomColor: Color.lightGray,
    // borderBottomWidth: 1,
    paddingLeft: dynamicSize(10),
  },
  modalcontainer: {
    // alignItems: 'center',
    justifyContent: 'center',
  },
  formtitle: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getFontSize(23),
    fontFamily: fontFamily.ProximaBold,
    marginTop: dynamicSize(10),
  },
});

export default EventMaybeGoingModel;
