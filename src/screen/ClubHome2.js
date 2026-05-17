//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Image} from 'react-native';
import {RoundButton} from '../components/Buttons';
import {Header} from '../components/Header';
import {Color, fontFamily, Shadow} from '../constants/Constants';
import Loader from '../constants/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

const ClubHome = () => {
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [join, setjoin] = useState(false);
  const [selection, setSelection] = useState(1);

  const [searchQuery, setSearchQuery] = React.useState('');

  const [ClubsItemList, SetClubsItemList] = useState([
    {
      id: 1,
      tripname: 'Livornon Surf Club',
      profileimage: require('../assets/images/clublogo.png'),
      triptext: 'Livornon,Italy',
      active: false,
      isselect: true,
    },
    {
      id: 2,
      tripname: 'Livornon Surf Club',
      profileimage: require('../assets/images/clublogo.png'),
      triptext: 'Livornon,Italy',
      active: true,
    },
    {
      id: 3,
      tripname: 'Livornon Surf Club',
      profileimage: require('../assets/images/clublogo.png'),
      triptext: 'Livornon,Italy',
      active: false,
      isselect: false,
    },
    {
      id: 4,
      tripname: 'Livornon Surf Club',
      profileimage: require('../assets/images/clublogo.png'),
      triptext: 'Livornon,Italy',
    },
  ]);
  const onunfriend = i => {
    let data = [...ClubsItemList];
    let Datainfo = data[i];
    if (Datainfo != null && Datainfo != join && Datainfo != '') {
      Datainfo.isselect = true;
      data[i] = Datainfo;
    }
    SetClubsItemList(data);
  };
  const onfriend = i => {
    let data = [...ClubsItemList];
    let Datainfo = data[i];
    if (Datainfo != null && Datainfo != join && Datainfo != '') {
      Datainfo.isselect = false;
      data[i] = Datainfo;
    }
    SetClubsItemList(data);
  };
  const onChangeSearch = query => setSearchQuery(query);

  const menuButtonClick = () => {
    navigation.goBack();
  };
  const gotoCreateClub = () => {
    navigation.navigate('CreateClub');
  };
  const GotoClubProfile = () => {
    navigation.navigate('ClubProfile');
  };
  return (
    <>
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={menuButtonClick}
          notification={'6'}
          title={'Club'}
          textAlign={'center'}
        />
        <Loader visible={showLoading} />
        {/* <View style={styles.searchcontainer}>
                    <Searchbar
                        placeholder=""
                        selectionColor={Color.gray}
                        onChangeText={onChangeSearch}
                        value={searchQuery}
                        inputStyle={styles.inputStyle}
                        style={styles.searchbar}
                    />
                </View> */}
        <View style={[styles.inputcontainer, styles.mt0]}>
          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={[
                styles.btn,
                selection === 1
                  ? {backgroundColor: Color.lightblue, ...Shadow.boxShadow}
                  : null,
              ]}
              onPress={() => setSelection(1)}>
              <Text
                style={[
                  styles.btnText,
                  selection === 1 ? {color: 'white'} : null,
                ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                selection === 2
                  ? {backgroundColor: Color.lightblue, ...Shadow.boxShadow}
                  : null,
              ]}
              onPress={() => setSelection(2)}>
              <Text
                style={[
                  styles.btnText,
                  selection === 2 ? {color: 'white'} : null,
                ]}>
                My (Organiser)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          bounces={true}
          alwaysBounceVertical={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}>
          <View style={styles.viewContainer}>
            {/* Trip clubs */}
            {ClubsItemList.map((item, i) => {
              return (
                <Pressable
                  onPress={GotoClubProfile}
                  style={[styles.cardView]}
                  key={i}>
                  <View style={styles.row}>
                    <View style={styles.box40}>
                      <View style={styles.clubimgcontainer}>
                        <FastImage
                          source={item.profileimage}
                          style={styles.clubprofileimg}
                        />
                      </View>
                    </View>
                    <View style={styles.box60}>
                      <View>
                        <Text style={styles.clubicontext}>{item.tripname}</Text>
                        {item.triptext ? (
                          <Text style={styles.clubsubtext}>
                            {item.triptext}
                          </Text>
                        ) : (
                          <></>
                        )}
                      </View>
                      <View style={styles.buttoncontainer}>
                        {item.active === false ? (
                          <>
                            {item.isselect === false ? (
                              <Pressable
                                onPress={() => onunfriend(i)}
                                style={[
                                  styles.readbtn,
                                  {backgroundColor: Color.lightblue},
                                ]}>
                                <Text style={styles.readtext}>Join</Text>
                              </Pressable>
                            ) : (
                              <Pressable
                                onPress={() => onfriend(i)}
                                style={[
                                  styles.readbtn,
                                  {backgroundColor: Color.lightGray},
                                ]}>
                                <Text style={styles.readtext}>Requested</Text>
                              </Pressable>
                            )}
                          </>
                        ) : (
                          <Pressable
                            style={[
                              styles.readbtn,
                              {backgroundColor: Color.green},
                            ]}>
                            <Text style={styles.readtext}>Active</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.rightbox}>
                    <View style={styles.rowcontainer}>
                      <Text style={styles.datalable}>
                        Trips <Text style={styles.dataitem}>4545</Text>
                      </Text>
                    </View>
                    <View style={styles.rowcontainer}>
                      <Text style={styles.datalable}>
                        Reports <Text style={styles.dataitem}>45</Text>{' '}
                      </Text>
                    </View>
                    <View style={styles.rowcontainer}>
                      <Text style={styles.datalable}>
                        Members <Text style={styles.dataitem}>45</Text>
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
            {/* end clubs */}
          </View>
        </ScrollView>
        <RoundButton title={'Create a club'} onPress={gotoCreateClub} />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  inputcontainer: {
    paddingHorizontal: 20,
  },
  mt2: {
    marginTop: 10,
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
  datalable: {
    fontSize: 12,
    fontFamily: fontFamilyProximaAB,
    color: Color.black,
    flexWrap: 'wrap',
  },
  dataitem: {
    width: '35%',
    flexWrap: 'wrap',
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 16,
    color: Color.black,
  },
  rowcontainer: {
    alignItems: 'center',
    maxWidth: '25%',
    marginHorizontal: 5,
  },
  rightbox: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
  },
  clubicontext: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 20,
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
  },
  clubsubtext: {
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 16,
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
  },
  box40: {
    width: '38%',
  },
  box60: {
    width: '58%',
  },
  clubimgcontainer: {
    borderRadius: 20,
    height: 130,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubprofileimg: {
    height: 100,
    width: 100,
    borderRadius: 100,
  },
  iconrowcontainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 15,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderTopColor: Color.lightGray,
  },
  blank: {
    paddingVertical: 20,
  },
  mt1: {
    marginTop: 5,
  },

  nametitle: {
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
  },
  namesubtitle: {
    fontSize: 13,
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  profiletextcontainer: {
    width: '78%',
  },
  infoiconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
  },
  profileimgcontainer: {
    width: '20%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    top: -20,
  },
  profileimg: {
    width: 60,
    height: '100%',
    borderRadius: 100,
  },
  nametext: {
    color: Color.white,
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
  },
  namebtn: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: 'rgba(37,87,102,0.6)',
    alignItems: 'flex-start',
    minWidth: 80,
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 100,
  },
  mapcontainer: {
    height: 100,
    backgroundColor: Color.lightblue,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  infoiconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  infoiconimg: {
    height: 18,
    width: 18,
    marginRight: 7,
  },
  inforow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  infocardView: {
    backgroundColor: Color.white,
    marginBottom: 10,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  /* end Trip Report */
  readtext: {
    fontSize: 15,
    color: Color.white,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 22,
  },
  readbtn: {
    backgroundColor: Color.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 5,
    borderRadius: 100,
  },
  mainimgcontainer: {
    borderRadius: 20,
    height: 130,
    overflow: 'hidden',
    width: '100%',
  },
  raitingrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  subtext: {
    fontSize: 12,
    fontFamily: fontFamily.ProximaR,
    color: Color.gray,
    paddingVertical: 5,
  },
  ratingtext: {
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
  },
  icontext: {
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
  },
  buttoncontainer: {
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconbox: {
    height: 22,
    width: 22,
    marginRight: 5,
  },
  texttitleicon: {
    height: 18,
    width: 18,
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  title: {
    fontSize: 16,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: 'Poppins-SemiBold',
    marginVertical: 5,
  },
  iconbtn: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconimg: {
    height: 20,
    width: 20,
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subproimg: {
    height: '100%',
    width: '100%',
  },
  box50: {
    width: '49%',
  },
  cardView: {
    backgroundColor: Color.white,
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 15,
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },

  /* end Trip Report */

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
    paddingBottom: 10,
    paddingTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default ClubHome;
