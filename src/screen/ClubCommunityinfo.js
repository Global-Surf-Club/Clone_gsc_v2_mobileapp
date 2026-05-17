//import liraries
import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Image} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Color, fontFamily, Shadow} from '../constants/Constants';
import FastImage from 'react-native-fast-image';

// create a component
export const ClubTripReport = props => {
  const [rbtnbackground, setrbtnbackground] = useState();
  const [onPressdownload, setonPressdownload] = useState();
  const [TripReportItemList, SetTripReportItemList] = useState([
    {
      id: 1,
      tripname: 'Test 121',
      profileimage: require('../assets/images/nature2.jpg'),
      // triptext: 'In publishing and graphic design, Lorem ipsum',
      tripicontext1: '',
      tripicontext2: 'Mudd13, Ozlem, Brian',
      tripicontext3: 'N/A',
    },
    {
      id: 2,
      tripname: 'Test trip 120',
      profileimage: require('../assets/images/natre6.jpg'),
      // triptext: 'In publishing and graphic design, Lorem ipsum',
      tripicontext1: '',
      tripicontext2: 'Gopal, Fearghas, Bria...',
      tripicontext3: 'N/A',
    },
  ]);
  const GotoTripDetail = () => {
    navigation.navigate('TripDetail');
  };
  // const { item, onCardClick, onPressRead, onPresslike, onPressmessage, onPressshare, rbtnbackground, onPressdownload } = props;
  return (
    <>
      {TripReportItemList.map((item, i) => {
        return (
          <Pressable
            style={[TripReportstyle.cardView]}
            onPress={GotoTripDetail}>
            <View style={TripReportstyle.row}>
              <View style={TripReportstyle.box50}>
                <View>
                  <Text style={TripReportstyle.title}>Trip Report</Text>
                </View>
              </View>
              <View style={TripReportstyle.box50}>
                <View style={TripReportstyle.raitingrow}>
                  <Text style={TripReportstyle.ratingtext}>Rating</Text>
                  <View style={TripReportstyle.raitingrow}>
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
            <View style={TripReportstyle.row}>
              <View style={TripReportstyle.box50}>
                <View style={TripReportstyle.mainimgcontainer}>
                  <FastImage
                    // source={require('../assets/images/icon/Surfboard.jpg')}
                    source={item.profileimage}
                    style={TripReportstyle.subproimg}
                  />
                </View>
              </View>
              <View style={TripReportstyle.box50}>
                <View>
                  <Text style={TripReportstyle.icontext}>{item.tripname}</Text>
                  {item.triptext ? (
                    <Text style={TripReportstyle.subtext}>{item.triptext}</Text>
                  ) : (
                    <></>
                  )}
                </View>
                <View style={TripReportstyle.iconrow}>
                  <View style={TripReportstyle.iconbox}>
                    <FastImage
                      source={require('../assets/images/icon/vanLogo.png')}
                      style={TripReportstyle.texttitleicon}
                    />
                  </View>
                  {item.tripicontext1 ? (
                    <Text style={TripReportstyle.icontext}>
                      {item.tripicontext1}
                    </Text>
                  ) : (
                    <Text style={TripReportstyle.icontext}> - </Text>
                  )}
                </View>
                <View style={TripReportstyle.iconrow}>
                  <View style={TripReportstyle.iconbox}>
                    <FastImage
                      source={require('../assets/images/icon/surfingLogo.png')}
                      style={TripReportstyle.texttitleicon}
                    />
                  </View>
                  {item.tripicontext2 ? (
                    <Text style={TripReportstyle.icontext}>
                      {item.tripicontext2}
                    </Text>
                  ) : (
                    <Text style={TripReportstyle.icontext}> - </Text>
                  )}
                </View>
                <View style={TripReportstyle.iconrow}>
                  <View style={TripReportstyle.iconbox}>
                    <FastImage
                      source={require('../assets/images/icon/hostelLogo.png')}
                      style={TripReportstyle.texttitleicon}
                    />
                  </View>
                  {item.tripicontext3 ? (
                    <Text style={TripReportstyle.icontext}>
                      {item.tripicontext3}
                    </Text>
                  ) : (
                    <Text style={TripReportstyle.icontext}> - </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={TripReportstyle.row}>
              <View style={TripReportstyle.box50}>
                <View style={TripReportstyle.iconbtnrow}>
                  <Pressable style={TripReportstyle.iconbtn}>
                    <FastImage
                      source={require('../assets/images/icon/likeIcon.png')}
                      style={TripReportstyle.iconimg}
                    />
                  </Pressable>
                  <Pressable style={TripReportstyle.iconbtn}>
                    <FastImage
                      source={require('../assets/images/icon/commentIcon.png')}
                      style={TripReportstyle.iconimg}
                    />
                  </Pressable>
                  <Pressable style={TripReportstyle.iconbtn}>
                    <FastImage
                      source={require('../assets/images/icon/shareIcon.png')}
                      style={TripReportstyle.iconimg}
                    />
                  </Pressable>
                  {onPressdownload ? (
                    <Pressable style={TripReportstyle.iconbtn}>
                      <FastImage
                        source={require('../assets/images/icon/downloadIcon.png')}
                        style={TripReportstyle.iconimg}
                      />
                    </Pressable>
                  ) : (
                    <></>
                  )}
                </View>
              </View>
              <View style={TripReportstyle.box50}>
                <View style={TripReportstyle.buttoncontainer}>
                  <Pressable
                    style={[
                      TripReportstyle.readbtn,
                      {
                        backgroundColor: rbtnbackground
                          ? rbtnbackground
                          : Color.black,
                      },
                    ]}>
                    <Text style={TripReportstyle.readtext}>Read</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </>
  );
};

const TripReportstyle = StyleSheet.create({
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
    paddingHorizontal: 20,
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
    lineHeight: 18,
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
  },
  icontext: {
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 16,
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
});

// create a component
export const ClubCommunityinfo = props => {
  const [onPressinfobutton, setonPressinfobutton] = useState();
  const [onPressdownload, setonPressdownload] = useState();
  const [CommunityinfoItemList, SetCommunityinfoItemList] = useState([
    {
      id: 1,
      username: 'Test 121',
      profileimage: require('../assets/images/profile.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'Peeranaporth,le st Georges Hill,Cor....',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
    {
      id: 2,
      username: 'Test trip 120',
      profileimage: require('../assets/images/profile.jpg'),
      placename: 'Brian',
      from: 'London Bridge, Greater London,London',
      to: 'Hayle,Cornwall,England,GB',
      friend: '4',
      date: '04/01/2022',
      time: '20:00',
    },
  ]);

  return (
    <>
      {CommunityinfoItemList.map((item, i) => {
        return (
          <Pressable style={[Communityinfostyle.cardView]}>
            <View style={Communityinfostyle.mapcontainer}>
              {/* <MapView
                        style={{width:'100%',height:'100%',}}
                            initialRegion={{
                                latitude: 37.78825,
                                longitude: -122.4324,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                        /> */}
              <View style={Communityinfostyle.titlebuttoncontainer}>
                {item.username ? (
                  <Pressable style={Communityinfostyle.namebtn}>
                    <Text style={Communityinfostyle.nametext}>
                      {item.username}
                    </Text>
                  </Pressable>
                ) : (
                  <></>
                )}
              </View>
            </View>
            <View>
              <View style={Communityinfostyle.row}>
                <View style={Communityinfostyle.profileimgcontainer}>
                  <FastImage
                    // source={require('../assets/images/icon/Surfboard.jpg')}
                    source={item.profileimage}
                    style={Communityinfostyle.profileimg}
                  />
                </View>
                <View style={Communityinfostyle.profiletextcontainer}>
                  <Text
                    style={[
                      Communityinfostyle.nametitle,
                      Communityinfostyle.mt1,
                    ]}>
                    {item.placename}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      Communityinfostyle.namesubtitle,
                      Communityinfostyle.mt2,
                    ]}>
                    From:{' '}
                    <Text style={Communityinfostyle.nametitle}>
                      {item.from}
                    </Text>
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={Communityinfostyle.namesubtitle}>
                    To:{' '}
                    <Text style={Communityinfostyle.nametitle}>{item.to}</Text>
                  </Text>
                </View>
              </View>
              <View style={Communityinfostyle.iconrowcontainer}>
                <View style={Communityinfostyle.iconrow}>
                  <FastImage
                    source={require('../assets/images/icon/shareIcon.png')}
                    style={Communityinfostyle.iconimg}
                  />

                  <Text style={Communityinfostyle.nametitle}>
                    {item.friend}
                  </Text>
                </View>
                <View style={Communityinfostyle.iconrow}>
                  <FastImage
                    source={require('../assets/images/icon/shareIcon.png')}
                    style={Communityinfostyle.iconimg}
                  />

                  <Text style={Communityinfostyle.nametitle}>{item.date}</Text>
                </View>
                <View
                  style={[
                    Communityinfostyle.iconrow,
                    {justifyContent: 'flex-end'},
                  ]}>
                  <FastImage
                    source={require('../assets/images/icon/shareIcon.png')}
                    style={Communityinfostyle.iconimg}
                  />
                  <Text style={Communityinfostyle.nametitle}>{item.time}</Text>
                </View>
              </View>
              {onPressinfobutton ? (
                <></>
              ) : (
                <View style={Communityinfostyle.blank}></View>
              )}

              <View style={Communityinfostyle.row}>
                <View style={Communityinfostyle.box50}>
                  <View style={Communityinfostyle.iconbtnrow}>
                    <Pressable style={Communityinfostyle.iconbtn}>
                      <FastImage
                        source={require('../assets/images/icon/likeIcon.png')}
                        style={Communityinfostyle.iconimg}
                      />
                    </Pressable>
                    <Pressable style={Communityinfostyle.iconbtn}>
                      <FastImage
                        source={require('../assets/images/icon/commentIcon.png')}
                        style={Communityinfostyle.iconimg}
                      />
                    </Pressable>
                    <Pressable style={Communityinfostyle.iconbtn}>
                      <FastImage
                        source={require('../assets/images/icon/shareIcon.png')}
                        style={Communityinfostyle.iconimg}
                      />
                    </Pressable>
                    {onPressdownload ? (
                      <Pressable style={Communityinfostyle.iconbtn}>
                        <FastImage
                          source={require('../assets/images/icon/downloadIcon.png')}
                          style={Communityinfostyle.iconimg}
                        />
                      </Pressable>
                    ) : (
                      <></>
                    )}
                  </View>
                </View>

                {onPressinfobutton ? (
                  item.isFull === true ? (
                    <View style={Communityinfostyle.box50}>
                      <View style={Communityinfostyle.buttoncontainer}>
                        <Pressable
                          style={[
                            Communityinfostyle.readbtn,
                            {backgroundColor: Color.red},
                          ]}>
                          <Text style={Communityinfostyle.readtext}>FULL</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={Communityinfostyle.box50}>
                      <View style={Communityinfostyle.buttoncontainer}>
                        <Pressable
                          style={[
                            Communityinfostyle.readbtn,
                            {backgroundColor: Color.green},
                          ]}>
                          <Text style={Communityinfostyle.readtext}>JOIN</Text>
                        </Pressable>
                      </View>
                    </View>
                  )
                ) : (
                  <></>
                )}
              </View>
            </View>
          </Pressable>
        );
      })}
    </>
  );
};

const Communityinfostyle = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  box50: {
    width: '49%',
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
  mt2: {
    marginTop: 10,
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
    width: '75%',
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
  },
  profileimgcontainer: {
    width: '25%',
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
  buttoncontainer: {
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  mapcontainer: {
    height: 100,
    backgroundColor: Color.lightblue,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  iconbtn: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  iconimg: {
    height: 18,
    width: 18,
    marginRight: 7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  cardView: {
    backgroundColor: Color.white,
    // marginVertical: 5,
    marginBottom: 10,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
});
