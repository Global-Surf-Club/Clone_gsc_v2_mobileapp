//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { RoundButton } from '../components/Buttons';
import { Header } from '../components/Header';
import { Color, fontFamily, Grid, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { AllTab, MyOrganiser } from './EventHomeTabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

const EventHomeMain = props => {
  const FirstRoute = () => <AllTab EventIDH={EventIDH} ListIndex={ListIndex} />;
  const SecondRoute = () => <MyOrganiser EventIDH={EventIDH} />;

  const navigation = useNavigation();
  const layout = useWindowDimensions();

  const [showLoading, SetshowLoading] = useState(false);
  const [index, setIndex] = React.useState(
    props?.route?.params?.index == 1 ? 1 : 0,
  );
  const [EventIDH, setEventIDH] = useState(
    props?.route?.params?.EventIDH ? props?.route?.params?.EventIDH : undefined,
  );
  const [ListIndex, setListIndex] = useState(
    props?.route?.params?.ListIndex ? props?.route?.params?.ListIndex : 0,
  );
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);
  // const renderScene = SceneMap({
  //     first: FirstRoute,
  //     second: SecondRoute,
  // });
  const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'first':
        return <AllTab EventIDH={EventIDH} ListIndex={ListIndex} />;
      case 'second':
        return <MyOrganiser EventIDH={EventIDH} />;
    }
  };

  const [routes] = React.useState([
    { key: 'first', title: 'All Events' },
    { key: 'second', title: 'My Events' },
  ]);

  const BackButtonClick = () => {
    navigation.goBack();
  };

  const gotoCreateClub = () => {
    let clubid = -999;
    let isPublish = 'isPublish';
    navigation.navigate('CreateEvent', { clubid, isPublish });
  };
  useEffect(() => {
    setIndex(props?.route?.params?.index == 1 ? 1 : 0);
    setEventIDH(
      props?.route?.params?.EventIDH
        ? props?.route?.params?.EventIDH
        : undefined,
    );
  }, [props]);
  const renderTabBar = props => (
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
      style={{ backgroundColor: Color.lightGray, borderRadius: 10 }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Header
          // iconleft={require('../assets/images/icon/ic_back.png')}
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={BackButtonClick}
          title={'Events'}
          notification={'6'}
          // messagenotification={'6'}
          textAlign={'center'}
        />

        <View style={styles.tabcontainer}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={renderTabBar}
            initialLayout={{ width: layout.width }}
          />
        </View>
        <RoundButton
          title={'Create An Event'}
          onPress={gotoCreateClub}
          disabled={!currentNetworkStatus}
          backgroundColor={!currentNetworkStatus ? Color.gray : Color.lightblue}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  labelStyle: {
    fontFamily: fontFamily.ProximaAB,
    textTransform: 'capitalize',
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
  },
  tabcontainer: {
    marginHorizontal: '2%',
    marginTop: dynamicSize(10),
    flex: 1,
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

//make this component available to the app
export default EventHomeMain;
