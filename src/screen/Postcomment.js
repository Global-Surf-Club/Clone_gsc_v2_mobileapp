//import liraries
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import Popover from 'react-native-popover-view';
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Image } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import Forum from '../api/Forum';
import { Header } from '../components/Header';
import { Color, fontFamily, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';
import Blockreport from '../api/Blockreport';
import SuccessModal from '../components/SuccessModal';
import { globlestyle } from '../styles/globlestyle';
import Hyperlink from 'react-native-hyperlink';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ForumDB from '../database/forumDbHelper';
import { updateForumPost } from '../store/forumSlice';
import FastImage from 'react-native-fast-image';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

let pageNo = 1;
let pageNoBottom = 1;
let pageNoTop = 1;
let isFetching = false;
let isDataLoaded = false;
let isDataLoadedTop = false;
let isSendInProgress = false;

const Postcomment = props => {
  const navigation = useNavigation();
  const route = useRoute();
  const postId = route.params?.id;
  const [replyId, setReplyId] = useState(null);
  const [replyData, setReplyData] = useState(null);
  const inputRef = useRef(null);
  const [showLoading, SetshowLoading] = useState(false);
  const [timeStart, settimeStart] = useState('');
  const user = useSelector(state => state.auth.user);
  const [selectusersID, setselectusersID] = useState('');
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [TopLodaer, setTopLodaer] = useState(false);
  const [heightlightColor, setheightlightColor] = useState(Color?.lightblue);
  const [isOnline, setIsOnline] = useState(true);
  const scrollRef = useRef(null);
  const scrollToIndex = useRef(0);
  const dataSourceCords = useRef([]);
  const comments = useRef([]);
  const isSendInProgressRef = useRef(false);
  const scrollToTopRef = useRef(false);
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [refreshLoader, setRefreshLoader] = useState(false);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  const openPopover = () => {
    setPopoverVisible(true);
  };
  const closePopover = () => {
    setPopoverVisible(false);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 10000);
  }, []);

  useEffect(() => {
    if (
      props?.route?.params?.ListIndex !== undefined &&
      props?.route?.params?.ListIndex !== null &&
      props?.route?.params?.ListIndex !== ''
    ) {
      if (props?.route?.params?.ListIndex === -1) {
        alert('The forum is deleted');
        getComments(true);
      } else {
        if (parseInt(props?.route?.params?.ListIndex) > 10) {
          let modules = parseInt(props?.route?.params?.ListIndex) % 10;
          if (modules == 0) {
            pageNoTop = parseInt(
              parseInt(props?.route?.params?.ListIndex) / 10,
            );
            pageNoBottom = parseInt(
              parseInt(props?.route?.params?.ListIndex) / 10,
            );
            pageNo = parseInt(parseInt(props?.route?.params?.ListIndex) / 10);
            scrollToIndex.current = 9;
            getComments(false, false, false, false, true);
          } else {
            pageNoTop =
              parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
            pageNoBottom =
              parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
            pageNo =
              parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
            scrollToIndex.current = modules > 0 ? modules - 1 : 0;
            getComments(false, false, false, false, true);
          }
        } else {
          pageNoTop = 1;
          pageNoBottom = 1;
          pageNo = 1;
          scrollToIndex.current =
            parseInt(props?.route?.params?.ListIndex) > 0
              ? parseInt(props?.route?.params?.ListIndex) - 1
              : 0;
          getComments(false, false, false, false, true);
        }
      }
    } else {
      getComments();
    }
  }, [props]);

  const getComments = async (isRefresh, isBottom, isSend, isTop, isStart) => {
    try {
      if (isBottom) {
        setBottomLodaer(true);
      } else if (isTop) {
        setTopLodaer(true);
      } else if (isStart) {
        isDataLoadedTop = false;
        isDataLoaded = false;
        SetshowLoading(true);
      } else if (isRefresh) {
        isDataLoaded = false;
        pageNo = 1;
        pageNoBottom = 1;
        pageNoTop = 1;
        // SetshowLoading(true);
        setRefreshLoader(true);
      } else {
        isDataLoaded = false;
        pageNo = 1;
        pageNoBottom = 1;
        pageNoTop = 1;
        SetshowLoading(true);
      }
      isFetching = true;

      try {
        const response = await Forum.getComments(
          postId,
          isBottom
            ? pageNoBottom
            : isTop
            ? pageNoTop
            : isSend
            ? pageNo
            : pageNo,
          10,
        );
        if (!response) {
          throw new Error('Empty API response');
        }

        const parsed =
          typeof response === 'string' ? JSON.parse(response) : response;
       if (!Array.isArray(parsed)) {
          throw new Error('Invalid API response');
        }

        if (isSend) {
          let commentData = [...comments?.current];
          if (parsed?.length > 0) {
            parsed.forEach(subitem => {
              const alreadyExists = commentData.some(x => x.id === subitem?.id);
              if (!alreadyExists) {
                commentData.unshift(subitem);
              }
            });

            comments.current = commentData;
          }
          scrollToTopRef.current = true;
          if (parsed?.length === 10) {
            pageNo += 1;
          }
        } else if (isTop) {
          comments.current = [...parsed, ...comments.current];
          setTopLodaer(false);
          // if (dataSourceCords.current?.length >= 10) {
          //   scrollRef.current.scrollTo({
          //     x: 0,
          //     y: dataSourceCords.current[10],
          //     animated: true,
          //   });
          // }
        } else if (isStart) {
          if (parsed.length === 0) {
            throw new Error('Empty start response');
          }
          comments.current = parsed;
          if (parsed?.length !== 10 && pageNoTop > 1) {
            pageNoTop -= 1;
            getComments(false, false, false, true);
          }
        } else if (isBottom) {
          comments.current = [...comments.current, ...parsed];
          setBottomLodaer(false);
        } else {
          comments.current = parsed;
        }
        if ((isStart || isRefresh) && parsed?.length > 0) {
          for (const c of parsed) {
            await ForumDB.insertForumComment(
              {
                ...c,
                id: c.id,
              },
              { skipPostCount: true },
            );
          }
        }

        if (parsed?.length !== 10) {
          isDataLoaded = true;
        }
        if (pageNo === 1 || pageNoTop === 1) {
          isDataLoadedTop = true;
        }
        SetshowLoading(false);
        setRefreshLoader(false);
        isFetching = false;
      } catch (apiErr) {
        const localComments = await ForumDB.getForumComments(
          postId,
          isBottom ? pageNoBottom : isTop ? pageNoTop : pageNo,
          10,
        );

        if (isSend) {
          let commentData = [...comments?.current];
          if (localComments?.length > 0) {
            localComments.forEach(subitem => {
              const alreadyExists = commentData.some(x => x.id === subitem?.id);
              if (!alreadyExists) {
                commentData.unshift(subitem);
              }
            });

            comments.current = commentData;
          }
          scrollToTopRef.current = true;
          if (localComments?.length === 10) {
            pageNo += 1;
          }
        } else if (isTop) {
          comments.current = [...localComments, ...comments.current];
          setTopLodaer(false);
        } else if (isStart) {
          comments.current = localComments;
        } else if (isBottom) {
          comments.current = [...comments.current, ...localComments];
          setBottomLodaer(false);
        } else {
          comments.current = localComments;
        }

        if (localComments?.length !== 10) {
          isDataLoaded = true;
        }
        if (pageNo === 1 || pageNoTop === 1) {
          isDataLoadedTop = true;
        }
        SetshowLoading(false);
        setRefreshLoader(false);
        isFetching = false;
      }
    } catch (error) {
      comments.current = [];
      SetshowLoading(false);
      setBottomLodaer(false);
      setTopLodaer(false);
      setRefreshLoader(false);
      isDataLoaded = false;
      isFetching = false;
      pageNo = 1;
    }
  };

  const menuButtonClick = () => {
    navigation.goBack();
  };

  const dispatch = useDispatch();

  const postComment = async (parentId = 0) => {
    if (isSendInProgressRef.current) return;

    if (!timeStart || timeStart.trim().length === 0) return;

    isSendInProgressRef.current = true;
    SetshowLoading(true);

    const messageText = timeStart;
    const isReply = parentId && parentId !== 0;

    try {
      const tempId = `temp_comment_${Date.now()}`;
      const createdAt = new Date().toISOString();

      const tempComment = {
        id: tempId,
        postId,
        parentId: isReply ? parentId : null,
        message: messageText,
        senderUser: user,
        createdAt,
        quoteComment: isReply ? { ...replyData } : null,
        isSync: false,
      };

      settimeStart('');
      setReplyId(null);
      setReplyData(null);

      await ForumDB.insertForumComment(
        {
          id: tempId,
          postId,
          userId: user?.id,
          message: messageText,
          createdAt,
          senderUser: user,
          quoteComment: isReply ? replyData : null,
          isSync: false,
        },
        { skipPostCount: false },
      );

      comments.current = [tempComment, ...comments.current];
      scrollToTopRef.current = true;

      const updatedPostLocal = await ForumDB.getForumPost(postId);
      if (updatedPostLocal) {
        dispatch(
          updateForumPost({
            id: postId,
            commentCount: Number(updatedPostLocal.commentCount || 0),
          }),
        );
      }
      try {
        const param = {
          id: 0,
          postId,
          parentId: isReply ? parentId : 0,
          message: messageText,
        };

        const response = await Forum.postComment(param);
        const created =
          typeof response === 'string' ? JSON.parse(response) : response;

        if (!created || !created.id) {
          throw new Error('Invalid API response');
        }
        const filtered = comments.current.filter(item => item.id !== tempId);
        comments.current = [
          {
            ...created,
            quoteComment: tempComment.quoteComment ?? null,
          },
          ...filtered,
        ];
        scrollToTopRef.current = true;
        await ForumDB.deleteForumComment(tempId, postId);
        await ForumDB.insertForumComment(
          {
            id: created.id,
            postId,
            userId: created.senderUser?.id || user?.id,
            message: created.message,
            createdAt: created.createdAt || new Date().toISOString(),
            senderUser: created.senderUser || user,
            quoteComment: created.quoteComment ?? null,
          },
          { skipPostCount: false },
        );

        const updatedPostAfter = await ForumDB.getForumPost(postId);
        if (updatedPostAfter) {
          dispatch(
            updateForumPost({
              id: postId,
              commentCount: Number(updatedPostAfter.commentCount || 0),
            }),
          );
        }
      } catch (apiError) {
        await ForumDB.addPendingForumAction({
          actionType: 'create_comment',
          postId,
          userId: user?.id,
          commentId: tempId,
          commentText: messageText,
          parentId: isReply ? parentId : 0,
        });
      }
    } catch (err) {
    } finally {
      isSendInProgressRef.current = false;
      SetshowLoading(false);
    }
  };

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
        Alert.alert('Targetid null Postcomment Pag');
      }
    }
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
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        >
          <Header
            backbutton={'chevron-left-circle'}
            iconRight={require('../assets/images/icon/chatting.png')}
            iconRight1={require('../assets/images/icon/bell1.png')}
            title={route.params?.ForumName ? route.params?.ForumName : 'N/A'}
            iconRight2={require('../assets/images/icon/home.png')}
            onPressLeft={menuButtonClick}
            notification={'6'}
            textAlign={'center'}
          />
          <Loader visible={showLoading} />
          <SuccessModal
            visible={success}
            onClose={() => {
              setSuccess(false);
              setIserror(false);
              setSuccessDescription('');
              setselectusersID('');
              closePopover();
            }}
            description={successdescription}
            iserror={iserror}
          />
          <ScrollView
            onScroll={({ nativeEvent }) => {
              if (isCloseToBottom(nativeEvent)) {
               if (!isFetching && !isDataLoaded) {
                  pageNoBottom += 1;
                  getComments(false, true);
                }
              } else if (isCloseToTop(nativeEvent)) {
                if (!isFetching && !isDataLoadedTop) {
                  if (pageNoTop > 1) {
                    pageNoTop -= 1;
                    getComments(false, false, false, true);
                  }
                }
              }
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshLoader}
                onRefresh={() => getComments(true)}
              />
            }
            onContentSizeChange={() => {
              if (scrollToTopRef.current) {
                scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
                scrollToTopRef.current = false;
              }
            }}
            bounces={true}
            ref={scrollRef}
            alwaysBounceVertical={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
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
            <View style={styles.viewContainer}>
              <View style={styles.ImageContainer}>
                {comments?.current?.map((item, index) => {
                 const isUserDeleted =
                    Array.isArray(user?.inActiveUsers) &&
                    user.inActiveUsers.some(
                      id => String(id) === String(item?.senderUser?.id),
                    );

                  const isQuatOwnerDelete =
                    Array.isArray(user?.inActiveUsers) &&
                    item?.quoteComment &&
                    user.inActiveUsers.some(
                      id =>
                        String(id) ===
                        String(item?.quoteComment?.senderUser?.id),
                    );

                  return (
                    <View
                      style={{
                        borderColor:
                          props?.route?.params?.CommentID === item?.id
                            ? heightlightColor
                            : Color?.white,
                        borderWidth: 2,
                        borderRadius: 10,
                      }}
                      onLayout={event => {
                        const layout = event.nativeEvent.layout;
                        dataSourceCords.current[index] = layout.y;
                        dataSourceCords.current = dataSourceCords.current;
                        if (
                          dataSourceCords.current?.length > 0 &&
                          dataSourceCords.current?.length < 11
                        ) {
                          scrollRef.current.scrollTo({
                            x: 0,
                            y: dataSourceCords.current[scrollToIndex.current],
                            animated: true,
                          });
                        }
                      }}
                    >
                      {item?.quoteComment && (
                        <Pressable
                          style={[
                            styles.chatmsg,
                            styles.pr10,
                            {
                              flex: 1,
                              flexDirection: 'row',
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="arrow-left-bottom"
                            size={25}
                            color={Color.themeColor}
                            style={{ marginRight: 15, marginLeft: 8 }}
                          />
                          <View style={{ flex: 1 }}>
                            <View>
                              <Text style={styles.nametext}>
                                {isQuatOwnerDelete
                                  ? 'Deletion Requested'
                                  : item?.quoteComment?.senderUser?.firstName +
                                    ' ' +
                                    item?.quoteComment?.senderUser?.lastName}
                              </Text>
                              {!isQuatOwnerDelete && (
                                <Text style={styles.status}>
                                  {getUserInfoText(
                                    item?.quoteComment?.senderUser,
                                  )}
                                </Text>
                              )}
                              <Text style={globlestyle.commentsmalltime}>
                                <MaterialCommunityIcons
                                  name="clock"
                                  size={10}
                                  color={Color.black0}
                                />
                                {' ' +
                                  moment(
                                    item?.quoteComment?.createdAt,
                                  ).fromNow()}
                              </Text>
                            </View>
                            <Text style={globlestyle.allcommenttext}>
                              {isQuatOwnerDelete
                                ? 'Member requested to delete'
                                : item?.quoteComment?.message}
                            </Text>
                          </View>
                        </Pressable>
                      )}
                      <View style={{ marginBottom: 10 }}>
                        {item?.senderUser?.id !== user?.id ? (
                          <Pressable
                            ref={touchableRef}
                            onLongPress={index => {
                              !isUserDeleted && openPopover(item?.id);
                              !isUserDeleted && setselectusersID(item.id);
                            }}
                            style={[styles.chatcontainer]}
                          >
                            <Pressable
                              onPress={() => {
                                !isUserDeleted &&
                                  navigation.navigate('Profile', {
                                    userId: item?.senderUser?.id,
                                  });
                              }}
                            >
                              <FastImage
                                source={
                                  isUserDeleted
                                    ? require('../assets/images/logo.png')
                                    : {
                                        uri: item?.senderUser
                                          ?.thumbnailProfileImage,
                                        cache: FastImage.cacheControl.immutable,
                                      }
                                }
                                style={[styles.chatprofileimg]}
                              />
                            </Pressable>
                            <View
                              style={[
                                styles.chatmsg,
                                styles.pr10,
                                { flex: 1 },
                                replyId == item?.id && { borderWidth: 1 },
                              ]}
                            >
                              <View>
                                <Text style={styles.nametext}>
                                  {isUserDeleted
                                    ? 'Deletion Requested'
                                    : item?.senderUser?.firstName +
                                      ' ' +
                                      item?.senderUser?.lastName}
                                </Text>
                                {!isUserDeleted && (
                                  <Text style={styles.status}>
                                    {getUserInfoText(item?.senderUser)}
                                  </Text>
                                )}
                                <Text style={globlestyle.commentsmalltime}>
                                  <MaterialCommunityIcons
                                    name="clock"
                                    size={10}
                                    color={Color.black0}
                                  />
                                  {' ' + moment(item?.createdAt).fromNow()}
                                </Text>
                              </View>
                              <Hyperlink
                                onPress={url => Linking.openURL(url)}
                                linkStyle={globlestyle.linkStyle}
                              >
                                <Text style={globlestyle.allcommenttext}>
                                  {isUserDeleted
                                    ? 'Member requested to delete'
                                    : item?.message}
                                </Text>
                              </Hyperlink>
                            </View>
                          </Pressable>
                        ) : (
                          <Pressable
                            ref={touchableRef}
                            style={[styles.chatcontainer]}
                          >
                            <Pressable
                              onPress={() => {
                                !isUserDeleted &&
                                  navigation.navigate('Profile', {
                                    userId: item?.senderUser?.id,
                                  });
                              }}
                            >
                              <FastImage
                                source={
                                  isUserDeleted
                                    ? require('../assets/images/logo.png')
                                    : {
                                        uri: item?.senderUser
                                          ?.thumbnailProfileImage,
                                        cache: FastImage.cacheControl.immutable,
                                      }
                                }
                                style={[styles.chatprofileimg]}
                              />
                            </Pressable>
                            <View
                              style={[
                                styles.chatmsg,
                                styles.pr10,
                                { flex: 1 },
                                replyId == item?.id && { borderWidth: 1 },
                              ]}
                            >
                              <View>
                                <Text style={styles.nametext}>
                                  {isUserDeleted
                                    ? 'Deletion Requested'
                                    : item?.senderUser?.firstName +
                                      ' ' +
                                      item?.senderUser?.lastName}
                                </Text>
                                {!isUserDeleted && (
                                  <Text style={styles.status}>
                                    {getUserInfoText(item?.senderUser)}
                                  </Text>
                                )}
                                <Text style={globlestyle.commentsmalltime}>
                                  <MaterialCommunityIcons
                                    name="clock"
                                    size={10}
                                    color={Color.black0}
                                  />
                                  {' ' + moment(item?.createdAt).fromNow()}
                                </Text>
                              </View>
                              <Hyperlink
                                onPress={url => Linking.openURL(url)}
                                linkStyle={globlestyle.linkStyle}
                              >
                                <Text style={globlestyle.allcommenttext}>
                                  {isUserDeleted
                                    ? 'Member requested to delete'
                                    : item?.message}
                                </Text>
                              </Hyperlink>
                            </View>
                          </Pressable>
                        )}

                        <View style={styles.iconbtnrow}>
                          {item?.isSync !== false && !isUserDeleted && (
                            <Pressable
                              onPress={() => {
                                setReplyId(item?.id);
                                setReplyData(item);
                                inputRef.current?.focus();
                              }}
                              style={styles.iconbtn}
                            >
                              <FastImage
                                source={require('../assets/images/icon/commentIcon.png')}
                                style={styles.iconimg}
                              />
                              <Text style={styles.status}>Reply</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
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
                      blockreport(
                        selectusersID,
                        'forumcomment',
                        'report',
                        'Reported',
                      );
                    }}
                  >
                    <Text style={styles.popupitemtext}>Report</Text>
                  </TouchableOpacity>
                </View>
              </Popover>
            </View>
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
          {replyData && (
            <View
              style={[styles.chatmsg, styles.pr10, { flexDirection: 'row' }]}
            >
              <MaterialCommunityIcons
                name="arrow-left-bottom"
                size={25}
                color={Color.themeColor}
                style={{ marginRight: 15, marginLeft: 8 }}
              />
              <View style={{ flex: 1 }}>
                <View>
                  <Text style={styles.nametext}>
                    {replyData?.senderUser?.firstName +
                      ' ' +
                      replyData?.senderUser?.lastName}
                  </Text>
                  <Text style={globlestyle.commentsmalltime}>
                    <MaterialCommunityIcons
                      name="clock"
                      size={10}
                      color={Color.black0}
                    />
                    {' ' + moment(replyData?.createdAt).fromNow()}
                  </Text>
                </View>
                <Text style={globlestyle.allcommenttext} numberOfLines={4}>
                  {replyData?.message}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setReplyData(null);
                  setReplyId(null);
                }}
                style={{ position: 'absolute', right: 15, top: 15 }}
              >
                <AntDesign name="close" size={25} color={Color.themeColor} />
              </Pressable>
            </View>
          )}
          <View style={styles.commentinputcontainer}>
            <Pressable style={{ width: '15%' }}>
              <FastImage
                source={{
                  uri: user?.thumbnailProfileImage,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.profileimg}
              />
            </Pressable>
            <TextInput
              ref={inputRef}
              multiline
              style={styles.coomentinput}
              onChangeText={settimeStart}
              value={timeStart}
              placeholderTextColor={Color.cardgray}
              placeholder="Add a comment...."
            />
            <Pressable
              disabled={isSendInProgressRef.current}
              onPress={() => {
                Keyboard.dismiss();
                postComment(replyId ?? 0);
              }}
              style={[styles.sendbtn]}
            >
              {/* <FontAwesome name="send" size={20} color={Color.cardgray} /> */}
              {isSendInProgressRef.current ? (
                <ActivityIndicator size="small" color={Color.cardgray} />
              ) : (
                <FontAwesome name="send" size={20} color={Color.cardgray} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

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
    color: Color.cardgray,
    lineHeight: getFontSize(16),
    color: Color.black0,
    textAlign: 'center',
  },
  popupitem: {
    paddingVertical: 10,
  },
  iconbtn: {
    height: dynamicSize(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: dynamicSize(8),
    marginVertical: 2,
  },
  iconimg: {
    height: dynamicSize(15),
    width: dynamicSize(15),
    marginRight: dynamicSize(5),
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '80%',
    alignSelf: 'flex-end',
  },

  nametext: {
    ...text.usernameboldtitle,
    color: Color.black,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  status: {
    ...text.usernamestatus,
    color: Color.black0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  chatprofileimg: {
    width: dynamicSize(40),
    height: dynamicSize(40),
    marginHorizontal: dynamicSize(10),
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  pr10: {
    paddingRight: 10,
  },
  chattext: {
    fontSize: getFontSize(14),
    lineHeight: getFontSize(19),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    marginTop: dynamicSize(10),
  },
  chattime: {
    fontSize: getFontSize(11),
    fontWeight: '600',
    color: Color.black,
    marginTop: 5,
    fontFamily: fontFamily.ProximaAB,
  },
  chatmsg: {
    backgroundColor: '#B5EAF0',
    paddingHorizontal: dynamicSize(15),
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopStartRadius: 20,
    paddingVertical: dynamicSize(10),
  },
  chatcontainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    borderRadius: 5,
    paddingVertical: 5,
    width: '100%',
  },
  ImageContainer: {
    paddingHorizontal: 10,
  },
  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    marginRight: 5,
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  commentreply: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(16),
  },
  commenttimr: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 16,
  },
  sendbtn: {
    alignItems: 'center',
    paddingVertical: dynamicSize(10),
    paddingHorizontal: dynamicSize(10),
    // marginHorizontal: dynamicSize(50),
  },
  // comment input
  commentinputcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dynamicSize(15),
    borderTopColor: Color.lightGray,
    borderTopWidth: 1,
    paddingVertical: 5,
  },
  coomentinput: {
    // width: '75%',
    flex: 1,
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaAL,
    lineHeight: getFontSize(21),
  },
  justifyCenter: {
    alignSelf: 'auto',
  },
  // comment input
  container: {
    flex: 1,
    backgroundColor: Color.white,
    paddingBottom: dynamicSize(10),
  },
});

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
};

export default Postcomment;
