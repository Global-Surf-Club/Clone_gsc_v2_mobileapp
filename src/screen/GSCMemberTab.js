//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Profile from '../api/Profile';
import { Color, fontFamily, Shadow, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';
import Popover from 'react-native-popover-view';
import Blockreport from '../api/Blockreport';
import SuccessModal from '../components/SuccessModal';
import { ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { getSearchUserDataPagination, VouchUser } from '../store/authSlice';
import { getConversions } from '../store/profileSlice';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';
import StatusMessage from '../components/StatusMessage';
import SyncInfo from '../components/SyncStatus';
import FastImage from 'react-native-fast-image';

let firstLoad = true;
let pageNo = 1;
let isFetching = false;
let isDataLoaded = false;

let pageNoChat = 1;
let isFetchingChat = false;
let isDataLoadedChat = false;

export const AllGSCMember = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const users = useSelector(state => state?.auth?.searchedUsers);
  const lastSyncTime = useSelector(state => state.auth.lastSyncTime);
  const [searchQuery, setSearchQuery] = useState('');
  const onChangeSearch = query => setSearchQuery(query);
  const [showLoading, SetshowLoading] = useState(false);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [iserror, setIsError] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [selectusersID, setSelectUsersID] = useState('');
  const [userblockOrUnblock, setuserblockOrUnblock] = useState(false);
  const [bottomLoader, setBottomLoader] = useState(false);
  const touchableRef = useRef();
  const [anchorRect, setAnchorRect] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        getUsers(true);
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const openPopover = () => {
    setPopoverVisible(true);
  };
  const closePopover = () => {
    setPopoverVisible(false);
  };

  useEffect(() => {
    getUsers(true);
  }, [searchQuery]);

  const getUsers = (isRefresh, isBottom) => {
    if (isBottom) {
      setBottomLoader(true);
    } else if (isRefresh) {
      isDataLoaded = false;
      pageNo = 1;
      if (firstLoad) {
        firstLoad = false;
        SetshowLoading(true);
      }
    }
    isFetching = true;

    dispatch(
      getSearchUserDataPagination(searchQuery, pageNo, (status, isEnded) => {
        SetshowLoading(false);
        setBottomLoader(false);
        setRefreshing(false);
        isFetching = false;
        if (isEnded && status) {
          isDataLoaded = true;
        }
      }),
    );
  };

  const vouchUser = async (id, name = '') => {
    try {
      SetshowLoading(true);
      const param = {
        vouchUserId: id,
      };

      const data = await Profile.vouchUser(param);
      dispatch(VouchUser(id));

      alert('Successfully sent email to ' + name);
    } catch (error) {
      if (error?.toString()?.toLocaleLowerCase()?.trim() != 'network error') {
        alert(error?.toString());
      }
    }
    SetshowLoading(false);
  };

  const blockreport = async (targetId, targetType, recordType, userMessage) => {
    if (user !== null && user !== '') {
      if (targetId !== null && targetId !== '' && targetId !== undefined) {
        let check = false;
        if (check === false || check === 'false') {
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
              setSelectUsersID('');
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
                  setIsError(true);
                },
                Platform.OS === 'ios' ? 300 : 0,
              );
            }
          }
        } else {
          if (check === true || check === 'true') {
            Alert.alert(
              'Alert',
              'User is already blocked. Are you want to un' + userMessage + '?',
              [
                {
                  text: 'No',
                  onPress: async () => {
                    setSelectUsersID('');
                    closePopover();
                  },
                },
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: async () => {
                    let response = await Blockreport.unblockkuser(
                      targetType,
                      targetId,
                    );

                    if (response !== null) {
                      if (response === true || response === 'true') {
                        let usermessagenew = 'unblocked successfully';
                        setSuccessDescription(usermessagenew);
                        setTimeout(
                          () => {
                            setSuccess(true);
                          },
                          Platform.OS === 'ios' ? 300 : 0,
                        );
                        setSelectUsersID('');
                        closePopover();
                      } else {
                        let usermessagenew = 'unblcoked not successfully';
                        setSuccessDescription(usermessagenew);
                        setTimeout(
                          () => {
                            setSuccess(true);
                            setIsError(true);
                          },
                          Platform.OS === 'ios' ? 300 : 0,
                        );
                      }
                    }
                  },
                },
              ],
            );
          } else {
            Alert.alert(check);
          }
        }
      } else {
        Alert.alert('Targetid null AllGSCMember Chat Pag');
      }
    }
  };

  const Unblockuser = async (targetId, targetType) => {
    closePopover();
    Alert.alert('Alert', 'Are you sure you want to unblock this user?', [
      {
        text: 'No',
        onPress: async () => {},
      },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          if (targetId !== null && targetId !== '' && targetId !== undefined) {
            const retval = await Blockreport.unblockkuser(targetType, targetId);

            setSuccessDescription('unblocked successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
            setSelectUsersID('');
          }
        },
      },
    ]);
  };

  const usercheckblockornot = async userid => {
    let check = await Blockreport.checkblockuser('allgscmember', userid);

    setuserblockOrUnblock(check);
  };

  return (
    <>
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -10, marginTop: 5 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSyncTime && !showLoading && currentNetworkStatus && (
        <View style={{ marginBottom: -15 }}>
          <SyncInfo
            lastSyncTime={lastSyncTime}
            showLoading={showLoading}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}
      <View style={styles.searchcontainer}>
        <Searchbar
          placeholder=""
          selectionColor={Color.gray}
          onChangeText={onChangeSearch}
          value={searchQuery}
          inputStyle={styles.inputStyle}
          style={styles.searchbar}
        />
      </View>
      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIsError(false);
          setSuccessDescription('');
          setSelectUsersID('');
          closePopover();
        }}
        description={successdescription}
        iserror={iserror}
      />
      <Loader visible={showLoading || (users?.length === 0 && refreshing)} />
      {users?.length > 0 ? (
        <FlashList
          data={users}
          keyExtractor={(item, i) => item?.id?.toString() || i.toString()}
          renderItem={({ item, index }) => {
            const isUserDeleted =
              Array.isArray(user?.inActiveUsers) &&
              user.inActiveUsers.some(id => String(id) === String(item.id));
            return (
              <Pressable
                onLongPress={e => {
                  if (item.id !== user.id) {
                    !isUserDeleted && setAnchorRect(e.nativeEvent.target);
                    !isUserDeleted && usercheckblockornot(item.id);
                    !isUserDeleted && setSelectUsersID(item.id);
                    !isUserDeleted && openPopover(item.id);
                  }
                }}
                onPress={() => {
                  if (item?.id !== user?.id) {
                    !isUserDeleted &&
                      navigation.navigate('PersonalChat', {
                        oppUserId: item?.id,
                      });
                  }
                }}
                style={({ pressed }) => [
                  styles.row,
                  styles.mt2,
                  {
                    backgroundColor: pressed
                      ? 'rgba(31, 189, 207, 0.1)'
                      : 'white',
                  },
                ]}
              >
                <View style={styles.profileimgcontainer}>
                  <Pressable
                    onPress={() => {
                      !isUserDeleted &&
                        navigation.navigate('Profile', { userId: item?.id });
                    }}
                  >
                    <FastImage
                      source={
                        isUserDeleted
                          ? require('../assets/images/logo.png')
                          : {
                              uri: item?.thumbnailProfileImage,
                              cache: FastImage.cacheControl.immutable,
                            }
                      }
                      style={styles.profileimg}
                    />
                  </Pressable>
                </View>
                <View style={styles.profiletextcontainer}>
                  <Text style={styles.sendRequest}>
                    {isUserDeleted
                      ? 'Deletion Requested'
                      : item?.firstName + ' ' + item?.lastName}
                  </Text>
                  {!isUserDeleted && (
                    <Text style={styles.sendRequestDate}>
                      {getUserInfoText(item)}
                    </Text>
                  )}
                </View>
                {!item?.isFullAccess && !isUserDeleted && (
                  <Pressable
                    disabled={item?.isVouch}
                    onPress={() => {
                      Alert.alert(
                        'Alert',
                        'Are you sure you want to vouch for this user?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Yes',
                            style: 'default',
                            onPress: () =>
                              vouchUser(
                                item?.id,
                                item?.firstName + ' ' + item?.lastName,
                              ),
                          },
                        ],
                      );
                    }}
                    style={{
                      height: dynamicSize(25),
                      width: dynamicSize(70),
                      backgroundColor: item?.isVouch
                        ? Color.green
                        : Color.lightblue,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: dynamicSize(50),
                    }}
                  >
                    <Text style={[styles.vouch]}>
                      {item?.isVouch ? 'Vouched' : 'Vouch'}
                    </Text>
                  </Pressable>
                )}
              </Pressable>
            );
          }}
          ListFooterComponent={
            bottomLoader ? (
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
            ) : null
          }
          contentContainerStyle={{ paddingBottom: getBottomSpace() }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            getUsers(true);
          }}
          onEndReached={() => {
            if (!isFetching && !isDataLoaded) {
              pageNo += 1;
              getUsers(false, true);
            }
          }}
          onEndReachedThreshold={0.01} // Triggers when the user is close to the bottom
          estimatedItemSize={100} // Estimated size of each item (required for FlashList performance optimization)
        />
      ) : (
        !showLoading && (
          <View style={styles.emptyContainer}>
            <StatusMessage
              isOnline={currentNetworkStatus}
              hasData={users?.length > 0}
              title={'No User Available'}
            />
          </View>
        )
      )}
      <Popover
        isVisible={popoverVisible}
        popoverStyle={styles.content}
        from={anchorRect}
        onRequestClose={() => setPopoverVisible(false)}
      >
        <View style={styles.popupcontainer}>
          <TouchableOpacity
            style={styles.popupitem}
            onPress={e => {
              blockreport(selectusersID, 'allgscmember', 'report', 'Reported');
            }}
          >
            <Text style={styles.popupitemtext}>Report</Text>
          </TouchableOpacity>
          {userblockOrUnblock === true || userblockOrUnblock === 'true' ? (
            <TouchableOpacity
              style={styles.popupitem}
              onPress={e => {
                Unblockuser(selectusersID, 'allgscmember');
              }}
            >
              <Text style={styles.popupitemtext}>Unblock</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.popupitem}
              onPress={e => {
                blockreport(selectusersID, 'allgscmember', 'block', 'Blocked');
              }}
            >
              <Text style={styles.popupitemtext}>Block</Text>
            </TouchableOpacity>
          )}
          {userblockOrUnblock === false || userblockOrUnblock === 'false' ? (
            <TouchableOpacity
              style={styles.popupitem}
              onPress={e => {
                blockreport(
                  selectusersID,
                  'allgscmember',
                  'blockreport',
                  'Blocked & Reported',
                );
              }}
            >
              <Text style={styles.popupitemtext}>Block & Report</Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
          {/* <TouchableOpacity
            style={styles.popupitem}
            onPress={e => {
              blockreport(selectusersID, 'allgscmember', 'block', 'Blocked');
            }}>
            <Text style={styles.popupitemtext}>Block</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.popupitem}
            onPress={e => {
              blockreport(
                selectusersID,
                'allgscmember',
                'blockreport',
                'Blocked & Reported',
              );
            }}>
            <Text style={styles.popupitemtext}>Block & Report</Text>
          </TouchableOpacity> */}
        </View>
      </Popover>
    </>
  );
};
//make this component available to the app
export const ChatMember = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const conversionList = useSelector(state => state.profile.chatConversiona);
  const lastSyncTime = useSelector(state => state.profile.lastSyncTime);
  const [selectusersID, setselectusersID] = useState('');
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [userblockOrUnblock, setuserblockOrUnblock] = useState(false);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  console.log('conversionList===>', conversionList);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        GetConversions(true);
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const openPopover = () => {
    setPopoverVisible(true);
  };
  const closePopover = () => {
    setPopoverVisible(false);
  };

  useEffect(() => {
    GetConversions(true);
    const unsubscribe = navigation.addListener('focus', () => {
      GetConversions(true);
    });
    return unsubscribe;
  }, []);

  const GetConversions = (isRefresh, isBottom) => {
    if (isBottom) {
      setBottomLodaer(true);
    } else if (isRefresh) {
      isDataLoadedChat = false;
      pageNoChat = 1;
      setRefreshing(true);
    }
    isFetchingChat = true;

    dispatch(
      getConversions(user?.id, pageNoChat, (status, isEnded) => {
        setRefreshing(false);
        setBottomLodaer(false);
        isFetchingChat = false;
        if (isEnded && status) {
          isDataLoadedChat = true;
        }
      }),
    );
  };

  const blockreport = async (targetId, targetType, recordType, userMessage) => {
    if (user !== null && user !== '') {
      if (targetId !== null && targetId !== '' && targetId !== undefined) {
        let checkchat = false;

        if (checkchat === false || checkchat === 'false') {
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
          if (checkchat === true || checkchat === 'true') {
            Alert.alert(
              'Alert',
              'User is already blocked. Are you want to un' + userMessage + '?',
              [
                {
                  text: 'No',
                  onPress: async () => {
                    setselectusersID('');
                    closePopover();
                  },
                },
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: async () => {
                    let response = await Blockreport.unblockkuser(
                      targetType,
                      targetId,
                    );

                    if (response !== null) {
                      if (response === true || response === 'true') {
                        let usermessagenew = 'unblock successfully';
                        setSuccessDescription(usermessagenew);
                        setTimeout(
                          () => {
                            setSuccess(true);
                          },
                          Platform.OS === 'ios' ? 300 : 0,
                        );
                        setselectusersID('');
                        closePopover();
                      } else {
                        let usermessagenew = 'unblock not successfully';
                        setSuccessDescription(usermessagenew);
                        setTimeout(
                          () => {
                            setSuccess(true);
                            setIserror(true);
                          },
                          Platform.OS === 'ios' ? 300 : 0,
                        );
                      }
                    }
                  },
                },
              ],
            );
          } else {
            Alert.alert(checkchat);
          }
        }
      } else {
        Alert.alert('Targetid null AllGSCMember Chat Pag');
      }
    }
  };

  const Unblockuser = async (targetId, targetType) => {
    closePopover();
    Alert.alert('Alert', 'Are you sure you want to unblock this user?', [
      {
        text: 'No',
        onPress: async () => {},
      },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          if (targetId !== null && targetId !== '' && targetId !== undefined) {
            const retval = await Blockreport.unblockkuser(targetType, targetId);

            setSuccessDescription('unblocked successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
            setselectusersID('');
          }
        },
      },
    ]);
    // if (targetId !== null && targetId !== '' && targetId !== undefined) {
    //   const retval = await Blockreport.unblockkuser(targetType, targetId);
    //
    //   setSuccessDescription('Unblocked successfully');
    //   setTimeout(
    //     () => {
    //       setSuccess(true);
    //     },
    //     Platform.OS === 'ios' ? 300 : 0,
    //   );
    //   setselectusersID('');
    //   closePopover();
    // }
  };

  const usercheckblockornot = async userid => {
    let check = await Blockreport.checkblockuser('allgscmember', userid);

    setuserblockOrUnblock(check);
  };

  return (
    <>
      <Loader visible={conversionList?.length === 0 && refreshing} />
      {!currentNetworkStatus && (
        <View>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSyncTime && !refreshing && currentNetworkStatus && (
        <View>
          <SyncInfo
            lastSyncTime={lastSyncTime}
            showLoading={refreshing}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}
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
      {conversionList?.length > 0 ? (
        <FlashList
          data={conversionList}
          keyExtractor={item => item?.id.toString()}
          renderItem={({ item: chat, index: i }) => {
            const isUserDeleted =
              Array.isArray(user?.inActiveUsers) &&
              user.inActiveUsers.some(id => String(id) === String(chat.id));

            return chat.id === user.id ? (
              <Pressable
                onPress={() => {
                  if (chat?.id !== user?.id) {
                    !isUserDeleted &&
                      navigation.navigate('PersonalChat', {
                        oppUserId: chat?.id,
                      });
                  }
                }}
                key={i}
                style={({ pressed }) => [
                  styles.row,
                  styles.mt2,
                  {
                    backgroundColor: pressed
                      ? 'rgba(31, 189, 207, 0.1)'
                      : 'white',
                    justifyContent: 'space-between',
                  },
                ]}
              >
                <View style={styles.row1}>
                  <View style={styles.profileimgcontainer}>
                    <Pressable
                      onPress={() => {
                        !isUserDeleted &&
                          navigation.navigate('Profile', { userId: chat?.id });
                      }}
                    >
                      <FastImage
                        source={
                          isUserDeleted
                            ? require('../assets/images/logo.png')
                            : {
                                uri: chat?.thumbnailProfileImage,
                                cache: FastImage.cacheControl.immutable,
                              }
                        }
                        style={styles.profileimg}
                      />
                    </Pressable>
                  </View>
                  <View style={styles.profiletextcontainer}>
                    <Text style={styles.sendRequest}>
                      {isUserDeleted
                        ? 'Deletion Requested'
                        : chat?.firstName + ' ' + chat?.lastName}
                    </Text>
                    {!isUserDeleted && (
                      <Text style={styles.sendRequestDate}>
                        {getUserInfoText(chat)}
                      </Text>
                    )}
                    <Text style={styles.sendRequestDate} numberOfLines={3}>
                      {isUserDeleted
                        ? 'Member requested to delete'
                        : chat?.lastMessage}
                    </Text>
                  </View>
                </View>
                {chat?.unReadCount > 0 && (
                  <View
                    style={{
                      height: 20,
                      width: 20,
                      borderRadius: 10,
                      backgroundColor: Color.red,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamily.ProximaR,
                        fontSize: 12,
                        color: Color.white,
                      }}
                    >
                      {chat?.unReadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            ) : (
              <Pressable
                onLongPress={e => {
                  !isUserDeleted && setAnchorRect(e.nativeEvent.target);
                  !isUserDeleted && openPopover(chat?.id);
                  !isUserDeleted && usercheckblockornot(chat.id);
                  !isUserDeleted && setselectusersID(chat.id);
                }}
                onPress={() => {
                  if (chat?.id !== user?.id) {
                    !isUserDeleted &&
                      navigation.navigate('PersonalChat', {
                        oppUserId: chat?.id,
                      });
                  }
                }}
                key={i}
                style={({ pressed }) => [
                  styles.row,
                  styles.mt2,
                  {
                    marginTop:
                      (lastSyncTime || currentNetworkStatus) && i == 0 ? 0 : 10,
                    backgroundColor: pressed
                      ? 'rgba(31, 189, 207, 0.1)'
                      : 'white',
                    justifyContent: 'space-between',
                  },
                ]}
              >
                <View style={styles.row1}>
                  <View style={styles.profileimgcontainer}>
                    <Pressable
                      onPress={() => {
                        !isUserDeleted &&
                          navigation.navigate('Profile', { userId: chat?.id });
                      }}
                    >
                      <FastImage
                        source={
                          isUserDeleted
                            ? require('../assets/images/logo.png')
                            : {
                                uri: chat?.thumbnailProfileImage,
                                cache: FastImage.cacheControl.immutable,
                              }
                        }
                        style={styles.profileimg}
                      />
                    </Pressable>
                  </View>
                  <View style={styles.profiletextcontainer}>
                    <Text style={styles.sendRequest}>
                      {isUserDeleted
                        ? 'Deletion Requested'
                        : chat?.firstName + ' ' + chat?.lastName}
                    </Text>
                    {!isUserDeleted && (
                      <Text style={styles.sendRequestDate}>
                        {getUserInfoText(chat)}
                      </Text>
                    )}
                    <Text style={styles.sendRequestDate} numberOfLines={3}>
                      {isUserDeleted
                        ? 'Member requested to delete'
                        : chat?.lastMessage}
                    </Text>
                  </View>
                </View>

                {chat?.unReadCount > 0 && (
                  <View
                    style={{
                      height: 20,
                      width: 20,
                      borderRadius: 10,
                      backgroundColor: Color.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamily.ProximaR,
                        fontSize: 12,
                        color: Color.white,
                      }}
                    >
                      {chat?.unReadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }}
          refreshing={refreshing && conversionList?.length == 0}
          onRefresh={() => {
            GetConversions(true);
          }}
          ListFooterComponent={() => {
            if (bottomLodaer) {
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
          contentContainerStyle={{
            ...styles.viewContainer,
            paddingBottom: dynamicSize(10) + getBottomSpace(),
          }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (!isFetchingChat && !isDataLoadedChat) {
              pageNoChat += 1;
              GetConversions(false, true);
            }
          }}
          onEndReachedThreshold={0.01} // Triggers when the user is close to the bottom
          estimatedItemSize={100}
        />
      ) : (
        !refreshing && (
          <View style={styles.emptyContainer}>
            <StatusMessage
              isOnline={currentNetworkStatus}
              hasData={conversionList?.length > 0}
              title={'No User Available'}
            />
          </View>
        )
      )}
      <Popover
        isVisible={popoverVisible}
        popoverStyle={styles.content}
        from={anchorRect}
        onRequestClose={() => setPopoverVisible(false)}
      >
        <View style={styles.popupcontainer}>
          <TouchableOpacity
            style={styles.popupitem}
            onPress={e => {
              blockreport(selectusersID, 'allgscmember', 'report', 'Reported');
            }}
          >
            <Text style={styles.popupitemtext}>Report</Text>
          </TouchableOpacity>
          {userblockOrUnblock === true || userblockOrUnblock === 'true' ? (
            <TouchableOpacity
              style={styles.popupitem}
              onPress={e => {
                Unblockuser(selectusersID, 'allgscmember');
              }}
            >
              <Text style={styles.popupitemtext}>Unblock</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.popupitem}
              onPress={e => {
                blockreport(selectusersID, 'allgscmember', 'block', 'Blocked');
              }}
            >
              <Text style={styles.popupitemtext}>Block</Text>
            </TouchableOpacity>
          )}
          {userblockOrUnblock === false || userblockOrUnblock === 'false' ? (
            <TouchableOpacity
              style={styles.popupitem}
              onPress={e => {
                blockreport(
                  selectusersID,
                  'allgscmember',
                  'blockreport',
                  'Blocked & Reported',
                );
              }}
            >
              <Text style={styles.popupitemtext}>Block & Report</Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
      </Popover>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    lineHeight: getLineSize(16),
    // color: Color.cardgray,
    color: Color.black0,
    textAlign: 'center',
  },
  popupitem: {
    paddingVertical: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: Color.cardbg,
  },
  popupcontainer: {},
  mt2: {
    marginTop: 10,
  },
  searchbar: {
    borderRadius: 10,
    // height: dynamicSize(40),
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  inputStyle: {
    paddingVertical: 0,
  },
  searchcontainer: {
    paddingHorizontal: dynamicSize(8),
    borderBottomColor: Color.cardbg,
    borderBottomWidth: 1,
    borderTopColor: Color.cardbg,
    // borderTopWidth: 1,
    paddingVertical: dynamicSize(8),
    marginTop: dynamicSize(8),
  },
  viewContainer: {
    paddingHorizontal: dynamicSize(15),
    paddingVertical: dynamicSize(10),
  },
  sendRequest: {
    color: Color.black,
    ...text.usernameboldtitle,
  },
  sendRequestDate: {
    ...text.usernamestatus,
    color: Color.black0,
  },
  vouch: {
    color: Color.white,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
  },
  profiletextcontainer: {
    // width: '75%',
    flex: 1,
  },
  profileimgcontainer: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: Color.cardbg,
    borderRadius: 100,
    overflow: 'hidden',
  },
  profileimg: {
    width: dynamicSize(95),
    height: dynamicSize(95),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    borderBottomColor: Color.cardbg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },

  row1: {
    flexDirection: 'row',
  },
});
