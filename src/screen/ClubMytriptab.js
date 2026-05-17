//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Image} from 'react-native';
import {Communityinfo} from '../components/CommunityItems';
import FastImage from 'react-native-fast-image';

export const MyTAb = () => {
  const navigation = useNavigation();
  const [CommunityinfoItemList, SetCommunityinfoItemList] = useState([
    {
      id: 1,
      username: 'Test 121',
      profileimage: require('../assets/images/icon/Surfboard.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'London Bridge, Greater London,London',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
    {
      id: 2,
      username: 'Test 1',
      profileimage: require('../assets/images/icon/Surfboard.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'London Bridge, Greater London,London',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
    {
      id: 3,
      username: 'Test 2',
      profileimage: require('../assets/images/icon/Surfboard.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'London Bridge, Greater London,London',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
    {
      id: 4,
      username: 'Test 3',
      profileimage: require('../assets/images/icon/Surfboard.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'London Bridge, Greater London,London',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
  ]);
  const GotoTripDetail = () => {
    navigation.navigate('TripDetail');
  };
  return (
    <View style={styles.tabbartab1}>
      <FlatList
        horizontal={false}
        data={CommunityinfoItemList}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatlist}
        renderItem={({item}, index) => (
          <Communityinfo
            onCardClick={GotoTripDetail}
            marginHorizontal={5}
            item={item}
            key={index}
          />
        )}
        keyExtractor={({item}, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabbartab1: {
    marginVertical: 10,
  },
});

//make this component available to the app
export const SuggestedTab = () => {
  const navigation = useNavigation();
  const GotoTripDetail = () => {
    navigation.navigate('TripDetail');
  };
  const [CommunityinfoItemList, SetCommunityinfoItemList] = useState([
    {
      id: 1,
      username: 'Test1',
      profileimage: require('../assets/images/icon/Surfboard.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'London Bridge, Greater London,London',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
    {
      id: 2,
      username: 'Test2',
      profileimage: require('../assets/images/icon/Surfboard.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'London Bridge, Greater London,London',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
    {
      id: 3,
      username: 'Test3',
      profileimage: require('../assets/images/icon/Surfboard.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'London Bridge, Greater London,London',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
    {
      id: 4,
      username: 'Test4',
      profileimage: require('../assets/images/icon/Surfboard.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'London Bridge, Greater London,London',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
  ]);

  return (
    <View style={tab2styles.tabbartab1}>
      <FlatList
        horizontal={false}
        data={CommunityinfoItemList}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tab2styles.flatlist}
        renderItem={({item}, index) => (
          <Communityinfo
            onCardClick={GotoTripDetail}
            marginHorizontal={5}
            item={item}
            key={index}
          />
        )}
        keyExtractor={({item}, index) => index.toString()}
      />
    </View>
  );
};

const tab2styles = StyleSheet.create({
  tabbartab1: {
    marginVertical: 10,
  },
});

//make this component available to the app
export const InvitationsTab = () => {
  return (
    <View style={Invitationsstyle.tabbartab1}>
      <View style={Invitationsstyle.logocontainer}>
        <FastImage
          source={require('../assets/images/logo.png')}
          style={Invitationsstyle.profileimg}
        />
      </View>
    </View>
  );
};

const Invitationsstyle = StyleSheet.create({
  logocontainer: {},
  tabbartab1: {
    // backgroundColor: Color.white,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  profileimg: {
    height: 120,
    width: 120,
    borderRadius: 100,
    alignSelf: 'center',
    opacity: 0.2,
  },
});
