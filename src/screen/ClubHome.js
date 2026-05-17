//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Image} from 'react-native';
import {Searchbar} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Header} from '../components/Header';
import {Color, fontFamily, Shadow} from '../constants/Constants';
import Loader from '../constants/Loader';
import {dynamicSize, getFontSize, getLineSize} from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

const ClubHome = () => {
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [fullClub, SetfullClub] = useState(false);
  const [download, Setdownload] = useState(true);

  const [searchQuery, setSearchQuery] = React.useState('');

  const [TripReportItemList, SetTripReportItemList] = useState([
    {
      id: 1,
      tripname: 'Test 121',
      profileimage: require('../assets/images/icon/Surfboard.jpg'),
      triptext: 'In publishing and graphic design, Lorem ipsum',
      tripicontext1: '',
      tripicontext2: 'Brian, Ozlem, Mudd13',
      tripicontext3: 'B&B',
    },
  ]);
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
      isFull: false,
    },
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
      isFull: true,
    },
  ]);
  const [ClubsItemList, SetClubsItemList] = useState([
    {
      id: 1,
      tripname: 'Livornon Surf Club',
      profileimage: require('../assets/images/clublogo.png'),
      triptext: 'Livornon,Italy',
    },
  ]);
  const onChangeSearch = query => setSearchQuery(query);

  const menuButtonClick = () => {
    navigation.goBack();
  };
  const Gotodetail = () => {
    navigation.navigate('ClubTripdetail');
  };
  const GotoClubProfile = () => {
    navigation.navigate('ClubProfile', {Selection: 1});
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
          bounces={true}
          alwaysBounceVertical={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}>
          <View style={styles.viewContainer}>
            {/* Communityinfo */}
            {CommunityinfoItemList.map((item, id) => {
              return (
                <Pressable
                  style={[styles.infocardView]}
                  key={id}
                  onPress={Gotodetail}>
                  <View style={styles.mapcontainer}>
                    {/* <MapView
                                    style={{width:'100%',height:'100%',}}
                                        initialRegion={{
                                            latitude: 37.78825,
                                            longitude: -122.4324,
                                            latitudeDelta: 0.0922,
                                            longitudeDelta: 0.0421,
                                        }}
                                    /> */}
                    <View style={styles.titlebuttoncontainer}>
                      {item.username ? (
                        <Pressable style={styles.namebtn}>
                          <Text style={styles.nametext}>{item.username}</Text>
                        </Pressable>
                      ) : (
                        <></>
                      )}
                    </View>
                  </View>
                  <View>
                    <View style={styles.inforow}>
                      <View style={styles.profileimgcontainer}>
                        <FastImage
                          source={item.profileimage}
                          style={styles.profileimg}
                        />
                      </View>
                      <View style={styles.profiletextcontainer}>
                        <Text style={[styles.nametitle, styles.mt1]}>
                          {item.placename}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={[styles.namesubtitle, styles.mt2]}>
                          From:{' '}
                          <Text style={styles.nametitle}>{item.from}</Text>
                        </Text>
                        <Text numberOfLines={1} style={styles.namesubtitle}>
                          To: <Text style={styles.nametitle}>{item.to}</Text>
                        </Text>
                      </View>
                    </View>
                    <View style={styles.iconrowcontainer}>
                      <View style={styles.infoiconrow}>
                        <FastImage
                          source={require('../assets/images/icon/shareIcon.png')}
                          style={styles.infoiconimg}
                        />

                        <Text style={styles.nametitle}>{item.friend}</Text>
                      </View>
                      <View style={styles.infoiconrow}>
                        <FastImage
                          source={require('../assets/images/icon/shareIcon.png')}
                          style={styles.infoiconimg}
                        />

                        <Text style={styles.nametitle}>{item.date}</Text>
                      </View>
                      <View
                        style={[
                          styles.infoiconrow,
                          {justifyContent: 'flex-end'},
                        ]}>
                        <FastImage
                          source={require('../assets/images/icon/shareIcon.png')}
                          style={styles.infoiconimg}
                        />
                        <Text style={styles.nametitle}>{item.time}</Text>
                      </View>
                    </View>
                    {/* <View style={styles.iconbtnrow}>
                                        <Pressable style={styles.iconbtn} onPress={onPresslike}>
                                            <FastImage
                                                source={require('../assets/images/icon/likeIcon.png')}
                                                style={styles.infoiconimg} />
                                        </Pressable>
                                        <Pressable style={styles.iconbtn} onPress={onPressmessage}>
                                            <FastImage
                                                source={require('../assets/images/icon/commentIcon.png')}
                                                style={styles.infoiconimg} />
                                        </Pressable>
                                        <Pressable style={styles.iconbtn} onPress={onPressshare}>
                                            <FastImage
                                                source={require('../assets/images/icon/shareIcon.png')}
                                                style={styles.infoiconimg} />
                                        </Pressable>
                                    </View> */}
                    <View style={styles.inforow}>
                      <View style={styles.box50}>
                        <View style={styles.infoiconbtnrow}>
                          <Pressable style={styles.iconbtn}>
                            <FastImage
                              source={require('../assets/images/icon/likeIcon.png')}
                              style={styles.infoiconimg}
                            />
                          </Pressable>
                          <Pressable style={styles.iconbtn}>
                            <FastImage
                              source={require('../assets/images/icon/commentIcon.png')}
                              style={styles.infoiconimg}
                            />
                          </Pressable>
                          <Pressable style={styles.iconbtn}>
                            <FastImage
                              source={require('../assets/images/icon/shareIcon.png')}
                              style={styles.infoiconimg}
                            />
                          </Pressable>
                          {download ? (
                            <Pressable style={styles.iconbtn}>
                              <FastImage
                                source={require('../assets/images/icon/downloadIcon.png')}
                                style={styles.infoiconimg}
                              />
                            </Pressable>
                          ) : (
                            <></>
                          )}
                        </View>
                      </View>
                      {item.isFull === true ? (
                        <View style={styles.box50}>
                          <View style={styles.buttoncontainer}>
                            <Pressable
                              style={[
                                styles.readbtn,
                                {backgroundColor: Color.red},
                              ]}>
                              <Text style={styles.readtext}>FULL</Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.box50}>
                          <View style={styles.buttoncontainer}>
                            <Pressable
                              style={[
                                styles.readbtn,
                                {backgroundColor: Color.green},
                              ]}>
                              <Text style={styles.readtext}>JOIN</Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
            {/* end Communityinfo */}

            {/* Trip Report */}
            {TripReportItemList.map((item, id) => {
              return (
                <Pressable style={[styles.cardView]} key={id}>
                  <View style={styles.row}>
                    <View style={styles.box50}>
                      <View>
                        <Text style={styles.title}>Trip Report</Text>
                      </View>
                    </View>
                    <View style={styles.box50}>
                      <View style={styles.raitingrow}>
                        <Text style={styles.ratingtext}>Rating</Text>
                        <View style={styles.raitingrow}>
                          <MaterialCommunityIcons
                            name={'star'}
                            size={13}
                            color={Color.starbg}
                          />
                          <MaterialCommunityIcons
                            name={'star'}
                            size={13}
                            color={Color.starbg}
                          />
                          <MaterialCommunityIcons
                            name={'star'}
                            size={13}
                            color={Color.starbg}
                          />
                          <MaterialCommunityIcons
                            name={'star'}
                            size={13}
                            color={Color.starbg}
                          />
                          <MaterialCommunityIcons
                            name={'star'}
                            size={13}
                            color={Color.starbg}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.box50}>
                      <View style={styles.mainimgcontainer}>
                        <FastImage
                          source={item.profileimage}
                          style={styles.subproimg}
                        />
                      </View>
                    </View>
                    <View style={styles.box50}>
                      <View>
                        <Text style={styles.icontext}>{item.tripname}</Text>
                        {item.triptext ? (
                          <Text style={styles.subtext}>{item.triptext}</Text>
                        ) : (
                          <></>
                        )}
                      </View>
                      <View style={styles.iconrow}>
                        <View style={styles.iconbox}>
                          <FastImage
                            source={require('../assets/images/icon/vanLogo.png')}
                            style={styles.texttitleicon}
                          />
                        </View>
                        {item.tripicontext1 ? (
                          <Text style={styles.icontext}>
                            {item.tripicontext1}
                          </Text>
                        ) : (
                          <Text style={styles.icontext}> - </Text>
                        )}
                      </View>
                      <View style={styles.iconrow}>
                        <View style={styles.iconbox}>
                          <FastImage
                            source={require('../assets/images/icon/surfingLogo.png')}
                            style={styles.texttitleicon}
                          />
                        </View>
                        {item.tripicontext2 ? (
                          <Text style={styles.icontext}>
                            {item.tripicontext2}
                          </Text>
                        ) : (
                          <Text style={styles.icontext}> - </Text>
                        )}
                      </View>
                      <View style={styles.iconrow}>
                        <View style={styles.iconbox}>
                          <FastImage
                            source={require('../assets/images/icon/hostelLogo.png')}
                            style={styles.texttitleicon}
                          />
                        </View>
                        {item.tripicontext3 ? (
                          <Text style={styles.icontext}>
                            {item.tripicontext3}
                          </Text>
                        ) : (
                          <Text style={styles.icontext}> - </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.box50}>
                      <View style={styles.iconbtnrow}>
                        <Pressable style={styles.iconbtn}>
                          <FastImage
                            source={require('../assets/images/icon/likeIcon.png')}
                            style={styles.iconimg}
                          />
                        </Pressable>
                        <Pressable style={styles.iconbtn}>
                          <FastImage
                            source={require('../assets/images/icon/commentIcon.png')}
                            style={styles.iconimg}
                          />
                        </Pressable>
                        <Pressable style={styles.iconbtn}>
                          <FastImage
                            source={require('../assets/images/icon/shareIcon.png')}
                            style={styles.iconimg}
                          />
                        </Pressable>
                        {download === true ? (
                          <Pressable style={styles.iconbtn}>
                            <FastImage
                              source={require('../assets/images/icon/downloadIcon.png')}
                              style={styles.iconimg}
                            />
                          </Pressable>
                        ) : (
                          <></>
                        )}
                      </View>
                    </View>
                    <View style={styles.box50}>
                      <View style={styles.buttoncontainer}>
                        <Pressable
                          style={[
                            styles.readbtn,
                            {backgroundColor: Color.black},
                          ]}>
                          <Text style={styles.readtext}>Read</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
            {/* end Trip Report */}

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
                        <Pressable
                          style={[
                            styles.readbtn,
                            {backgroundColor: Color.green},
                          ]}>
                          <Text style={styles.readtext}>JOIN</Text>
                        </Pressable>
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
                  {/* <View style={styles.rightbox}>
                                        <View style={styles.rowcontainer}>
                                            <Text style={styles.datalable}>Trips</Text>
                                            <Text style={styles.dataitem}>4545</Text>
                                        </View>
                                        <View style={styles.rowcontainer}>
                                            <Text style={styles.datalable}>Reports</Text>
                                            <Text style={styles.dataitem}>45</Text>
                                        </View>
                                        <View style={styles.rowcontainer}>
                                            <Text style={styles.datalable}>Members</Text>
                                            <Text style={styles.dataitem}>45</Text>
                                        </View>
                                    </View> */}
                </Pressable>
              );
            })}
            {/* end clubs */}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  datalable: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
    flexWrap: 'wrap',
  },
  dataitem: {
    width: '35%',
    flexWrap: 'wrap',
    marginLeft: 4,
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
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
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
  },
  clubsubtext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
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
    height: dynamicSize(130),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubprofileimg: {
    height: dynamicSize(100),
    width: dynamicSize(100),
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
    marginTop: getFontSize(5),
  },
  mt2: {
    marginTop: getFontSize(10),
  },
  nametitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(19),
    color: Color.black,
  },
  namesubtitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(19),
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
    height: dynamicSize(60),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    top: dynamicSize(-20),
  },
  profileimg: {
    width: dynamicSize(60),
    height: '100%',
    borderRadius: 100,
  },
  nametext: {
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
  },
  namebtn: {
    paddingHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(5),
    backgroundColor: 'rgba(37,87,102,0.8)',
    alignItems: 'flex-start',
    minWidth: dynamicSize(70),
    alignItems: 'center',
    position: 'absolute',
    top: dynamicSize(10),
    left: dynamicSize(10),
    marginRight: dynamicSize(10),
    borderRadius: 100,
  },
  mapcontainer: {
    height: dynamicSize(100),
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
    height: dynamicSize(18),
    width: dynamicSize(18),
    marginRight: 7,
  },
  inforow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: dynamicSize(10),
  },
  infocardView: {
    backgroundColor: Color.white,
    marginBottom: dynamicSize(10),
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  /* end Trip Report */
  readtext: {
    fontSize: getFontSize(14),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(22),
  },
  readbtn: {
    backgroundColor: Color.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(5),
    borderRadius: 100,
  },
  mainimgcontainer: {
    borderRadius: 20,
    height: dynamicSize(130),
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
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaR,
    color: Color.gray,
    paddingVertical: 5,
  },
  ratingtext: {
    fontSize: getFontSize(13),
    lineHeight: getLineSize(18),
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  icontext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(16),
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
    textTransform: 'capitalize',
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
    height: dynamicSize(22),
    width: dynamicSize(22),
    marginRight: 5,
  },
  texttitleicon: {
    height: dynamicSize(18),
    width: dynamicSize(18),
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  title: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getLineSize(23),
    fontFamily: fontFamily.ProximaAB,
    marginVertical: 5,
  },
  iconbtn: {
    height: dynamicSize(30),
    width: dynamicSize(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconimg: {
    height: dynamicSize(20),
    width: dynamicSize(20),
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subproimg: {
    height: '100%',
    width: '100%',
    backgroundColor: '#8cb4cf52',
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
