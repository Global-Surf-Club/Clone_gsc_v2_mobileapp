//import liraries
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {Header} from '../components/Header';
import {Color, fontFamily} from '../constants/Constants';
import Loader from '../constants/Loader';
import {getFontSize} from '../constants/Responsive';
import {AllGSCMember, ChatMember} from '../screen/GSCMemberTab';
import { SafeAreaView } from 'react-native-safe-area-context';

const FirstRoute = () => <AllGSCMember />;
const SecondRoute = () => <ChatMember />;

const GSCMembers = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const BackButtonClick = () => {
    navigation.goBack();
  };

  const layout = useWindowDimensions();
  const [showLoading, SetshowLoading] = useState(false);
  const [index, setIndex] = React.useState(route.params?.isMessage ? 1 : 0);
  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });
  const [routes] = React.useState([
    {key: 'first', title: 'All GSC Member'},
    {key: 'second', title: 'Chat Member'},
  ]);
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
        onPressLeft={BackButtonClick}
        title={index === 0 ? 'GSC All Member' : 'Chat messages'}
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
    textTransform: 'none',
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
  },
  paperinput: {
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  textbtnstyle: {
    fontSize: getFontSize(13),
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
export default GSCMembers;
