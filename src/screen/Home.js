// screens/Home.js - ENHANCED WITH FULL OFFLINE SUPPORT
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  AppState,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useDispatch, useSelector } from 'react-redux';
import Trip from '../api/Trip';
import { MenuItemButtom } from '../components/Buttons';
import { Header } from '../components/Header';
import WavesInfoItem from '../components/Item';
import ConnectionBanner from '../components/ConnectionBanner';
import {
  Color,
  Grid,
  NotInvitedMessage,
  NotPaidMessage,
  text,
} from '../constants/Constants';
import Loader from '../constants/Loader';
import { NOTIFICATION_DATA, setNotificationData } from '../constants/Utility';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGoogleApiKey, getUserData, updateFCM } from '../store/authSlice';
import {
  getFriendList,
  getNotificationCount,
  getMessageNotificationCount,
} from '../store/profileSlice';
import {
  getCommunityListDemo,
  getFavouriteSpots,
  getHomeSpot,
  getModifiedReason,
  getNearBySpotsForHome,
  setCurrentRegion,
  setCurrentRegionForForecast,
  setCurrentSpotIdForForecast,
} from '../store/tripSlice';
import { getBusinessSpeed, getSponsorSpeed } from '../store/sponsorSlice';
import { fetchAllClubsSpeed, fetchMyClubsSpeed } from '../store/clubSlice';
import { initializeAppConfig, syncAllConfigs } from '../store/configSlice';

const Home = () => {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const isFullAccess = user?.isFullAccess;
  const [showLoading, setShowLoading] = useState(false);
  const [notificationLoader, setNotificationLoader] = useState(false);
  const isInvited = useSelector(state => state.auth.isInvited);
  const [spotData, setSpotData] = useState(null);
  const dispatch = useDispatch();
  const {
    data,
    tide: tideData,
    spotName,
  } = useSelector(state => state.trip.nearBySpotsForHome);

  const spotConfigration = useSelector(state => state.trip?.spotConfigration);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ==================== NETWORK MONITORING ====================
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable;
      setCurrentNetworkStatus(isConnected);

      if (isConnected && !isInitialLoad) {
        refreshData();
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus, isInitialLoad]);

  useEffect(() => {
    dispatch(initializeAppConfig());
    dispatch(syncAllConfigs());
    dispatch(getGoogleApiKey());
    dispatch(getModifiedReason());
    dispatch(getFavouriteSpots());
    dispatch(getCommunityListDemo());
    dispatch(getSponsorSpeed());
    dispatch(getBusinessSpeed());
    dispatch(fetchAllClubsSpeed());
    dispatch(fetchMyClubsSpeed());
  }, []);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', () => {
      initNotification();
      dispatch(updateFCM(user?.id));
    });

    dispatch(getFriendList(user?.id, () => {}, true));

    navigation.addListener('focus', () => {
      dispatch(getNotificationCount());
      dispatch(getMessageNotificationCount());
    });

    initNotification();

    return () => {
      appStateListener && appStateListener.remove();
    };
  }, []);

  // ==================== LOAD USER SPOT ====================
  useEffect(() => {
    if (user?.id) {
      if (user?.spotId && user?.spotId > 0) {
        getUserSpot();
      } else {
        requestLocationPermission();
      }
      setIsInitialLoad(false);
    }
  }, [user?.spotId]);

  const getUserSpot = () => {
    setShowLoading(true);
    dispatch(
      getHomeSpot(user?.spotId, (status, spot) => {
        if (status) {
          setSpotData(spot);
        } else {
        }
        setShowLoading(false);
      }),
    );
  };

  // ==================== REFRESH DATA ====================
  const refreshData = async () => {
    if (user?.spotId && user?.spotId > 0) {
      getUserSpot();
    } else {
      requestLocationPermission();
    }

    dispatch(getUserData(user?.id));
    dispatch(getFriendList(user.id, () => {}, true));
    dispatch(getNotificationCount());
    dispatch(getMessageNotificationCount());
    dispatch(getModifiedReason());
    dispatch(getFavouriteSpots());
  };

  // ==================== NOTIFICATIONS ====================
  const initNotification = async () => {
    if (NOTIFICATION_DATA) {
      if (!isFullAccess) {
        alert(isInvited ? NotPaidMessage : NotInvitedMessage);
        return;
      }
      try {
        let tripData = {};
        switch (NOTIFICATION_DATA?.targettype) {
          case 'TRIP':
            setNotificationLoader(true);
            tripData = JSON.parse(
              await Trip.getCurrentTrip(NOTIFICATION_DATA?.targetid),
            );
            setNotificationLoader(false);
            navigation.navigate('TripDetail', {
              ...tripData,
              showAll: user?.id == tripData?.organizer?.id,
            });
            break;
          // ... [keep all other notification cases]
          default:
            break;
        }
      } catch (error) {
        alert(error?.toString() ?? 'Try again');
      }
      setNotificationData(null);
      setNotificationLoader(false);
    }
  };

  // ==================== LOCATION PERMISSIONS ====================
  const requestLocationPermission = async () => {
    setShowLoading(true);
    if (Platform.OS === 'ios') {
      getOneTimeLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This App needs to Access your location',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const enableResult = await promptForEnableLocationIfNeeded();
          if (enableResult == 'enabled' || enableResult == 'already-enabled') {
            setTimeout(() => {
              getOneTimeLocation();
            }, 1000);
          }
        } else {
          setShowLoading(false);
        }
      } catch (err) {
        setShowLoading(false);
      }
    }
  };

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);
        getNearBySpot(currentLatitude, currentLongitude);
      },
      error => {
        setShowLoading(false);
        alert(error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 1000,
      },
    );
  };

  const getNearBySpot = (lat, lng) => {
    dispatch(
      getNearBySpotsForHome(lat, lng, (status, spot) => {
        if (status) {
          setSpotData(spot);
        } else {
        }
        setShowLoading(false);
      }),
    );
  };

  // ==================== NAVIGATION HANDLERS ====================
  const goToOrganiseTrip = () => {
    navigation.navigate('Organizetrip');
  };

  const menuButtonClick = () => {
    navigation.openDrawer();
  };

  const GotoMytrip = () => {
    if (isFullAccess) {
      navigation.navigate('Mytrip');
    } else {
      alert(isInvited ? NotPaidMessage : NotInvitedMessage);
    }
  };

  const GotoCommunity = () => {
    if (isFullAccess) {
      navigation.navigate('Community', {
        isForum: false,
        ListIndex: 'ForHome',
      });
    } else {
      alert(isInvited ? NotPaidMessage : NotInvitedMessage);
    }
  };

  const GotoDetail = data => {
    dispatch(setCurrentRegionForForecast(data));
    dispatch(setCurrentSpotIdForForecast(spotData?.id));
    dispatch(setCurrentRegion({ spot: spotData }));
    navigation.navigate('WeatherDetail');
  };

  const GotoProfile = () => {
    navigation.navigate('Profile', { userId: user?.id });
  };

  const GotoClubHomePage = () => {
    if (isFullAccess) {
      navigation.navigate('ClubHomeMain', { isIndex: false });
    } else {
      alert(isInvited ? NotPaidMessage : NotInvitedMessage);
    }
  };

  const GotoEventsMain = () => {
    if (isFullAccess) {
      navigation.navigate('EventHomeMain');
    } else {
      alert(isInvited ? NotPaidMessage : NotInvitedMessage);
    }
  };

  const GotoBusinesses = () => {
    if (isFullAccess) {
      navigation.navigate('SponsorsHomeMain');
    } else {
      alert(isInvited ? NotPaidMessage : NotInvitedMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        iconleft={require('../assets/images/icon/menu.png')}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        onPressLeft={menuButtonClick}
        textAlign={'center'}
      />
      <Loader visible={notificationLoader} />

      {!currentNetworkStatus && (
        <View style={{ marginBottom: -10, marginTop: 0 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: getBottomSpace() }}
        refreshControl={
          <RefreshControl refreshing={showLoading} onRefresh={refreshData} />
        }
        bounces={true}
        alwaysBounceVertical={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={styles.viewContainer}>
          <View style={styles.mainusercontainer}>
            <Text style={styles.title}>Welcome,</Text>
            <Text style={styles.subtitle}>
              {user?.firstName ?? ''} {user?.lastName ?? ''}
            </Text>
          </View>

          <View>
            {/* SPOT INFO CARD - Will show cached data if offline */}
            <View>
              <WavesInfoItem
                spotName={spotName || spotData?.title || 'Loading...'}
                onPressSpotName={() => {
                  if (data || spotData) {
                    GotoDetail(data);
                  }
                }}
                spotConfigration={spotConfigration}
                marginHorizontal={0}
                tideExtremesByday={tideData ?? []}
                item={data}
                onPressBottomRight={goToOrganiseTrip}
                key={'0'}
              />
            </View>

            {/* MENU BUTTONS */}
            <View style={styles.menucontainer}>
              <View style={styles.buttoncontainer}>
                <MenuItemButtom
                  title={'Community'}
                  icon={require('../assets/images/icon/communty.png')}
                  onPress={GotoCommunity}
                />
              </View>
              <View style={styles.buttoncontainer}>
                <MenuItemButtom
                  title={'Trips'}
                  icon={require('../assets/images/icon/van.png')}
                  onPress={GotoMytrip}
                />
              </View>
            </View>
            <View style={styles.menucontainer}>
              <View style={styles.buttoncontainer}>
                <MenuItemButtom
                  title={'Profile'}
                  onPress={GotoProfile}
                  icon={require('../assets/images/icon/profile-user.png')}
                />
              </View>
              <View style={styles.buttoncontainer}>
                <MenuItemButtom
                  title={'Clubs'}
                  onPress={GotoClubHomePage}
                  icon={require('../assets/images/icon/people.png')}
                />
              </View>
            </View>
            <View style={styles.menucontainer}>
              <View style={styles.buttoncontainer}>
                <MenuItemButtom
                  title={'Sponsors'}
                  onPress={GotoBusinesses}
                  icon={require('../assets/images/icon/surf-shop.png')}
                />
              </View>
              <View style={styles.buttoncontainer}>
                <MenuItemButtom
                  title={'Events'}
                  onPress={GotoEventsMain}
                  icon={require('../assets/images/icon/Calendar.png')}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainusercontainer: {
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  viewContainer: {
    paddingHorizontal: '5%',
  },
  buttoncontainer: {
    width: '48%',
  },
  menucontainer: {
    ...Grid.row,
    justifyContent: 'space-between',
    marginVertical: 7,
  },
  title: {
    ...text.title,
  },
  subtitle: {
    ...text.smalltitle,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

export default Home;
