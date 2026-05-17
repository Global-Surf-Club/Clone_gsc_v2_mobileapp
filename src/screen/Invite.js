//import liraries
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Searchbar, Snackbar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import Trip from '../api/Trip';
import { RoundButton } from '../components/Buttons';
import { Header } from '../components/Header';
import { Color, fontFamily, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';
import ClubsAPi from '../api/ClubApi';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPendingList } from '../store/tripSlice';
import { getSearchUserData } from '../store/authSlice';
import FastImage from 'react-native-fast-image';

let firstLoad = true;
const Invite = () => {
  const route = useRoute();
  const trip = useSelector(state => state.trip.currentTrip);
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const { clubid } = route?.params;

  const dispatch = useDispatch();
  const users = useSelector(state => state?.auth?.searchedUsers);
  const [clubUsers, setClubUsers] = useState([]);
  const [showLoading, SetshowLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [inviteData, setInviteData] = useState([]);
  const [visible, setVisible] = useState(false);
  const onToggleSnackBar = () => setVisible(!visible);
  const onChangeSearch = query => setSearchQuery(query);
  const onDismissSnackBar = () => setVisible(false);
  const [isInviteProgress, setisInviteProgress] = useState(false);
  const menuButtonClick = () => {
    navigation.goBack();
  };
  const [currentItem, setCurrentItem] = useState();
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  useEffect(() => {
    if (clubid === '-999') {
      getUsers();
    } else if (
      clubid !== '-999' &&
      clubid !== null &&
      clubid !== undefined &&
      clubid !== ''
    ) {
      getClubActiveMemeberList();
    }
  }, [searchQuery]);

  const getUsers = () => {
    if (firstLoad) {
      firstLoad = false;
      SetshowLoading(true);
    }
    dispatch(
      getSearchUserData(searchQuery, () => {
        SetshowLoading(false);
      }),
    );
  };
  const getClubActiveMemeberList = async () => {
    try {
      if (user !== null) {
        SetshowLoading(false);
        const repsone = await ClubsAPi.getAllclubsActivememebers(
          searchQuery,
          clubid,
        );

        if (repsone) {
          setClubUsers(JSON.parse(repsone));
        }
        SetshowLoading(false);
      }
    } catch (error) {
      SetshowLoading(false);
    }
  };
  const GotoInvite = () => {
    navigation.navigate('Invite');
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          title="Invite"
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={menuButtonClick}
          notification={'6'}
          textAlign={'center'}
        />

        <Loader visible={showLoading} />
        <View style={styles.searchcontainer}>
          <Searchbar
            placeholder=""
            selectionColor={Color.gray}
            onChangeText={onChangeSearch}
            value={searchQuery}
            inputStyle={styles.inputStyle}
            style={styles.searchbar}
          />
        </View>
        <FlashList
          data={clubid === '-999' ? users : clubUsers}
          keyExtractor={(item, i) => item?.id?.toString() || i.toString()}
          extraData={inviteData}
          renderItem={({ item, index }) => {
            if (item?.id === user?.id) {
              return null;
            }

            const indexInInviteData = inviteData.findIndex(
              inviteItem => inviteItem?.invitedUserId === item?.id,
            );
            const isSelected = indexInInviteData !== -1;

            return (
              <View key={index}>
                <Pressable
                  style={[styles.passengerimgcontainer, styles.mt2]}
                  onPress={() => {
                    if (isSelected) {
                      setInviteData(data => {
                        return [...data].filter(
                          inviteItem => inviteItem?.invitedUserId !== item?.id,
                        );
                      });
                      return;
                    }

                    const inviteItem = {
                      tripId: trip?.id,
                      invitedUserId: item?.id,
                      isDriver: false,
                    };
                    setInviteData(prevData => {
                      const newData = [...prevData];
                      newData.push(inviteItem);
                      return newData;
                    });
                  }}
                >
                  <View style={styles.profileimgcontainer}>
                    <Pressable
                      onPress={() => {
                        navigation.navigate('Profile', {
                          userId: item?.id,
                        });
                      }}
                    >
                      <FastImage
                        source={{
                          uri: item?.thumbnailProfileImage,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.profileimg}
                      />
                    </Pressable>
                  </View>
                  <View style={{ width: '75%' }}>
                    <Text style={styles.nametext}>
                      {item?.firstName + ' ' + item?.lastName}
                    </Text>
                    <Text style={styles.status}>
                      {getUserInfoText(item)}
                      {/* Additional user info can be added here */}
                    </Text>
                  </View>

                  <View style={{ width: '10%' }}>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name={'check'}
                        size={30}
                        color={Color.lightblue}
                      />
                    )}
                  </View>
                </Pressable>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: dynamicSize(80) }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={100} // Estimate the size of each row for performance optimization
        />
        <View>
          {/* <RoundborderButton
            title={'Done'}
            onPress={() => {
              navigation.goBack();
            }}
          /> */}
          <RoundButton
            title={'Invite'}
            backgroundColor={Color.green}
            disabled={isInviteProgress}
            isInviteProgress={isInviteProgress}
            onPress={async () => {
              setisInviteProgress(true);
              for (let index = 0; index < inviteData.length; index++) {
                const item = inviteData[index];
                let tep = {
                  invitedUserId: item?.invitedUserId,
                  isDriver: item?.isDriver,
                  tripId: item?.tripId,
                  clubId: clubid,
                };

                try {
                  const data = await Trip.inviteForTrip(tep);
                } catch (error) {
                }
              }
              dispatch(getPendingList(trip?.id));
              setisInviteProgress(false);
              navigation.goBack();
            }}
          />
        </View>

        <Snackbar
          style={{ backgroundColor: Color.black }}
          visible={visible}
          onDismiss={onDismissSnackBar}
          action={{
            label: 'Undo',
            color: Color.lightblue,
            onPress: () => {},
          }}
        >
          Delete
        </Snackbar>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
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
  },
  modalView: {
    backgroundColor: Color.white,
    paddingVertical: 10,
    borderRadius: 10,
    textAlign: 'center',
  },
  nametext: {
    color: Color.black,
    ...text.usernameboldtitle,
    flex: 1,
    flexWrap: 'wrap',
  },
  status: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(16),
  },
  mt2: {
    marginTop: 10,
  },
  profileimgcontainer: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: Color.cardbg,
    borderRadius: 100,
    overflow: 'hidden',
  },
  profileimg: {
    width: dynamicSize(95),
    height: dynamicSize(95),
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
    paddingBottom: 10,
    paddingTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
    paddingBottom: 10,
  },
});

//make this component available to the app
export default Invite;
