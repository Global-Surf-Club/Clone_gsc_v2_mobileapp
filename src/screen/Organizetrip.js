import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { List, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Trip from '../api/Trip';
import { RoundButton } from '../components/Buttons';
import FavouriteSpotItem from '../components/FavouriteSpotItem';
import { Header } from '../components/Header';
import Region from '../components/Region';
import { Color, fontFamily } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getFavouriteSpots,
  getModifiedReason,
  setCurrentRegion,
} from '../store/tripSlice';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';
import StatusMessage from '../components/StatusMessage';

const Organizetrip = () => {
  const navigation = useNavigation();
  const currentRegion = useSelector(state => state.trip.currentRegion);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isFullAccess = user?.isFullAccess;
  const route = useRoute();
  const regions = useSelector(state => state?.trip?.ModifiedResons);
  const [searchLoader, setSearchLoader] = useState(false);
  const [searchedData, setSearchedData] = useState(null);
  const [showLoading, SetshowLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const favouriteSpots = useSelector(state => state.trip.favouriteSpots);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      getModifiedReasons();
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  useEffect(() => {
    if (
      route?.params?.resonList != undefined &&
      route?.params?.resonList != null &&
      route?.params?.resonList != ''
    ) {
      setSearchedData(route?.params?.resonList);
    } else {
      navigation.addListener('focus', () => {
        dispatch(getFavouriteSpots(() => {}));
      });
      if (regions?.length == 0) {
        getModifiedReasons();
      }
      return () => {
        dispatch(setCurrentRegion({}));
      };
    }
  }, []);

  const getSearchedRegions = async searchQuery => {
    try {
      setSearchLoader(true);
      const data = JSON.parse(await Trip.getSearchedRegions(searchQuery));
      if (searchQuery.length > 0) {
        setSearchedData(data);
      } else {
        setSearchedData(null);
      }
    } catch (error) {}
    setSearchLoader(false);
  };

  const getModifiedReasons = () => {
    SetshowLoading(true);
    dispatch(
      getModifiedReason(status => {
        SetshowLoading(false);
      }),
    );
  };

  const BackButtonClick = () => {
    navigation.goBack('Mytrip');
  };

  const GotoOrganizeForm = () => {
    if (currentRegion?.id) {
      if (currentRegion?.spot?.id) {
        if (route?.params?.isEdit) {
          navigation.goBack();
        } else {
          navigation.navigate('OrganizeForm');
        }
      } else {
        alert('No spot found');
      }
    } else {
      alert('Select region');
    }
  };

  const timer = useRef(null);

  const changeSearchString = newString => {
    if (newString.length > 0) {
      getSearchedRegions(newString);
    } else {
      setSearchedData(null);
    }
  };

  const onChangeSearch = newVal => {
    setSearchQuery(newVal);
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(() => changeSearchString(newVal), 1000);
  };

  const filteredData = searchedData ?? regions;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={BackButtonClick}
          title={'Choose a destination'}
          notification={'2'}
          textAlign={'center'}
        />
        <Loader visible={showLoading} />
        {!currentNetworkStatus && (
          <View style={{ marginBottom: -5, marginTop: 0 }}>
            <ConnectionBanner isOnline={currentNetworkStatus} />
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
          {searchLoader && (
            <View
              style={{
                height: dynamicSize(80),
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator color={'black'} />
            </View>
          )}
        </View>
        {filteredData?.length > 0 || favouriteSpots?.length > 0 ? (
          <ScrollView
            // bounces={true}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps={'handled'}
            contentContainerStyle={{ paddingBottom: getBottomSpace() }}
            // alwaysBounceVertical={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {favouriteSpots?.length > 0 && (
              <Text
                style={{
                  fontSize: getFontSize(15),
                  fontFamily: fontFamily.ProximaR,
                  color: Color.black0,
                  marginLeft: dynamicSize(20),
                  marginTop: dynamicSize(10),
                }}
              >
                Favourites
              </Text>
            )}
            <View
              style={{
                // marginBottom: favouriteSpots?.length > 0 ? -20 : 0,
                zIndex: 5,
              }}
            >
              <List.Section
                // theme={{colors: {background: 'red'}}}
                style={{ marginVertical: 0, backgroundColor: 'white' }}
              >
                <FlatList
                  scrollEnabled={false}
                  keyboardDismissMode="on-drag"
                  keyboardShouldPersistTaps={'handled'}
                  data={favouriteSpots}
                  renderItem={({ item }) => {
                    return (
                      <FavouriteSpotItem
                        spot={item}
                        setLoader={SetshowLoading}
                        loader={showLoading}
                      />
                    );
                  }}
                />
              </List.Section>
            </View>
            <View style={[styles.viewContainer, { marginTop: 0 }]}>
              <List.Section
                // theme={{colors: {background: 'red'}}}
                style={{ backgroundColor: 'white', borderBottomWidth: 0 }}
              >
                {filteredData.map(item => {
                  return (
                    <Region
                      item={item}
                      searchQuery={
                        searchLoader
                          ? ''
                          : route?.params?.serchString
                          ? route?.params?.serchString
                          : searchQuery
                      }
                      isSponsor={route?.params?.serchString ? true : false}
                    />
                  );
                })}
              </List.Section>
            </View>
          </ScrollView>
        ) : (
          !showLoading && (
            <View style={styles.emptyContainer}>
              <StatusMessage
                isOnline={currentNetworkStatus}
                hasData={filteredData?.length > 0 || favouriteSpots?.length > 0}
                title={'No Clubs Available'}
              />
            </View>
          )
        )}
        {isFullAccess && (
          <RoundButton title={'Next'} onPress={GotoOrganizeForm} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchbar: {
    borderRadius: 10,
    // height: 40,
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  inputStyle: {
    paddingVertical: 0,
  },

  searchcontainer: {
    paddingHorizontal: 8,
    borderBottomColor: Color.cardbg,
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 5,
  },
  listtextstyle: {
    fontFamily: fontFamily.ProximaR,
    fontSize: 14,
    lineHeight: 20,
  },
  listItemstyle: {
    marginHorizontal: 20,
    borderBottomColor: Color.lightGray,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  citycintainer: {},
  accordiontitle: {
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 24,
    fontSize: 16,
    paddingHorizontal: '1%',
  },
  subaccordiontitle: {
    fontSize: 16,
    fontFamily: fontFamily.ProximaR,
    paddingHorizontal: '1%',
    color: Color.black0,
  },
  accordioncontainer: {
    backgroundColor: Color.white,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderRadius: 100,
  },
  accordioncontainer2: {
    backgroundColor: Color.white,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderRadius: 100,
    marginHorizontal: 10,
  },
  viewContainer: {
    // paddingHorizontal: '5%',
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default Organizetrip;
