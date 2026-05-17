import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

import { Image } from 'react-native';
import { useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import Trip from '../api/Trip';
import { Color, fontFamily, text } from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';
import Popover from 'react-native-popover-view';
import Blockreport from '../api/Blockreport';
import SuccessModal from '../components/SuccessModal';
import { globlestyle } from '../styles/globlestyle';
import Hyperlink from 'react-native-hyperlink';
import { addPendingAction } from '../database/tripDbHelper';
import FastImage from 'react-native-fast-image';

const CommentItem = ({
  comment,
  btnHandler,
  isReport,
  pageName,
  onLayout,
  CommentID,
}) => {
  const user = useSelector(state => state.auth.user);
  const [likes, setLikes] = useState([]);
  const [likeData, LikeData] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const navigation = useNavigation();
  const [selectusersID, setselectusersID] = useState('');
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(id => String(id) === String(comment?.author?.id));

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
    getLikes();
  }, [comment]);

  const getLikes = async () => {
    try {
      const like = isReport
        ? JSON.parse(await Trip.getLikesForReportComment(comment?.id))
        : JSON.parse(await Trip.getLikes(comment?.id));
      setLikes(like);
    } catch (error) {
      setLikes([]);
    }
  };

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

  const blockreport = async (targetId, targetType, recordType, userMessage) => {
    if (user !== null && user !== '') {
      if (targetId !== null && targetId !== '' && targetId !== undefined) {
        const data = {
          SenderUserId: user.id,
          TargetId: targetId,
          TargetType: pageName,
          RecordType: recordType,
        };
        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );
        if (retval !== null) {
          if (retval?.id > 0) {
            setselectusersID('');
            closePopover();
            setSuccessDescription(userMessage + ' successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            setSuccessDescription(userMessage + ' not successfully');
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
        Alert.alert('Targetid null CommentItem Pag');
      }
    }
  };

  const handleLikePress = async () => {
    if (isLikeProcessing) return;

    setIsLikeProcessing(true);
    const previousLikedState = isLiked;
    const previousLikes = [...likes];

    try {
      // Optimistic update
      setIsLiked(!previousLikedState);

      if (!previousLikedState) {
        // Adding like
        const optimisticLike = {
          id: `temp-${Date.now()}`,
          userLikeId: user?.id,
          createdAt: new Date().toISOString(),
        };
        setLikes([...likes, optimisticLike]);
      } else {
        // Removing like
        setLikes(likes.filter(like => like.userLikeId !== user?.id));
      }

      if (isOnline) {
        try {
          if (previousLikedState) {
            // Unlike
            if (isReport) {
              await Trip.deleteLikeForReportComment(likeData?.id);
            } else {
              await Trip.deleteLike(likeData?.id);
            }
          } else {
            // Like
            if (isReport) {
              await Trip.likeCommentForReportComment(comment?.id);
            } else {
              await Trip.likeComment(comment?.id);
            }
          }

          if (isReport) {
            await getLikesForReport();
          } else {
            await getLikes();
          }
        } catch (apiError) {
          await addPendingAction({
            actionType: previousLikedState
              ? isReport
                ? 'UNLIKE_TRIP_REPORT_COMMENT'
                : 'UNLIKE_TRIP_COMMENT'
              : isReport
              ? 'LIKE_TRIP_REPORT_COMMENT'
              : 'LIKE_TRIP_COMMENT',
            entityId: comment?.id,
            payload: {
              commentId: comment?.id,
              userId: user?.id,
              likeId: likeData?.id,
              isReport,
            },
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Offline: Queue for sync
        await addPendingAction({
          actionType: previousLikedState
            ? isReport
              ? 'UNLIKE_TRIP_REPORT_COMMENT'
              : 'UNLIKE_TRIP_COMMENT'
            : isReport
            ? 'LIKE_TRIP_REPORT_COMMENT'
            : 'LIKE_TRIP_COMMENT',
          entityId: comment?.id,
          payload: {
            commentId: comment?.id,
            userId: user?.id,
            likeId: likeData?.id,
            isReport,
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      setIsLiked(previousLikedState);
      setLikes(previousLikes);
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const [heightlightColor, setheightlightColor] = useState(Color?.lightblue);
  useEffect(() => {
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 10000);
  }, []);

  return (
    <View key={comment?.id} onLayout={onLayout}>
      <View
        style={[
          styles.passengerimgcontainer2,
          styles.mt2,
          {
            borderColor:
              CommentID === comment?.id ? heightlightColor : Color.white,
            borderWidth: 2,
            borderRadius: 10,
            padding: CommentID === comment?.id ? 5 : undefined,
          },
        ]}
      >
        <SuccessModal
          visible={success}
          onClose={() => {
            setSuccess(false);
            setIserror(false);
            setSuccessDescription('');
            closePopover();
            setselectusersID('');
          }}
          description={successdescription}
          iserror={iserror}
        />
        <Pressable
          onPress={() => {
            !isUserDeleted &&
              navigation.navigate('Profile', { userId: comment?.author?.id });
          }}
        >
          <FastImage
            source={
              isUserDeleted
                ? require('../assets/images/logo.png')
                : {
                    uri: comment?.author?.thumbnailProfileImage,
                    cache: FastImage.cacheControl.immutable,
                  }
            }
            style={styles.profileimg}
          />
        </Pressable>
        {comment?.author?.id === user.id ? (
          <Pressable style={{ width: '85%' }} ref={touchableRef}>
            <Text style={styles.userNametext}>
              {isUserDeleted
                ? 'Deletion Requested'
                : comment?.author?.firstName +
                  ' ' +
                  comment?.author?.lastName}{' '}
            </Text>
            {!isUserDeleted && (
              <Text style={styles.status1}>
                {getUserInfoText(comment?.author)}
              </Text>
            )}
            <Hyperlink
              onPress={url => Linking.openURL(url)}
              linkStyle={globlestyle.linkStyle}
            >
              <Text style={globlestyle.allcommenttext}>
                {isUserDeleted
                  ? 'Member requested to delete'
                  : comment?.comment}
              </Text>
            </Hyperlink>
            <View style={styles.replycontainer}>
              <View style={styles.passengerimgcontainer2}>
                <Text style={[styles.commenttimr]}>
                  {comment?.createdAt
                    ? moment(comment?.createdAt ?? '').fromNow()
                    : ''}
                  {comment?.isPending && ' • Pending'}
                </Text>
                {likes.length > 0 && (
                  <Text
                    style={{
                      marginLeft: dynamicSize(10),
                      ...styles.commenttimr1,
                    }}
                  >
                    {likes.length + ' likes'}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={handleLikePress}
                disabled={isLikeProcessing}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <FastImage
                  source={
                    isLiked
                      ? require('../assets/images/NewIcons/like_selected.png')
                      : require('../assets/images/NewIcons/like.png')
                  }
                  style={styles.likeicon}
                />
              </Pressable>
            </View>
          </Pressable>
        ) : (
          <Pressable
            style={{ width: '85%' }}
            ref={touchableRef}
            onLongPress={e => {
              !isUserDeleted && openPopover(e);
              !isUserDeleted && setselectusersID(comment.id);
            }}
          >
            <Text style={styles.userNametext}>
              {isUserDeleted
                ? 'Deletion Requested'
                : comment?.author?.firstName +
                  ' ' +
                  comment?.author?.lastName}{' '}
            </Text>
            {!isUserDeleted && (
              <Text style={styles.status1}>
                {getUserInfoText(comment?.author)}
              </Text>
            )}
            <Hyperlink
              onPress={url => Linking.openURL(url)}
              linkStyle={globlestyle.linkStyle}
            >
              <Text style={globlestyle.allcommenttext}>
                {' '}
                {isUserDeleted
                  ? 'Member requested to delete'
                  : comment?.comment}
              </Text>
            </Hyperlink>
            <View style={styles.replycontainer}>
              <View style={styles.passengerimgcontainer2}>
                <Text style={[styles.commenttimr]}>
                  {comment?.createdAt
                    ? moment(comment?.createdAt ?? '').fromNow()
                    : ''}
                  {comment?.isPending && ' • Pending'}
                </Text>
                {likes.length > 0 && (
                  <Text
                    style={{
                      marginLeft: dynamicSize(10),
                      ...styles.commenttimr1,
                    }}
                  >
                    {likes.length + ' likes'}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => {
                  !isUserDeleted && handleLikePress();
                }}
                disabled={isLikeProcessing || isUserDeleted}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <FastImage
                  source={
                    isLiked
                      ? require('../assets/images/NewIcons/like_selected.png')
                      : require('../assets/images/NewIcons/like.png')
                  }
                  style={styles.likeicon}
                />
              </Pressable>
            </View>
          </Pressable>
        )}
        <Popover
          isVisible={popoverVisible}
          popoverStyle={styles.content}
          from={touchableRef}
          onRequestClose={() => setPopoverVisible(false)}
        >
          <View style={styles.popupcontainer}>
            <TouchableOpacity
              style={styles.popupitem}
              onPress={e => {
                blockreport(selectusersID, 'tripcomment', 'report', 'Reported');
              }}
            >
              <Text style={styles.popupitemtext}>Report</Text>
            </TouchableOpacity>
          </View>
        </Popover>
      </View>
    </View>
  );
};

export default CommentItem;

// Styles remain the same
const styles = StyleSheet.create({
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
    color: Color.black0,
    textAlign: 'center',
  },
  popupitem: {
    paddingVertical: 10,
  },
  commentreply: {
    fontSize: 12,
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 16,
  },
  commenttimr: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(16),
  },
  commenttimr1: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(16),
  },
  sendbtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  pr10: {
    paddingRight: 10,
  },
  chattext: {
    fontSize: 14,
    lineHeight: 19,
    color: Color.black,
    textAlign: 'right',
    fontFamily: fontFamily.ProximaR,
  },
  chattime: {
    fontSize: 13,
    fontWeight: '600',
    color: Color.black,
    textAlign: 'right',
    marginTop: 5,
    fontFamily: fontFamily.ProximaAB,
  },
  chatcontainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: 20,
    backgroundColor: '#B5EAF0',
    paddingHorizontal: 10,
    borderRadius: 5,
    paddingVertical: 10,
  },
  commentinputcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    borderTopColor: Color.lightGray,
    borderTopWidth: 1,
  },
  coomentinput: {
    width: '75%',
    fontSize: 15,
    color: Color.black,
    fontFamily: fontFamily.ProximaAL,
    lineHeight: 21,
  },
  justifyCenter: {
    alignSelf: 'auto',
  },
  ImageContainer: {
    paddingHorizontal: 10,
  },
  replybutton: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replycontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: dynamicSize(6),
  },
  commenttext: {
    fontSize: getFontSize(17),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    marginTop: dynamicSize(6),
  },
  userNametext: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(21),
    color: Color.black,
  },
  likeicon: {
    height: dynamicSize(20),
    width: dynamicSize(20),
    alignSelf: 'baseline',
  },
  close: {
    height: dynamicSize(35),
    width: dynamicSize(35),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: dynamicSize(10),
    top: dynamicSize(10),
  },
  pv20: {
    paddingVertical: 20,
  },
  btnrow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttoncontainer: {
    width: '40%',
    marginHorizontal: 5,
  },
  inputstyles: {
    height: 30,
    padding: 0,
    paddingHorizontal: 10,
    fontSize: 15,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 21,
  },
  textinput: {
    marginHorizontal: 20,
    borderBottomColor: Color.lightblue,
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  modalbtntext: {
    textAlign: 'center',
    fontSize: 17,
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
    fontWeight: '400',
    color: Color.gray,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  modaltitle: {
    fontSize: 15,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 21,
    color: Color.black,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  bottommodal: {},
  modalView: {
    backgroundColor: Color.white,
    paddingVertical: 15,
    borderRadius: 10,
    textAlign: 'center',
  },
  viewContainer: {
    flex: 1,
  },
  deleteicon: {
    height: 20,
    width: 20,
  },
  deleticonbtn: {
    height: 35,
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  justifyend: {
    justifyContent: 'flex-end',
  },
  crewtext: {
    fontSize: 15,
    fontWeight: '600',
    color: Color.black,
    alignItems: 'center',
  },
  crewrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonscrollview: {
    paddingHorizontal: 5,
    marginBottom: 20,
    height: 60,
  },
  editnametext: {
    fontSize: 18,
    fontFamily: fontFamily.ProximaAB,
    color: Color.lightblue,
    lineHeight: 25,
  },
  editbutton: {
    height: 23,
    width: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editbuttonimg: {
    height: 18,
    width: 18,
    resizeMode: 'cover',
  },
  editnamecontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  btnGroup: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: Color.lightGray,
    borderRadius: 10,
  },
  btn: {
    borderRadius: 10,
    width: 85,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    borderWidth: 1,
    borderColor: Color.lightblue,
    marginHorizontal: 5,
  },
  btnText: {
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fontFamily.ProximaR,
    color: Color.lightblue,
  },
  input: {
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 15,
    backgroundColor: Color.white,
    borderRadius: 10,
    fontSize: 13,
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  textareabox: {
    marginVertical: 5,
  },
  passengerimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerimgcontainer2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ph6: {
    paddingVertical: 6,
  },
  detailsection2: {
    backgroundColor: Color.reportcardbg,
    marginHorizontal: 20,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 10,
  },
  textAlignleft: {
    textAlign: 'left',
  },
  textAlignright: {
    textAlign: 'right',
  },
  flexrow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconflex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mt2: {
    marginTop: 10,
  },
  subtitle: {
    fontSize: getLineSize(15),
    color: Color.black,
    fontWeight: '600',
    width: '85%',
  },
  inputcontainer: {
    paddingHorizontal: 20,
  },
  nametitle: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(20),
    color: Color.black,
    textAlign: 'right',
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  nametext: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(21),
    color: Color.cardgray,
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  subnametext: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getLineSize(21),
    color: Color.cardgray,
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  status: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    color: Color.cardgray,
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  status1: {
    ...text.usernamestatus,
    color: Color.black0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    marginRight: dynamicSize(10),
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
    paddingBottom: 10,
  },
});
