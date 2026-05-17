//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'react-native';
import { Color, fontFamily, Shadow, text } from '../constants/Constants';
import SuccessModal from '../components/SuccessModal';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../constants/Loader';
import CustomFlatList from '../components/CustomFlatList';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import {
  acceptClubInvitation,
  fetchAllClubs,
  fetchAllClubsSpeed,
  fetchMyClubs,
  fetchMyClubsSpeed,
  joinClub,
  rejectClubInvitation,
} from '../store/clubSlice';
import ConnectionBanner from '../components/ConnectionBanner';
import StatusMessage from '../components/StatusMessage';
import SyncInfo from '../components/SyncStatus';
import FastImage from 'react-native-fast-image';

let pageNo = 1;
let isFetching = false;
let isDataLoaded = false;

let pageNoOrganiser = 1;
let isFetchingOrganiser = false;
let isDataLoadedOrganiser = false;

export const AllTab = props => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const allClubsFromStore = useSelector(state => state.club.allClubs || []);
  const loadingFromStore = useSelector(state => state.club.loading);
  const isOffline = useSelector(state => state.club.isOffline);
  const lastSync = useSelector(state => state.club.lastSync);
  const user = useSelector(state => state.auth.user);
  const [success, setSuccess] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [ClubsItemList, setClubsItemList] = useState([]);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  useEffect(() => {
    if (allClubsFromStore && Array.isArray(allClubsFromStore)) {
      setClubsItemList(allClubsFromStore);
    }
  }, [allClubsFromStore]);

  useEffect(() => {
    if (props?.ListIndex === -1) {
      alert('The club is expired');
      GetallClub(true);
    } else if (props?.ListIndex == 'ForHome') {
      GetallClub(true);
    } else if (
      props?.ListIndex !== 'NoIndex' &&
      props?.ListIndex !== 'ForHome'
    ) {
      handleScrollToIndex();
    } else {
      GetallClub(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        GetallClub(true);
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const handleScrollToIndex = () => {
    if (parseInt(props?.ListIndex) > 10) {
      let modules = parseInt(props?.ListIndex) % 10;
      if (modules == 0) {
        pageNo = parseInt(parseInt(props?.ListIndex) / 10);
      } else {
        pageNo = parseInt(parseInt(props?.ListIndex) / 10) + 1;
      }
      setScrollIndex(9);
      GetallClub(false, false, true);
    } else {
      pageNo = 1;
      setScrollIndex(
        parseInt(props?.ListIndex) > 0 ? parseInt(props?.ListIndex) - 1 : 0,
      );
      GetallClub(false, false, true);
    }
  };

  const GetallClub = async () => {
    try {
      isFetching = true;

      dispatch(
        fetchAllClubsSpeed(successFlag => {
          isFetching = false;
          setBottomLodaer(false);
          isDataLoaded = true;
        }),
      );
    } catch (error) {
      isFetching = false;
      setBottomLodaer(false);
    }
  };

  const ClubJoin = async clubId => {
    dispatch(
      joinClub(clubId, (successFlag, message) => {
        if (successFlag) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription(message);
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      }),
    );
  };

  const ClubReject = async clubId => {
    dispatch(
      rejectClubInvitation(clubId, user.id, (successFlag, message) => {
        if (successFlag) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription(message);
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      }),
    );
  };

  const ClubAccept = async clubId => {
    dispatch(
      acceptClubInvitation(clubId, user.id, (successFlag, message) => {
        if (successFlag) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription(message);
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      }),
    );
  };

  const getItemLayout = (data, index) => ({
    length: 200,
    offset: 200 * index,
    index,
  });

  const [heightlightColor, setheightlightColor] = useState(Color.lightblue);
  useEffect(() => {
    setheightlightColor(Color.lightblue);
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 15000);
  }, [props]);

  return (
    <View style={{ flex: 1 }}>
      {!currentNetworkStatus && (
        <View style={{ marginTop: 5 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSync && !loadingFromStore && currentNetworkStatus && (
        <View style={{ marginTop: 5 }}>
          <SyncInfo
            lastSyncTime={lastSync}
            showLoading={loadingFromStore}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}

      <Loader visible={ClubsItemList?.length === 0 && loadingFromStore} />
      {ClubsItemList?.length > 0 ? (
        <CustomFlatList
          horizontal={false}
          data={ClubsItemList}
          onRefresh={() => {
            GetallClub(true);
            dispatch(fetchMyClubsSpeed());
          }}
          refreshing={loadingFromStore}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          initialScrollIndex={scrollIndex}
          contentContainerStyle={{
            paddingTop: !currentNetworkStatus || lastSync ? 0 : 10,
            paddingBottom: 30 + getBottomSpace(),
          }}
          onEndReached={() => {
            if (!isFetching && !isDataLoaded) {
              pageNo += 1;
              GetallClub(false, true);
            }
          }}
          onEndReachedThreshold={0.5}
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
          renderItem={({ item, index }) => {
            const isUserDeleted =
              Array.isArray(user?.inActiveUsers) &&
              user.inActiveUsers.some(
                id => String(id) === String(item?.organizerId),
              );
            return (
              // isUserDeleted ? (
              //   <View
              //     style={[
              //       styles.cardView,
              //       {
              //         borderColor:
              //           props?.ClubID === item?.id
              //             ? heightlightColor
              //             : Color?.white,
              //         borderWidth: 2,
              //         paddingVertical: 10,
              //       },
              //     ]}
              //   >
              //     <Text> Member requested to delete</Text>
              //   </View>
              // ) : (
              <Pressable
                style={[
                  styles.cardView,
                  {
                    borderColor:
                      props?.ClubID === item?.id
                        ? heightlightColor
                        : Color?.white,
                    borderWidth: 2,
                  },
                ]}
                key={index}
              >
                <View style={styles.row}>
                  <View
                    style={[
                      styles.clubimgcontainer,
                      { paddingTop: dynamicSize(10) },
                    ]}
                  >
                    {item.thumbnailLogoPath && !isUserDeleted ? (
                      <FastImage
                        source={{
                          uri: item.thumbnailLogoPath ?? '',
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.clubprofileimg}
                      />
                    ) : (
                      <FastImage
                        source={require('../assets/images/logo.png')}
                        style={[styles.clubprofileimg, { opacity: 0.5 }]}
                      />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View>
                      <Text style={styles.clubicontext}>{isUserDeleted ? 'Inactive Club' : item?.title}</Text>
                      {!isUserDeleted &&
                        <Text style={styles.status}>
                          {(item?.city ?? item?.state
                            ? (item?.city ?? item?.state) + ', '
                            : '') + (item?.country ?? '')}
                        </Text>
                      }
                      {item.triptext ? (
                        <Text style={styles.clubsubtext}>{item.triptext}</Text>
                      ) : (
                        <></>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.rightbox}>
                    <View style={styles.rowcontainer}>
                      <Text style={styles.datalable}>
                        Trips{' '}
                        <Text style={styles.dataitem}>{item?.tripCount}</Text>
                      </Text>
                    </View>
                    <View style={styles.rowcontainer}>
                      <Text style={styles.datalable}>
                        Reports{' '}
                        <Text style={styles.dataitem}>
                          {item?.tripReportsCount}
                        </Text>{' '}
                      </Text>
                    </View>
                    <View style={styles.rowcontainer}>
                      <Text style={styles.datalable}>
                        Members{' '}
                        <Text style={styles.dataitem}>
                          {' '}
                          {item?.membersCount}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.buttoncontainer}>
                      {item.status === 'Pending' ? (
                        <Pressable
                          onPress={() => { }}
                          style={[
                            styles.readbtn,
                            {
                              backgroundColor: Color.white,
                              borderWidth: 1,
                              borderColor: Color.lightblue,
                              paddingHorizontal: dynamicSize(20),
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.readtext,
                              { color: Color.lightblue },
                            ]}
                          >
                            Requested
                          </Text>
                        </Pressable>
                      ) : item.status === 'InvitationSent' ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Pressable
                            onPress={() => ClubAccept(item.id)}
                            style={[
                              styles.readbtn,
                              {
                                backgroundColor: Color.lightblue,
                                borderWidth: 1,
                                borderColor: Color.lightblue,
                                marginRight: 5,
                              },
                            ]}
                          >
                            <Text
                              style={[styles.readtext, { color: Color.white }]}
                            >
                              Approve
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => ClubReject(item.id)}
                            style={[
                              styles.readbtn,
                              {
                                backgroundColor: Color.white,
                                borderWidth: 1,
                                borderColor: Color.lightblue,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.readtext,
                                { color: Color.lightblue },
                              ]}
                            >
                              Decline
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => ClubJoin(item.id)}
                          style={[
                            styles.readbtn,
                            {
                              backgroundColor: Color.lightblue,
                              paddingHorizontal: 30,
                            },
                          ]}
                          disabled={isUserDeleted}
                        >
                          <Text style={styles.readtext}>Join</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : (
        !loadingFromStore && (
          <View style={styles.emptyContainer}>
            <StatusMessage
              isOnline={currentNetworkStatus}
              hasData={ClubsItemList?.length > 0}
              title={'No Clubs Available'}
            />
          </View>
        )
      )}

      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
        }}
        description={successdescription}
      />
    </View>
  );
};

export const MyOrganiser = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const myClubsFromStore = useSelector(state => state.club.myClubs || []);
  const loadingFromStore = useSelector(state => state.club.loading);
  const isOffline = useSelector(state => state.club.isOffline);
  const lastSync = useSelector(state => state.club.lastSync);
  const [ClubsItemList, setClubsItemList] = useState([]);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  useEffect(() => {
    if (myClubsFromStore && Array.isArray(myClubsFromStore)) {
      setClubsItemList(myClubsFromStore);
    }
  }, [myClubsFromStore]);

  useEffect(() => {
    // GetallMyClub(true);
    const unsubscribe = navigation.addListener('focus', () => {
      pageNoOrganiser = 1;
      GetallMyClub(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        GetallMyClub(true);
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const GetallMyClub = async () => {
    try {
      isFetchingOrganiser = true;

      dispatch(
        fetchMyClubsSpeed(successFlag => {
          isFetchingOrganiser = false;
          setBottomLodaer(false);
          isDataLoadedOrganiser = true;
        }),
      );
    } catch (error) {
      isFetchingOrganiser = false;
      setBottomLodaer(false);
    }
  };

  const GotoClubProfile = clubid => {
    if (clubid) {
      navigation.navigate('ClubProfile', { clubid, Selection: 1 });
    }
  };
  const onfriend = i => {
    let data = [...ClubsItemList];
    let Datainfo = data[i];
    if (Datainfo != null && Datainfo != join && Datainfo != '') {
      Datainfo.isselect = false;
      data[i] = Datainfo;
    }
    setClubsItemList(data);
  };

  return (
    <View style={styles.viewContainer}>
      {!currentNetworkStatus && (
        <View style={{ marginTop: 5 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSync && !loadingFromStore && currentNetworkStatus && (
        <View style={{ marginTop: 5 }}>
          <SyncInfo
            lastSyncTime={lastSync}
            showLoading={loadingFromStore}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}

      <Loader visible={ClubsItemList?.length === 0 && loadingFromStore} />
      {ClubsItemList?.length > 0 ? (
        <CustomFlatList
          horizontal={false}
          data={ClubsItemList}
          onRefresh={() => {
            GetallMyClub(true);
            dispatch(fetchAllClubsSpeed());
          }}
          refreshing={loadingFromStore}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: !currentNetworkStatus || lastSync ? 0 : 10,
            paddingBottom: 70 + getBottomSpace(),
          }}
          onEndReached={() => {
            if (!isFetchingOrganiser && !isDataLoadedOrganiser) {
              pageNoOrganiser += 1;
              GetallMyClub(false, true);
            }
          }}
          onEndReachedThreshold={0.5}
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
          renderItem={({ item, index }) => {
            const isUserDeleted =
              Array.isArray(user?.inActiveUsers) &&
              user.inActiveUsers.some(
                id => String(id) === String(item?.organizerId),
              );
            return (
              //    isUserDeleted ? (
              //   <View
              //     style={[
              //       styles.cardView,
              //       {
              //         marginTop: dynamicSize(10),
              //         paddingVertical: 10,
              //       },
              //     ]}
              //   >
              //     <Text> Member requested to delete</Text>
              //   </View>
              // ) : (
              <Pressable
                onPress={e => {
                  GotoClubProfile(item?.id);
                }}
                style={[
                  styles.cardView,
                  {
                    marginTop: dynamicSize(10),
                  },
                ]}
                key={index}
              >
                <View style={styles.row}>
                  <View
                    style={[
                      styles.clubimgcontainer,
                      { paddingTop: dynamicSize(10) },
                    ]}
                  >
                    {item.thumbnailLogoPath && !isUserDeleted ? (
                      <FastImage
                        source={{
                          uri: item.thumbnailLogoPath ?? '',
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.clubprofileimg}
                      />
                    ) : (
                      <FastImage
                        source={require('../assets/images/logo.png')}
                        style={[styles.clubprofileimg, { opacity: 0.5 }]}
                      />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View>
                      <Text style={styles.clubicontext}>{isUserDeleted ? 'Inactive Club' : item?.title}</Text>
                      {!isUserDeleted &&
                        <Text style={styles.status}>
                          {(item?.city ?? item?.state
                            ? (item?.city ?? item?.state) + ', '
                            : '') + (item?.country ?? '')}
                        </Text>
                      }
                      {item.triptext ? (
                        <Text style={styles.clubsubtext}>{item.triptext}</Text>
                      ) : (
                        <></>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.rightbox}>
                    <View style={styles.rowcontainer}>
                      <Text style={styles.datalable}>
                        Trips{' '}
                        <Text style={styles.dataitem}>{item?.tripCount}</Text>
                      </Text>
                    </View>
                    <View style={styles.rowcontainer}>
                      <Text style={styles.datalable}>
                        Reports{' '}
                        <Text style={styles.dataitem}>
                          {item?.tripReportsCount}
                        </Text>{' '}
                      </Text>
                    </View>
                    <View style={styles.rowcontainer}>
                      <Text style={styles.datalable}>
                        Members{' '}
                        <Text style={styles.dataitem}>
                          {' '}
                          {item?.membersCount}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.buttoncontainer}>
                      {user.id === item?.organizerId ? (
                        <>
                          {item.active === false ? (
                            <>
                              <Pressable
                                onPress={() => onfriend(i)}
                                style={[
                                  styles.readbtn,
                                  { backgroundColor: Color.lightGray },
                                ]}
                              >
                                <Text style={styles.readtext}>Pending</Text>
                              </Pressable>
                            </>
                          ) : (
                            <Pressable
                              style={[
                                styles.readbtn,
                                {
                                  backgroundColor: Color.white,
                                  borderWidth: 1,
                                  borderColor: Color.lightblue,
                                  paddingHorizontal: dynamicSize(20),
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.readtext,
                                  { color: Color.lightblue },
                                ]}
                              >
                                Organiser
                              </Text>
                            </Pressable>
                          )}
                        </>
                      ) : (
                        <>
                          {item.active === false ? (
                            <>
                              <Pressable
                                onPress={() => onfriend(i)}
                                style={[
                                  styles.readbtn,
                                  { backgroundColor: Color.lightGray },
                                ]}
                              >
                                <Text style={styles.readtext}>Pending</Text>
                              </Pressable>
                            </>
                          ) : (
                            <Pressable
                              style={[
                                styles.readbtn,
                                {
                                  backgroundColor: Color.white,
                                  borderWidth: 1,
                                  borderColor: Color.lightblue,
                                  paddingHorizontal: dynamicSize(20),
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.readtext,
                                  { color: Color.lightblue },
                                ]}
                              >
                                Member
                              </Text>
                            </Pressable>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : (
        !loadingFromStore && (
          <View style={styles.emptyContainer}>
            <StatusMessage
              isOnline={currentNetworkStatus}
              hasData={ClubsItemList?.length > 0}
              title={'No Clubs Available'}
            />
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  status: {
    ...text.usernamestatus,
    color: Color.black0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  viewContainer: {
    flex: 1,
  },
  inputcontainer: {
    paddingHorizontal: 20,
  },
  mt2: {
    marginTop: 10,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,

    backgroundColor: Color.lightGray,
    borderRadius: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
  },
  btnText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
  },
  datalable: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
  },
  dataitem: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
  },
  rowcontainer: {
    alignItems: 'center',
    marginRight: 5,
  },
  rightbox: {
    flexDirection: 'row',
  },
  clubicontext: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  clubsubtext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
  },
  box40: {
    width: '38%',
  },
  box60: {
    width: '58%',
  },
  clubimgcontainer: {
    overflow: 'hidden',
    marginRight: 30,
    justifyContent: 'center',
  },
  clubprofileimg: {
    height: dynamicSize(70),
    width: dynamicSize(70),
    borderRadius: 100,
    backgroundColor: Color.gray,
  },
  iconrowcontainer: {
    flexDirection: 'row',
    marginHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(15),
    marginVertical: dynamicSize(15),
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

  nametitle: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
  },
  namesubtitle: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(19),
    color: Color.black,
  },
  profiletextcontainer: {
    width: '78%',
  },
  infoiconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
  },
  profileimgcontainer: {
    width: '20%',
    height: dynamicSize(60),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    top: -20,
  },
  profileimg: {
    width: dynamicSize(60),
    height: '100%',
    borderRadius: dynamicSize(100),
  },
  nametext: {
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
  },
  namebtn: {
    paddingHorizontal: dynamicSize(15),
    paddingVertical: 5,
    backgroundColor: 'rgba(37,87,102,0.6)',
    alignItems: 'flex-start',
    minWidth: dynamicSize(80),
    alignItems: 'center',
    position: 'absolute',
    top: dynamicSize(10),
    left: dynamicSize(10),
    borderRadius: 100,
  },
  mapcontainer: {
    height: dynamicSize(100),
    backgroundColor: Color.lightblue,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  infoiconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dynamicSize(15),
    // paddingBottom: 10,
  },
  infoiconimg: {
    height: dynamicSize(18),
    width: dynamicSize(18),
    marginRight: 7,
  },
  inforow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  infocardView: {
    backgroundColor: Color.white,
    // marginVertical: 5,
    marginBottom: dynamicSize(10),
    ...Shadow.boxShadow,
    marginHorizontal: dynamicSize(10),
    borderRadius: 20,
  },
  /* end Trip Report */
  readtext: {
    // fontSize: getFontSize(12),
    // color: Color.white,
    // fontFamily: fontFamily.ProximaAB,
    // lineHeight: getFontSize(20),
    fontFamily: fontFamily.ProximaR,
    fontSize: getFontSize(10),
    color: Color.white,
  },
  readbtn: {
    // backgroundColor: Color.black,
    // alignItems: 'center',
    // justifyContent: 'center',
    // paddingHorizontal: dynamicSize(20),
    // paddingVertical: 6,
    // borderRadius: 100,
    height: dynamicSize(30),
    paddingHorizontal: dynamicSize(13),
    backgroundColor: Color.lightblue,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
  },
  icontext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
  },
  buttoncontainer: {
    // paddingHorizontal: 10,
    marginRight: -7,
    alignSelf: 'flex-end',
    marginVertical: 5,
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
    lineHeight: getFontSize(23),
    fontFamily: fontFamily.ProximaBold,
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
  },
  box50: {
    width: '49%',
  },
  cardView: {
    backgroundColor: Color.white,
    marginBottom: 5,
    marginTop: dynamicSize(10),
    paddingHorizontal: 15,
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: dynamicSize(10),
    borderRadius: 20,
  },

  /* end Trip Report */

  searchbar: {
    borderRadius: 10,
    height: dynamicSize(40),
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  inputStyle: {
    paddingVertical: 0,
  },
  searchcontainer: {
    paddingHorizontal: 8,
    borderBottomColor: Color.cardbg,
    borderBottomWidth: 1,
    paddingBottom: dynamicSize(10),
    paddingTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  //offline new style add
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

  // Sync Info
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
});
