// ClubEventComments.js - Updated with proper pagination and deduplication
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  ActivityIndicator,
  RefreshControl,
  Text,
  StyleSheet,
} from 'react-native';
import { Image } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import ClubEventCommentItem from '../components/ClubEventCommentItem';
import { Header } from '../components/Header';
import { Color, fontFamily } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize } from '../constants/Responsive';
import { styles } from './TripDetail';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';
import StatusMessage from '../components/StatusMessage';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

// Import offline-first actions
import { fetchEventComments, postEventComment } from '../store/eventSlice';

const ClubEventComments = props => {
  const {
    EventId,
    clubid,
    isPublish,
    onlyAdminCommentOnly,
    organizerId,
    CommentID,
    ListIndex,
  } = props?.route?.params;

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const reduxComments =
    useSelector(state => state.event.eventComments[EventId]) || [];

  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [topLoader, setTopLoader] = useState(false);
  const [bottomLoader, setBottomLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [commentLoader, setCommentLoader] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const isFetchingComment = useRef(false);
  const hasMoreComments = useRef(true);
  const scrollViewRef = useRef();
  const scrollToIndex = useRef(0);
  const scrollToTopRef = useRef(false);
  const scrollToBottomRef = useRef(false);
  const dataSourceCords = useRef([]);

  const pageNo = useRef(1);
  const pageNoBottom = useRef(1);
  const pageNoTop = useRef(1);
  const scrollRetryTimer = useRef(null);

  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

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

  const BackButtonClick = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
    });

    return () => unsubscribe();
  }, [isOnline]);

  useEffect(() => {
    if (EventId) {
      handleNotificationIndex();
    }
  }, [EventId]);

  const handleNotificationIndex = () => {
    if (ListIndex !== undefined && ListIndex !== null && ListIndex !== '') {
      if (ListIndex === -1) {
        initComments();
      } else {
        const idx = parseInt(ListIndex, 10);
        if (idx > 10) {
          const modules = idx % 10;
          if (modules === 0) {
            pageNo.current = Math.floor(idx / 10);
            pageNoBottom.current = Math.floor(idx / 10);
            pageNoTop.current = Math.floor(idx / 10);
            scrollToIndex.current = 9;
            loadComments(false, false, true);
          } else {
            pageNo.current = Math.floor(idx / 10) + 1;
            pageNoBottom.current = Math.floor(idx / 10) + 1;
            pageNoTop.current = Math.floor(idx / 10) + 1;
            scrollToIndex.current = modules > 0 ? modules - 1 : 0;
            loadComments(false, false, true);
          }
        } else {
          pageNo.current = 1;
          pageNoBottom.current = 1;
          pageNoTop.current = 1;
          scrollToIndex.current = idx > 0 ? idx - 1 : 0;
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

  const loadComments = (
    isRefresh = false,
    loadMore = false,
    isStart = false,
    isTop = false,
  ) => {
    if (isFetchingComment.current) {
      return;
    }
    if (!EventId) {
      return;
    }

    isFetchingComment.current = true;

    if (loadMore) {
      setBottomLoader(true);
    } else if (isTop) {
      setTopLoader(true);
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
      fetchEventComments(
        EventId,
        pageToFetch,
        10,
        { isBottom: loadMore, isTop, isStart },
        (success, isLastPage) => {
          isFetchingComment.current = false;
          setCommentLoader(false);
          setBottomLoader(false);
          setTopLoader(false);
          setRefreshing(false);

          if (success) {
            if (loadMore) {
              pageNoBottom.current += 1;
              hasMoreComments.current = !isLastPage;
            } else if (isTop) {
              if (pageNoTop.current > 1) pageNoTop.current -= 1;
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
              hasMoreComments.current = !isLastPage;
              if (pageNo.current > 1) {
                scrollToTopRef.current = true;
              }
              if (isLastPage) {
                if (pageNoTop.current > 1) {
                  loadComments(false, false, false, true);
                }
              }
            } else {
              pageNo.current = 1;
              pageNoBottom.current = 1;
              pageNoTop.current = 1;
              hasMoreComments.current = !isLastPage;
            }
          }
        },
      ),
    );
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || isSending || !EventId) {
      return;
    }
    if (onlyAdminCommentOnly && organizerId !== user?.id) {
      return;
    }
    const comment = commentText.trim();
    try {
      Keyboard.dismiss();
      setIsSending(true);
      setCommentText('');

      scrollToBottomRef.current = true;
      const payload = {
        EventId: EventId,
        comment: comment,
        ParentId: 0,
        autherId: user?.id,
        auther: user,
      };

      await dispatch(
        postEventComment(payload, EventId, (success, created) => {}),
      );
    } catch (error) {
      setCommentText('');
    } finally {
      setIsSending(false);
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 100;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const isCloseToTop = ({ contentOffset }) => {
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
          title={
            isPublish === 'isPublish' ? 'Event comments' : 'Club event comments'
          }
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
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1, paddingHorizontal: 10 }}
            >
              {topLoader && (
                <View style={localStyles.loaderContainer}>
                  <ActivityIndicator color={Color.themeColor} />
                </View>
              )}

              {reduxComments.map((comment, index) => {
                const commentKey = comment.id ?? comment.comment_id ?? index;
                return (
                  <ClubEventCommentItem
                    key={commentKey}
                    isPublish={isPublish}
                    comment={comment}
                    clubid={clubid}
                    pageName={'clubeventcomment'}
                    onlyAdminCommentOnly={onlyAdminCommentOnly}
                    organizerId={organizerId}
                    CommentID={CommentID ? CommentID : 0}
                    onLayout={event => {
                      const layout = event.nativeEvent.layout;
                      dataSourceCords.current[index] = layout.y;
                      attemptScroll();
                    }}
                  />
                );
              })}

              {!commentLoader && reduxComments.length === 0 && (
                <View style={[styles.emptyContainer, { flex: 1 }]}>
                  <StatusMessage
                    isOnline={isOnline}
                    hasData={reduxComments?.length > 0}
                    title={'No Comments Available'}
                  />
                </View>
              )}

              {bottomLoader && (
                <View style={localStyles.loaderContainer}>
                  <ActivityIndicator color={Color.themeColor} />
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
                onChangeText={setCommentText}
                value={commentText}
                placeholderTextColor={Color.cardgray}
                placeholder={
                  onlyAdminCommentOnly
                    ? organizerId === user?.id
                      ? 'Add a comment....'
                      : 'Organiser has turned off comments for this event.'
                    : 'Add a comment....'
                }
                editable={
                  !isSending &&
                  (onlyAdminCommentOnly ? organizerId === user?.id : true)
                }
              />

              <Pressable
                onPress={handleSendComment}
                style={styles.sendbtn}
                disabled={
                  isSending ||
                  !commentText.trim() ||
                  (onlyAdminCommentOnly && organizerId !== user?.id)
                }
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={Color.themeColor} />
                ) : (
                  <FontAwesome
                    name="send"
                    size={20}
                    color={
                      commentText.trim() ? Color.themeColor : Color.cardgray
                    }
                  />
                )}
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  loaderContainer: {
    height: dynamicSize(50),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ClubEventComments;
