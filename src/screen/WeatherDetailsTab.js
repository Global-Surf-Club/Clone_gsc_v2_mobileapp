import { useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import Profile from '../api/Profile';
import Trip from '../api/Trip';
import { TableButton } from '../components/Buttons';
import CustomMapView from '../components/CustomMapView';
import WavesInfoItem from '../components/Item';
import { Color, fontFamily, Grid } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { getSwellDirection, getWindDirection } from '../constants/Utility';
import { getProfile } from '../store/profileSlice';
import { getFavouriteSpots, getForecase } from '../store/tripSlice';
import FastImage from 'react-native-fast-image';

export const CurrentTab = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    dispatch(getFavouriteSpots());
  }, []);

  const favouriteSpotsIds = useSelector(
    state => state.trip.favouriteSpotsIds || [],
  );
  const currentRegion = useSelector(state => state.trip.currentRegion);
  const id =
    route.params?.newIdForForecast ??
    useSelector(state => state.trip.currentSpotIdForForecast);
  const [isFavouriteSpot, setIsFavouriteSpot] = useState(
    favouriteSpotsIds?.includes(currentRegion?.spot?.id),
  );

  const currentForcast = useSelector(
    state => state.trip.currentRegionForForecast,
  );
  const tideExtremesByday =
    useSelector(state => state.trip?.tideExtremesByday)?.[id] ?? [];
  const astornomyByDay =
    useSelector(state => state.trip?.astornomyByDay)?.[id]?.[
      moment(currentForcast?.time)?.format('l')
    ] ?? {};

  useEffect(() => {
    if (id && !isDataLoaded) {
      setIsLoading(true);
      dispatch(
        getForecase(
          id,
          (success, data, tides) => {
            setIsLoading(false);
            setIsDataLoaded(true);

            if (success) {
            } else {
            }
          },
          false,
          null,
          true,
        ),
      );
    }
  }, [id]);

  const astronomyData = [
    {
      title: 'First Light',
      time: astornomyByDay?.civilDawn,
    },
    {
      title: 'Sunrise',
      time: astornomyByDay?.sunrise,
    },
    {
      title: 'Sunset',
      time: astornomyByDay?.sunset,
    },
    {
      title: 'Last Light',
      time: astornomyByDay?.civilDusk,
    },
  ];

  const tideList = tideExtremesByday[moment(currentForcast?.time)?.format('l')];

  const handleFavouriteToggle = async () => {
    setIsLoading(true);
    try {
      if (isFavouriteSpot) {
        await Trip.deleteFavouriteSpot(currentRegion?.spot?.id);
        setIsFavouriteSpot(false);
      } else {
        const param = {
          spotId: currentRegion?.spot?.id,
          userId: user?.id,
        };
        await Trip.addFavouriteSpot(param);
        setIsFavouriteSpot(true);
      }
    } catch (error) {}
    setIsLoading(false);
    dispatch(getFavouriteSpots(() => {}));
  };

  const handleHomeSpotToggle = async () => {
    setIsLoading(true);
    try {
      if (user?.spotId && user?.spotId > 0) {
        if (currentRegion?.spot?.id == user?.spotId) {
          await Profile.updateProfile({ spotId: 0 });
        } else {
          await Profile.updateProfile({
            spotId: currentRegion?.spot?.id,
          });
        }
      } else {
        await Profile.updateProfile({
          spotId: currentRegion?.spot?.id,
        });
      }
    } catch (error) {}

    dispatch(
      getProfile(
        user?.id,
        () => {
          setIsLoading(false);
        },
        true,
      ),
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: getBottomSpace() }}
    >
      <View style={tab1styles.container}>
        <Text style={tab1styles.UpdatedInformation}>
          {'Updated ' + moment().fromNow()}
        </Text>

        <Pressable
          onPress={handleFavouriteToggle}
          style={{
            position: 'absolute',
            right: dynamicSize(15),
            top: dynamicSize(10),
          }}
        >
          <AntDesign
            name={isFavouriteSpot ? 'heart' : 'hearto'}
            size={dynamicSize(24)}
            color={Color.lightblue}
          />
        </Pressable>

        <Pressable
          onPress={handleHomeSpotToggle}
          style={{
            position: 'absolute',
            right: dynamicSize(50),
            top: dynamicSize(10),
          }}
        >
          <Ionicons
            name={
              user?.spotId == currentRegion?.spot?.id
                ? 'home-sharp'
                : 'home-outline'
            }
            size={dynamicSize(25)}
            color={Color.lightblue}
          />
        </Pressable>

        <View style={tab1styles.Directions}>
          <View style={tab1styles.Directions1}>
            <FastImage
              style={tab1styles.icon}
              tintColor={Color.lightblue}
              source={require('../assets/images/icon/wind33.png')}
            />
            <Text style={tab1styles.Tempraturemph}>
              {(currentForcast?.windSpeed?.sg * 2.23694)?.toFixed(2) +
                'mph,' +
                getWindDirection(currentForcast?.windDirection?.sg)}
            </Text>
          </View>
          <View style={[tab1styles.Directions1, tab1styles.alignright]}>
            <Text style={[tab1styles.Tempraturemph]}>
              {'Period ' + currentForcast?.swellPeriod?.sg?.toFixed(2) + 's'}
            </Text>
          </View>
        </View>

        <Text style={tab1styles.TempratureNumber}>
          {currentForcast?.waveHeight?.sg?.toFixed(2) + 'm'}
        </Text>

        <View style={tab1styles.Directions}>
          <View style={tab1styles.Directions1}>
            <FastImage
              style={tab1styles.Waveicon}
              source={require('../assets/images/icon/wave.png')}
            />
            <Text style={tab1styles.TempratureCelcious}>
              {currentForcast?.waterTemperature?.sg?.toFixed(2) + '°C'}
            </Text>
          </View>
          <View style={tab1styles.Directions1}>
            <Text style={tab1styles.BorderLeft}></Text>
            <Text style={tab1styles.TempratureCelcious}>
              {'Swell: ' +
                currentForcast?.swellHeight?.sg?.toFixed(2) +
                'm, ' +
                getSwellDirection(currentForcast?.swellDirection?.sg)}
            </Text>
          </View>
        </View>

        <View style={tab1styles.mapContainer}>
          {currentRegion?.spot?.address?.locationLat &&
          currentRegion?.spot?.address?.locationLng ? (
            <CustomMapView
              location={{
                latitude: currentRegion?.spot?.address?.locationLat,
                longitude: currentRegion?.spot?.address?.locationLng,
              }}
              currentForcast={currentForcast}
            />
          ) : null}
        </View>

        <Text style={tab1styles.TableHeading}>Tides</Text>
        <View style={tab1styles.Table}>
          {[0, 1, 2, 3]?.map((item, index) => {
            return (
              <View
                key={index}
                style={
                  index % 2 == 0
                    ? tab1styles.TableFirstRow
                    : tab1styles.TableSecondRow
                }
              >
                <View style={tab1styles.Directions1}>
                  <Text
                    style={[
                      tab1styles.TableText,
                      { minWidth: dynamicSize(35) },
                    ]}
                  >
                    {tideList?.length > index ? tideList[index]?.type : ''}
                  </Text>
                  <Text style={tab1styles.TableText}>
                    {tideList?.length > index && tideList[index]?.time
                      ? moment(tideList[index]?.time)?.format('HH:mm')
                      : ''}
                  </Text>
                </View>
                <View
                  style={[
                    tab1styles.Directions1,
                    { justifyContent: 'flex-end' },
                  ]}
                >
                  <Text
                    style={[
                      tab1styles.TableText,
                      { minWidth: dynamicSize(60) },
                    ]}
                  >
                    {astronomyData[index].title}
                  </Text>
                  <Text
                    style={[
                      tab1styles.TableText,
                      { minWidth: dynamicSize(40) },
                    ]}
                  >
                    {astronomyData[index]?.time &&
                      moment(astronomyData[index]?.time)?.format('HH:mm')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      <Loader visible={isLoading} />
    </ScrollView>
  );
};

const tab1styles = StyleSheet.create({
  alignright: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 1,
  },
  UpdatedInformation: {
    // color: Color.gray,
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
  },
  icon: {
    height: 20,
    width: 20,
    marginTop: 3,
    marginRight: 5,
    tintColor: Color.lightblue,
  },
  Waveicon: {
    height: 15,
    width: 15,
    marginTop: 3,
    marginRight: 5,
  },
  Directions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  Directions1: {
    flexDirection: 'row',
    width: '50%',
  },
  TempratureCelcious: {
    color: Color.lightblue,
    fontFamily: fontFamily.ProximaR,
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
  },
  Tempraturemph: {
    color: Color.lightblue,
    fontSize: 18,
    fontFamily: fontFamily.ProximaR,
  },

  TempratureNumber: {
    color: Color.black0,
    fontSize: 24,
    marginVertical: 10,
    fontFamily: fontFamily.ProximaAB,
  },
  SwellText: {
    color: Color.lightblue,
    fontSize: 16,
  },
  BorderLeft: {
    marginRight: 10,
    borderLeftWidth: 1,
    borderLeftColor: Color.cardgray,
  },
  mapContainer: {
    backgroundColor: Color.lightblue,
    width: '100%',
    height: 170,
    borderRadius: 20,
    marginVertical: 10,
    overflow: 'hidden',
  },
  TableHeading: {
    fontSize: getFontSize(18),
    color: Color.black0,
    fontFamily: fontFamily.ProximaAB,
    marginVertical: 10,
  },
  Table: {
    flexDirection: 'column',
  },
  TableFirstRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    // justifyContent: 'space-between'
    // opacity:.9
  },
  TableSecondRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: Color.tablebgblue,
    paddingHorizontal: 5,
    // justifyContent: 'space-between',
    borderRadius: 6,
    // opacity: .7
  },
  TableText: {
    fontSize: 14,
    color: 'black',
    marginHorizontal: 5,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 19,
    textTransform: 'capitalize',
  },
});

//make this component available to the app
export const ExtendedTab = memo(() => {
  const route = useRoute();
  const currentRegion = useSelector(state => state.trip.currentRegion);
  const id =
    route.params?.newIdForForecast ??
    useSelector(state => state.trip.currentSpotIdForForecast);
  const currentForcast = useSelector(
    state => state.trip.currentRegionForForecast,
  );
  const [currentCard, setCurrentCard] = useState(currentForcast);
  const forecastByDay =
    useSelector(state => state.trip?.forecastByDay)?.[id] || {};
  const averageForcast =
    useSelector(state => state.trip.averageForcast)[id] ?? [];
  const tideExtremesByday =
    useSelector(state => state.trip.tideExtremesByday)?.[id] ?? [];
  const spotConfigration = useSelector(state => state.trip?.spotConfigration);
  const scrollViewRef = useRef();
  const extendedForecast =
    forecastByDay[moment(currentCard?.time)?.format('l')];
  const astornomyByDay =
    useSelector(state => state.trip?.astornomyByDay)?.[id]?.[
      moment(currentCard?.time)?.format('l')
    ] || {};
  const astronomyData = [
    {
      title: 'First Light',
      time: astornomyByDay?.civilDawn,
    },
    {
      title: 'Sunrise',
      time: astornomyByDay?.sunrise,
    },
    {
      title: 'Sunset',
      time: astornomyByDay?.sunset,
    },
    {
      title: 'Last Light',
      time: astornomyByDay?.civilDusk,
    },
  ];
  const tideList = tideExtremesByday[moment(currentCard?.time)?.format('l')];
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      ref={scrollViewRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: getBottomSpace() }}
    >
      <View style={tab2styles.container}>
        <Text style={tab2styles.UpdatedInformation}>
          {'Updated ' + new Date().getMinutes() + ' minutes ago'}
        </Text>
        <View style={tab2styles.Directions}>
          <View style={tab2styles.Directions1}>
            <FastImage
              style={tab2styles.icon}
              tintColor={Color.lightblue}
              source={require('../assets/images/icon/wind33.png')}
            />
            <Text style={tab2styles.Tempraturemph}>
              {(currentCard?.windSpeed?.sg * 2.23694)?.toFixed(2) +
                'mph,' +
                getWindDirection(currentCard?.windDirection?.sg)}
            </Text>
          </View>
          <View style={[tab2styles.Directions1, tab2styles.alignright]}>
            <Text style={[tab2styles.Tempraturemph]}>
              {'Period ' + currentCard?.swellPeriod?.sg?.toFixed(2) + 's'}
            </Text>
          </View>
        </View>
        <Text style={tab2styles.TempratureNumber}>
          {currentCard?.waveHeight?.sg?.toFixed(2) + 'm'}
        </Text>
        <View style={tab2styles.Directions}>
          <View style={tab2styles.Directions1}>
            <FastImage
              style={tab2styles.Waveicon}
              source={require('../assets/images/icon/wave.png')}
            />
            <Text style={tab2styles.TempratureCelcious}>
              {currentCard?.waterTemperature?.sg?.toFixed(2) + '°C'}
            </Text>
          </View>
          <View style={tab2styles.Directions1}>
            <Text style={tab2styles.BorderLeft}></Text>
            <Text style={tab2styles.TempratureCelcious}>
              {'Swell: ' +
                currentCard?.swellHeight?.sg?.toFixed(2) +
                'm, ' +
                getSwellDirection(currentCard?.swellDirection?.sg)}
            </Text>
          </View>
        </View>
        <View style={tab1styles.mapContainer}>
          {currentRegion?.spot?.address?.locationLat &&
          currentRegion?.spot?.address?.locationLng ? (
            <CustomMapView
              // location={currentRegion?.spot?.address?.location}
              location={{
                latitude: currentRegion?.spot?.address?.locationLat,
                longitude: currentRegion?.spot?.address?.locationLng,
              }}
              currentForcast={currentCard}
            />
          ) : // <MapView
          //   provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          //   style={StyleSheet.absoluteFillObject}
          //   mapType={'satellite'}
          //   onPress={() => {}}
          //   region={{
          //     ...currentRegion?.spot?.address?.location,
          //     latitudeDelta: 0.01,
          //     longitudeDelta: 0.01,
          //   }}>
          //   <Marker
          //     anchor={Platform.OS == 'android' ? {y: 0.5} : {x: 0.5, y: 0.5}}
          //     style={
          //       {
          //         // overflow: 'visible'
          //         // height: 160,
          //         // width: 160,
          //         // alignItems: 'center',
          //         // justifyContent: 'center',
          //       }
          //     }
          //     coordinate={currentRegion?.spot?.address?.location}>
          //     <CustomMarker
          //       // forecastData={forecastData[item?.destination?.id] ?? []}
          //       currentForcast={currentCard}
          //     />
          //   </Marker>
          // </MapView>
          null}
        </View>
        <Text style={tab2styles.TableHeading}>Tides</Text>
        <View style={tab2styles.Table}>
          {[0, 1, 2, 3]?.map((item, index) => {
            return (
              <View
                style={
                  index % 2 == 0
                    ? tab1styles.TableFirstRow
                    : tab1styles.TableSecondRow
                }
              >
                <View style={tab1styles.Directions1}>
                  <Text
                    style={[
                      tab1styles.TableText,
                      { minWidth: dynamicSize(35) },
                    ]}
                  >
                    {tideList?.length >= index ? tideList[index]?.type : ''}
                  </Text>
                  <Text style={tab1styles.TableText}>
                    {tideList?.length >= index
                      ? tideList[index]?.time &&
                        moment(
                          tideList?.length >= index
                            ? tideList[index]?.time
                            : '',
                        )?.format('HH:mm')
                      : ''}
                  </Text>
                </View>
                <View
                  style={[
                    tab1styles.Directions1,
                    { justifyContent: 'flex-end' },
                  ]}
                >
                  <Text
                    style={[
                      tab1styles.TableText,
                      { minWidth: dynamicSize(60) },
                    ]}
                  >
                    {astronomyData[index].title}
                  </Text>
                  <Text
                    style={[
                      tab1styles.TableText,
                      { minWidth: dynamicSize(40) },
                    ]}
                  >
                    {astronomyData[index]?.time &&
                      moment(astronomyData[index]?.time)?.format('HH:mm')}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* {tideExtremesByday[moment(currentCard?.time)?.format('l')]?.map((item, index) => {
                        return (
                            <View style={index % 2 == 0 ? tab1styles.TableFirstRow : tab1styles.TableSecondRow}>
                                <View style={tab1styles.Directions1}>
                                    <Text style={tab1styles.TableText}>{item?.type}</Text>
                                    <Text style={tab1styles.TableText}>{moment(item?.time).format('HH:mm')}</Text>
                                </View>
                                <View style={tab1styles.Directions1}>
                                    <Text style={tab1styles.TableText}>First Light</Text>
                                    <Text style={tab1styles.TableText}>10:55</Text>
                                </View>
                            </View>
                        )
                    })} */}
          {/* <View style={tab2styles.TableFirstRow}>
                        <View style={tab2styles.Directions1}>
                            <Text style={tab2styles.TableText}>High</Text>
                            <Text style={tab2styles.TableText}>10:55</Text>
                        </View>
                        <View style={tab2styles.Directions1}>
                            <Text style={tab2styles.TableText}>First Light</Text>
                            <Text style={tab2styles.TableText}>10:55</Text>
                        </View>
                    </View>
                    <View style={tab2styles.TableSecondRow}>
                        <View style={tab2styles.Directions1}>
                            <Text style={tab2styles.TableText}>Low</Text>
                            <Text style={tab2styles.TableText}>17:13</Text>
                        </View>
                        <View style={tab2styles.Directions1}>
                            <Text style={tab2styles.TableText}>Sunrise</Text>
                            <Text style={tab2styles.TableText}>11:28</Text>
                        </View>
                    </View>
                    <View style={tab2styles.TableFirstRow}>
                        <View style={tab2styles.Directions1}>
                            <Text style={tab2styles.TableText}>High</Text>
                            <Text style={tab2styles.TableText}>23:13</Text>
                        </View>
                        <View style={tab2styles.Directions1}>
                            <Text style={tab2styles.TableText}>Sunset</Text>
                            <Text style={tab2styles.TableText}>00:22</Text>
                        </View>
                    </View>
                    <View style={tab2styles.TableSecondRow}>
                        <View style={tab2styles.Directions1}>
                            <Text style={tab2styles.TableText}>Low</Text>
                            <Text style={tab2styles.TableText}></Text>
                        </View>
                        <View style={tab2styles.Directions1}>
                            <Text style={tab2styles.TableText}>Last Light</Text>
                            <Text style={tab2styles.TableText}>00:55</Text>
                        </View>
                    </View> */}
        </View>
        <Text style={tab2styles.DayTime}>
          {' '}
          {moment(currentCard?.time)?.format('dddd-DD/MM/YYYY')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: 20 }}
        >
          <View style={tab2styles.Directions}>
            <View style={tab2styles.DateTable}>
              <TableButton />
              <View style={tab2styles.TableColumn}>
                {extendedForecast?.map((item, index) => {
                  return (
                    <Text style={tab2styles.DateTableHeadingText}>
                      {moment(item?.time)?.format('HH:mm')}
                    </Text>
                  );
                })}
              </View>
            </View>
            <View style={tab2styles.DateTable}>
              <TableButton title="SURF" backgroundColor="black" color="white" />
              <View style={tab2styles.TableColumn1}>
                {extendedForecast?.map((item, index) => {
                  return (
                    <Text
                      style={tab2styles.DateTableText}
                    >{`${item?.waveHeight?.sg}m\n${item?.wavePeriod?.sg}s`}</Text>
                  );
                })}

                {/* <Text style={tab2styles.DateTableText}>1.33m{'\n'}5.68s</Text>
                                <Text style={tab2styles.DateTableText}>0.68m {'\n'}7.55s</Text>
                                <Text style={tab2styles.DateTableText}>0.69m {'\n'}8.72s</Text>
                                <Text style={tab2styles.DateTableText}>0.86m{'\n'} 5.47s</Text>
                                <Text style={tab2styles.DateTableText}>0.81m{'\n'} 6.39s</Text>
                                <Text style={tab2styles.DateTableText}>0.84m {'\n'}7.14s</Text> */}
              </View>
            </View>
            <View style={tab2styles.DateTable}>
              <TableButton title="WIND" backgroundColor="black" color="white" />
              <View style={tab2styles.TableColumn2}>
                {extendedForecast?.map((item, index) => {
                  return (
                    <Text style={tab2styles.DateTableText}>{`${getWindDirection(
                      item?.windDirection?.sg,
                    )}\n${(item?.windSpeed?.sg * 2.23694).toFixed(
                      2,
                    )}mph`}</Text>
                  );
                })}
                {/* <Text style={tab2styles.DateTableText}> N {'\n'} 7.89mph</Text>
                                <Text style={tab2styles.DateTableText}> NW {'\n'} 2.45mph</Text>
                                <Text style={tab2styles.DateTableText}>N {'\n'} 2.51mph</Text>
                                <Text style={tab2styles.DateTableText}>N {'\n'} 4.26mph</Text>
                                <Text style={tab2styles.DateTableText}>NW {'\n'} 4.57mph</Text>
                                <Text style={tab2styles.DateTableText}>N {'\n'} 5.76mph</Text> */}
              </View>
            </View>
            <View style={tab2styles.DateTable}>
              <TableButton
                title="SWELL 1"
                backgroundColor="black"
                color="white"
              />
              <View style={tab2styles.TableColumn1}>
                {extendedForecast?.map((item, index) => {
                  return (
                    <Text style={tab2styles.DateTableText}>{`${getWindDirection(
                      item?.swellDirection?.sg,
                    )} ${item?.swellHeight?.sg.toFixed(2)}m\n${
                      item?.swellPeriod?.sg
                    }s`}</Text>
                  );
                })}
                {/* <Text style={tab2styles.DateTableText}> WSW 0.40M {'\n'} @10.49S</Text>
                                <Text style={tab2styles.DateTableText}> W 0.30M {'\n'} @4.01S</Text>
                                <Text style={tab2styles.DateTableText}> WSW 0.20M {'\n'} @7.64S</Text>
                                <Text style={tab2styles.DateTableText}>WSW 0.07M {'\n'} @14.95S</Text>
                                <Text style={tab2styles.DateTableText}>WSW 0.17M {'\n'} @13.10S</Text>
                                <Text style={tab2styles.DateTableText}>WSW 0.35M {'\n'} @9.92S</Text> */}
              </View>
            </View>
            <View style={tab2styles.DateTable}>
              <TableButton
                title="SWELL 2"
                backgroundColor="black"
                color="white"
              />
              <View style={tab2styles.TableColumn1}>
                {extendedForecast?.map((item, index) => {
                  return (
                    <Text style={tab2styles.DateTableText}>{`${getWindDirection(
                      item?.secondarySwellDirection?.sg,
                    )} ${item?.secondarySwellHeight?.sg.toFixed(2)}m\n${
                      item?.secondarySwellPeriod?.sg
                    }s`}</Text>
                  );
                })}
                {/* <Text style={tab2styles.DateTableText}>1.33m{'\n'}5.68s</Text>
                                <Text style={tab2styles.DateTableText}>0.68m {'\n'}7.55s</Text>
                                <Text style={tab2styles.DateTableText}>0.69m {'\n'}8.72s</Text>
                                <Text style={tab2styles.DateTableText}>0.86m{'\n'} 5.47s</Text>
                                <Text style={tab2styles.DateTableText}>0.81m{'\n'} 6.39s</Text>
                                <Text style={tab2styles.DateTableText}>0.84m {'\n'}7.14s</Text> */}
              </View>
            </View>
            {/* <View style={tab2styles.DateTable}>
                            <TableButton
                                title='WIND'
                                backgroundColor='black'
                                color="white"
                            />
                            <View style={tab2styles.TableColumn2}>
                                <Text style={tab2styles.DateTableText}> N {'\n'} 7.89mph</Text>
                                <Text style={tab2styles.DateTableText}> NW {'\n'} 2.45mph</Text>
                                <Text style={tab2styles.DateTableText}>N {'\n'} 2.51mph</Text>
                                <Text style={tab2styles.DateTableText}>N {'\n'} 4.26mph</Text>
                                <Text style={tab2styles.DateTableText}>NW {'\n'} 4.57mph</Text>
                                <Text style={tab2styles.DateTableText}>N {'\n'} 5.76mph</Text>
                            </View>
                        </View> */}
            {/* <View style={tab2styles.DateTable}>
                            <TableButton
                                title='SWELL 1'
                                backgroundColor='black'
                                color="white"
                            />
                            <View style={tab2styles.TableColumn1}>
                                <Text style={tab2styles.DateTableText}> WSW 0.40M {'\n'} @10.49S</Text>
                                <Text style={tab2styles.DateTableText}> W 0.30M {'\n'} @4.01S</Text>
                                <Text style={tab2styles.DateTableText}> WSW 0.20M {'\n'} @7.64S</Text>
                                <Text style={tab2styles.DateTableText}>WSW 0.07M {'\n'} @14.95S</Text>
                                <Text style={tab2styles.DateTableText}>WSW 0.17M {'\n'} @13.10S</Text>
                                <Text style={tab2styles.DateTableText}>WSW 0.35M {'\n'} @9.92S</Text>
                            </View>
                        </View> */}
          </View>
        </ScrollView>
        <View>
          <FlatList
            horizontal={true}
            data={averageForcast}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tab2styles.flatlist}
            renderItem={({ item, index }) => (
              <WavesInfoItem
                spotConfigration={spotConfigration}
                tideExtremesByday={tideExtremesByday ?? []}
                onCardClick={() => {
                  scrollViewRef.current &&
                    scrollViewRef.current.scrollTo({
                      x: 0,
                      y: 0,
                      animated: true,
                    });
                  setCurrentCard(item);
                }}
                width={250}
                marginHorizontal={5}
                item={item}
                key={index}
              />
            )}
            keyExtractor={({ item }, index) => index.toString()}
          />
        </View>
      </View>
    </ScrollView>
  );
});

const tab2styles = StyleSheet.create({
  // Same css Tab 1 And Tab 2 Start
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 1,
  },
  UpdatedInformation: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
  },
  icon: {
    height: 20,
    width: 20,
    marginTop: 3,
    marginRight: 5,
    tintColor: Color.lightblue,
  },
  Waveicon: {
    height: 15,
    width: 15,
    marginTop: 3,
    marginRight: 5,
  },
  Directions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  alignright: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  Directions1: {
    flexDirection: 'row',
    width: '50%',
  },
  TempratureCelcious: {
    color: Color.lightblue,
    fontFamily: fontFamily.ProximaR,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  Tempraturemph: {
    color: Color.lightblue,
    fontSize: 18,
    fontFamily: fontFamily.ProximaR,
  },
  TempratureNumber: {
    color: Color.black0,
    fontSize: 24,
    marginVertical: 10,
    fontFamily: fontFamily.ProximaAB,
  },
  SwellText: {
    color: Color.lightblue,
    fontSize: 16,
  },
  BorderLeft: {
    marginRight: 10,
    borderLeftWidth: 1,
    borderLeftColor: Color.cardgray,
  },
  mapContainer: {
    backgroundColor: Color.lightblue,
    width: '100%',
    height: 150,
    borderRadius: 20,
    marginVertical: 10,
  },
  TableHeading: {
    fontSize: getFontSize(18),
    color: Color.black0,
    fontFamily: fontFamily.ProximaAB,
    marginVertical: 10,
  },
  Table: {
    flexDirection: 'column',
  },
  TableFirstRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    // justifyContent: 'space-between'
    // opacity:.9
  },
  TableSecondRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: Color.tablebgblue,
    paddingHorizontal: 5,
    // justifyContent: 'space-between',
    borderRadius: 6,
    // opacity: .7
  },
  TableText: {
    fontSize: 14,
    color: 'black',
    marginHorizontal: 5,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 19,
  },
  // Same css Tab 1 And Tab 2 End
  DayTime: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaBold,
    color: Color.black,
    marginVertical: 10,
  },
  TableColumn1: {
    backgroundColor: Color.lightpink,
    paddingVertical: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  DateTable: {
    flexDirection: 'column',
    marginHorizontal: 5,
  },
  TableColumn: {
    paddingVertical: 20,
    width: '100%',
    marginVertical: 10,
    borderRadius: 20,
  },
  TableColumn2: {
    backgroundColor: Color.tablebgblue,
    paddingVertical: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  DateTableText: {
    color: 'black',
    fontSize: 13,
    marginVertical: 20,
    flexWrap: 'wrap',
    textAlign: 'center',
    fontFamily: fontFamily.ProximaR,
    lineHeight: 19,
  },
  DateTableHeadingText: {
    width: 60,
    color: 'black',
    fontFamily: fontFamily.ProximaAB,
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 27.5,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
});
//make this component available to the app
export const DetailsTab = memo(() => {
  const currentForcast = useSelector(
    state => state.trip.currentRegionForForecast,
  );
  const currentRegion = useSelector(state => state.trip.currentRegion);

  const currentSpot = currentRegion?.spot;
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: getBottomSpace() }}
    >
      <View style={DetailsTabstyles.detailcontainer}>
        <View style={tab1styles.mapContainer}>
          {currentRegion?.spot?.address?.locationLat &&
          currentRegion?.spot?.address?.locationLng ? (
            <CustomMapView
              // location={currentRegion?.spot?.address?.location}
              location={{
                latitude: currentRegion?.spot?.address?.locationLat,
                longitude: currentRegion?.spot?.address?.locationLng,
              }}
              currentForcast={currentForcast}
            />
          ) : // <MapView
          //   provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          //   style={StyleSheet.absoluteFillObject}
          //   mapType={'satellite'}
          //   onPress={() => {}}
          //   region={{
          //     ...currentRegion?.spot?.address?.location,
          //     latitudeDelta: 0.01,
          //     longitudeDelta: 0.01,
          //   }}>
          //   <Marker
          //     anchor={Platform.OS == 'android' ? {y: 0.5} : {x: 0.5, y: 0.5}}
          //     style={
          //       {
          //         // overflow: 'visible'
          //         // height: 160,
          //         // width: 160,
          //         // alignItems: 'center',
          //         // justifyContent: 'center',
          //       }
          //     }
          //     coordinate={currentRegion?.spot?.address?.location}>
          //     <CustomMarker
          //       // forecastData={forecastData[item?.destination?.id] ?? []}
          //       currentForcast={currentForcast}
          //     />
          //   </Marker>
          // </MapView>
          null}
        </View>
        <View style={DetailsTabstyles.botttomborder}>
          <Text style={DetailsTabstyles.title}>Spot Guide</Text>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Surf Type:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {/* Wave Pool */}
              {currentRegion?.spot?.title == 'The Wave' ? 'Wave Pool' : 'Surf'}
              {/* {currentSpot?.surfType
                ? triptype[currentSpot?.surfType ?? 0]
                : ''} */}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Experience:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.experience}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Frequency:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.frequency}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Wave Quality:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.waveQuality}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Wave Type:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.waveType}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Wave Direction:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.waveDirection}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Wave Power:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.wavePower}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Wave Normal Length:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.waveNormalLength}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Wave Good day Length:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.waveGoodDayLength}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Sea Bottom:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.seaBottom}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Swell Size:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.swellSize}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Good Swell Direction:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.goodSwellDirection}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Good Wind Direction:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.goodWindDirection}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Best Tide Position:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.bestTidePosition}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Weekend Crowd:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.weekEndCrowed}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Week Crowd:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.weekCrowed}
            </Text>
          </View>
        </View>
        <View style={DetailsTabstyles.row}>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.label}>Additional Info:</Text>
          </View>
          <View style={DetailsTabstyles.box50}>
            <Text style={DetailsTabstyles.labeltaxt}>
              {currentSpot?.additionalInfo}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

const DetailsTabstyles = StyleSheet.create({
  mapContainer: {
    backgroundColor: Color.lightblue,
    width: '100%',
    height: 150,
    borderRadius: 20,
    marginVertical: 10,
  },
  labeltaxt: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontFamily.ProximaR,
    color: Color.lightblue,
  },
  detailcontainer: {
    paddingHorizontal: 10,
  },
  box50: {
    width: '50%',
  },
  row: {
    ...Grid.row,
    paddingVertical: 5,
  },
  title: {
    fontSize: 18,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: fontFamily.ProximaAB,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 21,
    color: Color.black,
    paddingHorizontal: 3,
  },
  botttomborder: {
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    marginVertical: 5,
    paddingVertical: 8,
    marginHorizontal: 10,
  },
});

const tab3styles = StyleSheet.create({});
