//import liraries
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Color, fontFamily, Shadow } from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';

// import { color } from 'react-native-reanimated';

// create a component
// export const ImageButton = (props) => {

//     const { backgroundColor, title, color, icon, onPress, isShadow } = props;

//     return (
//         <View style={Imagestyles.container}>
//             <Pressable style={[Imagestyles.buttonBody, isShadow ? Imagestyles.shadowValue : {}, { backgroundColor: backgroundColor }]} onPress={onPress}>
//                 {icon ? <AntDesign style={Imagestyles.icon} name={icon} color={color} size={20} /> : <></>}
//                 <Text style={[Imagestyles.text, { color: color, paddingRight: icon ? 15 : 0 }]}>{title}</Text>
//             </Pressable>
//         </View>
//     );
// };

// define your styles
// const Imagestyles = StyleSheet.create({
//     container: {
//         width: '100%',
//     },
//     shadowValue: {
//         shadowColor: Color.blackO,
//         shadowOffset: { height: 4, width: 0 },
//         shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
//         shadowRadius: Platform.OS === 'android' ? 10 : 4,
//         elevation: Platform.OS === 'android' ? 5 : 0
//     },
//     buttonBody: {
//         height: 50,
//         backgroundColor: Color.golden,
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderRadius: 5,
//         flexDirection: 'row',
//     },
//     text: {
//         color: Color.white,
//         fontSize: 14,
//         fontWeight: '700',
//     },
//     icon: {
//         paddingHorizontal: 10,
//         paddingBottom: 3,
//     }
// });

// // create a component
export const MenuItemButtom = props => {
  const { onPress, title, icon, icon2 } = props;

  return (
    <View style={MenuItemButtomStyle.maincontainer}>
      <Pressable onPress={onPress} style={MenuItemButtomStyle.container}>
        <LinearGradient
          colors={['rgba(31, 190, 206, 1)', 'rgba(169, 210, 240, 1);']}
          style={MenuItemButtomStyle.linearGradient}
        >
          <FastImage
            imageStyle={{ borderRadius: 50 }}
            source={icon}
            resizeMode={'contain'}
            style={MenuItemButtomStyle.righticoncontainer2}
          />
          <Text style={MenuItemButtomStyle.menutext}>{title}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
};

// create a component
export const ImageButton = props => {
  const { backgroundColor, title, color, icon, onPress, isShadow } = props;

  return (
    <View style={Imagestyles.container}>
      <Pressable
        style={[
          Imagestyles.buttonBody,
          isShadow ? Imagestyles.shadowValue : {},
          { backgroundColor: backgroundColor },
        ]}
        onPress={onPress}
      >
        {icon ? (
          <FastImage
            style={Imagestyles.icon}
            tintColor={Color.white}
            source={icon}
          />
        ) : (
          <></>
        )}
        <Text
          style={[
            Imagestyles.text,
            { color: color, paddingRight: icon ? 5 : 6 },
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </View>
  );
};

// define your styles
const Imagestyles = StyleSheet.create({
  container: {
    // width: '100%',
  },
  shadowValue: {
    ...Shadow.boxShadow,
  },
  buttonBody: {
    marginTop: dynamicSize(10),
    height: dynamicSize(35),
    minWidth: dynamicSize(100),
    backgroundColor: Color.lightblue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  text: {
    left: 5,
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
  },
  icon: {
    height: dynamicSize(20),
    width: dynamicSize(20),
    resizeMode: 'contain',
  },
});

// define your styles
const MenuItemButtomStyle = StyleSheet.create({
  righticoncontainer2: {
    height: dynamicSize(25),
    width: dynamicSize(25),
  },
  menutext: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(19),
    color: Color.white,
    textTransform: 'capitalize',
    marginTop: 6,
  },
  maincontainer: {
    width: '100%',
  },
  container: {
    borderRadius: 20,
    backgroundColor: Color.gray,
    justifyContent: 'center',
    alignItems: 'center',
    height: dynamicSize(140),
    zIndex: 1,
  },
  linearGradient: {
    // ...Shadow.boxShadow,
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    borderRadius: 20,
  },
});

// create a component
export const RoundButton = props => {
  const {
    onPress,
    title,
    backgroundColor,
    disabled = false,
    isInviteProgress = false,
  } = props;

  return (
    <Pressable
      disabled={disabled ? disabled : false}
      hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
      onPress={onPress}
      style={[
        RoundStyle.container,
        {
          backgroundColor: backgroundColor ? backgroundColor : Color.lightblue,
        },
      ]}
    >
      {isInviteProgress ? (
        <ActivityIndicator size="small" color={Color.white} />
      ) : (
        <Text style={RoundStyle.text}>{title}</Text>
      )}
    </Pressable>
  );
};
// define your styles
const RoundStyle = StyleSheet.create({
  text: {
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
  },
  container: {
    minWidth: dynamicSize(90),
    height: dynamicSize(40),
    paddingHorizontal: dynamicSize(20),
    borderRadius: 75,
    backgroundColor: Color.lightblue,
    position: 'absolute',
    right: dynamicSize(20),
    bottom: dynamicSize(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
});
// create a component
export const RoundborderButton = props => {
  const { onPress, title } = props;

  return (
    <Pressable onPress={onPress} style={RoundborderStyle.container}>
      <Text style={RoundborderStyle.text}>{title}</Text>
    </Pressable>
  );
};
// define your styles
const RoundborderStyle = StyleSheet.create({
  text: {
    color: Color.lightblue,
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 18,
  },
  container: {
    minWidth: 90,
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: Color.lightblue,
    backgroundColor: Color.white,
    position: 'absolute',
    right: 120,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
});
// create a component
export const ButtonRound = props => {
  const {
    onPress,
    title,
    backgroundColor,
    isProcessing,
    disabled = false,
  } = props;

  return (
    <Pressable
      disabled={isProcessing || disabled}
      onPress={onPress}
      style={[
        ButtonRoundStyle.container,
        {
          backgroundColor:
            isProcessing || disabled
              ? Color.gray
              : backgroundColor
              ? backgroundColor
              : Color.lightblue,
          flexDirection: 'row',
        },
      ]}
    >
      {isProcessing ? (
        <ActivityIndicator size={15} color="white" style={{ marginRight: 5 }} />
      ) : (
        <></>
      )}
      <Text style={ButtonRoundStyle.text}>{title}</Text>
    </Pressable>
  );
};
// define your styles
const ButtonRoundStyle = StyleSheet.create({
  text: {
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
  },
  container: {
    minWidth: dynamicSize(60),
    height: dynamicSize(35),
    // paddingHorizontal: 20,
    borderRadius: 75,
    backgroundColor: Color.lightblue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
});

// create a component
export const ShowButton = props => {
  const { onPress, title, backgroundColor } = props;

  return (
    <Pressable
      onPress={onPress}
      style={[
        ShowButtonStyle.container,
        {
          backgroundColor: backgroundColor ? backgroundColor : Color.lightblue,
        },
      ]}
    >
      <Text style={ShowButtonStyle.text}>{title}</Text>
    </Pressable>
  );
};
// define your styles
const ShowButtonStyle = StyleSheet.create({
  text: {
    color: Color.lightblue,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(18),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  container: {
    paddingVertical: dynamicSize(9),
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Color.lightblue,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: dynamicSize(10),
    marginHorizontal: dynamicSize(5),
  },
});

// create a component
export const BorderButton = props => {
  const { onPress, title, color, borderColor, backgroundColor, isProcessing } =
    props;

  return (
    <View style={BorderButtonStyle.maincontainer}>
      <Pressable
        disabled={isProcessing ? true : false}
        onPress={onPress}
        style={[
          BorderButtonStyle.container,
          {
            borderColor: isProcessing
              ? Color.gray
              : backgroundColor == Color.lightblue
              ? Color.lightblue
              : borderColor ?? color,
            backgroundColor: isProcessing ? Color.gray : backgroundColor,
            flexDirection: 'row',
          },
        ]}
      >
        {isProcessing ? (
          <ActivityIndicator
            size={15}
            color="white"
            style={{ marginRight: 5 }}
          />
        ) : (
          <></>
        )}
        <Text style={[BorderButtonStyle.text, { color: color }]}>{title}</Text>
      </Pressable>
    </View>
  );
};
// define your styles
const BorderButtonStyle = StyleSheet.create({
  maincontainer: {
    width: '100%',
  },
  text: {
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
  },
  container: {
    height: dynamicSize(40),
    paddingHorizontal: dynamicSize(20),
    borderRadius: 75,
    // backgroundColor: Color.lightblue,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
});
// create a component
export const TableButton = props => {
  const { onPress, title, backgroundColor } = props;

  return (
    <Pressable
      onPress={onPress}
      style={[TableButtonStyle.container, { backgroundColor: backgroundColor }]}
    >
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={TableButtonStyle.text}
      >
        {title}
      </Text>
    </Pressable>
  );
};
// define your styles
const TableButtonStyle = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: getFontSize(13),
    lineHeight: getFontSize(20),
    fontFamily: fontFamily.ProximaAB,
  },
  container: {
    minHeight: dynamicSize(35),
    maxWidth: dynamicSize(100),
    paddingHorizontal: dynamicSize(12),
    borderRadius: 12,
    backgroundColor: Color.lightblue,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: dynamicSize(30),
    marginHorizontal: dynamicSize(5),
    // ...Shadow.boxShadow,
  },
});

export const IconButton = props => {
  const { onPress, title, backgroundColor, disabled } = props;

  return (
    <Pressable
      disabled={disabled ? disabled : false}
      onPress={onPress}
      style={[
        IconButtontyle.container,
        { backgroundColor: backgroundColor, borderWidth: disabled ? 0 : 1 },
      ]}
    >
      <AntDesign name="plus" color={Color.white} size={getFontSize(25)} />
    </Pressable>
  );
};
// define your styles
const IconButtontyle = StyleSheet.create({
  text: {
    color: Color.lightblue,
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 18,
  },
  container: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Color.primary,
    backgroundColor: Color.white,
    position: 'absolute',
    right: 20,
    bottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Color.primary,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    // elevation: Platform.OS === 'android' ? 0 : 0,
  },
});
