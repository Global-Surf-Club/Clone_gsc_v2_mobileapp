import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Dimensions, Platform, StyleSheet, Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {List} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {Color, fontFamily} from '../constants/Constants';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import WavesInfoItem from './Item';
import Radiobtn from './Radiobtn';
import {
  getForecase,
  setCurrentRegion,
  setCurrentRegionForForecast,
  setCurrentSpotIdForForecast,
} from '../store/tripSlice';

const FavouriteSpotItem = ({spot, setLoader, loader}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const forecastData = useSelector(state => state.trip.averageForcast);
  const spotConfigration = useSelector(state => state.trip?.spotConfigration);

  const dispatch = useDispatch();
  const tideExtremesByday = useSelector(state => state.trip.tideExtremesByday);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    if (isExpanded) {
      if (!forecastData[spot?.id]) {
        setLoader(true);
        setIsLoading(true);
        dispatch(
          getForecase(spot?.id, () => {
            setLoader(false);
            setIsLoading(false);
          }),
        );
      }
    }
  }, [isExpanded]);

  const GotoDetail = data => {
    dispatch(setCurrentRegionForForecast(data));
    dispatch(setCurrentSpotIdForForecast(spot?.id));
    dispatch(
      setCurrentRegion({
        spot,
        id: spot?.regionId,
        name: spot?.title,
      }),
    );
    navigation.navigate('WeatherDetail');
    // navigation.navigate('ClubsubForcastTabItem');
  };
  const currentRegion = useSelector(state => state.trip.currentRegion);

  const withoutpropslist = [
    {
      key: spot?.id,
    },
  ];

  return (
    <List.Accordion
      theme={{colors: {background: 'transparent', primary: Color.black}}}
      style={styles.accordioncontainer}
      right={props => <></>}
      onPress={() => {}}
      titleStyle={styles.accordiontitleMain}
      title={spot?.regionName ?? 'unknown'}>
      <View>
        <List.Accordion
          theme={{colors: {background: 'transperent'}}}
          style={[styles.accordioncontainer2, {marginLeft: 15}]}
          // right={props => (<></>)}
          right={props => (
            <Radiobtn
              key={currentRegion?.spot?.id ?? 0}
              isSelected={currentRegion?.spot?.id ?? {}}
              PROP={withoutpropslist}
              setValue={() => {
                setIsExpanded(v => !v);
                dispatch(
                  setCurrentRegion({
                    spot,
                    id: spot?.regionId,
                    name: spot?.title,
                  }),
                );
              }}
            />
          )}
          titleStyle={[styles.subaccordiontitle, {color: Color.lightblue}]}
          onPress={() => {
            setIsExpanded(v => !v);
            dispatch(
              setCurrentRegion({
                spot,
                id: spot?.regionId,
                name: spot?.title,
              }),
            );
          }}
          title={spot?.title}>
          {isExpanded ? (
            <FlatList
              horizontal={true}
              data={forecastData[spot?.id] ?? []}
              // data={[]}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatlist}
              renderItem={({item, index}) => (
                <WavesInfoItem
                  tideExtremesByday={tideExtremesByday[spot?.id] ?? []}
                  onCardClick={() => {
                    GotoDetail(item);
                  }}
                  spotConfigration={spotConfigration}
                  width={230}
                  marginHorizontal={5}
                  item={item}
                  key={index}
                />
              )}
              ListEmptyComponent={() => {
                if (isLoading) {
                  return null;
                }
                return (
                  <Text
                    style={{
                      alignSelf: 'center',
                      width: Dimensions.get('screen').width,
                      textAlign: 'center',
                      color: 'black',
                      // marginVertical: dynamicSize(10),
                      marginTop: 10,
                      marginBottom: 10,
                      fontFamily: fontFamily.ProximaAL,
                    }}>
                    Forecast not available
                  </Text>
                );
              }}
              keyExtractor={({item}, index) => index.toString()}
            />
          ) : null}
        </List.Accordion>
      </View>
    </List.Accordion>
  );
};

export default FavouriteSpotItem;

const styles = StyleSheet.create({
  accordiontitleMain: {
    fontFamily:
      Platform.OS == 'android' ? fontFamily.ProximaBold : fontFamily.ProximaR,
    // lineHeight:getLineSize(24),
    fontSize: getFontSize(16),
    paddingHorizontal: '3%',
  },
  searchbar: {
    borderRadius: 10,
    height: 40,
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
    paddingBottom: 10,
    paddingTop: 5,
  },
  listtextstyle: {
    fontFamily: fontFamily.ProximaR,
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
  },
  listItemstyle: {
    marginHorizontal: 20,
    borderBottomColor: Color.lightGray,
    borderBottomWidth: 1,
    // paddingVertical: 10,
  },
  citycintainer: {},
  accordiontitle: {
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(24),
    fontSize: getFontSize(16),
    paddingHorizontal: '1%',
  },
  subaccordiontitle: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaR,
    paddingHorizontal: '1%',
    color: Color.black0,
    marginLeft: dynamicSize(10),
  },
  accordioncontainer: {
    backgroundColor: Color.white,
    borderBottomWidth: 1,
    paddingVertical: dynamicSize(5),
    borderBottomColor: Color.lightGray,
    borderRadius: 100,
  },
  accordioncontainer2: {
    backgroundColor: Color.white,
    marginVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderRadius: 100,
  },
  viewContainer: {
    // paddingHorizontal: '5%',
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});
