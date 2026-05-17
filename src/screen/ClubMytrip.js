//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { RoundButton } from '../components/Buttons';
import { Header } from '../components/Header';
import { Color, fontFamily, Grid, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import { InvitationsTab, MyTAb, SuggestedTab } from '../screen/ClubMytriptab';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

const ClubMytrip = () => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [showLoading, SetshowLoading] = useState(false);
  const [index, setIndex] = React.useState(0);

  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);
  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
  });

  const FirstRoute = () => <MyTAb />;
  const SecondRoute = () => <SuggestedTab />;
  const ThirdRoute = () => <InvitationsTab />;

  const [routes] = React.useState([
    { key: 'first', title: 'My' },
    { key: 'second', title: 'Suggested' },
    { key: 'third', title: 'Invitations' },
  ]);
  const BackButtonClick = () => {
    navigation.goBack();
  };
  const GotoOrganizetrip = () => {
    navigation.navigate('ClubOrganizetrip');
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
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={BackButtonClick}
          title={'My Trips'}
          notification={'6'}
          textAlign={'center'}
        />
        <Loader visible={showLoading} />
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
          title={'Organize a trip'}
          onPress={GotoOrganizetrip}
          disabled={!currentNetworkStatus}
          backgroundColor={!currentNetworkStatus ? Color.gray : Color.lightblue}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  labelStyle: {
    fontFamily: fontFamily.ProximaAB,
    textTransform: 'capitalize',
    fontSize: 14,
    lineHeight: 20,
  },
  tabcontainer: {
    marginHorizontal: '2%',
    marginTop: 10,
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
export default ClubMytrip;
