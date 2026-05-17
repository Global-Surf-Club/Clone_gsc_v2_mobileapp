//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { IconButton, RoundButton } from '../../components/Buttons';
import { Header } from '../../components/Header';
import { Color, fontFamily, Grid, text } from '../../constants/Constants';
import { dynamicSize, getFontSize } from '../../constants/Responsive';
import { SponsorsTab, BusinessesTab } from './SponsorsHomeTab';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

const SponsorsHomeMain = props => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(
    props?.route?.params?.index == 1 ? 1 : 0,
  );
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);
  const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'first':
        return <SponsorsTab />;
      case 'second':
        return <BusinessesTab />;
    }
  };

  const [routes] = React.useState([
    { key: 'first', title: 'Sponsors' },
    { key: 'second', title: 'Businesses' },
  ]);

  const BackButtonClick = () => {
    navigation.goBack();
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
            iconRight={require('../../assets/images/icon/chatting.png')}
            iconRight1={require('../../assets/images/icon/bell1.png')}
            iconRight2={require('../../assets/images/icon/home.png')}
            onPressLeft={BackButtonClick}
            title={'Sponsors'}
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
          <IconButton
            onPress={() => {
              navigation.navigate('CreateSponsor', {
                businessDetails: '',
                index: index,
              });
            }}
            disabled={!currentNetworkStatus}
            backgroundColor={!currentNetworkStatus ? Color.gray : Color.primary}
          />
        </View>
        {/* <RoundButton title={index == '0' ? 'Create Sponsors' : 'Create Business'} onPress={() => { navigation.navigate('CreateSponsor', { businessDetails: '' }) }} /> */}
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
export default SponsorsHomeMain;
