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
import {useDispatch} from 'react-redux';
import {Header} from '../components/Header';
import {Color, fontFamily} from '../constants/Constants';
import Loader from '../constants/Loader';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AcceptInvite} from '../store/authSlice';

const AcceptInvitation = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showLoading, setShowLoading] = useState(false);
  const [Email, setEmail] = React.useState('');
  const [Code, setCode] = React.useState('');
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

  const acceptInvite = () => {
    if (Email.trim().length == 0) {
      alert('Enter Email');
      return;
    } else if (Code.length == 0) {
      alert('Enter Code');
      return;
    }
    setShowLoading(true);
    dispatch(
      AcceptInvite(Email.trim(), Code, (status, error) => {
        setShowLoading(false);
        if (status) {
          navigation.goBack();
        } else {
          alert(error);
        }
      }),
    );
  };

  return (
    <>
      <Loader visible={showLoading} />
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          onPressLeft={backButtonClick}
          // notification={'6'}
          // messagenotification={'6'}
          title={'Accept Invitation'}
          textAlign={'center'}
        />
        <KeyboardAwareScrollView>
          <ScrollView style={{flex: 1}}>
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
                      fontFamily: 'Poppins-Regular',
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Email Address"
                keyboardType="default"
                placeholder="Email Address"
                value={Email}
                onChangeText={Email => setEmail(Email)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: Code ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: 'Poppins-Regular',
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Invitation Code"
                keyboardType="default"
                placeholder="Invitation Code"
                value={Code}
                onChangeText={Code => setCode(Code)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        <View style={styles.maincontainer}>
          <Pressable onPress={acceptInvite} style={[styles.btncontainer]}>
            <Text style={[styles.text]}>Accept Invite</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  maincontainer: {
    width: '60%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  text: {
    color: Color.white,
    fontSize: 13,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 18,
  },
  btncontainer: {
    height: 40,
    paddingHorizontal: 20,
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
    marginVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default AcceptInvitation;
