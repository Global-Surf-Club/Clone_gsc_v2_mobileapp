//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput} from 'react-native-paper';
import Auth from '../api/Auth';
import {Header} from '../components/Header';
import {Color, fontFamily} from '../constants/Constants';
import Loader from '../constants/Loader';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import ClubsAPi from '../api/ClubApi';
import SuccessModal from '../components/SuccessModal';
import { SafeAreaView } from 'react-native-safe-area-context';

const ClubAppInvite = props => {
  const navigation = useNavigation();
  const {clubid} = props?.route?.params;
  const [showLoading, SetshowLoading] = useState(false);
  const [Email, setEmail] = React.useState('');
  const [Code, setCode] = React.useState('');
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
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
          title={'Club App Invite'}
          textAlign={'center'}
        />
        <KeyboardAwareScrollView>
          <ScrollView style={{flex: 1}}>
            <Text style={styles.title}>
              Enter email of user you want to send invitation to:
            </Text>
            <View style={styles.textinputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: Email ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                autoCorrect={false}
                underlineColor={Color.lightblue}
                label="Email"
                keyboardType="default"
                autoCapitalize={false}
                placeholder="Email"
                value={Email}
                onChangeText={Email => setEmail(Email)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        <View style={styles.maincontainer}>
          <Pressable
            onPress={async () => {
              SetshowLoading(true);
              try {
                let useremail = {
                  email: Email,
                  clubId: clubid,
                };

                let data = await ClubsAPi.invitenongscmember(
                  JSON.stringify(useremail),
                  clubid,
                );
                setSuccess(true);
                setSuccessDescription('invitation sent successfully');

                // if (data === 'true' || data === true) {
                //

                // }

                // navigation.goBack();
                //alert('Invitation sent successfully');
              } catch (error) {
                alert(error);
              }
              SetshowLoading(false);
            }}
            style={[styles.btncontainer]}>
            <Text style={[styles.text]}>Invite</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
    </>
  );
};

const styles = StyleSheet.create({
  paperinput: {
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: getFontSize(16),
    height: dynamicSize(62),
  },
  title: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(19),
    flex: 1,
    flexWrap: 'wrap',
    paddingHorizontal: dynamicSize(20),
    marginTop: dynamicSize(10),
  },
  maincontainer: {
    width: '60%',
    alignSelf: 'center',
    marginVertical: dynamicSize(10),
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
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },

  mt2: {
    marginTop: 10,
  },
  profileimg: {
    width: 50,
    height: 50,
    borderRadius: 100,
    marginRight: 10,
    alignSelf: 'center',
    backgroundColor: Color.gray,
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
    paddingBottom: 10,
  },
});

//make this component available to the app
export default ClubAppInvite;
