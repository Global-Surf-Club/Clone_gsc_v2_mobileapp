//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Header} from '../components/Header';
import WavesInfoItem from '../components/Item';
import {Color} from '../constants/Constants';
import Loader from '../constants/Loader';
import {useDispatch, useSelector} from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

const Forecast = () => {
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const spotConfigration = useSelector(state => state.trip?.spotConfigration);
  const BackButtonClick = () => {
    navigation.goBack();
  };
  const GotoDetail = () => {
    navigation.navigate('WeatherDetail');
  };
  return (
    <>
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={BackButtonClick}
          notification={'6'}
          textAlign={'center'}
        />
        <Loader visible={showLoading} />
        <ScrollView
          bounces={true}
          alwaysBounceVertical={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}>
          <View style={styles.viewContainer}>
            <View>
              <Text>Gwithian</Text>
            </View>
            <View>
              <FlatList
                horizontal={true}
                data={foodItemList}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatlist}
                renderItem={({item, index}) => (
                  <WavesInfoItem
                    onPress={GotoDetail}
                    width={250}
                    marginHorizontal={5}
                    item={item}
                    key={index}
                  />
                )}
                spotConfigration={spotConfigration}
                keyExtractor={({item}, index) => index.toString()}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default Forecast;
