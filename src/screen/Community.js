//import liraries
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import CommunityTab from '../components/CommunityTab';
import ForumTab from '../components/ForumTab';
import { Header } from '../components/Header';
import { Color, fontFamily } from '../constants/Constants';
import { getFontSize } from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

const Community = () => {
  const navigation = useNavigation();
  const Routes = useRoute();
  const [state, setState] = useState(true);
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(Routes?.params?.isForum ? 1 : 0);

  useEffect(() => {
    navigation.addListener('focus', () => {
      setState(true);
    });
    navigation.addListener('blur', () => {
      setState(false);
    });
  }, []);

  const menuButtonClick = () => {
    navigation.goBack();
  };

  const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'first':
        return (
          <CommunityTab
            state={state}
            ListIndex={
              !Routes?.params?.isForum
                ? Routes?.params?.ListIndex
                  ? Routes?.params?.ListIndex
                  : 'NoIndex'
                : 0
            }
            TripID={
              !Routes?.params?.isForum
                ? Routes?.params?.TargetID
                  ? Routes?.params?.TargetID
                  : 0
                : 0
            }
          />
        );
      case 'second':
        return (
          <ForumTab
            state={state}
            ListIndex={
              Routes?.params?.isForum
                ? Routes?.params?.ListIndex
                  ? Routes?.params?.ListIndex
                  : 'NoIndex'
                : 0
            }
            ForumID={
              Routes?.params?.isForum
                ? Routes?.params?.TargetID
                  ? Routes?.params?.TargetID
                  : 0
                : 0
            }
          />
        );
    }
  };

  const routes = [
    { key: 'first', title: 'Community' },
    { key: 'second', title: 'FORUM' },
  ];

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
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        iconRight2={require('../assets/images/icon/home.png')}
        onPressLeft={menuButtonClick}
        notification={'6'}
        title={'Community'}
        textAlign={'center'}
      />
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
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
  labelStyle: {
    fontFamily: fontFamily.ProximaAB,
    textTransform: 'capitalize',
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  tabcontainer: {
    marginTop: 10,
    flex: 1,
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
    // paddingBottom: 10,
    paddingTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  tabbartab1: {
    marginVertical: 10,
  },
  inputcontainer: {
    paddingHorizontal: 20,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,

    backgroundColor: Color.lightGray,
    borderRadius: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
  },
  btnText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 20,
  },
  modalbtntext: {
    textAlign: 'center',
    fontSize: 17,
    fontFamily: fontFamily.ProximaR,
    fontWeight: '400',
    color: Color.lightblue,
  },
  divider: {
    marginVertical: 13,
    height: 1.5,
    backgroundColor: Color.cardbg,
  },
  modalbutton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  modaltext: {
    fontSize: 13,
    color: Color.gray,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 18,
  },
  modaltitle: {
    color: Color.gray,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 18,
  },
  bottommodal: {
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: Color.black.concat('50'),
  },
  modalView: {
    backgroundColor: Color.white,
    paddingVertical: 10,
    borderRadius: 10,
    textAlign: 'center',
  },
  mt2: {
    marginTop: 10,
  },
  profileimg: {
    width: 50,
    height: 50,
    borderRadius: 100,
    marginRight: 10,
    alignSelf: 'center',
    backgroundColor: Color.gray,
  },
  passengerimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    borderBottomColor: Color.cardbg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },

  searchbar: {
    borderRadius: 10,
    // height: 40,
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  inputStyle: {
    paddingVertical: 0,
  },
  // searchcontainer: {
  //   paddingHorizontal: 8,
  //   borderBottomColor: Color.cardbg,
  //   borderBottomWidth: 1,
  //   paddingBottom: 10,
  //   paddingTop: 5,
  // },
  // container: {
  //   flex: 1,
  //   backgroundColor: Color.white,
  //   paddingBottom: 10,
  // },
  offlineIndicator: {
    backgroundColor: Color.lightblue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 6,
    fontFamily: fontFamily.ProximaAB,
  },

  // Sync Info
  syncInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
  },
  syncInfoText: {
    fontSize: 11,
    color: Color.gray,
    marginLeft: 4,
    fontFamily: fontFamily.ProximaR,
  },
});

//make this component available to the app

export default Community;
