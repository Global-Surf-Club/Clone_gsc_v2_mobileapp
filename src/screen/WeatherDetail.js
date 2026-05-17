//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {useSelector} from 'react-redux';
import {Header} from '../components/Header';
import {Color, fontFamily} from '../constants/Constants';
import Loader from '../constants/Loader';
import {CurrentTab, DetailsTab, ExtendedTab} from '../screen/WeatherDetailsTab';
import {SafeAreaView} from 'react-native-safe-area-context';

const renderTabBar = props => (
  <TabBar
    {...props}
    activeColor={Color.white}
    inactiveColor={Color.lightblue}
    labelStyle={styles.labelStyle}
    indicatorStyle={{
      backgroundColor: Color.lightblue,
      height: '100%',
      borderRadius: 10,
    }}
    style={{
      backgroundColor: Color.lightGray,
      borderRadius: 10,
      marginHorizontal: '2%',
    }}
  />
);

const renderScene = SceneMap({
  first: () => <CurrentTab />,
  // first: () => null,
  second: () => <ExtendedTab />,
  // second: () => null,
  third: () => <DetailsTab />,
  // third: () => null
});

const WeatherDetail = () => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [showLoading, SetshowLoading] = useState(false);
  const [index, setIndex] = React.useState(0);
  const currentRegion = useSelector(state => state.trip.currentRegion);

  const BackButtonClick = () => {
    navigation.goBack();
  };
  const routes = [
    {key: 'first', title: 'Current'},
    {key: 'second', title: 'Extended'},
    {key: 'third', title: 'Details'},
  ];
  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        iconRight2={require('../assets/images/icon/home.png')}
        onPressLeft={BackButtonClick}
        // notification={'6'}
        title={currentRegion?.spot?.title ?? currentRegion?.name}
        // messagenotification={'6'}
        textAlign={'center'}
      />
      <Loader visible={showLoading} />
      <View style={styles.tabcontainer}>
        <TabView
          navigationState={{index, routes}}
          swipeEnabled={false}
          renderScene={renderScene}
          onIndexChange={setIndex}
          renderTabBar={renderTabBar}
          initialLayout={{width: layout.width}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  labelStyle: {
    fontFamily: fontFamily.ProximaAB,
    textTransform: 'capitalize',
    fontSize: 14,
    lineHeight: 20,
  },
  paperinput: {
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  textbtnstyle: {
    fontSize: 13,
    color: Color.black,
    fontWeight: '800',
  },
  inputcontainer: {
    paddingHorizontal: 15,
  },
  tabbartab1: {
    flex: 1,
    paddingVertical: 10,
  },
  tabcontainer: {
    // marginHorizontal: '2%',
    marginTop: 10,
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default WeatherDetail;
