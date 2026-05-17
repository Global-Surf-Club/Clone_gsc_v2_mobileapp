//import liraries
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import Trip from '../api/Trip';
import { Color, fontFamily, resizeMode, Shadow } from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import Popover from 'react-native-popover-view';
import Blockreport from '../api/Blockreport';
import ListModal from '../components/ListModal';
import Entypo from 'react-native-vector-icons/Entypo';
import SuccessModal from '../components/SuccessModal';
import NetInfo from '@react-native-community/netinfo';
import FastImage from 'react-native-fast-image';
// create a component
export const TripReport = props => {
  const {
    likeTripReportAction,
    unlikeTripReportAction,
    getTripReportLikes,
  } = require('../store/tripSlice');
  const {
    item,
    onCardClick,
    onPressRead,
    onPresslike,
    onPressmessage,
    onPressshare,
    rbtnbackground,
    onPressdownload,
    dotsthreeclick,
    onPressreportImage,
    TripID,
  } = props;
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [selectusersID, setselectusersID] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectImageID, setselectImageID] = useState('');
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const reportLikes = useSelector(state => state.trip.reportLikes);
  const [likes, setLikes] = useState([]);
  const [likeData, LikeData] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(id => String(id) === String(item?.author?.id));

  const openPopover = () => {
    setPopoverVisible(true);
  };
  const closePopover = () => {
    setPopoverVisible(false);
  };
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Load likes from Redux/DB
    dispatch(
      getTripReportLikes(
        props.item?.id || props.item?.tripReportId,
        (success, fetchedLikes) => {
          if (success && fetchedLikes) {
            setLikes(fetchedLikes);
          }
        },
      ),
    );
  }, [props.item?.id || props.item?.tripReportId]);

  // Update from Redux store
  useEffect(() => {
    const reportId = props.item?.id || props.item?.tripReportId;
    if (reportLikes[reportId]) {
      setLikes(reportLikes[reportId]);
    }
  }, [reportLikes, props.item?.id || props.item?.tripReportId]);

  useEffect(() => {
    let flag = 0;
    likes.forEach(item => {
      if (item?.userLikeId == user?.id) {
        flag = 1;
        LikeData(item);
      }
    });

    if (flag == 0) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
    }
  }, [likes]);

  const handleLikePress = async () => {
    const reportId = props.item?.id || props.item?.tripReportId;

    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    if (newLikedState) {
      // Like
      const optimisticLike = {
        id: `temp-${Date.now()}`,
        userLikeId: user?.id,
        createdAt: new Date().toISOString(),
      };
      setLikes([...likes, optimisticLike]);
      dispatch(likeTripReportAction(reportId, user?.id));
    } else {
      // Unlike
      setLikes(likes.filter(like => like.userLikeId !== user?.id));
      dispatch(unlikeTripReportAction(reportId, user?.id, likeData?.id));
    }
  };
  // const destinationAddress = item?.trip?.destination?.address;
  const destinationAddress = item?.destinationLocationAddress;

  const toAddress =
    (destinationAddress?.address1 ?? '') +
    ' ' +
    // (destinationAddress?.address2 ?? '') +
    // ' ' +
    (destinationAddress?.city ?? '') +
    ' ' +
    (destinationAddress?.state ?? '') +
    ' ' +
    (destinationAddress?.country ?? '');
  const accommodationAddress = item?.trip?.accommodationAddress;
  const accAddress =
    (accommodationAddress?.address1 ?? '') +
    ' ' +
    // (accommodationAddress?.address2 ?? '') +
    // ' ' +
    (accommodationAddress?.city ?? '') +
    ' ' +
    (accommodationAddress?.state ?? '') +
    ' ' +
    (accommodationAddress?.country ?? '');

  const passengersNames = item?.trip?.passengers
    ?.map(p => {
      const passengerId = p?.passenger?.id;

      const isDeleted =
        Array.isArray(user?.inActiveUsers) &&
        user.inActiveUsers.some(id => String(id) === String(passengerId));

      return isDeleted ? 'Deletion Requested' : p?.passenger?.firstName;
    })
    .join(', ');

  const blockreport = async (targetId, targetType, recordType, userMessage) => {
    if (user !== null && user !== '') {
      if (targetId !== null && targetId !== '' && targetId !== undefined) {
        const data = {
          SenderUserId: user.id,
          TargetId: targetId,
          TargetType: targetType,
          RecordType: recordType,
        };
        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );
        if (retval !== null) {
          if (retval?.id > 0) {
            setselectusersID('');
            closePopover();
            // Alert.alert(userMessage + ' successfully');
            setSuccessDescription(userMessage + ' successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            // Alert.alert(userMessage + ' not successfully');
            setSuccessDescription(userMessage + ' successfully');
            setTimeout(
              () => {
                setSuccess(true);
                setIserror(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          }
        }
      } else {
        Alert.alert('Targetid null Trip Report Pag');
      }
    }
  };

  const reportImage = async () => {
    if (user !== null && user !== '') {
      if (
        selectImageID !== null &&
        selectImageID !== '' &&
        selectImageID !== undefined
      ) {
        const data = {
          SenderUserId: user.id,
          TargetId: selectImageID,
          TargetType: 'tripreportimage',
          RecordType: 'report',
        };
        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );
        if (retval !== null) {
          if (retval?.id > 0) {
            setselectImageID('');
            setDeleteModal(false);
            setSuccessDescription('Reported successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            setSuccessDescription('Reported not successfully');
            setTimeout(
              () => {
                setSuccess(true);
                setIserror(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
            // Alert.alert('Tripreport image Not successfully');
          }
        }
      } else {
        Alert.alert('Targetid null AllGSCMember Chat Pag');
      }
    }
  };
  const [heightlightColor, setheightlightColor] = useState(Color.lightblue);
  useEffect(() => {
    setheightlightColor(Color.lightblue);
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 15000);
  }, [TripID]);
  return (
    //  isUserDeleted ? (
    //   <View
    //     style={[
    //       TripReportstyle.cardView,
    //       {
    //         borderColor: TripID
    //           ? TripID === item?.tripReportId
    //             ? heightlightColor
    //             : Color.white
    //           : Color.white,
    //         borderWidth: 2,
    //       },
    //     ]}
    //   >
    //     <View style={TripReportstyle.box50}>
    //       <View>
    //         <Text style={TripReportstyle.title}>Trip Report</Text>
    //       </View>
    //     </View>
    //     <Text>Member requested to delete</Text>
    //   </View>
    // ) : (
    <Pressable
      style={[
        TripReportstyle.cardView,
        {
          borderColor: TripID
            ? TripID === item?.tripReportId
              ? heightlightColor
              : Color.white
            : Color.white,
          borderWidth: 2,
        },
      ]}
      onPress={onCardClick}
    >
      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          setSuccessDescription('');
          closePopover();
          setDeleteModal(false);
          setselectImageID('');
          setselectusersID('');
        }}
        description={successdescription}
        iserror={iserror}
      />
      <View style={TripReportstyle.row}>
        <View style={TripReportstyle.box50}>
          <View>
            <Text style={TripReportstyle.title}>Trip Report</Text>
          </View>
        </View>
        <View style={TripReportstyle.box50}>
          <View style={TripReportstyle.raitingrow}>
            <Text style={TripReportstyle.ratingtext}>Rating</Text>
            <View style={TripReportstyle.raitingrow}>
              {[0, 1, 2, 3, 4].map(i => (
                <MaterialCommunityIcons
                  name={'star'}
                  size={dynamicSize(13)}
                  color={i < item?.rating ? Color.starbg : 'grey'}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
      <View style={TripReportstyle.row}>
        <View style={TripReportstyle.box50}>
          {item?.author?.id !== user.id ? (
            <TouchableOpacity
              style={TripReportstyle.dotCont}
              onPress={() => {
                // !isUserDeleted && setDeleteModal(true);
                // !isUserDeleted &&
                //   setselectImageID(item?.images[0] && item?.images[0]?.id);
                setDeleteModal(true);
                setselectImageID(item?.images[0] && item?.images[0]?.id);
              }}
            >
              <Entypo
                name="dots-three-vertical"
                color={Color.black}
                size={getFontSize(16)}
              />
            </TouchableOpacity>
          ) : (
            <></>
          )}

          <Pressable
            style={TripReportstyle.mainimgcontainer}
            ref={touchableRef}
            // onLongPress={e => {
            //   openPopover(e);
            //   setselectusersID(item?.images[0] && item?.images[0]?.id);
            // }}
          >
            {item?.images[0] && item?.images[0]?.thumbnailImageUrl ? (
              <Pressable onPress={onPressreportImage}>
                <FastImage
                  resizeMode={resizeMode.center}
                  // source={require('../assets/images/icon/Surfboard.jpg')}
                  source={{
                    uri:
                      (item?.images[0] && item?.images[0]?.thumbnailImageUrl) ??
                      '',
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={[
                    TripReportstyle.subproimg,
                    { backgroundColor: resizeMode.background },
                  ]}
                />
              </Pressable>
            ) : (
              <FastImage
                source={require('../assets/images/logo-removebg.png')}
                resizeMode="contain"
                style={[TripReportstyle.subproimg, { opacity: 0.9 }]}
              />
            )}
          </Pressable>
        </View>

        <View style={TripReportstyle.box50}>
          <View>
            <Text style={TripReportstyle.icontext}>{item?.title}</Text>
            {toAddress ? (
              <Text style={TripReportstyle.subtext}>{toAddress}</Text>
            ) : (
              <></>
            )}
          </View>
          <View style={TripReportstyle.iconrow}>
            <View style={TripReportstyle.iconbox}>
              <FastImage
                source={require('../assets/images/icon/vanLogo.png')}
                style={TripReportstyle.texttitleicon}
              />
            </View>
            {item?.trip?.transportType ? (
              <Text style={TripReportstyle.icontext}>
                {item?.trip?.transportType}
              </Text>
            ) : (
              <Text style={TripReportstyle.icontext}> - </Text>
            )}
          </View>
          <View style={TripReportstyle.iconrow}>
            <View style={TripReportstyle.iconbox}>
              <FastImage
                source={require('../assets/images/icon/surfingLogo.png')}
                style={TripReportstyle.texttitleicon}
              />
            </View>
            {passengersNames ? (
              <Text style={TripReportstyle.icontext}>{passengersNames}</Text>
            ) : (
              <Text style={TripReportstyle.icontext}> - </Text>
            )}
          </View>
          <View style={TripReportstyle.iconrow}>
            <View style={TripReportstyle.iconbox}>
              <FastImage
                source={require('../assets/images/icon/hostelLogo.png')}
                style={TripReportstyle.texttitleicon}
              />
            </View>
            {item?.trip?.accommodationAvailable ? (
              <Text style={TripReportstyle.icontext}>{accAddress}</Text>
            ) : (
              <Text style={TripReportstyle.icontext}>N/A</Text>
            )}
          </View>
        </View>
      </View>
      <ListModal
        onCancel={() => {
          setselectImageID('');
          setDeleteModal(false);
        }}
        outheruser
        // isself={isSelf}
        visible={deleteModal}
        onPressReport={() => {
          reportImage();
          // Alert.alert('Alert', 'Are you sure you want to delete this photo?');
        }}
      />
      <View style={TripReportstyle.row}>
        <View style={TripReportstyle.box50}>
          <View style={TripReportstyle.iconbtnrow}>
            {likes?.length > 0 && (
              <Text
                style={{ color: Color.black, fontFamily: fontFamily.ProximaR }}
              >
                {likes?.length}
              </Text>
            )}
            <Pressable
              // onPress={() => {
              //   setIsLiked(data => !data);
              //   if (isLiked) {
              //     dispatch(unlikeTripReportAction(likeData?.id));
              //   } else {
              //     dispatch(likeTripReportAction(item?.id));
              //   }
              // }}
              onPress={handleLikePress}
              style={TripReportstyle.iconbtn}
            >
              {/* <AntDesign name={isLiked ? 'like1' : 'like2'} color={'black'} size={20} /> */}
              <FastImage
                // source={require('../assets/images/icon/likeIcon.png')}
                source={
                  isLiked
                    ? require('../assets/images/NewIcons/like_selected.png')
                    : require('../assets/images/NewIcons/like.png')
                }
                style={TripReportstyle.iconimg}
              />
            </Pressable>
            {(item?.commentCount ?? item?.tripReportCommentCount ?? 0) > 0 && (
              <Text
                style={{ color: Color.black, fontFamily: fontFamily.ProximaR }}
              >
                {item?.commentCount ?? item?.tripReportCommentCount ?? 0}
              </Text>
            )}
            <Pressable
              style={TripReportstyle.iconbtn}
              onPress={() => {
                navigation.navigate('TripReportComments', {
                  reportId:
                    props.item?.id && props.item?.id > 0
                      ? props.item?.id
                      : props.item?.tripReportId,
                });
              }}
            >
              <FastImage
                source={require('../assets/images/icon/commentIcon.png')}
                style={TripReportstyle.iconimg}
              />
            </Pressable>
            {/* <Pressable style={TripReportstyle.iconbtn} onPress={onPressshare}>
              <FastImage
                source={require('../assets/images/icon/shareIcon.png')}
                style={TripReportstyle.iconimg}
              />
            </Pressable> */}
            {onPressdownload ? (
              <Pressable
                style={TripReportstyle.iconbtn}
                onPress={onPressdownload}
              >
                <FastImage
                  source={require('../assets/images/icon/downloadIcon.png')}
                  style={TripReportstyle.iconimg}
                />
              </Pressable>
            ) : (
              <></>
            )}
          </View>
        </View>
        <View style={TripReportstyle.box50}>
          <View style={TripReportstyle.buttoncontainer}>
            <Pressable
              style={[
                TripReportstyle.readbtn,
                {
                  backgroundColor: rbtnbackground
                    ? rbtnbackground
                    : Color.black,
                },
              ]}
              onPress={onPressRead}
            >
              <Text style={TripReportstyle.readtext}>Read</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <Popover
        isVisible={popoverVisible}
        popoverStyle={TripReportstyle.content}
        from={touchableRef}
        onRequestClose={() => setPopoverVisible(false)}
      >
        <View style={TripReportstyle.popupcontainer}>
          <TouchableOpacity
            style={TripReportstyle.popupitem}
            onPress={e => {
              blockreport(item.id, 'tripreportcomment', 'report', 'Reported');
            }}
          >
            <Text style={TripReportstyle.popupitemtext}>Report</Text>
          </TouchableOpacity>
        </View>
      </Popover>
    </Pressable>
  );
};

// define your styles
const TripReportstyle = StyleSheet.create({
  dotCont: {
    position: 'absolute',
    top: dynamicSize(15),
    right: dynamicSize(10),
    zIndex: 99,
    shadowColor: '#fafafa',
    elevation: 5,
    shadowOpacity: 1,
    shadowRadius: 5,
    backgroundColor: 'transparent',
  },
  content: {
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 150,
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
  readtext: {
    fontSize: getFontSize(14),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(22),
  },
  readbtn: {
    backgroundColor: Color.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(5),
    borderRadius: 100,
  },
  mainimgcontainer: {
    borderRadius: 20,
    height: dynamicSize(130),
    overflow: 'hidden',
    width: '100%',
  },
  raitingrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  subtext: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaR,
    color: Color.gray,
    paddingVertical: 5,
  },
  ratingtext: {
    fontSize: getFontSize(13),
    lineHeight: getLineSize(18),
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  icontext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(16),
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
    textTransform: 'capitalize',
  },
  buttoncontainer: {
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconbox: {
    height: dynamicSize(22),
    width: dynamicSize(22),
    marginRight: 5,
  },
  texttitleicon: {
    height: dynamicSize(18),
    width: dynamicSize(18),
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  title: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getLineSize(23),
    fontFamily: fontFamily.ProximaAB,
    marginVertical: 5,
  },
  iconbtn: {
    height: dynamicSize(30),
    width: dynamicSize(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconimg: {
    height: dynamicSize(20),
    width: dynamicSize(20),
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subproimg: {
    height: '100%',
    width: '100%',
    backgroundColor: '#8cb4cf52',
  },
  box50: {
    width: '49%',
  },
  cardView: {
    backgroundColor: Color.white,
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 15,
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
});

// create a component
export const Communityinfo = memo(props => {
  const {
    likeTripAction,
    unlikeTripAction,
    getTripLikes,
  } = require('../store/tripSlice');
  const {
    item,
    onCardClick,
    onPresslike,
    isSended,
    showAll = false,
    onPressmessage,
    onPressshare,
    rbtnbackground,
    onPressinfobutton,
    onPressdownload,
    onPressAccept,
    onPressDecline,
    isProfile = false,
    TripID,
    onLayout,
  } = props;
  const departureAddress = item?.departureAddress;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const startDate = new Date(item?.startDate);
  startDate.setDate(startDate.getDate() + 6);
  const expiryDateVar = new Date(item?.expiryDate).getTime();
  const currentDate = new Date().getTime();
  const isExpired = expiryDateVar < currentDate;
  const user = useSelector(state => state.auth.user);
  const [selectusersID, setselectusersID] = useState('');
  const tripLikes = useSelector(state => state.trip.tripLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState([]);
  const [likeData, LikeData] = useState({});
  const [isOnline, setIsOnline] = useState(true);

  const tripId = props.item?.id || props.item?.tripId;
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user?.inActiveUsers.some(id => String(id) === String(item?.organizer?.id));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Load likes from Redux/DB
    dispatch(
      getTripLikes(tripId, (success, fetchedLikes) => {
        if (success && fetchedLikes) {
          setLikes(fetchedLikes);
        }
      }),
    );
  }, [tripId]);

  // Update from Redux store
  useEffect(() => {
    if (tripLikes[tripId]) {
      setLikes(tripLikes[tripId]);
    }
  }, [tripLikes, tripId]);

  useEffect(() => {
    let flag = 0;
    likes.forEach(item => {
      if (item?.userLikeId == user?.id) {
        flag = 1;
        LikeData(item);
      }
    });

    if (flag == 0) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
    }
  }, [likes]);

  const handleLikePress = async () => {
    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    if (newLikedState) {
      // Like
      const optimisticLike = {
        id: `temp-${Date.now()}`,
        userLikeId: user?.id,
        createdAt: new Date().toISOString(),
      };
      setLikes([...likes, optimisticLike]);
      dispatch(likeTripAction(tripId, user?.id));
    } else {
      // Unlike
      setLikes(likes.filter(like => like.userLikeId !== user?.id));
      dispatch(unlikeTripAction(tripId, user?.id, likeData?.id));
    }
  };

  // const destination = item?.destination?.address;
  const destination = item?.destinationLocationAddress;
  const fromAddress =
    (departureAddress?.address1 ?? '') +
    ' ' +
    // (departureAddress?.address2 ?? '') +
    // ' ' +
    (departureAddress?.city ?? '') +
    ' ' +
    (departureAddress?.state ?? '') +
    ' ' +
    (departureAddress?.country ?? '');
  const toAddress =
    (destination?.address1 ?? '') +
    // ' ' +
    // (destination?.address2 ?? '') +
    ' ' +
    (destination?.city ?? '') +
    ' ' +
    (destination?.state ?? '') +
    ' ' +
    (destination?.country ?? '');

  const isTripStarted =
    new Date(moment(item?.startDate).add(6, 'hours')).getTime() <
    new Date().getTime();

  const [heightlightColor, setheightlightColor] = useState(Color.lightblue);
  useEffect(() => {
    setheightlightColor(Color.lightblue);
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 15000);
  }, [TripID]);

  if (isExpired && !isProfile) {
    return null;
  }

  return (
    // isUserDeleted ? (
    //   <View
    //     style={[
    //       Communityinfostyle.cardView,
    //       {
    //         borderColor:
    //           TripID === (item?.id || item?.tripId)
    //             ? heightlightColor
    //             : Color.white,
    //         borderWidth: 2,
    //       },
    //     ]}
    //   >
    //     <View style={[Communityinfostyle.row, { paddingVertical: 10 }]}>
    //       <Pressable
    //         style={[
    //           Communityinfostyle.profileimgcontainer,
    //           { top: dynamicSize(0) },
    //         ]}
    //       >
    //         <FastImage
    //           source={require('../assets/images/logo.png')}
    //           style={Communityinfostyle.profileimg}
    //         />
    //       </Pressable>
    //       <View style={Communityinfostyle.profiletextcontainer}>
    //         <Text style={[Communityinfostyle.nametitle, Communityinfostyle.mt1]}>
    //           Deletion Requested
    //         </Text>
    //         <Text
    //           style={[
    //             Communityinfostyle.nametitle,
    //             { fontFamily: fontFamily.ProximaR },
    //           ]}
    //         >
    //           Member requested to delete
    //         </Text>
    //       </View>
    //     </View>
    //   </View>
    // ) :

    <Pressable
      style={[
        Communityinfostyle.cardView,
        {
          borderColor:
            TripID === (item?.id || item?.tripId)
              ? heightlightColor
              : Color.white,
          borderWidth: 2,
        },
      ]}
      onPress={() => {
        onCardClick({ ...item, isExpired });
      }}
      onLayout={onLayout}
    >
      <View
        pointerEvents="none"
        style={[Communityinfostyle.mapcontainer, { overflow: 'hidden' }]}
      >
        {item?.destination?.address?.destinationLocationLat &&
          item?.destination?.address?.destinationLocationLng && (
            <MapView
              key={item?.tripId?.toString()}
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              zoomControlEnabled={false}
              scrollDuringRotateOrZoomEnabled={false}
              initialRegion={{
                // ...item?.destination?.address?.destinationLocation,
                latitude: item?.destination?.address?.destinationLocationLat,
                longitude: item?.destination?.address?.destinationLocationLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              mapType={'standard'}
            >
              {item?.destination?.address?.destinationLocationLat &&
                item?.destination?.address?.destinationLocationLng && (
                  <Marker
                    // coordinate={item?.destination?.address?.destinationLocation}
                    coordinate={{
                      latitude:
                        item?.destination?.address?.destinationLocationLat,
                      longitude:
                        item?.destination?.address?.destinationLocationLng,
                    }}
                  />
                )}
            </MapView>
          )}
        <View style={Communityinfostyle.titlebuttoncontainer}>
          <Pressable style={Communityinfostyle.namebtn}>
            <Text style={Communityinfostyle.nametext} numberOfLines={1}>
              {item?.title ?? ''}
            </Text>
          </Pressable>
        </View>
      </View>
      <View>
        <View style={Communityinfostyle.row}>
          <Pressable
            onPress={() => {
              !isUserDeleted &&
                navigation.navigate('Profile', { userId: item?.organizer?.id });
            }}
            style={Communityinfostyle.profileimgcontainer}
          >
            <FastImage
              // source={require('../assets/images/icon/Surfboard.jpg')}
              source={
                isUserDeleted
                  ? require('../assets/images/logo.png')
                  : {
                      uri: item?.organizer?.thumbnailProfileImage,
                      cache: FastImage.cacheControl.immutable,
                    }
              }
              // source={item.profileimage}
              style={Communityinfostyle.profileimg}
            />
          </Pressable>
          <View style={Communityinfostyle.profiletextcontainer}>
            <Text
              style={[Communityinfostyle.nametitle, Communityinfostyle.mt1]}
            >
              {isUserDeleted
                ? 'Deletion Requested'
                : item?.organizer?.firstName + ' ' + item?.organizer?.lastName}
            </Text>
            <Text
              numberOfLines={1}
              style={[Communityinfostyle.namesubtitle, Communityinfostyle.mt1]}
            >
              From:{' '}
              <Text style={Communityinfostyle.nametitle}>{fromAddress}</Text>
            </Text>
            <Text numberOfLines={1} style={Communityinfostyle.namesubtitle}>
              To: <Text style={Communityinfostyle.nametitle}>{toAddress}</Text>
            </Text>
          </View>
        </View>
        <View style={Communityinfostyle.iconrowcontainer}>
          <View style={Communityinfostyle.iconrow}>
            <FastImage
              source={require('../assets/images/NewIcons/users.png')}
              resizeMode={'contain'}
              style={[Communityinfostyle.iconimg, { width: dynamicSize(20) }]}
            />

            <Text style={Communityinfostyle.nametitle}>
              {item?.passengers?.length ?? 1}
            </Text>
          </View>
          <View style={Communityinfostyle.iconrow}>
            <FastImage
              source={require('../assets/images/NewIcons/ic_calendar_black.png')}
              style={Communityinfostyle.iconimg}
            />

            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                Communityinfostyle.nametitle,
                { marginRight: dynamicSize(10) },
              ]}
            >
              {item?.startDate
                ? moment(item?.startDate ?? '').format('DD/MM/YYYY')
                : ''}
            </Text>
          </View>
          <View
            style={[Communityinfostyle.iconrow, { justifyContent: 'flex-end' }]}
          >
            <AntDesign
              name="clockcircle"
              color={'black'}
              size={dynamicSize(18)}
              style={{ marginRight: 7 }}
            />
            <Text style={Communityinfostyle.nametitle}>
              {item?.startDate
                ? moment(item?.startDate ?? '').format('HH:mm')
                : ''}
            </Text>
          </View>
        </View>
        <View style={[Communityinfostyle.row]}>
          <View style={[Communityinfostyle.box50, { width: undefined }]}>
            <View style={[Communityinfostyle.iconbtnrow]}>
              {likes?.length > 0 && (
                <Text
                  style={{
                    color: Color.black,
                    fontFamily: fontFamily.ProximaR,
                  }}
                >
                  {likes?.length}
                </Text>
              )}
              <Pressable
                style={[Communityinfostyle.iconbtn]}
                // onPress={() => {
                //   setIsLiked(data => !data);
                //   if (isLiked) {
                //     dispatch(unlikeTripAction(item?.id || item?.tripId));
                //   } else {
                //     dispatch(likeTripAction(item?.id || item?.tripId));
                //   }
                // }}
                onPress={handleLikePress}
              >
                <FastImage
                  source={
                    isLiked
                      ? require('../assets/images/NewIcons/like_selected.png')
                      : require('../assets/images/NewIcons/like.png')
                  }
                  style={Communityinfostyle.iconimg}
                />
              </Pressable>
              {(item?.commentCount ?? item?.tripCommentCount ?? 0) > 0 && (
                <Text
                  style={{
                    color: Color.black,
                    fontFamily: fontFamily.ProximaR,
                  }}
                >
                  {item?.commentCount ?? item?.tripCommentCount ?? 0}
                </Text>
              )}
              <Pressable
                style={Communityinfostyle.iconbtn}
                onPress={() => {
                  navigation.navigate('TripComments', {
                    ...item,
                  });
                  // const passengerList =
                  //   item?.passengers?.map(item => item?.passenger?.id) ?? [];
                  // const isJoined = passengerList.includes(user?.id);
                  // navigation.navigate('TripDetail', {
                  //   ...item,
                  //   showAll: isJoined || user?.id == item?.organizer?.id,
                  //   isChat: isJoined || user?.id == item?.organizer?.id,
                  // });
                }}
              >
                <FastImage
                  source={require('../assets/images/icon/commentIcon.png')}
                  style={Communityinfostyle.iconimg}
                />
              </Pressable>
              {item?.isAdaptive && (
                <View
                  style={[
                    Communityinfostyle.iconbtn,
                    {
                      height: dynamicSize(23),
                      width: dynamicSize(23),
                      borderRadius: 15,
                    },
                  ]}
                >
                  <FastImage
                    source={require('../assets/images/icon/adaptive.png')}
                    resizeMode="contain"
                    style={{ height: '100%', width: '100%' }}
                  />
                </View>
              )}
              {/* surfadaptive.png */}
              {onPressdownload ? (
                <Pressable
                  style={Communityinfostyle.iconbtn}
                  onPress={onPressdownload}
                >
                  <FastImage
                    source={require('../assets/images/icon/downloadIcon.png')}
                    style={Communityinfostyle.iconimg}
                  />
                </Pressable>
              ) : (
                <></>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              flex: 1,
            }}
          >
            {isExpired ? (
              <View style={{}}>
                <View style={Communityinfostyle.buttoncontainer}>
                  <Pressable
                    style={[
                      Communityinfostyle.readbtn,
                      { backgroundColor: '#FF0000AA' },
                    ]}
                  >
                    <Text style={Communityinfostyle.readtext}>EXPIRED</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                {onPressDecline && (
                  <View
                    style={[
                      {},
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      },
                    ]}
                  >
                    <View>
                      <Pressable
                        style={[
                          Communityinfostyle.readbtn,
                          {
                            backgroundColor: Color.white,
                            borderWidth: 1,
                            borderColor: Color.lightblue,
                          },
                        ]}
                        onPress={() => {
                          onPressDecline && onPressDecline();
                        }}
                      >
                        <Text
                          style={[
                            Communityinfostyle.readtext,
                            { color: Color.lightblue },
                          ]}
                        >
                          REJECT
                        </Text>
                      </Pressable>
                    </View>
                    <View style={{}}>
                      <Pressable
                        style={[
                          Communityinfostyle.readbtn,
                          { backgroundColor: Color.lightblue },
                        ]}
                        onPress={() => {
                          if (isTripStarted) {
                            alert(
                              'You can not join a trip 6 hours after a trip has started',
                            );
                          } else {
                            onPressAccept && onPressAccept();
                          }
                        }}
                      >
                        <Text style={Communityinfostyle.readtext}>ACCEPT</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
                {onPressinfobutton ? (
                  isSended ? (
                    <View style={{}}>
                      <View style={Communityinfostyle.buttoncontainer}>
                        <Pressable
                          style={[
                            Communityinfostyle.readbtn,
                            { backgroundColor: Color.lightblue },
                          ]}
                        >
                          <Text style={Communityinfostyle.readtext}>
                            REQUESTED
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={{}}>
                      <View style={Communityinfostyle.buttoncontainer}>
                        <Pressable
                          style={[
                            Communityinfostyle.readbtn,
                            { backgroundColor: Color.lightblue },
                          ]}
                          onPress={() => {
                            onPressinfobutton && onPressinfobutton();
                          }}
                        >
                          <Text style={Communityinfostyle.readtext}>JOIN</Text>
                        </Pressable>
                      </View>
                    </View>
                  )
                ) : (
                  <></>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

// define your styles
const Communityinfostyle = StyleSheet.create({
  readtext: {
    fontSize: getFontSize(12),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 22,
  },
  readbtn: {
    backgroundColor: Color.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 100,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  box50: {
    width: '49%',
  },
  iconrowcontainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 15,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderTopColor: Color.lightGray,
  },
  blank: {
    paddingVertical: dynamicSize(20),
  },
  mt1: {
    marginTop: 5,
  },
  mt2: {
    marginTop: 10,
  },
  titlebuttoncontainer: {
    paddingRight: 10,
  },
  nametitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  namesubtitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  profiletextcontainer: {
    width: '75%',
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
  },
  profileimgcontainer: {
    width: '25%',
    height: dynamicSize(60),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    top: dynamicSize(-25),
  },
  profileimg: {
    width: dynamicSize(60),
    height: '100%',
    borderRadius: 100,
    backgroundColor: Color.gray,
  },
  nametext: {
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
  },
  namebtn: {
    paddingHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(5),
    backgroundColor: 'rgba(37,87,102,0.8)',
    alignItems: 'flex-start',
    minWidth: dynamicSize(70),
    alignItems: 'center',
    position: 'absolute',
    top: dynamicSize(10),
    left: dynamicSize(10),
    marginRight: dynamicSize(10),
    borderRadius: 100,
  },
  buttoncontainer: {
    paddingRight: 5,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  mapcontainer: {
    height: dynamicSize(100),
    backgroundColor: Color.lightblue,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  iconbtn: {
    height: dynamicSize(30),
    width: dynamicSize(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  iconimg: {
    height: dynamicSize(18),
    width: dynamicSize(18),
    marginRight: dynamicSize(7),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  cardView: {
    backgroundColor: Color.white,
    marginVertical: 5,
    marginBottom: dynamicSize(15),
    ...Shadow.boxShadow,
    marginHorizontal: dynamicSize(10),
    borderRadius: 20,
    // height: 291
  },
});

// create a component
export const Participantitem = props => {
  const { item, onCardClick } = props;

  return (
    <Pressable style={[Participantitemstyle.cardView]} onPress={onCardClick}>
      <View style={Participantitemstyle.mapcontainer}>
        {/* <MapView
                style={{width:'100%',height:'100%',}}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                /> */}
      </View>
      <View style={Participantitemstyle.p2}>
        <View style={Participantitemstyle.box100}>
          <View style={Participantitemstyle.titlerow}>
            <Text style={Participantitemstyle.triptitle}>{item.tripname}</Text>
            <View style={Participantitemstyle.raitingrow}>
              <MaterialCommunityIcons
                name={'star'}
                size={dynamicSize(13)}
                color={Color.starbg}
              />
              <MaterialCommunityIcons
                name={'star'}
                size={dynamicSize(13)}
                color={Color.starbg}
              />
              <MaterialCommunityIcons
                name={'star'}
                size={dynamicSize(13)}
                color={Color.starbg}
              />
              <MaterialCommunityIcons
                name={'star'}
                size={dynamicSize(13)}
                color={Color.starbg}
              />
              <MaterialCommunityIcons
                name={'star'}
                size={dynamicSize(13)}
                color={Color.starbg}
              />
            </View>
          </View>
          {item.triptext ? (
            <Text style={Participantitemstyle.subtext}>{item.triptext}</Text>
          ) : (
            <></>
          )}
        </View>
        <View style={Participantitemstyle.iconrow}>
          <View style={Participantitemstyle.iconbox}>
            <FastImage
              source={require('../assets/images/icon/vanLogo.png')}
              style={Participantitemstyle.texttitleicon}
            />
          </View>
          {item.tripicontext1 ? (
            <Text style={Participantitemstyle.icontext}>
              {item.tripicontext1}
            </Text>
          ) : (
            <Text style={Participantitemstyle.icontext}> - </Text>
          )}
        </View>
        <View style={Participantitemstyle.iconrow}>
          <View style={Participantitemstyle.iconbox}>
            <FastImage
              source={require('../assets/images/icon/surfingLogo.png')}
              style={Participantitemstyle.texttitleicon}
            />
          </View>
          {item.tripicontext2 ? (
            <Text style={Participantitemstyle.icontext}>
              {item.tripicontext2}
            </Text>
          ) : (
            <Text style={Participantitemstyle.icontext}> - </Text>
          )}
        </View>
        <View style={Participantitemstyle.iconrow}>
          <View style={Participantitemstyle.iconbox}>
            <FastImage
              source={require('../assets/images/icon/hostelLogo.png')}
              style={Participantitemstyle.texttitleicon}
            />
          </View>
          {item.tripicontext3 ? (
            <Text style={Participantitemstyle.icontext}>
              {item.tripicontext3}
            </Text>
          ) : (
            <Text style={Participantitemstyle.icontext}> - </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

// define your styles
const Participantitemstyle = StyleSheet.create({
  titlerow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  p2: {
    padding: dynamicSize(10),
  },
  box100: {
    width: '99%',
  },
  raitingrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    width: '20%',
  },
  subtext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaR,
    color: Color.gray,
    paddingVertical: 5,
  },
  ratingtext: {
    fontSize: getFontSize(13),
    lineHeight: getFontSize(18),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
  },
  icontext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
  },
  triptitle: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(20),
    color: Color.black,
    maxWidth: '73%',
    marginRight: dynamicSize(20),
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconbox: {
    height: dynamicSize(22),
    width: dynamicSize(22),
    marginRight: dynamicSize(5),
  },
  texttitleicon: {
    height: dynamicSize(18),
    width: dynamicSize(18),
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  mapcontainer: {
    height: dynamicSize(100),
    backgroundColor: Color.lightblue,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  cardView: {
    backgroundColor: Color.white,
    // marginVertical: 5,
    marginBottom: dynamicSize(10),
    width: dynamicSize(250),
    ...Shadow.boxShadow,
    marginHorizontal: dynamicSize(10),
    borderRadius: 20,
  },
});
