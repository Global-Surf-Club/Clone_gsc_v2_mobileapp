//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import {TextInput} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Header} from '../components/Header';
import {Color, fontFamily} from '../constants/Constants';
import Loader from '../constants/Loader';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

const AboutEdit = () => {
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [description, setDescription] = React.useState('');
  const [cartype, setCartype] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phonenumber, setPhonenumber] = React.useState('');
  const [boardtype, setBoardtype] = React.useState('');
  const [isModalTripType, setisModalTripType] = useState();

  const onTripTypeSelected = value => {
    setCartype(value);
    toggleTripType();
  };
  const toggleTripType = () => {
    setisModalTripType(!isModalTripType);
  };

  const triptype = [
    '2 Seats',
    '3 Seats',
    '4 Seats',
    '5 Seats',
    '6 Seats',
    '7 Seats',
    '8 Seats',
  ];
  const Gotoforgotscreen = () => {
    navigation.navigate('Forgotpassword');
  };
  const GotoHome = () => {
    navigation.navigate('Forgotpassword');
  };
  const GotoInvitationscreen = () => {
    navigation.navigate('Forgotpassword');
  };
  const backButtonClick = () => {
    navigation.goBack();
  };
  return (
    <>
      <Loader visible={showLoading} />
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          onPressLeft={backButtonClick}
          title={'Edit Profile'}
          textAlign={'center'}
        />
        <KeyboardAwareScrollView>
          <ScrollView style={{flex: 1}}>
            <View style={styles.textinputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: firstName ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="First name"
                keyboardType="default"
                placeholder="First name"
                value={firstName}
                onChangeText={firstName => setFirstName(firstName)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: lastName ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Last name"
                keyboardType="default"
                placeholder="Last name"
                value={lastName}
                onChangeText={lastName => setLastName(lastName)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: email ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Email"
                keyboardType="default"
                placeholder="Email"
                value={email}
                onChangeText={email => setEmail(email)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: phonenumber ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Phone number"
                keyboardType="name-phone-pad"
                placeholder="Phone number"
                value={phonenumber}
                onChangeText={phonenumber => setPhonenumber(phonenumber)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: description ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                multiline={true}
                numberOfLines={4}
                underlineColor={Color.lightblue}
                label="Description"
                keyboardType="default"
                placeholder="Description"
                value={description}
                onChangeText={description => setDescription(description)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: description ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Board type"
                keyboardType="default"
                placeholder="Board type"
                value={boardtype}
                onChangeText={boardtype => setBoardtype(boardtype)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              {/*<TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: description ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Car type"
                keyboardType="default"
                placeholder="Car type"
                value={cartype}
                onChangeText={cartype => setCartype(cartype)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
            />*/}
              <Pressable onPress={toggleTripType}>
                <TextInput
                  label="Car type"
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: cartype ? Color.lightblue : Color.gray,
                      background: 'transparent',
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  underlineColor={cartype ? Color.lightblue : Color.gray}
                  placeholder="Car type"
                  style={styles.paperinput}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                  editable={false}
                  value={cartype}
                />
              </Pressable>
            </View>
            <View style={styles.maincontainer}>
              <Pressable style={[styles.btncontainer]}>
                <Text style={[styles.text]}>Save</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        <Modal
          isVisible={isModalTripType}
          deviceWidth={deviceWidth}
          deviceHeight={deviceHeight}>
          <View style={styles.modalcontainer}>
            <View style={styles.modalsubcontainer}>
              <View style={[styles.mx2, styles.modalheader]}>
                <Text style={styles.formtitle}>Car type</Text>
                <Pressable style={styles.close} onPress={toggleTripType}>
                  <Ionicons name="close-circle" size={26} color={Color.black} />
                </Pressable>
              </View>
              <View style={styles.modalflatlist}>
                <FlatList
                  data={triptype}
                  renderItem={({item, index}) => (
                    <TouchableOpacity
                      style={styles.listitem}
                      onPress={() => onTripTypeSelected(item)}>
                      <Text style={styles.listitemtext}> {item || ''}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.bank}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  formtitle: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getFontSize(23),
    fontFamily: fontFamily.ProximaAB,
    marginTop: 10,
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
  modalcontainer: {
    justifyContent: 'center',
  },
  mx2: {
    marginHorizontal: 10,
  },
  mt2: {
    marginTop: 10,
  },
  modalflatlist: {
    flex: 1,
    marginTop: 7,
  },
  modalsubcontainer: {
    backgroundColor: Color.white,
    minHeight: 170,
    height: dynamicSize(300),
    borderRadius: 8,
    paddingBottom: 10,
  },
  listitemtext: {
    fontSize: getFontSize(16),
    color: Color.black0,
  },
  listitem: {
    paddingVertical: 15,
    borderBottomColor: Color.lightGray,
    borderBottomWidth: 1,
    paddingLeft: 10,
  },
  title: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(19),
    flex: 1,
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  maincontainer: {
    width: '60%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  text: {
    color: Color.white,
    fontSize: getFontSize(13),
  },
  btncontainer: {
    height: dynamicSize(40),
    paddingHorizontal: dynamicSize(20),
    borderRadius: 10,
    backgroundColor: Color.lightblue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Color.gray,
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  textinputcontainer: {
    paddingHorizontal: dynamicSize(20),
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default AboutEdit;
