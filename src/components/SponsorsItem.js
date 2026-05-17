//import liraries
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  Image,
} from 'react-native';

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import Trip from '../api/Trip';
import { Color, fontFamily, resizeMode, Shadow } from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import Mapmodal from '../screen/sponsors/Mapmodal';
import PromocodeModal from '../screen/sponsors/PromocodeModal';
import { ClubmultiplePopover } from './ClubmultiplePopover';
import FastImage from 'react-native-fast-image';

export const SponsorsItem = props => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const [mapmodalopen, setmapmodalopen] = useState(false);
  const [promocodeModal, setpromocodeModal] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [businessDetails, setbusinessDetails] = useState('');
  const [fullAddress, setfullAddress] = useState('');
  const [latitude, setlatitude] = useState('');
  const [longitude, setlongitude] = useState('');
  const [isMore, setIsMore] = useState(false);
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(id => String(id) === String(props?.createdBy));
  const gotowebsite = async Url => {
    if (Url.slice(0, 4) === 'http') {
      Linking.openURL(Url);
    } else {
      Linking.openURL('https://' + Url);
    }
  };

  const onEmailClick = async Url => {
    Linking.openURL('mailto:' + Url);
  };

  return (
    //   isUserDeleted ? (
    //   <View style={[styles.cardView, { paddingBottom: 10 }]}>
    //     <Text>Member requested to delete</Text>
    //   </View>
    // ) : (
    <Pressable style={[styles.cardView]} onPress={props?.onCardClick}>
      <Mapmodal
        visible={mapmodalopen}
        onClose={() => {
          setmapmodalopen(false);
        }}
        description={fullAddress}
        Lat={latitude}
        Long={longitude}
      />
      <PromocodeModal
        visible={promocodeModal}
        onClose={() => {
          setpromocodeModal(false);
        }}
        description={businessDetails}
      />
      <View style={styles.row}>
        <Pressable style={styles.mainimgcontainer}>
          {props?.thumbnailImagePath ? (
            <FastImage
              source={{
                uri: props?.thumbnailImagePath,
                cache: FastImage.cacheControl.immutable,
              }}
              style={[styles.subproimg]}
            />
          ) : (
            <FastImage
              source={require('../assets/images/logo.png')}
              style={[styles.subproimg]}
            />
          )}
        </Pressable>

        <View style={styles.box50}>
          <Text style={styles.title}>{props?.name}</Text>
          <Text style={styles.subtext}>{props?.typeName}</Text>
        </View>
      </View>
      {props?.isApproved == false ? (
        <View style={{ position: 'absolute', top: 10, right: 10 }}>
          <Text style={styles.moreText}>Pending</Text>
        </View>
      ) : (
        <></>
      )}
      <Pressable
        style={styles.iconrow}
        // onPress={() => { setmapmodalopen(true), setfullAddress(props?.address), setlatitude(props?.locationLat), setlongitude(props?.locationLng) }}
      >
        <Ionicons
          name="location"
          color={Color.black}
          size={dynamicSize(18)}
          style={{ marginRight: 7 }}
        />
        {props?.address ? (
          <Text style={styles.subtext}>{props?.address}</Text>
        ) : (
          <Text style={styles.icontext}> - </Text>
        )}
      </Pressable>

      <Pressable
        style={{ flexDirection: 'row', flex: 1 }}
        onPress={() => {
          props?.email ? onEmailClick(props?.email) : undefined;
        }}
      >
        <Ionicons
          name="mail"
          color={Color.black}
          size={dynamicSize(18)}
          style={{ marginRight: 7 }}
        />
        {props?.email ? (
          <Text style={[styles.subtext, { color: Color.primary }]}>
            {props?.email}
          </Text>
        ) : (
          <Text style={[styles.icontext, { marginTop: 2 }]}> - </Text>
        )}
      </Pressable>
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          marginBottom: isMore ? 0 : 10,
        }}
      >
        <Pressable
          style={{ flexDirection: 'row', flex: 1 }}
          onPress={props?.onumberClick}
        >
          <Ionicons
            name="call"
            color={Color.black}
            size={dynamicSize(18)}
            style={{ marginRight: 7 }}
          />
          {props?.phoneNumber ? (
            <Text
              style={[
                styles.subtext,
                {
                  marginTop: 2,
                  color: Color.primary,
                },
              ]}
            >
              {props?.phoneNumber}
            </Text>
          ) : (
            <Text style={[styles.icontext, { marginTop: 2 }]}> - </Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => setIsMore(!isMore)}
          style={{ flex: 1, alignItems: 'flex-end' }}
        >
          <Text style={styles.moreText}>{isMore ? 'less' : 'more'}</Text>
        </Pressable>
      </View>

      {isMore ? (
        <>
          <View style={styles.paddingVertical}>
            <Text style={[styles.icontext, { marginTop: 4 }]}>About:</Text>
            <Text style={[styles.subtext, { marginTop: 4 }]}>
              {props?.about ? props?.about : 'N/A'}
            </Text>
          </View>
          <View style={styles.paddingVertical}>
            <Text style={[styles.icontext, { marginTop: 4 }]}>
              Website:{' '}
              <Text
                style={[styles.subtext, { marginTop: 4, color: Color.primary }]}
                onPress={() => {
                  gotowebsite(props?.website);
                }}
              >
                {props?.website ? props?.website : 'N/A'}
              </Text>
            </Text>
          </View>
          <View style={styles.paddingVertical}>
            <Text style={[styles.icontext, { marginTop: 4 }]}>
              Hours:{' '}
              <Text style={[styles.subtext, { marginTop: 4 }]}>
                {props?.hours ? props?.hours : 'N/A'}
              </Text>
            </Text>
          </View>
          <View style={styles.paddingVertical}>
            <Text style={[styles.icontext, { marginTop: 4 }]}>
              SponsorShip:{' '}
              <Text style={[styles.subtext, { marginTop: 4 }]}>
                {props?.sponsirship ? props?.sponsirship : 'N/A'}
              </Text>
            </Text>
          </View>
          <View style={styles.paddingVertical}>
            {props?.regionDtoslist?.length > 0 ? (
              <Text style={[styles.icontext, { marginTop: 4 }]}>
                Nearby Spots:{' '}
                {props?.regionDtoslist?.map((item, index) => (
                  <Text
                    style={[
                      styles.subtext,
                      { marginTop: 4, color: Color.primary },
                    ]}
                    onPress={() => {
                      props?.onPressNearbySpot(item);
                    }}
                  >
                    {index > 0
                      ? `, ${item?.children[0]?.children[0]?.spotList[0]?.title}`
                      : item?.children[0]?.children[0]?.spotList[0]?.title}
                  </Text>
                ))}
              </Text>
            ) : (
              <Text style={[styles.icontext, { marginTop: 4 }]}>
                Nearby Spots:{' '}
                <Text
                  style={[
                    styles.subtext,
                    { marginTop: 4, color: Color.primary },
                  ]}
                >
                  N/A
                </Text>
              </Text>
            )}
          </View>
          <View style={[styles.row, { marginBottom: 10 }]}>
            <Pressable
              onPress={() => {
                const newArray = props?.regionDtoslist
                  ?.map(item => {
                    const spot = item?.children[0]?.children[0]?.spotList[0];
                    return spot
                      ? {
                          Cordinates: {
                            latitude: spot?.address?.locationLat,
                            longitude: spot?.address?.locationLng,
                          },
                          isMain: false,
                        }
                      : null;
                  })
                  .filter(item => item !== null);

                const mainLatLongList = [
                  {
                    Cordinates: {
                      latitude: props?.locationLat,
                      longitude: props?.locationLng,
                    },
                    isMain: true,
                  },
                ];
                props?.onPressmap(
                  [...mainLatLongList, ...newArray],
                  props?.thumbnailImagePath,
                );
              }}
            >
              <Text style={styles.moreText}>{'Show on map'}</Text>
            </Pressable>
            <Pressable onPress={() => props?.onPressGenerateCode(props)}>
              <Text style={styles.moreText}>{'Redeem code'}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <></>
      )}
    </Pressable>
  );
};

export const BusinessesItem = props => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const [mapmodalopen, setmapmodalopen] = useState(false);
  const [promocodeModal, setpromocodeModal] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [businessDetails, setbusinessDetails] = useState('');
  const [fullAddress, setfullAddress] = useState('');
  const [latitude, setlatitude] = useState('');
  const [longitude, setlongitude] = useState('');
  const [isMore, setIsMore] = useState(false);
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(id => String(id) === String(props?.createdBy));
  const gotowebsite = async Url => {
    if (Url.trim().slice(0, 4).toLowerCase() === 'http') {
      Linking.openURL(Url);
    } else {
      Linking.openURL('https://' + Url);
    }
  };

  const onEmailClick = async Url => {
    Linking.openURL('mailto:' + Url);
  };
  return (
    //  isUserDeleted ? (
    //   <View style={[styles.cardView, { paddingBottom: 10 }]}>
    //     <Text>Member requested to delete</Text>
    //   </View>
    // ) : (
    <>
      <Pressable style={[styles.cardView]} onPress={props?.onCardClick}>
        <Mapmodal
          visible={mapmodalopen}
          onClose={() => {
            setmapmodalopen(false);
          }}
          description={fullAddress}
          Lat={latitude}
          Long={longitude}
        />
        <PromocodeModal
          visible={promocodeModal}
          onClose={() => {
            setpromocodeModal(false);
          }}
          description={businessDetails}
        />
        <View style={styles.row}>
          <Pressable style={styles.mainimgcontainer}>
            {props?.thumbnailImagePath ? (
              <FastImage
                source={{
                  uri: props?.thumbnailImagePath,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={[styles.subproimg]}
              />
            ) : (
              <FastImage
                source={require('../assets/images/logo.png')}
                style={[styles.subproimg]}
              />
            )}
          </Pressable>

          <View style={styles.box50}>
            <Text style={styles.title}>{props?.name}</Text>
            <Text style={styles.subtext}>{props?.typeName}</Text>
          </View>
        </View>
        {props?.isApproved == false ? (
          <View style={{ position: 'absolute', top: 10, right: 10 }}>
            <Text style={styles.moreText}>Pending</Text>
          </View>
        ) : (
          <></>
        )}

        <Pressable style={styles.iconrow}>
          <Ionicons
            name="location"
            color={Color.black}
            size={dynamicSize(18)}
            style={{ marginRight: 7 }}
          />
          {props?.address ? (
            <Text style={styles.subtext}>{props?.address}</Text>
          ) : (
            <Text style={styles.icontext}> - </Text>
          )}
        </Pressable>

        <Pressable
          style={{ flexDirection: 'row', flex: 1 }}
          onPress={() => {
            props?.email ? onEmailClick(props?.email) : undefined;
          }}
        >
          <Ionicons
            name="mail"
            color={Color.black}
            size={dynamicSize(18)}
            style={{ marginRight: 7 }}
          />
          {props?.email ? (
            <Text style={[styles.subtext, { color: Color.primary }]}>
              {props?.email}
            </Text>
          ) : (
            <Text style={[styles.icontext, { marginTop: 2 }]}> - </Text>
          )}
        </Pressable>

        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            marginBottom: isMore ? 0 : 10,
          }}
        >
          <Pressable
            style={{ flexDirection: 'row', flex: 1 }}
            onPress={props?.phoneNumber ? props?.onumberClick : undefined}
          >
            <Ionicons
              name="call"
              color={Color.black}
              size={dynamicSize(18)}
              style={{ marginRight: 7 }}
            />
            {props?.phoneNumber ? (
              <Text
                style={[
                  styles.subtext,
                  {
                    marginTop: 2,
                    color: Color.primary,
                  },
                ]}
              >
                {props?.phoneNumber}
              </Text>
            ) : (
              <Text style={[styles.icontext, { marginTop: 2 }]}> - </Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => setIsMore(!isMore)}
            style={{ flex: 1, alignItems: 'flex-end' }}
          >
            <Text style={styles.moreText}>{isMore ? 'less' : 'more'}</Text>
          </Pressable>
        </View>
        {isMore ? (
          <>
            <View style={styles.paddingVertical}>
              <Text style={[styles.icontext, { marginTop: 4 }]}>About:</Text>
              <Text style={[styles.subtext, { marginTop: 4 }]}>
                {props?.about ? props?.about : 'N/A'}
              </Text>
            </View>
            <View style={styles.paddingVertical}>
              <Text style={[styles.icontext, { marginTop: 4 }]}>
                Website:{' '}
                <Text
                  style={[
                    styles.subtext,
                    { marginTop: 4, color: Color.primary },
                  ]}
                  onPress={() => {
                    gotowebsite(props?.website);
                  }}
                >
                  {props?.website ? props?.website : 'N/A'}
                </Text>
              </Text>
            </View>
            <View style={styles.paddingVertical}>
              <Text style={[styles.icontext, { marginTop: 4 }]}>
                Hours:{' '}
                <Text style={[styles.subtext, { marginTop: 4 }]}>
                  {props?.hours ? props?.hours : 'N/A'}
                </Text>
              </Text>
            </View>
            {/* <View style={styles.paddingVertical}>
                            <Text style={[styles.icontext, { marginTop: 4, }]}>SponsorShip: <Text style={[styles.subtext, { marginTop: 4, }]}>{props?.sponsirship}</Text></Text>

                        </View> */}
            <View style={styles.paddingVertical}>
              {/* <Text style={[styles.icontext, { marginTop: 4, }]}>Nearby Spots:  <Text style={[styles.subtext, { marginTop: 4, }]}>{props?.nearBySpots}</Text></Text> */}
              <View style={styles.paddingVertical}>
                {props?.regionDtoslist?.length > 0 ? (
                  <Text style={[styles.icontext, { marginTop: 4 }]}>
                    Nearby Spots:{' '}
                    {props?.regionDtoslist?.map((item, index) => (
                      <Text
                        style={[
                          styles.subtext,
                          { marginTop: 4, color: Color.primary },
                        ]}
                        onPress={() => {
                          props?.onPressNearbySpot(item);
                        }}
                      >
                        {index > 0
                          ? `, ${item?.children[0]?.children[0]?.spotList[0]?.title}`
                          : item?.children[0]?.children[0]?.spotList[0]?.title}
                      </Text>
                    ))}
                  </Text>
                ) : (
                  <Text style={[styles.icontext, { marginTop: 4 }]}>
                    Nearby Spots:{' '}
                    <Text
                      style={[
                        styles.subtext,
                        {
                          marginTop: 4,
                          color: Color.primary,
                        },
                      ]}
                    >
                      N/A
                    </Text>
                  </Text>
                )}
              </View>
            </View>
            <View style={[styles.row, { marginBottom: 10 }]}>
              <Pressable
                onPress={() => {
                  const newArray = props?.regionDtoslist
                    ?.map(item => {
                      const spot = item?.children[0]?.children[0]?.spotList[0];
                      return spot
                        ? {
                            Cordinates: {
                              latitude: spot?.address?.locationLat,
                              longitude: spot?.address?.locationLng,
                            },
                            isMain: false,
                          }
                        : null;
                    })
                    .filter(item => item !== null);

                  const mainLatLongList = [
                    {
                      Cordinates: {
                        latitude: props?.locationLat,
                        longitude: props?.locationLng,
                      },
                      isMain: true,
                    },
                  ];
                  props?.onPressmap(
                    [...mainLatLongList, ...newArray],
                    props?.thumbnailImagePath,
                  );
                }}
              >
                <Text style={styles.moreText}>{'Show on map'}</Text>
              </Pressable>
              {/* <Pressable
                                onPress={() => props?.onPressGenerateCode(props)}>
                                <Text style={styles.moreText}>{'generate Code'}</Text>
                            </Pressable> */}
            </View>
          </>
        ) : (
          <></>
        )}
      </Pressable>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  dotCont: {
    position: 'absolute',
    top: dynamicSize(15),
    right: dynamicSize(10),
    zIndex: 99,
    shadowColor: '#fafafa',
    elevation: 5,
    shadowOpacity: 1,
    shadowRadius: 5,
    backgroundColor: 'transparent',
  },
  paddingVertical: {
    paddingVertical: 5,
  },
  content: {
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 150,
  },

  backarrow: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginLeft: 10,
    borderRadius: 8,
    marginRight: 5,
    height: 38,
    width: 38,
  },
  popupitemtext: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaR,
    color: Color.cardgray,
    lineHeight: getFontSize(16),
    color: Color.black0,
    textAlign: 'center',
  },
  popupitem: {
    paddingVertical: 10,
  },
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
  moreText: {
    fontSize: getFontSize(14),
    color: Color.primary,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(22),
  },
  moreButton: {
    backgroundColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal: dynamicSize(20),
    // paddingVertical: dynamicSize(5),
    borderRadius: 100,
  },
  mainimgcontainer: {
    // borderRadius: 50,
    // overflow: 'hidden',
    // height: 60,
    // width: 60,
    // justifyContent:'center',
    // alignItems:'center'
  },
  raitingrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  subtext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaR,
    color: Color.gray,
    flex: 1,
  },
  ratingtext: {
    fontSize: getFontSize(13),
    lineHeight: getLineSize(18),
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  icontext: {
    fontSize: getFontSize(14),
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
    // marginBottom: 10,
    marginTop: -20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row1: {
    flexDirection: 'row',
    // alignItems: 'center',
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
    alignItems: 'flex-start',
    paddingTop: 5,
  },
  title: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getLineSize(23),
    fontFamily: fontFamily.ProximaAB,
    // marginVertical: 5,
    textTransform: 'capitalize',
  },
  iconbtn: {
    borderWidth: 0.5,
    height: dynamicSize(30),
    width: dynamicSize(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
    borderRadius: 100,
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
    width: dynamicSize(45),
    height: dynamicSize(45),
    borderRadius: 100,
    backgroundColor: Color.cardbg,
    borderRadius: 100,
    marginRight: 10,
    alignSelf: 'center',
  },
  box50: {
    flex: 1,
    paddingLeft: 10,
    paddingTop: 5,
  },
  cardView: {
    backgroundColor: Color.white,
    // marginBottom: 10,
    marginTop: 15,
    paddingTop: 10,
    paddingHorizontal: 15,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
});
