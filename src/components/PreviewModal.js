import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { View } from 'react-native';
import {
  Dimensions,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { Image } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import { Color, Shadow, fontFamily } from '../constants/Constants';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import Popover from 'react-native-popover-view';
import { useSelector } from 'react-redux';
import Blockreport from '../api/Blockreport';
import SuccessModal from '../components/SuccessModal';
import FastImage from 'react-native-fast-image';

const PreviewModal = ({
  visible,
  onClose,
  photoUrl,
  reportbutton,
  selectimageID,
  pageName,
  onOpen,
}) => {
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const user = useSelector(state => state.auth.user);
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const reportImage = async () => {
    if (user !== null && user !== '') {
      if (
        selectimageID !== null &&
        selectimageID !== '' &&
        selectimageID !== undefined
      ) {
        const data = {
          SenderUserId: user.id,
          TargetId: selectimageID,
          TargetType: pageName,
          RecordType: 'report',
        };

        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );

        if (retval !== null) {
          if (retval?.id > 0) {
            setPopoverVisible(false);
            onClose();
            setSuccessDescription('reported successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 500 : 0,
            );
          } else {
            setSuccessDescription('reported not successfully');
            setTimeout(
              () => {
                setSuccess(true);
                setIserror(true);
              },
              Platform.OS === 'ios' ? 500 : 0,
            );
          }
        }
      } else {
        Alert.alert('Targetid null AllGSCMember Chat Pag');
      }
    }
  };
  return (
    <>
      <Modal
        animationType={'fade'}
        transparent={false}
        onRequestClose={() => {}}
        visible={visible}
      >
        {reportbutton === true ? (
          <View style={{ height: 70 }}>
            <Pressable
              ref={touchableRef}
              onPress={() => {
                setPopoverVisible(true);
              }}
              style={{
                height: 40,
                width: 40,
                backgroundColor: Color.white,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100,
                ...Shadow.boxShadow,
                position: 'absolute',
                right: dynamicSize(10),
                top: dynamicSize(30),
              }}
            >
              <Entypo
                name="dots-three-vertical"
                color={'black'}
                size={dynamicSize(18)}
              />
            </Pressable>

            <Popover
              isVisible={popoverVisible}
              popoverStyle={styles.content}
              from={touchableRef}
              onRequestClose={() => setPopoverVisible(false)}
            >
              <View style={styles.popupcontainer}>
                <TouchableOpacity
                  style={styles.popupitem}
                  onPress={e => {
                    reportImage();
                  }}
                >
                  <Text style={styles.popupitemtext}>Report</Text>
                </TouchableOpacity>
              </View>
            </Popover>
          </View>
        ) : (
          <></>
        )}

        <TouchableOpacity onPress={onClose} style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <FastImage
            source={{ uri: photoUrl, cache: FastImage.cacheControl.immutable }}
            onPress={onClose}
            resizeMode={'contain'}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height - 150,
              alignSelf: 'center',
            }}
          />
        </TouchableOpacity>
      </Modal>
      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          setSuccessDescription('');
          onOpen();
          // setvisible(!this.state.visible)
        }}
        description={successdescription}
        iserror={iserror}
      />
    </>
  );
};

export default PreviewModal;
const styles = StyleSheet.create({
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
});
