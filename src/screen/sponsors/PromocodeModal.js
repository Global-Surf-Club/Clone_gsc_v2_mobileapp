import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Color, Shadow, fontFamily } from '../../constants/Constants';
import {
  dynamicSize,
  getFontSize,
  getLineSize,
} from '../../constants/Responsive';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import Toast from 'react-native-root-toast';
import FastImage from 'react-native-fast-image';

const PromocodeModal = ({ visible, description, onClose, iserror }) => {
  const [promocode, setPromocode] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = () => {
    Toast.show('code snippet copied', {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
    });
    // Clipboard.setString('016063');
  };

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: Color.black0.concat('9'),
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: Color.white,
            marginHorizontal: dynamicSize(20),
            borderRadius: dynamicSize(10),
            // padding: dynamicSize(10),
            paddingVertical: 10,
            paddingHorizontal: 10,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: getFontSize(18),
              color: 'black',
              fontFamily: fontFamily.ProximaBold,
              marginBottom: 10,
            }}
          >
            Promocode
          </Text>
          <Pressable
            onPress={() => {
              onClose && onClose();
              setPromocode(false);
            }}
            style={{
              height: 30,
              width: 30,
              backgroundColor: Color.white,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              zIndex: 99,
              position: 'absolute',
              right: dynamicSize(5),
              top: dynamicSize(5),
            }}
          >
            <FastImage
              source={require('../../assets/images/icon/Close.png')}
              resizeMode="contain"
              style={{ height: 15, width: 15 }}
            />
          </Pressable>
          <View style={styles.row}>
            <Pressable style={styles.mainimgcontainer}>
              {description.thumbnailImagePath ? (
                <Pressable onPress={description.onPressreportImage}>
                  <FastImage
                    source={{
                      uri: description?.thumbnailImagePath,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    resizeMode="cover"
                    style={[styles.subproimg, { opacity: 0.9 }]}
                  />
                </Pressable>
              ) : (
                <FastImage
                  source={require('../../assets/images/logo-removebg.png')}
                  resizeMode="contain"
                  style={[styles.subproimg, { opacity: 0.9 }]}
                />
              )}
            </Pressable>

            <View style={[styles.box50]}>
              <Text style={styles.title}>
                {description?.name ? description?.name : 'N/A'}
              </Text>
              <Text style={styles.subtext}>
                Recommended by :{' '}
                {description?.createdByName
                  ? description?.createdByName
                  : 'N/A'}
              </Text>
            </View>
          </View>
          <Pressable
            style={[styles.iconrow, { marginTop: 10 }]}
            onPress={() => {
              setSuccess(true);
            }}
          >
            <Ionicons
              name="location"
              color={Color.black}
              size={dynamicSize(18)}
              style={{ marginRight: 7 }}
            />

            <Text style={styles.icontext}>
              {/* 131 Manchester Rd, Northwich,Cheshire , United Kingdom CW9 7LS */}
              {description?.address ? description?.address : 'N/A'}
            </Text>
          </Pressable>
          <Pressable style={styles.iconrow}>
            <Ionicons
              name="call"
              color={Color.black}
              size={dynamicSize(18)}
              style={{ marginRight: 7 }}
            />

            <Text style={[styles.icontext, { marginTop: 4 }]}>
              {description?.phoneNumber ? description?.phoneNumber : 'N/A'}
            </Text>
          </Pressable>
          {/* <Text
                        style={{
                            fontSize: getFontSize(18),
                            color: 'black',
                            fontFamily: fontFamily.ProximaBold,
                            marginBottom: 10,
                        }}>
                        {copiedText}

                    </Text>
                    <TouchableOpacity onPress={fetchCopiedText}>
                        <Text style={{
                            fontSize: getFontSize(18),
                            color: 'black',
                            fontFamily: fontFamily.ProximaBold,
                            marginBottom: 10,
                        }}>View copied text</Text>
                    </TouchableOpacity> */}

          {promocode ? (
            <TouchableOpacity
              onPress={copyToClipboard}
              style={[
                {
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 20,
                  marginBottom: 10,
                },
              ]}
            >
              <Text
                style={[
                  {
                    fontSize: getFontSize(13),
                    fontFamily: fontFamily.ProximaAB,
                    lineHeight: getLineSize(16),
                    color: Color.black,
                  },
                ]}
              >
                {/* 016063 */}
                {description?.promoCode ? description?.promoCode : 'N/A'}
              </Text>
              <Ionicons
                name="copy"
                color={Color.black}
                size={dynamicSize(18)}
                style={{ marginLeft: 7 }}
              />
            </TouchableOpacity>
          ) : (
            <Pressable
              onPress={() => setPromocode(!promocode)}
              style={{
                backgroundColor: Color.lightblue,
                width: '45%',
                height: dynamicSize(50),
                borderRadius: dynamicSize(10),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: getFontSize(16),
                  fontFamily: fontFamily.ProximaBold,
                }}
              >
                {'View Promocode'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PromocodeModal;

const styles = StyleSheet.create({
  copiedText: {
    marginTop: 10,
    color: 'red',
  },

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
  mainimgcontainer: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 60,
    width: 60,
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
    height: '100%',
    width: '100%',
    backgroundColor: '#8cb4cf52',
  },
  box50: {
    flex: 1,
    paddingLeft: 10,
  },
  cardView: {
    backgroundColor: Color.white,
    marginBottom: 10,
    marginTop: 2,
    paddingTop: 10,
    paddingHorizontal: 15,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
});
