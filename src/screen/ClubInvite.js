//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
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
import ClubApi from '../api/ClubApi';
import SuccessModal from '../components/SuccessModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

let firstLoad = true;
const ClubInvite = props => {
  const { clubid } = props?.route?.params;
  const trip = useSelector(state => state.trip.currentTrip);
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [users, setusers] = useState([]);
  const [showLoading, SetshowLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [inviteData, setInviteData] = useState([]);
  const [visible, setVisible] = useState(false);
  const onToggleSnackBar = () => setVisible(!visible);
  const onChangeSearch = query => setSearchQuery(query);
  const onDismissSnackBar = () => setVisible(false);
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const menuButtonClick = () => {
    navigation.goBack();
  };
  const [currentItem, setCurrentItem] = useState();
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  useEffect(() => {
    getUsers();
  }, [searchQuery]);

  const getUsers = async () => {
    try {
      const data = await ClubApi.getClubInviteMemberList(searchQuery, clubid);

      if (data?.length > 0) {
        setusers(JSON.parse(data));
      } else {
        setusers([]);
      }
    } catch (error) {
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
        <ScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{ paddingBottom: dynamicSize(80) }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={styles.viewContainer}>
            <View style={styles.ImageContainer}>
              {users.map((invitetem, i) => {
                if (invitetem?.id == user?.id) {
                  return null;
                }
                const index = inviteData.findIndex(
                  item => item?.invitedUserId == invitetem?.id,
                );
                const isSelected = index != -1;
                return (
                  <View key={i}>
                    <Pressable
                      style={[styles.passengerimgcontainer, styles.mt2]}
                      onPress={() => {
                        if (isSelected) {
                          setInviteData(data => {
                            return [...data].filter(
                              item => item?.invitedUserId !== invitetem?.id,
                            );
                          });
                          return;
                        }

                        const item = {
                          //tripId: trip?.id,
                          invitedUserId: invitetem?.id,
                          //isDriver: false,
                        };
                        setInviteData(i => {
                          const t = [...i];
                          t.push(item);
                          return t;
                        });
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          navigation.navigate('Profile', {
                            userId: invitetem?.id,
                          });
                        }}
                      >
                        <FastImage
                          source={{
                            uri: invitetem?.thumbnailProfileImage,
                            cache: FastImage.cacheControl.immutable,
                          }}
                          style={styles.profileimg}
                        />
                      </Pressable>

                      <View style={{ width: '75%' }}>
                        <Text style={styles.nametext}>
                          {invitetem?.firstName + ' ' + invitetem?.lastName}
                        </Text>
                        <Text style={styles.status}>
                          {getUserInfoText(invitetem)}

                          {/* {`${
                            (invitetem?.city ?? invitetem?.state) +
                            (', ' + invitetem?.country ?? '')
                          }\n${
                            userSkillLevel[invitetem?.surferSkillLevel ?? 0]
                          }, ${invitetem?.carOwner ? 'Driver' : 'Passenger'}`} */}
                        </Text>
                      </View>

                      <View style={{ width: '10%' }}>
                        {/* <FastImage
                                                        source={invitetem.profileimg}
                                                        style={styles.profileimg} /> */}
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
              })}
            </View>
          </View>
        </ScrollView>
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
            onPress={async () => {
              try {
                if (inviteData.length > 0) {
                  let memberid = [];
                  inviteData.map(item => {
                    memberid.push(item.invitedUserId);
                  });
                  let Userdata = {
                    ClubId: clubid,
                    UserId: memberid,
                  };
                  const data = await ClubApi.inviteFormember(Userdata, clubid);

                  setSuccess(true);
                  setSuccessDescription('invitation sent successfully');
                }
              } catch (error) {
              }
            }}
          />
        </View>
        <SuccessModal
          visible={success}
          onClose={() => {
            setSuccess(false);
            setIserror(false);
            navigation.goBack();
          }}
          description={successdescription}
          iserror={iserror}
        />
        <Snackbar
          style={{ backgroundColor: Color.black }}
          visible={visible}
          onDismiss={onDismissSnackBar}
          action={{
            label: 'Undo',
            color: Color.lightblue,
            onPress: () => {
              // Do something
            },
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
  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    borderRadius: 100,
    backgroundColor: Color.cardbg,
    borderRadius: 100,
    marginRight: 10,
    alignSelf: 'center',
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
export default ClubInvite;
