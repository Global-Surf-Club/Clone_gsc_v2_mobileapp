import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  FlatList,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import { Header } from '../components/Header';
import { Color } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize } from '../constants/Responsive';
import { styles } from './TripDetail';
import Popover from 'react-native-popover-view';
import Blockreport from '../api/Blockreport';
import SuccessModal from '../components/SuccessModal';
import Hyperlink from 'react-native-hyperlink';
import { globlestyle } from '../styles/globlestyle';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConnectionBanner from '../components/ConnectionBanner';
import StatusMessage from '../components/StatusMessage';
import SyncInfo from '../components/SyncStatus';
import NetInfo from '@react-native-community/netinfo';
import FastImage from 'react-native-fast-image';

// Import from chat slice instead of trip slice
import {
  getChatMessages,
  sendMessage,
  clearUnreadCount,
} from '../store/chatSlice';
import syncService from '../services/syncService';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Profile from '../api/Profile';

const PersonalChat = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { oppUserId = -1 } = route.params;
  const user = useSelector(state => state.auth.user);
  const isOnline = useSelector(state => state.chat.isOnline);
  const lastSyncTime = useSelector(state => state.chat.lastSyncTime);
  const personalChats = useSelector(
    state => state.chat?.personalChats[`${user?.id}-${oppUserId}`],
  );
  const [showLoading, setShowLoading] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chats, setChats] = useState([]);
  const [refreshLoader, setRefreshLoader] = useState(false);
  const [selectusersID, setselectusersID] = useState('');
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [userblockstatus, setuserblockstatus] = useState('');
  const [sending, setSending] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const messages = personalChats?.messages ?? [];
  const hasScrolled = useRef(false);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const chatTextRef = useRef('');
  const unreadMessages = messages.filter(
    msg => msg?.sender?.id !== user?.id && !msg?.isRead,
  );
  const unreadCount = unreadMessages.length;
  const actualIndex = unreadCount;

  useEffect(() => {
    const targetIndex = actualIndex - 1;
    if (
      messages.length > 0 &&
      actualIndex > 0 &&
      targetIndex < messages.length &&
      !hasScrolled.current
    ) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: targetIndex,
          animated: true,
          viewPosition: 0.5,
        });
        hasScrolled.current = true;
      }, 300);
    }
  }, [messages, actualIndex]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const BackButtonClick = () => {
    navigation.goBack();
  };

  const loadChats = (isRefresh = false, isSilentRefresh = false) => {
    if (!isSilentRefresh) {
      if (isRefresh) {
        setRefreshLoader(true);
      } else {
        setShowLoading(true);
      }
    }
    dispatch(
      getChatMessages(oppUserId, user?.id, status => {
        ReadCount();
        setRefreshLoader(false);
        setShowLoading(false);
      }),
    );
  };

  useEffect(() => {
    getuserprofileblockuser(false, true);
  }, []);

  const ReadCount = async () => {
    await Profile.cahtRead(oppUserId);
  };

  useEffect(() => {
    loadChats();
    const interval = setInterval(() => {
      ReadCount();
      loadChats(false, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [oppUserId, user?.id]);

  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);

  const openPopover = () => {
    setPopoverVisible(true);
  };

  const closePopover = () => {
    setPopoverVisible(false);
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
            await getuserprofileblockuser();
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
      }
    }
  };

  const getuserprofileblockuser = async (isRefresh, isSilentRefresh) => {
    if (!isSilentRefresh) {
      if (isRefresh) {
        setRefreshLoader(true);
      } else {
        setShowLoading(true);
      }
    }

    if (oppUserId !== null && oppUserId !== -1 && oppUserId !== '') {
      const retval = await Blockreport.Usercheckprofileblock(
        'block',
        oppUserId,
      );

      setRefreshLoader(false);
      setShowLoading(false);
      setTimeout(
        () => {
          setuserblockstatus(JSON.parse(retval));
        },
        Platform.OS === 'ios' ? 300 : 0,
      );
    }
  };

  const UserUnBlock = async () => {
    Alert.alert('Alert', 'Are you sure you want to unblock this user?', [
      {
        text: 'No',
        onPress: async () => { },
      },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          if (user !== null && user !== '') {
            const retval = await Blockreport.unblockkuser(
              'allgscmember',
              oppUserId,
            );

            if (retval !== null) {
              if (retval === true || retval === 'true') {
                await getuserprofileblockuser(false, true);
                setTimeout(
                  () => {
                    setSuccess(true);
                  },
                  Platform.OS === 'ios' ? 300 : 0,
                );
                setSuccessDescription('unblocked successfully');
              } else {
                setTimeout(
                  () => {
                    setSuccess(true);
                    setIserror(true);
                  },
                  Platform.OS === 'ios' ? 300 : 0,
                );
                setSuccessDescription('unblocked not successfully');
              }
            }
          }
        },
      },
    ]);
  };

  const handleSendMessage = () => {
    if (sending || showLoading) return;

    inputRef.current?.blur();
    Keyboard.dismiss();

    setTimeout(() => {
      const message = chatTextRef.current.trim();
      if (!message) return;

      chatTextRef.current = '';
      setChatText('');
      inputRef.current?.clear();
      inputRef.current?.setNativeProps({ text: '' });
      setSending(true);

      try {
        dispatch(sendMessage(oppUserId, message, user));
        loadChats(false, true);
      } catch (error) {
        Alert.alert(
          'Message Not Sent',
          isOnline
            ? 'Failed to send message. Please try again.'
            : 'You are offline. Message will be sent when you reconnect.',
          [{ text: 'OK' }],
        );
      } finally {
        setSending(false);
      }
    }, 50);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        onPressLeft={BackButtonClick}
        title={'Messages'}
        textAlign={'center'}
      />
      <Loader visible={showLoading && messages?.length == 0} />
      {!currentNetworkStatus && (
        <View style={{ marginBottom: 0, marginTop: -5 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSyncTime && !showLoading && currentNetworkStatus && (
        <View style={{ marginBottom: 0, marginTop: -5 }}>
          <SyncInfo
            lastSyncTime={lastSyncTime}
            showLoading={showLoading}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshLoader}
              onRefresh={() => {
                ReadCount();
                loadChats(true);
              }}
            />
          }
          inverted={true}
          data={messages}
          extraData={messages.length}
          onScrollToIndexFailed={info => {
            flatListRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: true,
            });
          }}
          keyExtractor={(item, index) =>
            item?.id?.toString() || `temp-${index}`
          }
          renderItem={({ item, index }) => {
            const isUserDeleted =
              Array.isArray(user?.inActiveUsers) &&
              user.inActiveUsers.some(
                id => String(id) === String(item?.sender?.id),
              );
            const isFirstUnread =
              (index)?.toString() === actualIndex?.toString() &&
              unreadCount > 0;
            return (
              <>
                {isFirstUnread && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 10,
                      paddingHorizontal: 10,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: Color.primary,
                        opacity: 0.4,
                      }}
                    />
                    <Text
                      style={{
                        marginHorizontal: 10,
                        fontSize: 12,
                        color: Color.primary,
                        fontWeight: '600',
                      }}
                    >
                      {'Last read'}
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: Color.primary,
                        opacity: 0.4,
                      }}
                    />
                  </View>
                )}
                <View style={{ marginBottom: 10 }}>
                  {item?.sender?.id === user?.id ? (
                    <Pressable
                      ref={touchableRef}
                      style={[
                        styles.chatcontainer,
                        {
                          backgroundColor: Color.tablebgblue,
                          paddingVertical: dynamicSize(8),
                          marginRight: dynamicSize(10),
                          marginLeft: dynamicSize(50),
                        },
                      ]}
                    >
                      <View style={[styles.pr10, { flex: 1 }]}>
                        <Hyperlink
                          onPress={url => {
                            !isUserDeleted && Linking.openURL(url);
                          }}
                          linkStyle={globlestyle.linkStyle}
                        >
                          <Text
                            style={[
                              styles.chattext,
                              item?.sender?.id !== user?.id
                                ? {
                                  textAlign: 'left',
                                  alignSelf: 'flex-start',
                                }
                                : {
                                  textAlign: 'left',
                                  alignSelf: 'flex-end',
                                  paddingLeft: dynamicSize(10),
                                },
                            ]}
                          >
                            {isUserDeleted
                              ? 'Member requested to delete'
                              : item?.text}
                          </Text>
                        </Hyperlink>
                        <Text style={[styles.chattime, { textAlign: 'right' }]}>
                          {item?.createdAt
                            ? moment(item?.createdAt).fromNow()
                            : ''}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          !isUserDeleted &&
                            navigation.navigate('Profile', {
                              userId: item?.sender?.id,
                            });
                        }}
                      >
                        <FastImage
                          source={
                            isUserDeleted
                              ? require('../assets/images/logo.png')
                              : {
                                uri: item?.sender?.thumbnailProfileImage,
                                cache: FastImage.cacheControl.immutable,
                              }
                          }
                          style={[styles.profileimg]}
                        />
                      </Pressable>
                    </Pressable>
                  ) : (
                    <Pressable
                      ref={touchableRef}
                      onLongPress={() => {
                        !isUserDeleted && openPopover(item?.sender?.id);
                        !isUserDeleted && setselectusersID(item?.id);
                      }}
                      style={[
                        styles.chatcontainer,
                        {
                          flexDirection: 'row-reverse',
                          justifyContent: 'flex-start',
                          paddingRight: 0,
                          backgroundColor: Color.GSCbg,
                          paddingVertical: dynamicSize(8),
                          marginRight: dynamicSize(
                            Platform.OS == 'ios' ? 10 : 50,
                          ),
                          marginLeft: dynamicSize(
                            Platform.OS == 'ios' ? 50 : 10,
                          ),
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.pr10,
                          { flex: 1, alignItems: 'flex-start' },
                        ]}
                      >
                        <Hyperlink
                          onPress={url => {
                            !isUserDeleted && Linking.openURL(url);
                          }}
                          linkStyle={globlestyle.linkStyle}
                        >
                          <Text
                            style={[
                              styles.chattext,
                              {
                                textAlign: 'left',
                                alignSelf: 'flex-start',
                              },
                            ]}
                          >
                            {isUserDeleted
                              ? 'Member requested to delete'
                              : item?.text}
                          </Text>
                        </Hyperlink>
                        <Text style={[styles.chattime, { textAlign: 'right' }]}>
                          {item?.createdAt
                            ? moment(item?.createdAt).fromNow()
                            : ''}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          !isUserDeleted &&
                            navigation.navigate('Profile', {
                              userId: item?.sender?.id,
                            });
                        }}
                      >
                        <FastImage
                          source={
                            isUserDeleted
                              ? require('../assets/images/logo.png')
                              : {
                                uri: item?.sender?.thumbnailProfileImage,
                                cache: FastImage.cacheControl.immutable,
                              }
                          }
                          style={[
                            styles.profileimg,
                            {
                              marginHorizontal: 15,
                            },
                          ]}
                        />
                      </Pressable>
                    </Pressable>
                  )}
                </View>
              </>
            );
          }}
          ListEmptyComponent={
            !showLoading && (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <StatusMessage
                  isOnline={currentNetworkStatus}
                  hasData={messages?.length > 0}
                  title={'No Message Available'}
                />
              </View>
            )
          }
        >
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
                    'chatmessage',
                    'report',
                    'Reported',
                  );
                }}
              >
                <Text style={styles.popupitemtext}>Report</Text>
              </TouchableOpacity>
            </View>
          </Popover>
        </FlatList>

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

          {userblockstatus === 'both are blocked' ||
            userblockstatus === 'i blocked you' ? (
            <>
              <TextInput
                multiline
                style={styles.coomentinput}
                value=""
                editable={false}
                placeholderTextColor={Color.cardgray}
                placeholder="You have block this user unblock to send a message"
              />
              <Pressable onPress={UserUnBlock} style={[styles.sendbtn]}>
                <FontAwesome name="unlock" size={20} color={Color.cardgray} />
              </Pressable>
            </>
          ) : userblockstatus === 'you blocked me' ? (
            <>
              <TextInput
                multiline
                style={styles.coomentinput}
                value=""
                editable={false}
                placeholderTextColor={Color.cardgray}
                placeholder="This user is set to private"
              />
              <Pressable disabled={true} style={[styles.sendbtn]}>
                <FontAwesome name="lock" size={20} color={Color.cardgray} />
              </Pressable>
            </>
          ) : (
            <>
              <TextInput
                ref={inputRef}
                multiline
                style={styles.coomentinput}
                onChangeText={text => {
                  setChatText(text);
                  chatTextRef.current = text;
                }}
                value={chatText}
                placeholderTextColor={Color.cardgray}
                placeholder="Send Message...."
                editable={!sending && !showLoading}
              />
              <Pressable
                disabled={!chatText.trim() || sending || showLoading}
                style={[
                  styles.sendbtn,
                  (!chatText.trim() || sending || showLoading) && {
                    opacity: 0.5,
                  },
                ]}
                onPress={handleSendMessage}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={Color.cardgray} />
                ) : (
                  <FontAwesome name="send" size={20} color={Color.cardgray} />
                )}
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
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
    </SafeAreaView>
  );
};

export default PersonalChat;
