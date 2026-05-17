//import liraries
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {Header} from '../components/Header';

import {Forecast, Infotab} from '../screen/OrganizeTabs';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {useSelector} from 'react-redux';
import {Color, fontFamily} from '../constants/Constants';
import Loader from '../constants/Loader';
import {SafeAreaView} from 'react-native-safe-area-context';

const FirstRoute = () => <Infotab />;
const SecondRoute = () => {
  // const forecastData = useSelector(state => state.trip.forecastData);
  const forecastData = useSelector(state => state.trip.averageForcast);

  const currentRegion = useSelector(state => state.trip.currentRegion);

  return (
    <Forecast forecastData={forecastData[currentRegion?.spot?.id] ?? []} />
  );
};

const OrganizeForm = () => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const route = useRoute();
  const [showLoading, SetshowLoading] = useState(false);
  const [index, setIndex] = React.useState(0);

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  const [routes] = React.useState([
    {key: 'first', title: 'Info'},
    {key: 'second', title: 'Forecast'},
  ]);
  const menuButtonClick = () => {
    navigation.openDrawer();
  };
  const BackButtonClick = () => {
    navigation.goBack();
  };
  const renderTabBar = props => {
    return (
      <TabBar
        {...props}
        bounces
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        iconRight2={require('../assets/images/icon/home.png')}
        onPressLeft={BackButtonClick}
        title={route.params?.item ? 'Edit Trip' : 'Organize'}
        notification={'6'}
        // messagenotification={'6'}
        textAlign={'center'}
      />
      <Loader visible={showLoading} />
      <View style={styles.tabcontainer}>
        <TabView
          navigationState={{index, routes}}
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
export default OrganizeForm;
