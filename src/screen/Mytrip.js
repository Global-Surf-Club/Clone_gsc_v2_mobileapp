//import liraries
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, Text } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { RoundButton } from '../components/Buttons';
import { Header } from '../components/Header';
import { Color, fontFamily, Grid, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import { getFontSize } from '../constants/Responsive';
import { InvitationsTab, MyTAb, SuggestedTab } from '../screen/Mytriptab';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

const Mytrip = () => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const Routes = useRoute();
  const [showLoading, SetshowLoading] = useState(false);
  const [index, setIndex] = React.useState(Routes.params?.isInvite ? 2 : 0);
  const [istabbarclick, setistabbarclick] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  useEffect(() => {
    setIndex(Routes.params?.isInvite ? 2 : 0);
  }, [Routes]);

  const renderScene = SceneMap({
    first: () => (
      <MyTAb
        ListIndex={
          !Routes.params?.isInvite ? Routes?.params?.ListIndex : undefined
        }
        TripID={!Routes.params?.isInvite ? Routes?.params?.TargetID ?? 0 : 0}
      />
    ),
    second: () => <SuggestedTab />,
    third: () => (
      <InvitationsTab
        ListIndex={Routes.params?.isInvite ? Routes?.params?.ListIndex : 0}
        TripID={Routes.params?.isInvite ? Routes?.params?.TargetID ?? 0 : 0}
      />
    ),
  });

  const routes = [
    { key: 'first', title: 'My' },
    { key: 'second', title: 'Suggested' },
    { key: 'third', title: 'Invitations' },
  ];

  const BackButtonClick = () => {
    navigation.goBack();
  };
  const GotoOrganizetrip = () => {
    navigation.navigate('Organizetrip');
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
      style={{
        backgroundColor: Color.lightGray,
        borderRadius: 10,
        marginHorizontal: '2%',
      }}
      onTabPress={() => {
        //
        setistabbarclick(!istabbarclick);
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
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
            key={'tabview'}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={renderTabBar}
            initialLayout={{ width: layout.width }}
          />
        </View>
        <RoundButton title={'Organize a trip'} onPress={GotoOrganizetrip} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelStyle: {
    fontFamily: fontFamily.ProximaAB,
    textTransform: 'capitalize',
    fontSize: getFontSize(14),
    lineHeight: 20,
  },
  tabcontainer: {
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
export default Mytrip;
