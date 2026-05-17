import React, { useEffect, useState, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { Layout } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Divider } from 'react-native-elements';
import moment from 'moment';
import { Header } from '../components/Header';
import ClubsAPi from '../api/ClubApi';
import { Color, fontFamily, Shadow } from '../constants/Constants';
import Loader from '../constants/Loader';
import AttendedModal from '../components/AttendedModal';
import EventMaybeGoingModel from '../components/EventMaybeGoingModal';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import { eventstyle } from '../components/ClubComponentitem';
import SuccessModal from '../components/SuccessModal';
import { ClubmultiplePopover } from '../components/ClubmultiplePopover';
import {
  fetchEventDetails,
  updateEventAttendance,
  fetchEventMembers,
  likeEvent,
} from '../store/eventSlice';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';
import FastImage from 'react-native-fast-image';
import { getUserInfoText } from '../constants/Utility';

const EventViewDetail = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { EventId, clubid, isPublish } = props?.route?.params;
  const EventDetails = useSelector(
    state => state.event.eventDetails[EventId] || null,
  );
  const eventMembers = useSelector(
    state => state.event.eventMembers[EventId]?.all || [],
  );
  const loading = useSelector(state => state.event.loading);
  const [showLoading, SetshowLoading] = useState(false);
  const [IsAttended, setIsAttended] = useState(false);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [topLoader, setTopLodaer] = useState(false);
  const [MaybeGoing, setMaybeGoing] = useState(false);
  const [AttendClubEventID, setAttendClubEventID] = useState('');
  const [refreshLoader, setRefreshLoader] = useState(false);
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [Maybe, setMaybe] = useState('');
  const [whosonthelist, setwhosonthelist] = useState('');
  const [textShown, setTextShown] = useState(false);
  const [lengthMore, setLengthMore] = useState(false);
  const [measured, setMeasured] = useState(false);
  const scrollToIndex = useRef(0);
  const dataSourceCords = useRef([]);
  const ScrollRef = useRef();
  const AllEventMemberList = useRef([]);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const [heightlightColor, setheightlightColor] = useState(Color?.lightblue);
  const canViewGuestList =
    EventDetails?.isShowGuestList === true ||
    EventDetails?.organizerId === user?.id;
  const isOrganiserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(
      id => String(id) === String(EventDetails?.organizer?.id),
    );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (eventMembers && eventMembers.length > 0) {
      AllEventMemberList.current = eventMembers;
    }
  }, [eventMembers]);

  useEffect(() => {
    if (props?.route?.params?.MemberID) {
      setwhosonthelist(true);
    }
  }, [props]);

  useEffect(() => {
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 10000);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getclubseventDetails(EventId);
      getEventMemberList(EventId);
    });
    return unsubscribe;
  }, [EventId]);

  const toggleNumberOfLines = () => setTextShown(prev => !prev);

  const toggalwhosonthelist = () => {
    setwhosonthelist(!whosonthelist);
  };

  const menuButtonClick = () => {
    navigation.goBack();
  };

  const gotoUpdateEvent = () => {
    navigation.navigate('CreateEvent', { clubid, EventDetails, isPublish });
  };

  const getclubseventDetails = eventId => {
    SetshowLoading(true);
    dispatch(
      fetchEventDetails(eventId, (successFlag, data) => {
        if (!successFlag) {
          SetshowLoading(false);
        } else {
          SetshowLoading(false);
        }
      }),
    );
  };

  const getEventMemberList = eventID => {
    dispatch(
      fetchEventMembers(eventID, 'all', 1, 9999, (success, isEnd) => {}),
    );
  };

  const OnClickGoingMaybe = async (id, status) => {
    SetshowLoading(true);
    let data = {
      eventId: id,
      memberId: user?.id,
      status: status,
      user: user,
    };
    dispatch(
      updateEventAttendance(data, (successFlag, res) => {
        if (successFlag) {
          getclubseventDetails(EventId);
        }
        SetshowLoading(false);
      }),
    );
  };

  const onEventCommentClick = (EventId, onlyAdminCommentOnly, organizerId) => {
    navigation.navigate('ClubEventComments', {
      EventId,
      clubid,
      isPublish,
      onlyAdminCommentOnly,
      organizerId,
    });
  };

  const onEventLikeClick = async (eventId, type) => {
    const currentIsLiked = EventDetails?.isLike;
    const payload = {
      eventId: eventId,
      type: type,
      user_id: user?.id,
    };

    dispatch(
      likeEvent(payload, eventId, (success, res) => {
        if (success) {
          // Refresh event details to get updated like count
          getclubseventDetails(EventId);
        }
      }),
    );
  };

  const DeleteEvent = async eventID => {
    if (
      eventID !== null &&
      eventID !== undefined &&
      eventID !== '' &&
      eventID !== 0
    ) {
      SetshowLoading(true);
      try {
        const response = await ClubsAPi.eventDelete(eventID);
        SetshowLoading(false);
        if (response) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription('deleted successfully');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      } catch (error) {
        SetshowLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        iconRight2={require('../assets/images/icon/home.png')}
        onPressLeft={menuButtonClick}
        notification={'6'}
        title={'Event'}
        textAlign={'center'}
      />
      <Loader visible={showLoading} />
      {!currentNetworkStatus && (
        <View style={{ marginBottom: 0, marginTop: 0 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}
      {!showLoading ? (
        <View style={styles.tabbartab1}>
          <Animated.ScrollView
            ref={ScrollRef}
            layout={Layout.springify()}
            refreshControl={
              <RefreshControl
                refreshing={refreshLoader}
                onRefresh={() => {
                  getclubseventDetails(EventId);
                }}
              />
            }
          >
            <View style={styles.friendimgcontainer}>
              {EventDetails?.coverPhotoPath ? (
                <FastImage
                  style={styles.friendimg}
                  source={{
                    uri: EventDetails?.coverPhotoPath,
                    cache: FastImage.cacheControl.immutable,
                  }}
                />
              ) : (
                <FastImage
                  resizeMode="contain"
                  style={{ height: 100, width: '100%' }}
                  source={require('../assets/images/logo-removebg.png')}
                />
              )}
            </View>
            <View style={styles.card}>
              <View style={[eventstyle.mainrow, { alignItems: 'center' }]}>
                <View style={[eventstyle.width60]}>
                  <View
                    style={[
                      eventstyle.row,
                      {
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <View style={eventstyle.clubimgcontainer}>
                      {EventDetails?.thumbnailCoverPhotoPath ? (
                        <FastImage
                          style={eventstyle.clubprofileimg}
                          source={{
                            uri: EventDetails?.thumbnailCoverPhotoPath,
                            cache: FastImage.cacheControl.immutable,
                          }}
                        />
                      ) : (
                        <FastImage
                          style={eventstyle.clubprofileimg}
                          source={require('../assets/images/logo.png')}
                        />
                      )}
                    </View>
                    <View style={[styles.mt2, {}]}>
                      <Text
                        style={[
                          eventstyle.clubsubtext,
                          { fontFamily: fontFamily.ProximaAB },
                        ]}
                      >
                        {EventDetails?.name ? EventDetails?.name : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[eventstyle.width40, { alignItems: 'flex-end' }]}>
                  {EventDetails?.organizerId === user?.id ? (
                    <View
                      style={{
                        marginRight: 35,
                      }}
                    >
                      <ClubmultiplePopover
                        simplebtn
                        onPressEdit={() => gotoUpdateEvent()}
                        onPressDelete={() => {
                          Alert.alert(
                            'Alert',
                            'Are you sure you want to remove this event?',
                            [
                              {
                                text: 'No',
                              },
                              {
                                text: 'Yes',
                                style: 'destructive',
                                onPress: async () => {
                                  DeleteEvent(EventDetails?.id);
                                },
                              },
                            ],
                          );
                        }}
                      />
                    </View>
                  ) : (
                    <></>
                  )}
                  <View
                    style={[eventstyle.datetimecontainer, { marginRight: 25 }]}
                  >
                    <Text style={[eventstyle.redcontainer]}>
                      {EventDetails
                        ? moment(new Date(EventDetails?.startDate)).format(
                            'MMM',
                          )
                        : moment(new Date()).format('MMM')}
                    </Text>
                    <Text style={eventstyle.redcontainertext}>
                      {EventDetails
                        ? moment(new Date(EventDetails?.startDate)).format(
                            'DD/YY',
                          )
                        : moment(new Date()).format('MMM')}
                    </Text>
                  </View>
                  <Text style={[eventstyle.datetime, { marginRight: 25 }]}>
                    Time: {moment(EventDetails?.startDate).format('hh:mm a')}
                  </Text>
                </View>
              </View>
              <View style={[styles.mt2, { flex: 1, marginTop: 5 }]}>
                <Text
                  style={eventstyle.clubsubtext}
                  onTextLayout={e => {
                    if (!measured) {
                      const lines = e.nativeEvent?.lines?.length ?? 0;
                      setLengthMore(lines > 4);
                      setMeasured(true);
                    }
                  }}
                  numberOfLines={textShown || !measured ? undefined : 4}
                >
                  {EventDetails?.description?.trim() || 'N/A'}
                </Text>

                {lengthMore ? (
                  <TouchableOpacity onPress={toggleNumberOfLines}>
                    <Text style={eventstyle.clubicontext}>
                      {textShown ? 'Read less..' : 'Read more..'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={{ marginTop: dynamicSize(10) }}></View>
              <View style={[eventstyle.iconrow, { alignItems: 'flex-start' }]}>
                <View style={eventstyle.iconcontainer}>
                  <Ionicons name="location" size={17} color={Color.black} />
                </View>

                <Text style={[eventstyle.iconrowtext]} numberOfLines={3}>
                  {EventDetails?.address?.address1
                    ? EventDetails?.address?.address1
                    : 'N/A'}
                </Text>
              </View>
              <View style={{ marginBottom: 10 }}></View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                  }}
                >
                  <Pressable
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      minWidth: 45,
                    }}
                    onPress={() => {
                      if (EventDetails?.isLike) {
                        onEventLikeClick(EventDetails?.id, 'unlike');
                      } else {
                        onEventLikeClick(EventDetails?.id, 'like');
                      }
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamily.ProximaAB,
                        lineHeight: getFontSize(16),
                        color: Color.black,
                        marginRight: 5,
                      }}
                    >
                      {EventDetails?.totalLikeCount || 0}
                    </Text>

                    <FastImage
                      source={
                        EventDetails?.isLike
                          ? require('../assets/images/NewIcons/like_selected.png')
                          : require('../assets/images/NewIcons/like.png')
                      }
                      style={{
                        height: 18,
                        width: 18,
                      }}
                    />
                  </Pressable>
                  <Pressable
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      minWidth: 45,
                    }}
                    onPress={() => {
                      onEventCommentClick(
                        EventDetails?.id,
                        EventDetails?.onlyAdminCommentOnly,
                        EventDetails?.organizerId,
                      );
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamily.ProximaAB,
                        lineHeight: getFontSize(16),
                        color: Color.black,
                        marginRight: 5,
                      }}
                    >
                      {EventDetails?.totalCommentCount || 0}
                    </Text>
                    <FastImage
                      source={require('../assets/images/icon/commentIcon.png')}
                      style={{
                        height: 18,
                        width: 18,
                      }}
                    />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => {
                    setAttendClubEventID(EventDetails?.id);
                    setIsAttended(true);
                  }}
                  style={eventstyle.readbtn}
                  disabled={isOrganiserDeleted}
                >
                  <Text style={eventstyle.Unreadtext}>
                    {EventDetails?.status === -1
                      ? 'Attend'
                      : EventDetails?.status === 0
                      ? 'Attending'
                      : EventDetails?.status === 1
                      ? 'Maybe Attending'
                      : EventDetails?.status === 2
                      ? 'Not Attending'
                      : ''}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.title}>Detail</Text>
              {EventDetails?.address?.destinationLocationLat &&
                EventDetails?.address?.destinationLocationLng && (
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={[styles.map]}
                    zoomEnabled={false}
                    cacheEnabled={false}
                    renderToHardwareTextureAndroid
                    pitchEnabled={false}
                    scrollEnabled={false}
                    toolbarEnabled={false}
                    zoomTapEnabled={false}
                    zoomControlEnabled={false}
                    userLocationCalloutEnabled={false}
                    loadingEnabled={false}
                    rotateEnabled={true}
                    scrollDuringRotateOrZoomEnabled={false}
                    region={{
                      latitude: EventDetails?.address?.destinationLocationLat,
                      longitude: EventDetails?.address?.destinationLocationLng,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    {EventDetails?.address?.destinationLocationLat &&
                      EventDetails?.address?.destinationLocationLng && (
                        <Marker
                          coordinate={{
                            latitude:
                              EventDetails?.address?.destinationLocationLat,
                            longitude:
                              EventDetails?.address?.destinationLocationLng,
                          }}
                        />
                      )}
                  </MapView>
                )}
              {Platform.OS == 'ios' ? (
                <Pressable
                  style={{
                    height: dynamicSize(300),
                    marginVertical: dynamicSize(10),
                    borderRadius: 10,
                    position: 'absolute',
                    top: 35,
                    bottom: 0,
                    right: 10,
                    left: 10,
                    backgroundColor: 'black',
                    opacity: 0,
                    zIndex: 999,
                  }}
                ></Pressable>
              ) : (
                <></>
              )}
              <View>
                <View style={styles.iconrow}>
                  <Text style={styles.iconrowtext}>
                    {EventDetails?.address?.address1
                      ? EventDetails?.address?.address1
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.card}>
              <View>
                <View style={{ paddingBottom: 10, paddingTop: 5 }}>
                  <View style={styles.row}>
                    <View style={styles.friendimgcontainer1}>
                      <Pressable
                        onPress={() => {
                          !isOrganiserDeleted &&
                            navigation.navigate('Profile', {
                              userId: EventDetails?.organizer?.id,
                            });
                        }}
                      >
                        <FastImage
                          style={styles.friendimg1}
                          source={
                            isOrganiserDeleted
                              ? require('../assets/images/logo.png')
                              : {
                                  uri: EventDetails?.organizer
                                    ?.thumbnailProfileImage,
                                  cache: FastImage.cacheControl.immutable,
                                }
                          }
                        />
                      </Pressable>
                    </View>
                    <View style={{ width: '70%' }}>
                      <Text style={styles.friendname}>Organizer</Text>
                      <Text style={styles.friendname}>
                        {isOrganiserDeleted
                          ? 'Deletion Requested'
                          : EventDetails?.organizer?.firstName +
                            ' ' +
                            EventDetails?.organizer?.lastName}
                      </Text>
                      {!isOrganiserDeleted && (
                        <Text style={styles.friendaddress}>
                          {getUserInfoText(EventDetails?.organizer)}
                        </Text>
                      )}
                    </View>
                  </View>

                  {canViewGuestList && (
                    <>
                      <Divider
                        style={{ backgroundColor: Color.cardbg, marginTop: 10 }}
                      />
                      <TouchableOpacity onPress={toggalwhosonthelist}>
                        <Text
                          style={[
                            styles.title,
                            {
                              textAlign: 'center',
                              marginTop: 10,
                              marginVertical: 0,
                            },
                          ]}
                        >
                          See who's on the list
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              {whosonthelist ? (
                AllEventMemberList?.current?.length > 0 ? (
                  AllEventMemberList?.current?.map((item, index) => {
                    const isuserDeleted =
                      Array.isArray(user?.inActiveUsers) &&
                      user.inActiveUsers.some(
                        id => String(id) === String(item?.member?.id),
                      );
                    return (
                      <Pressable
                        key={index}
                        style={[
                          styles.friendcontainer,
                          {
                            alignItems: 'center',
                            borderColor:
                              props?.route?.params?.MemberID === item?.id
                                ? heightlightColor
                                : Color.white,
                            borderWidth: 2,
                            borderRadius: 10,
                            padding:
                              props?.route?.params?.MemberID === item?.id
                                ? 5
                                : undefined,
                          },
                        ]}
                        onLayout={event => {
                          const layout = event.nativeEvent.layout;
                          dataSourceCords.current[index] = layout.y;
                          dataSourceCords.current = dataSourceCords.current;
                          if (dataSourceCords.current?.length > 0) {
                            ScrollRef.current.scrollTo({
                              x: 0,
                              y:
                                dataSourceCords.current[scrollToIndex.current] +
                                200,
                              animated: true,
                            });
                          }
                        }}
                      >
                        <View style={styles.row}>
                          <View style={styles.friendimgcontainer1}>
                            <Pressable
                              onPress={() => {
                                !isuserDeleted &&
                                  navigation.navigate('Profile', {
                                    userId: item?.member.id,
                                  });
                              }}
                            >
                              <FastImage
                                style={styles.friendimg1}
                                source={
                                  isuserDeleted
                                    ? require('../assets/images/logo.png')
                                    : {
                                        uri: item?.member
                                          ?.thumbnailProfileImage,
                                        cache: FastImage.cacheControl.immutable,
                                      }
                                }
                              />
                            </Pressable>
                          </View>
                          <View
                            style={{
                              width: '80%',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <View style={{ width: '80%' }}>
                              <Text style={styles.friendname}>
                                {isuserDeleted
                                  ? 'Deletion Requested'
                                  : item?.member?.firstName +
                                    ' ' +
                                    item?.member?.lastName}
                              </Text>
                              {!isuserDeleted && (
                                <Text style={styles.friendaddress}>
                                  {getUserInfoText(item?.member)}
                                </Text>
                              )}
                            </View>
                            <View
                              style={{ width: '20%', alignItems: 'flex-end' }}
                            >
                              <Text style={styles.friendstatus}>
                                {item?.status == 'GoingTo'
                                  ? 'Going'
                                  : item?.status}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
            </View>
          </Animated.ScrollView>
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
        </View>
      ) : (
        <></>
      )}

      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          navigation.goBack();
        }}
        description={successdescription}
        iserror={iserror}
      />
      <AttendedModal
        visible={IsAttended}
        Yes={item => {
          setIsAttended(false);
          OnClickGoingMaybe(AttendClubEventID, item);
        }}
        No={item => {
          setIsAttended(false);
          OnClickGoingMaybe(AttendClubEventID, item);
        }}
        Maybe={item => {
          setIsAttended(false);
          OnClickGoingMaybe(AttendClubEventID, item);
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
        EventID={AttendClubEventID}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  friendstatus: {
    color: Color.lightblue,
    fontFamily: fontFamily.ProximaR,
    fontSize: getFontSize(13),
  },
  btngroup: {
    flexDirection: 'row',
    marginVertical: dynamicSize(5),
  },
  readtext: {
    fontSize: getFontSize(13),
    marginLeft: 4,
    color: Color.lightblue,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(22),
  },
  Unreadtext: {
    fontSize: getFontSize(13),
    marginLeft: 4,
    color: Color.white,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(22),
  },
  readbtn: {
    backgroundColor: Color.lightblue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 100,
    marginRight: 10,
  },
  Unreadbtn: {
    width: '32%',
    backgroundColor: Color.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: dynamicSize(10),
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Color.lightblue,
  },
  map: {
    height: dynamicSize(300),
    marginVertical: dynamicSize(10),
    borderRadius: 10,
  },
  gusestrowcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  width50: {
    width: '45%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconrowtext: {
    fontSize: getFontSize(15),
    color: 'black',
    lineHeight: getLineSize(21),
    fontFamily: fontFamily.ProximaR,
    flex: 1,
  },
  gusesttext: {
    fontSize: getFontSize(15),
    color: 'black',
    lineHeight: getLineSize(21),
    fontFamily: fontFamily.ProximaR,
    flex: 1,
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  iconcontainer: {
    width: dynamicSize(30),
  },
  gusesttitle: {
    fontSize: getFontSize(15),
    color: 'black',
    marginVertical: 5,
    lineHeight: getFontSize(21),
    fontFamily: fontFamily.ProximaAB,
  },
  title: {
    fontSize: getFontSize(15),
    color: 'black',
    marginVertical: 5,
    lineHeight: getLineSize(21),
    fontFamily: fontFamily.ProximaAB,
  },
  seemorebtn: {
    position: 'absolute',
    right: dynamicSize(15),
    top: 0,
  },
  seemore: {
    fontSize: getFontSize(15),
    color: Color.lightblue,
    marginVertical: 5,
    lineHeight: getLineSize(21),
    fontFamily: fontFamily.ProximaAB,
  },
  clubicontext: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(25),
    color: Color.black,
    flexWrap: 'wrap',
  },
  clubsubtext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
  },
  redcontainertext: {
    fontSize: getFontSize(13),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(20),
    marginTop: 5,
  },
  redcontainer: {
    height: dynamicSize(17),
    width: '100%',
    fontSize: getFontSize(9),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    lineHeight: getFontSize(17),
    backgroundColor: Color.red,
    justifyContent: 'center',
    alignContent: 'center',
    paddingLeft: dynamicSize(12),
  },
  datetimecontainer: {
    position: 'absolute',
    top: dynamicSize(-20),
    height: dynamicSize(40),
    width: dynamicSize(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: Color.white,
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
    marginBottom: 5,
  },
  commentcontainer: {
    position: 'absolute',
    top: dynamicSize(-20),
    height: dynamicSize(40),
    width: dynamicSize(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: Color.white,
    borderWidth: 1,
    borderColor: Color.black0,
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
    marginBottom: 5,
  },
  Editontainer: {
    position: 'absolute',
    right: dynamicSize(15),
    top: dynamicSize(-20),
    height: dynamicSize(40),
    width: dynamicSize(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: Color.lightblue,
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
    marginBottom: 5,
  },
  datetime: {
    fontSize: getFontSize(12),
    color: Color.red,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getLineSize(18),
    marginBottom: 5,
  },
  card: {
    top: dynamicSize(-30),
    backgroundColor: Color.white,
    marginBottom: dynamicSize(10),
    marginTop: 2,
    paddingHorizontal: dynamicSize(10),
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  eventdetail: {
    top: dynamicSize(-30),
    backgroundColor: Color.white,
    marginBottom: dynamicSize(10),
    marginTop: 2,
    paddingHorizontal: dynamicSize(15),
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: dynamicSize(10),
    borderRadius: 20,
  },
  friendimgcontainer: {
    width: '100%',
    backgroundColor: Color.cardbg,
    height: dynamicSize(250),
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendimgcontainer1: {
    padding: 1,
    backgroundColor: Color.lightblue,
    borderRadius: 100,
    marginRight: dynamicSize(10),
  },
  friendimg: {
    height: '100%',
    width: '100%',
  },
  friendimg1: {
    height: dynamicSize(50),
    borderRadius: 100,
    width: dynamicSize(50),
  },
  tabbartab1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datalable: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
    flexWrap: 'wrap',
  },
  dataitem: {
    width: '30%',
    flexWrap: 'wrap',
    marginLeft: 4,
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
  },
  mr1: {
    marginRight: dynamicSize(10),
  },
  friendcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: dynamicSize(10),
  },
  friendsection: {
    backgroundColor: Color.white,
    padding: dynamicSize(15),
    marginHorizontal: dynamicSize(10),
    borderRadius: dynamicSize(10),
  },
  friendaddress: {
    color: Color.black,
    fontSize: getFontSize(13),
    lineHeight: getFontSize(18),
    fontFamily: fontFamily.ProximaR,
    flexWrap: 'wrap',
  },
  friendname: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
    color: 'black',
    flexWrap: 'wrap',
  },
});
export default EventViewDetail;
