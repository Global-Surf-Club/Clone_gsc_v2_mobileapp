//import liraries
import moment from 'moment';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Color,
  Grid,
  fontFamily,
  fontSize,
  text,
} from '../constants/Constants';
import {
  CURRENT_WIDTH,
  dynamicSize,
  getFontSize,
} from '../constants/Responsive';
import { getHighLow, getWindDirection } from '../constants/Utility';
import FastImage from 'react-native-fast-image';

// create a component
const WavesInfoItem = props => {
  const {
    item,
    onCardClick,
    width,
    marginHorizontal,
    spotName,
    tideExtremesByday,
    onPressBottomRight,
    onPressSpotName,
    spotConfigration,
  } = props;

  let windDirection = parseFloat(
    parseFloat(item?.windDirection?.sg ? item?.windDirection?.sg : 0)?.toFixed(
      0,
    ),
  );
  let SwellPeriod = parseFloat(
    parseFloat(item?.swellPeriod?.sg ? item?.swellPeriod?.sg : 0)?.toFixed(2),
  );
  let SwellHeight = parseFloat(
    parseFloat(item?.swellHeight?.sg ? item?.swellHeight?.sg : 0)?.toFixed(2),
  );
  let swellDirection = parseFloat(
    parseFloat(
      item?.swellDirection?.sg ? item?.swellDirection?.sg : 0,
    )?.toFixed(0),
  );
  let compraition = false;
  let windForm = parseFloat(
    parseFloat(
      spotConfigration?.windDirectionFrom
        ? spotConfigration?.windDirectionFrom
        : 0,
    )?.toFixed(0),
  );
  let windTo = parseFloat(
    parseFloat(
      spotConfigration?.windDirectionTo ? spotConfigration?.windDirectionTo : 0,
    )?.toFixed(0),
  );
  let swellForm = parseFloat(
    parseFloat(
      spotConfigration?.swellDirectionFrom
        ? spotConfigration?.swellDirectionFrom
        : 0,
    )?.toFixed(0),
  );
  let swellTo = parseFloat(
    parseFloat(
      spotConfigration?.swellDirectionTo
        ? spotConfigration?.swellDirectionTo
        : 0,
    )?.toFixed(0),
  );
  let goodWind = false;
  let goodSwell = false;

  if (
    item?.windDirection?.sg !== 'NaN' &&
    item?.swellPeriod?.sg !== 'NaN' &&
    item?.swellHeight?.sg !== 'NaN' &&
    item?.swellDirection?.sg !== 'NaN' &&
    spotConfigration?.swellMinHeight &&
    spotConfigration?.swellMinPeriod &&
    spotConfigration?.swellDirectionFrom &&
    spotConfigration?.swellDirectionTo &&
    swellDirection &&
    spotConfigration?.windDirectionFrom &&
    spotConfigration?.windDirectionTo &&
    item?.windDirection?.sg &&
    item?.swellDirection?.sg &&
    item?.swellHeight?.sg &&
    item?.swellDirection?.sg
  ) {
    if (windForm && windTo && windDirection) {
      for (let index = 1; index > 0; index++) {
        if (windDirection === windForm) {
          goodWind = true;
          break;
        } else {
          windForm++;
          if (windDirection == windForm) {
            goodWind = true;
            break;
          } else if (windForm == windTo) {
            break;
          } else if (windForm === 360) {
            windForm = 0;
          }
        }
      }
    }
    if (swellForm && swellTo && swellDirection) {
      for (let index = 1; index > 0; index++) {
        if (swellDirection == swellForm) {
          goodSwell = true;
          break;
        } else {
          swellForm++;
          if (swellDirection == swellForm) {
            goodSwell = true;
            break;
          } else if (swellForm == swellTo) {
            break;
          } else if (swellForm == 360) {
            swellForm = 0;
          }
        }
      }
    }

    let swellMinH = false;
    let swellMinP = false;

    if (
      parseFloat(
        parseFloat(
          spotConfigration?.swellMinHeight
            ? spotConfigration?.swellMinHeight
            : 0.01,
        )?.toFixed(2),
      ) <= parseFloat(parseFloat(SwellHeight ? SwellHeight : 0)?.toFixed(2))
    ) {
      swellMinH = true;
    }

    if (
      parseFloat(
        parseFloat(
          spotConfigration?.swellMinPeriod
            ? spotConfigration?.swellMinPeriod
            : 0.01,
        )?.toFixed(2),
      ) <= parseFloat(parseFloat(SwellPeriod ? SwellPeriod : 0)?.toFixed(2))
    ) {
      swellMinP = true;
    }

    if (goodWind && goodSwell && swellMinH && swellMinP) {
      compraition = true;
    } else {
      compraition = false;
    }
  } else {
    compraition = false;
  }
  try {
    var { high, low, highTime, lowTime } = getHighLow(
      tideExtremesByday[moment(item?.time).format('l')] ?? [],
    );
  } catch (error) {}
  return (
    <Pressable
      style={[
        WavesInfostyle.cardView,
        { width: width, marginHorizontal: marginHorizontal },
      ]}
      onPress={onCardClick}
    >
      <LinearGradient
        colors={
          compraition === true
            ? ['rgba(31,206 , 190, 1)', 'rgba(169, 240,210 , 1)']
            : ['rgba(31, 190, 206, 1)', 'rgba(169, 210, 240, 1);']
        }
        style={WavesInfostyle.linearGradient}
      >
        <Text style={WavesInfostyle.datetext}>
          {item?.time ? moment(item?.time).format('ddd MM/DD') : ''}
        </Text>
        <View style={WavesInfostyle.section2}>
          <View style={[WavesInfostyle.row, { marginLeft: 0 }]}>
            <View style={WavesInfostyle.infocontainer}>
              {/* <Ionicons size={20} name={'partly-sunny'} color={Color.white} /> */}
              <View style={WavesInfostyle.iconcontainer}>
                <FastImage
                  source={require('../assets/images/icon/cloudy.png')}
                  style={WavesInfostyle.iconimg}
                />
              </View>

              <Text style={WavesInfostyle.boxtext}>
                {item?.airTemperature?.sg?.toFixed(2)}*C
              </Text>
            </View>
            <View style={[WavesInfostyle.infocontainer2, { width: 'auto' }]}>
              {/* <MaterialCommunityIcons size={20} name={'weather-windy'} color={Color.white} /> */}
              <View style={WavesInfostyle.iconcontainer}>
                <FastImage
                  source={require('../assets/images/icon/wind33.png')}
                  style={WavesInfostyle.iconimg}
                />
              </View>
              <Text style={WavesInfostyle.boxtext}>
                {getWindDirection(item?.windDirection?.sg) +
                  ', ' +
                  (item?.windSpeed?.sg * 2.23694)?.toFixed(2)}
                mph
              </Text>
            </View>
          </View>
          {spotName ? (
            <>
              <Pressable onPress={onPressSpotName}>
                <Text numberOfLines={1} style={WavesInfostyle.cityname}>
                  {spotName}
                </Text>
              </Pressable>
            </>
          ) : (
            <></>
          )}
        </View>

        <View style={WavesInfostyle.section3}>
          <Text style={WavesInfostyle.minutetext}>
            {item?.swellHeight?.sg?.toFixed(2)}m
          </Text>
          <View style={WavesInfostyle.vborder}></View>
          <Text style={WavesInfostyle.minutetext}>
            {item?.swellPeriod?.sg?.toFixed(2)}s
          </Text>
        </View>
        <View style={WavesInfostyle.section4}>
          <View style={WavesInfostyle.section4Item}>
            <View style={WavesInfostyle.iconcontainer}>
              <FastImage
                source={require('../assets/images/icon/wave.png')}
                style={WavesInfostyle.iconimg}
              />
            </View>
            <Text style={WavesInfostyle.boxtext}>
              {item?.waterTemperature?.sg?.toFixed(2)}*C
            </Text>
          </View>
          <View style={WavesInfostyle.section4Item}>
            {/* <MaterialCommunityIcons size={20} name={'waves-arrow-up'} color={Color.white} /> */}
            <View style={WavesInfostyle.iconcontainer}>
              <FastImage
                source={require('../assets/images/icon/Tide.png')}
                style={WavesInfostyle.iconimg}
              />
            </View>
            <Text style={WavesInfostyle.boxtext}>
              {item?.waveHeight?.sg?.toFixed(2)}
            </Text>
          </View>
          <View style={WavesInfostyle.section4Item}>
            {/* <Ionicons size={20} name={'partly-sunny'} color={Color.white} /> */}
            <View style={WavesInfostyle.iconcontainer}>
              <FastImage
                source={require('../assets/images/icon/swell.png')}
                style={WavesInfostyle.iconimg}
              />
            </View>
            <Text style={WavesInfostyle.boxtext}>
              {item?.wavePeriod?.sg?.toFixed(2)}s
            </Text>
          </View>
        </View>
        <View style={WavesInfostyle.section5}>
          <View style={WavesInfostyle.section4Item}>
            <Text style={WavesInfostyle.boxtext}>
              L {highTime ? moment(highTime).format('HH:mm') : 'NaN'}
            </Text>
          </View>
          <View style={WavesInfostyle.section4Item}>
            <Text style={WavesInfostyle.boxtext}>
              H {lowTime ? moment(lowTime).format('HH:mm') : 'NaN'}
            </Text>
          </View>
        </View>
        <Text style={WavesInfostyle.updatedetext}>
          {'Updated at ' + new Date().getMinutes() + ' minutes ago'}
        </Text>
        <View style={WavesInfostyle.profileicon}>
          {/* <FontAwesome size={30} name={'user-circle-o'} color={Color.white} /> */}
          <Pressable
            onPress={onPressBottomRight}
            style={WavesInfostyle.righticon}
          >
            {onPressBottomRight && (
              <FastImage
                tintColor={'blue'}
                imageStyle={{ borderRadius: 50 }}
                source={require('../assets/images/icon/forecast.png')}
                style={[WavesInfostyle.righticoncontainer2]}
              />
            )}
          </Pressable>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

// define your styles
const WavesInfostyle = StyleSheet.create({
  iconcontainer: {
    height: dynamicSize(18),
    width: dynamicSize(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconimg: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  righticoncontainer2: {
    height: dynamicSize(35),
    width: dynamicSize(35),
  },
  profileicon: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    opacity: 0.7,
  },
  section5: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  updatedetext: {
    // fontSize: getFontSize(11),
    // position: 'absolute',
    // bottom: 7,
    // left: 15,
    // color: Color.white,
    // fontWeight: '600',
    position: 'absolute',
    bottom: 7,
    left: 15,
    fontSize: fontSize.font12,
    color: Color.white,
    fontFamily: fontFamily.ProximaBold,
    lineHeight: fontSize.font16,
  },
  section4Item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    width: '26%',
  },
  section4: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section3: {
    flexDirection: 'row',
    marginTop: dynamicSize(15),
    marginBottom: dynamicSize(15),
    alignItems: 'center',
  },
  vborder: {
    height: '80%',
    width: 2,
    backgroundColor: Color.white,
    marginHorizontal: dynamicSize(20),
  },
  minutetext: {
    fontSize: getFontSize(28),
    fontFamily: fontFamily.ProximaAB,
    color: Color.white,
    fontWeight: '400',
  },
  boxtext: {
    ...text.boxtext,
    color: Color.white,
    marginLeft: dynamicSize(5),
  },
  datetext: {
    ...text.subtitle,
    color: Color.white,
  },
  cityname: {
    ...text.subtitle,
    color: Color.yellow,
    maxWidth: CURRENT_WIDTH - dynamicSize(260),

    // textAlign: 'right',
  },
  section2: {
    ...Grid.row,
    justifyContent: 'space-between',
    width: '100%',
    marginTop: dynamicSize(10),
    paddingHorizontal: dynamicSize(8),
  },
  infocontainer: {
    ...Grid.row,
    marginHorizontal: dynamicSize(6),
    // width: '35%',
  },
  infocontainer2: {
    ...Grid.row,
    marginHorizontal: dynamicSize(6),
    width: '70%',
  },
  row: {
    ...Grid.row,
    // width: '65%',
    // justifyContent: 'flex-start',
  },
  linearGradient: {
    borderRadius: dynamicSize(25),
    marginTop: dynamicSize(10),
    // ...Shadow.boxShadow,
    alignItems: 'center',
    paddingHorizontal: dynamicSize(5),
    paddingVertical: dynamicSize(13),
  },
  cardView: {
    marginBottom: dynamicSize(10),
  },
});

export default WavesInfoItem;
