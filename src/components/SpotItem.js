import {Dimensions, FlatList, StyleSheet, Text, View} from 'react-native';
import React, {memo, useEffect, useState} from 'react';
import {List} from 'react-native-paper';
import Radiobtn from './Radiobtn';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Loader from '../constants/Loader';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import WavesInfoItem from './Item';
import {Color, fontFamily} from '../constants/Constants';
import {
  getForecase,
  setCurrentRegion,
  setCurrentRegionForForecast,
  setCurrentSpotIdForForecast,
} from '../store/tripSlice';

const SpotItem = ({region, spot = {}, searchQuery = '', index, isSponsor}) => {
  const currentRegion = useSelector(state => state.trip.currentRegion);
  const navigation = useNavigation();
  const forecastData = useSelector(state => state.trip.averageForcast);
  const tideExtremesByday = useSelector(state => state.trip.tideExtremesByday);
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();
  const withoutpropslist = [
    {
      key: spot.id,
    },
  ];
  const spotConfigration = useSelector(state => state.trip?.spotConfigration);
  const GotoDetail = data => {
    dispatch(setCurrentRegionForForecast(data));
    dispatch(setCurrentSpotIdForForecast(spot?.id));
    const newData = {...region};
    newData.spotList = [];
    newData.spot = spot;
    newData.children = [];
    dispatch(setCurrentRegion(newData));
    navigation.navigate('WeatherDetail');
  };

  useEffect(() => {
    if (isSponsor) {
      getForecastData();
      const newData = {...region};
      newData.spotList = [];
      newData.spot = {...spot};
      newData.children = [];
      dispatch(setCurrentRegion(newData));
    }
  }, [isSponsor]);

  const getForecastData = () => {
    if (spot) {
      if (!forecastData[spot?.id]) {
        setLoader(true);
        dispatch(
          getForecase(spot?.id, () => {
            setLoader(false);
          }),
        );
      }
    }
  };

  return (
    <List.Accordion
      // expanded={searchQuery.length > 0 ? true : undefined}
      theme={{colors: {background: 'transparent'}}}
      style={[styles.accordioncontainer2, {marginLeft: index * 15}]}
      // right={props => (<></>)}
      right={props => (
        <Radiobtn
          key={currentRegion?.spot?.id ?? 0}
          isSelected={currentRegion?.spot?.id ?? 0}
          PROP={withoutpropslist}
        />
      )}
      titleStyle={[styles.subaccordiontitle, {color: Color.lightblue}]}
      onPress={() => {
        getForecastData();
        const newData = {...region};
        newData.spotList = [];
        newData.spot = {...spot};
        newData.children = [];
        dispatch(setCurrentRegion(newData));
      }}
      title={spot?.title}>
      <View style={[styles.citycintainer]}>
        {loader ? (
          <View style={{height: dynamicSize(150)}}>
            <Loader visible={loader} />
          </View>
        ) : (
          <FlatList
            horizontal={true}
            data={forecastData[spot?.id] ?? []}
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
              if (loader) {
                return null;
              }
              return (
                <Text
                  style={{
                    alignSelf: 'center',
                    width: Dimensions.get('screen').width,
                    color: 'black',
                    textAlign: 'center',
                    marginTop: 10,
                    marginBottom: 10,
                    fontFamily: fontFamily.ProximaAL,
                    // backgroundColor:Color.GSCbg
                  }}>
                  Forecast not available
                </Text>
              );
            }}
            keyExtractor={({item}, index) => index.toString()}
          />
        )}
      </View>
    </List.Accordion>
  );
};

export default memo(SpotItem);

const styles = StyleSheet.create({
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
    paddingVertical: 10,
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
    fontFamily: fontFamily.ProximaAB,
    paddingHorizontal: '1%',
    color: Color.black0,
    marginLeft: dynamicSize(10),
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
  },
  viewContainer: {
    // paddingHorizontal: '5%',
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});
