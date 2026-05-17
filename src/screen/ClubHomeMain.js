//import liraries
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { RoundButton } from '../components/Buttons';
import { Header } from '../components/Header';
import { Color, fontFamily, Grid, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { AllTab, MyOrganiser } from './ClubHomeTabs';
import { useDispatch, useSelector } from 'react-redux';
import ClubApi from '../api/ClubApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

const ClubHomeMain = () => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const Route = useRoute();
  const [CreateClubcomfirmation, setCreateClubcomfirmation] = useState(false);
  const [index, setIndex] = React.useState(Route?.params?.isIndex ? 1 : 0);
  const [ListIndex, setListIndex] = React.useState(
    Route?.params?.ListIndex ? Route?.params?.ListIndex : 0,
  );

  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const FirstRoute = () => (
    <AllTab
      ListIndex={Route?.params?.ListIndex}
      ClubID={Route?.params?.ClubID}
    />
  );
  const SecondRoute = () => <MyOrganiser />;

  useEffect(() => {
    GetCreteClubConfirmation();
  }, []);

  const GetCreteClubConfirmation = async () => {
    try {
      const response = await ClubApi.getCreteClubConfirmation();
      if (response) {
        setTimeout(
          () => {
            setCreateClubcomfirmation(JSON.parse(response));
          },
          Platform.OS === 'ios' ? 300 : 0,
        );
      }
    } catch (error) {
     }
  };

  const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'first':
        return (
          <AllTab
            ListIndex={Route?.params?.ListIndex}
            ClubID={Route?.params?.ClubID}
          />
        );
      case 'second':
        return <MyOrganiser />;
    }
  };

  const [routes] = React.useState([
    { key: 'first', title: 'All Clubs' },
    { key: 'second', title: 'My Clubs' },
  ]);

  const BackButtonClick = () => {
    navigation.goBack();
  };

  const gotoCreateClub = () => {
    navigation.navigate('CreateClub', { ClubsDetail: '' });
  };

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
    <>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <Header
            backbutton={'chevron-left-circle'}
            iconRight={require('../assets/images/icon/chatting.png')}
            iconRight1={require('../assets/images/icon/bell1.png')}
            iconRight2={require('../assets/images/icon/home.png')}
            onPressLeft={BackButtonClick}
            title={'Club'}
            notification={'6'}
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
          {CreateClubcomfirmation ? (
            <RoundButton
              title={'Create a club'}
              onPress={() => {
                gotoCreateClub();
              }}
              disabled={!currentNetworkStatus}
              backgroundColor={
                !currentNetworkStatus ? Color.gray : Color.lightblue
              }
            />
          ) : (
            <></>
          )}
          {/* <View style={{paddingVertical:30,}}></View> */}
        </View>
      </SafeAreaView>
    </>
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
export default ClubHomeMain;
