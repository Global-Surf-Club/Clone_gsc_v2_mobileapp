//import liraries
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
} from 'react-native';
import { Badge } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import {
  Color,
  fontFamily,
  NotInvitedMessage,
  NotPaidMessage,
} from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

// create a component
export const Header = props => {
  const navigation = useNavigation();
  const {
    title,
    textAlign = 'left',
    iconleft,
    iconRight,
    iconRight1,
    iconRight2,
    onPressLeft,
    notification,
    // messagenotification,
    backbutton,
    addicon,
    onPressAddbtn,
    AddPressbtn,
  } = props;
  const notificationCount = useSelector(
    state => state.profile.notificationCount,
  );
  const messagenotification = useSelector(
    state => state.profile.messagenotificationCount,
  );
  const user = useSelector(state => state.auth.user);
  const isFullAccess = user?.isFullAccess;
  const isInvited = useSelector(state => state.auth.isInvited);
  const Gotomessage = () => {
    if (isFullAccess) {
      navigation.navigate('GSCMembers', { isMessage: true });
    } else {
      alert(isInvited ? NotPaidMessage : NotInvitedMessage);
    }
  };
  const GotoNotification = () => {
    navigation.navigate('Notification');
  };
  const GotoHome = () => {
    navigation.navigate('SideDrower');
  };
  return (
    <View style={Menustyles.container}>
      <Pressable onPress={onPressLeft} style={Menustyles.itemContainer}>
        {iconleft ? (
          <FastImage
            imageStyle={{ borderRadius: 50 }}
            // source={require('../assets/images/icon/CheckBox.png')}
            source={iconleft}
            style={Menustyles.subproimg}
          />
        ) : (
          <MaterialCommunityIcons
            name={backbutton}
            size={dynamicSize(22)}
            color={Color.black}
          />
        )}
      </Pressable>
      <Text style={[Menustyles.title, { textAlign: textAlign }]}>{title}</Text>
      {addicon ? (
        <Pressable onPress={onPressAddbtn} style={[Menustyles.righticon]}>
          <FastImage
            imageStyle={{ borderRadius: 50 }}
            source={addicon}
            style={Menustyles.addicon}
          />
        </Pressable>
      ) : (
        <View style={Menustyles.righticonlist}>
          <View>
            {iconRight ? (
              <Pressable onPress={Gotomessage} style={[Menustyles.righticon]}>
                {/* <Entypo name={iconRight} size={22} color={Color.black} /> */}
                <FastImage
                  imageStyle={{ borderRadius: 50 }}
                  source={iconRight}
                  style={Menustyles.righticoncontainer}
                />
                {messagenotification ? (
                  <Badge style={Menustyles.badge} size={dynamicSize(15)}>
                    {messagenotification}
                  </Badge>
                ) : (
                  <></>
                )}
              </Pressable>
            ) : (
              <></>
            )}
          </View>
          {iconRight1 ? (
            <Pressable onPress={GotoNotification} style={Menustyles.righticon}>
              {/* <Ionicons name={iconRight1} size={22} color={Color.black} /> */}
              <FastImage
                imageStyle={{ borderRadius: 50 }}
                source={iconRight1}
                style={Menustyles.righticoncontainer1}
              />
              {notificationCount > 0 ? (
                <Badge style={Menustyles.badge} size={dynamicSize(15)}>
                  {notificationCount}
                </Badge>
              ) : (
                <></>
              )}
            </Pressable>
          ) : (
            <></>
          )}

          {iconRight2 ? (
            <Pressable onPress={GotoHome} style={Menustyles.righticon}>
              <FastImage
                imageStyle={{ borderRadius: 50 }}
                source={iconRight2}
                style={Menustyles.righticoncontainer2}
              />
              {/* <MaterialCommunityIcons name={iconRight2} size={22} color={Color.black} /> */}
            </Pressable>
          ) : (
            <></>
          )}
        </View>
      )}
    </View>
  );
};

// define your styles
const Menustyles = StyleSheet.create({
  addicon: {
    height: dynamicSize(20),
    width: dynamicSize(20),
  },
  righticoncontainer2: {
    height: dynamicSize(20),
    width: dynamicSize(20),
    resizeMode: 'cover',
  },
  righticoncontainer: {
    height: dynamicSize(20),
    width: dynamicSize(23),
    resizeMode: 'cover',
  },
  righticoncontainer1: {
    height: dynamicSize(20),
    width: dynamicSize(17),
    resizeMode: 'cover',
  },
  subproimg: {
    height: dynamicSize(25),
    width: dynamicSize(25),
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: 1,
    backgroundColor: Color.golden,
  },
  righticonlist: {
    flexDirection: 'row',
    width: '30%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  container: {
    height: dynamicSize(50),
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: dynamicSize(15),
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    marginBottom: dynamicSize(5),
    marginHorizontal: dynamicSize(15),
  },
  itemContainer: {
    width: '10%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  righticon: {
    width: dynamicSize(30),
    height: dynamicSize(30),
    marginRight: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Color.black,
    fontSize: getFontSize(14),
    lineHeight: getLineSize(19),
    width: '60%',
    fontFamily: fontFamily.ProximaAB,
  },
});

//make this component available to the app
