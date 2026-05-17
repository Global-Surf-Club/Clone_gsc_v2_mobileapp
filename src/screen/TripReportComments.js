import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  RefreshControl,
  Text,
} from 'react-native';
import { Image } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import CommentItem from '../components/CommentItem';
import { Header } from '../components/Header';
import { Color, fontFamily } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { styles } from './TripDetail';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import FastImage from 'react-native-fast-image';
import ConnectionBanner from '../components/ConnectionBanner';
import StatusMessage from '../components/StatusMessage';
import {
  getTripReportComments,
  commentTripReportAction,
  setReportComments,
} from '../store/tripSlice';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const TripReportComments = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeItem = route?.params;
  const user = useSelector(state => state.auth.user);
  const reduxComments = useSelector(state => state.trip.reportComments);
  const dispatch = useDispatch();
  const scrollViewRef = useRef();
  const dataSourceCords = useRef([]);
  const [commentLoader, setCommentLoader] = useState(false);
  const [bottomLoader, setBottomLoader] = useState(false);
  const [inputComment, setInputComment] = useState('');
  const [isSendInProgress, setIsSendInProgress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const isFetchingComment = useRef(false);
  const hasMoreComments = useRef(true);
  const reportId = routeItem?.id || routeItem?.reportId;
  const scrollToIndex = useRef(0);
  const scrollToTopRef = useRef(false);
  const scrollToBottomRef = useRef(false);
  const pageNo = useRef(1);
  const pageNoBottom = useRef(1);
  const pageNoTop = useRef(1);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  const BackButtonClick = () => {
    navigation.goBack();
  };

  const attemptScroll = () => {
    if (
      scrollToTopRef.current &&
      dataSourceCords.current?.length > scrollToIndex.current
    ) {
      scrollViewRef.current?.scrollTo({
        x: 0,
        y: dataSourceCords.current[scrollToIndex.current] || 0,
        animated: true,
      });
      scrollToTopRef.current = false;
    } else if (
      scrollToBottomRef.current &&
      dataSourceCords.current?.length > 0
    ) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
      scrollToBottomRef.current = false;
    }
  };

  useEffect(() => {
    if (reportId) {
      handleNotificationIndex();
    }
  }, [reportId]);

  const handleNotificationIndex = () => {
    if (
      routeItem?.ListIndex !== undefined &&
      routeItem?.ListIndex !== null &&
      routeItem?.ListIndex !== ''
    ) {
      if (routeItem?.ListIndex === -1) {
        initComments();
      } else {
        if (parseInt(routeItem?.ListIndex) > 10) {
          let modules = parseInt(routeItem?.ListIndex) % 10;
          if (modules == 0) {
            pageNo.current = parseInt(parseInt(routeItem?.ListIndex) / 10);
            pageNoBottom.current = parseInt(
              parseInt(routeItem?.ListIndex) / 10,
            );
            pageNoTop.current = parseInt(parseInt(routeItem?.ListIndex) / 10);
            scrollToIndex.current = 9;
            loadComments(false, false, true);
          } else {
            pageNo.current = parseInt(parseInt(routeItem?.ListIndex) / 10) + 1;
            pageNoBottom.current =
              parseInt(parseInt(routeItem?.ListIndex) / 10) + 1;
            pageNoTop.current =
              parseInt(parseInt(routeItem?.ListIndex) / 10) + 1;
            scrollToIndex.current = modules > 0 ? modules - 1 : 0;
            loadComments(false, false, true);
          }
        } else {
          pageNo.current = 1;
          pageNoBottom.current = 1;
          pageNoTop.current = 1;
          scrollToIndex.current =
            parseInt(routeItem?.ListIndex) > 0
              ? parseInt(routeItem?.ListIndex) - 1
              : 0;
          loadComments(false, false, true);
        }
      }
    } else {
      initComments();
    }
  };

  const initComments = () => {
    pageNo.current = 1;
    pageNoBottom.current = 1;
    pageNoTop.current = 1;
    hasMoreComments.current = true;
    loadComments(false);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      const wasOffline = !isOnline;
      setIsOnline(online);
      if (!online && wasOffline) {
        setShowOfflineMessage(true);
        setTimeout(() => setShowOfflineMessage(false), 3000);
      }
      if (online && wasOffline) {
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  const loadComments = (
    isRefresh = false,
    loadMore = false,
    isStart = false,
    isTop = false,
  ) => {
    if (isFetchingComment.current) {
      return;
    }
    if (!reportId) {
      return;
    }
    isFetchingComment.current = true;
    if (loadMore) {
      setBottomLoader(true);
    } else if (isTop) {
      setCommentLoader(true);
    } else if (isRefresh) {
      setRefreshing(true);
    } else {
      setCommentLoader(true);
    }

    let pageToFetch = 1;
    if (loadMore) {
      pageToFetch = pageNoBottom.current + 1;
    } else if (isTop) {
      pageToFetch = pageNoTop.current - 1;
    } else if (isStart) {
      pageToFetch = pageNo.current;
    } else {
      pageToFetch = 1;
    }

    dispatch(
      getTripReportComments(
        reportId,
        pageToFetch,
        loadMore, // isBottom parameter
        isTop, // isTop parameter
        isStart, // isStart parameter
        (success, hasMore) => {
         isFetchingComment.current = false;
          setCommentLoader(false);
          setBottomLoader(false);
          setRefreshing(false);

          if (success) {
            if (loadMore) {
              pageNoBottom.current += 1;
              hasMoreComments.current = hasMore === true;
            } else if (isTop) {
              pageNoTop.current -= 1;
              // if (dataSourceCords.current?.length >= 10) {
              //   setTimeout(() => {
              //     scrollViewRef.current?.scrollTo({
              //       x: 0,
              //       y: dataSourceCords.current[10] || 0,
              //       animated: true,
              //     });
              //   }, 100);
              // }
            } else if (isStart) {
              hasMoreComments.current = hasMore === true;
              if (pageNo.current > 1) {
                scrollToTopRef.current = true;
              }
              if (!hasMore) {
                if (pageNoTop.current > 1) {
                  loadComments(false, false, false, true);
                }
              }
            } else {
              pageNo.current = 1;
              pageNoBottom.current = 1;
              pageNoTop.current = 1;
              hasMoreComments.current = hasMore === true;
            }
          } else {
            isFetchingComment.current = false;
          }
        },
      ),
    );
  };

  const handleSendComment = async () => {
    if (!inputComment.trim() || isSendInProgress || !reportId) {
      return;
    }
    const commentText = inputComment.trim();
    try {
      Keyboard.dismiss();
      setIsSendInProgress(true);
      setInputComment('');
      // setTimeout(() => {
      //   scrollViewRef.current?.scrollToEnd({ animated: true });
      // }, 100);
      scrollToBottomRef.current = true;
      await dispatch(
        commentTripReportAction(
          { tripReportId: reportId, comment: commentText },
          user,
        ),
      );
    } catch (error) {
      setInputComment(commentText);
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 3000);
    } finally {
      setIsSendInProgress(false);
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 100;
    const isClose =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    return isClose;
  };

  const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    return contentOffset.y <= 0;
  };

  const handleScroll = ({ nativeEvent }) => {
    if (isCloseToBottom(nativeEvent)) {
      if (!isFetchingComment.current && hasMoreComments.current && isOnline) {
        loadComments(false, true, false);
      }
    } else if (isCloseToTop(nativeEvent)) {
      if (!isFetchingComment.current && pageNoTop.current > 1 && isOnline) {
        loadComments(false, false, false, true);
      }
    }
  };

  const handleRefresh = () => {
    pageNo.current = 1;
    pageNoBottom.current = 1;
    pageNoTop.current = 1;
    hasMoreComments.current = true;
    loadComments(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={BackButtonClick}
          title={'Trip Report Comments'}
          notification={'6'}
          textAlign={'center'}
        />

        {!isOnline && (
          <View>
            <ConnectionBanner isOnline={isOnline} />
          </View>
        )}
        {commentLoader ? (
          <Loader visible={commentLoader} />
        ) : (
          <>
            <ScrollView
              ref={scrollViewRef}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={Color.themeColor}
                />
              }
              onScroll={handleScroll}
              scrollEventThrottle={300}
              onContentSizeChange={() => {
                attemptScroll();
              }}
              bounces={true}
              contentContainerStyle={{
                paddingBottom: getBottomSpace() + 20,
                paddingTop: 10,
              }}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1, paddingHorizontal: 10 }}
            >
              {reduxComments.map((comment, index) => (
                <CommentItem
                  key={comment.id || `comment-${index}`}
                  onLayout={event => {
                    const layout = event.nativeEvent.layout;
                    dataSourceCords.current[index] = layout.y;
                    attemptScroll();
                  }}
                  CommentID={routeItem?.CommentID}
                  comment={comment}
                  btnHandler={() => {}}
                  pageName={'tripreportcomment'}
                  isReport
                />
              ))}
              {!commentLoader && reduxComments.length === 0 && (
                <View style={[styles.emptyContainer, { flex: 1 }]}>
                  <StatusMessage
                    isOnline={isOnline}
                    hasData={reduxComments?.length > 0}
                    title={'No Comments Available'}
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.commentinputcontainer}>
              <Pressable style={{ width: '15%' }}>
                <FastImage
                  source={{
                    uri: user?.thumbnailProfileImage,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.chatprofileimg}
                />
              </Pressable>

              <TextInput
                multiline
                style={styles.coomentinput}
                onChangeText={setInputComment}
                value={inputComment}
                placeholderTextColor={Color.cardgray}
                placeholder="Add a comment...."
                editable={!isSendInProgress}
              />

              <Pressable
                onPress={handleSendComment}
                style={styles.sendbtn}
                disabled={isSendInProgress || !inputComment.trim()}
              >
                {isSendInProgress ? (
                  <ActivityIndicator size="small" color={Color.themeColor} />
                ) : (
                  <FontAwesome
                    name="send"
                    size={20}
                    color={
                      inputComment.trim() ? Color.themeColor : Color.cardgray
                    }
                  />
                )}
              </Pressable>
            </View>
          </>
        )}
        {commentLoader && <Loader visible={commentLoader} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const localStyles = {
  offlineBanner: {
    backgroundColor: Color.lightblue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  offlineText: {
    color: Color.white,
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaBold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
};

export default TripReportComments;
