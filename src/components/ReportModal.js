import React, {useState, useCallback} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Color, fontFamily, Shadow} from '../constants/Constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TextInput} from 'react-native-paper';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import {ButtonRound} from '../components/Buttons';
import DropDownPicker from 'react-native-dropdown-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ModalDropdown from 'react-native-modal-dropdown';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

// export const ReportModal = props => {
const ReportModal = props => {
  const [reportreasonOpen, setReportreasonOpen] = useState(false);
  const [onclickOther, setonclickOther] = useState(false);
  // const [typeShow, settypeShow] = useState('other');
  const [reportreasonValue, setReportreasonValue] = useState('other');
  const [reportreasonValueOpen, setreportreasonValueOpen] = useState(false);
  const [reason, setReason] = useState([
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    'other',
  ]);
  const onReportreasonOpen = useCallback(() => {
    setreportreasonValueOpen(true);
  }, []);

  const onChange2 = useCallback(() => {
    setReportreasonOpen(false);
  }, []);

  const {
    setModalVisible,
    modalVisible,
    onChange,
    value,
    blockreport,
    username,
    reasonList,
    reasonValue,
    selectReason,
    selcterror,
  } = props;

  return (
    <Modal
      animationType="slide"
      hasBackdrop={true}
      backdropOpacity={0.6}
      backdropColor={'black'}
      deviceWidth={deviceWidth}
      deviceHeight={deviceHeight}
      transparent={true}
      isVisible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={[
          styles.modalcontainer,
          {paddingBottom: getBottomSpace()},
        ]}>
        <View style={styles.modalcontainer}>
          <View style={styles.modalsubcontainer}>
            <View style={[styles.mx2, {paddingRight: dynamicSize(40)}]}>
              <Text style={styles.formtitle}>
                {'Please state your reason why you are reporting ' +
                  (username ? username : 'N/A') +
                  ' ?'}
              </Text>
              <Pressable
                style={styles.close}
                onPress={() => {
                  setReportreasonOpen(false);
                  setModalVisible(false);
                }}>
                <Ionicons name="close-circle" size={26} color={Color.black} />
              </Pressable>
            </View>

            <View style={[styles.mx2, {marginVertical: 10}]}>
              <ModalDropdown
                style={styles.pickercontainer}
                textStyle={styles.textStyle}
                dropdownStyle={styles.dropDownContainerStyle}
                dropdownTextStyle={styles.listItemLabelStyle}
                // defaultValue={reasonValue}
                onDropdownWillShow={e => {
                  // selectReason(e)
                  // settypeShow(e);
                }}
                onSelect={e => {
                  selectReason(e);
                  // settypeShow(e);
                }}
                options={reasonList}
                saveScrollPosition={false} // to fix items disappear on select
              />
              {/* <DropDownPicker
              listMode="SCROLLVIEW"
              style={[
                styles.pickercontainer,
                {
                  borderColor: reportreasonOpen
                    ? Color.lightblue
                    : Color.cardbg,
                },
              ]}
              selectedItemContainerStyle={{
                backgroundColor: 'rgba(100, 107, 235, 0.1)',
              }}
              open={reportreasonOpen}
              value={reportreasonValue}
              items={reason}
              setOpen={setReportreasonOpen}
              setValue={setReportreasonValue}
              setItems={setReason}
              placeholder="Choose working hours"
              placeholderStyle={styles.placeholderStyles}
              onOpen={onReportreasonOpen}
              onChangeValue={onChange2}
              // zIndex={5000}
              // zIndexInverse={3000}
              textStyle={styles.textStyle}
              listItemContainerStyle={[styles.listItemContainerStyle]}
              listItemLabelStyle={styles.listItemLabelStyle}
              dropDownContainerStyle={[styles.dropDownContainerStyle]}
              ArrowUpIconComponent={() => (
                <AntDesign name="caretup" size={13} color={Color.black} />
              )}
              ArrowDownIconComponent={() => (
                <AntDesign name="caretdown" size={13} color={Color.black} />
              )}
              />*/}
              {reasonValue === 'Other' || reasonValue === 'other' ? (
                <TextInput
                  style={{
                    marginBottom: 5,
                    minHeight: Platform.OS === 'ios' ? 120 : 120,
                    maxHeight: Platform.OS === 'ios' ? 130 : 130,
                  }}
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: Color.gray,
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  keyboardType="default"
                  mode="outlined"
                  label="Enter Other Reason"
                  //label={<Text style={{}}>Enter Other Reason</Text>}
                  activeOutlineColor={Color.lightblue}
                  value={value}
                  onChangeText={onChange}
                  numberOfLines={5}
                  multiline={true}
                  placeholder="Type something"
                />
              ) : (
                <></>
              )}

              {selcterror !== null &&
              selcterror !== '' &&
              selcterror !== undefined ? (
                <Text style={styles.Error}>{selcterror}</Text>
              ) : (
                <></>
              )}
            </View>
            <View>
              <View style={styles.buttoncontainer}>
                <ButtonRound
                  title={'Send'}
                  onPress={e => {
                    setReportreasonOpen(false);
                    blockreport();
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Modal>

    //   <Modal transparent animationType="slide" visible={visible}>
    //   <View
    //     style={{
    //       flex: 1,
    //       backgroundColor: Color.black0.concat('9'),
    //       justifyContent: 'center',
    //     }}>
    //     <View
    //       style={{
    //         backgroundColor: Color.white,
    //         marginHorizontal: dynamicSize(40),
    //         borderRadius: dynamicSize(10),
    //         padding: dynamicSize(10),
    //         alignItems: 'center',
    //       }}>
    //       <Text
    //         style={{
    //           fontSize: getFontSize(18),
    //           color: 'black',
    //           fontFamily: fontFamily.ProximaBold,
    //           marginVertical: dynamicSize(15),
    //         }}>
    //         "Sorry"

    //       </Text>
    //       <Text
    //         style={{
    //           color: 'black',
    //           marginBottom: dynamicSize(20),
    //           fontSize: getFontSize(16),
    //           textAlign: 'center',
    //           fontFamily: fontFamily.ProximaR,
    //         }}>
    //         {description}
    //       </Text>
    //       <Pressable
    //         onPress={() => {
    //           onClose && onClose();
    //         }}
    //         style={{
    //           backgroundColor: Color.lightblue,
    //           width: '60%',
    //           height: dynamicSize(50),
    //           borderRadius: dynamicSize(10),
    //           alignItems: 'center',
    //           justifyContent: 'center',
    //         }}>
    //         <Text style={{color: 'white', fontSize: getFontSize(16)}}>
    //           {'Okay'}
    //         </Text>
    //       </Pressable>
    //     </View>
    //   </View>
    // </Modal>
  );
};
export default ReportModal;
const styles = StyleSheet.create({
  Error: {
    fontSize: 12,
    color: Color.red,
    // lineHeight: 23,
    marginLeft: 5,
    fontFamily: fontFamily.ProximaR,
    // marginTop: 10,
  },
  dropdownStyle: {
    width: 100,
    borderRadius: 5,
  },
  divider: {
    marginVertical: 15,
    height: 1.5,
  },
  pickercontainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: Color.cardgray,
    borderRadius: 7,
    marginTop: 5,
    paddingVertical: 13,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: Color.white,
    ...Shadow.boxShadow,
  },
  dropDownContainerStyle: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#DEE1E6',
    borderRadius: 7,
    marginTop: 10,
    backgroundColor: Color.white,
    ...Shadow.boxShadow,
  },
  listItemLabelStyle: {
    fontSize: 16,
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  listItemContainerStyle: {
    height: 40,
  },
  textStyle: {
    fontSize: 16,
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  buttoncontainer: {
    width: '40%',
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  close: {
    position: 'absolute',
    right: -5,
    top: 4,
    height: dynamicSize(40),
    width: dynamicSize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  formtitle: {
    fontSize: 16,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: fontFamily.ProximaBold,
    marginTop: 10,
  },
  mx2: {
    marginHorizontal: dynamicSize(10),
  },
  mt2: {
    marginTop: dynamicSize(10),
  },
  modalflatlist: {
    flex: 1,
    marginTop: 7,
  },
  modalsubcontainer: {
    backgroundColor: Color.white,
    minHeight: dynamicSize(200),
    borderRadius: 8,
    paddingBottom: dynamicSize(10),
  },
  modalcontainer: {
    // alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
});
