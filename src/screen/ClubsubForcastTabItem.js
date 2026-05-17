//import liraries
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  Image,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  Text,
  View,
  Dimensions,
 
  ScrollView,
} from 'react-native';
import {Header} from '../components/Header';
import {TableButton} from '../components/Buttons';
import {Color, fontFamily, Grid} from '../constants/Constants';
import Loader from '../constants/Loader';
import {Divider} from 'react-native-paper';
import {TabView, TabBar} from 'react-native-tab-view';
import WavesInfoItem from '../components/Item';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {PhotoGrid} from 'react-native-photo-grid-frame';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

const ClubsubForcastTabItem = () => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();

  const [text, setText] = React.useState('');
  const [showLoading, SetshowLoading] = useState(false);
  const [index, setIndex] = React.useState(0);
  const [foodItemList, SetFoodItemList] = useState([
    {
      id: 1,
      date: 'Fri 04/01',
      c: '6.83',
      nnn: 'NNE,17.69mph',
      minute: '1.28',
      second: '5-67',
      wavyc: '9.14',
      wavy2: 'N/A',
      wavysecond: '10.50',
      ltime: 'N/A',
      htime: 'N/A',
    },
    {
      id: 2,
      date: 'Fri 04/01',
      c: '6.83',
      nnn: 'NNE,17.69mph',
      minute: '1.28',
      second: '5-67',
      wavyc: '9.14',
      wavy2: 'N/A',
      wavysecond: '10.50',
      ltime: 'N/A',
      htime: 'N/A',
    },
    {
      id: 3,
      date: 'Fri 04/01',
      c: '6.83',
      nnn: 'NNE,17.69mph',
      minute: '1.28',
      second: '5-67',
      wavyc: '9.14',
      wavy2: 'N/A',
      wavysecond: '10.50',
      ltime: 'N/A',
      htime: 'N/A',
    },
    {
      id: 4,
      date: 'Fri 04/01',
      c: '6.83',
      nnn: 'NNE,17.69mph',
      minute: '1.28',
      second: '5-67',
      wavyc: '9.14',
      wavy2: 'N/A',
      wavysecond: '10.50',
      ltime: 'N/A',
      htime: 'N/A',
    },
    {
      id: 5,
      date: 'Fri 04/01',
      c: '6.83',
      nnn: 'NNE,17.69mph',
      minute: '1.28',
      second: '5-67',
      wavyc: '9.14',
      wavy2: 'N/A',
      wavysecond: '10.50',
      ltime: 'N/A',
      htime: 'N/A',
    },
    {
      id: 6,
      date: 'Fri 04/01',
      c: '6.83',
      nnn: 'NNE,17.69mph',
      minute: '1.28',
      second: '5-67',
      wavyc: '9.14',
      wavy2: 'N/A',
      wavysecond: '10.50',
      ltime: 'N/A',
      htime: 'N/A',
    },
    {
      id: 7,
      date: 'Fri 04/01',
      c: '6.83',
      nnn: 'NNE,17.69mph',
      minute: '1.28',
      second: '5-67',
      wavyc: '9.14',
      wavy2: 'N/A',
      wavysecond: '10.50',
      ltime: 'N/A',
      htime: 'N/A',
    },
  ]);
  const Photos = [
    {
      url: 'https://i.pinimg.com/originals/9c/b0/70/9cb070d62dc738a0c3a1a408d68e4af5.jpg',
    },

    {
      url: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=440&h=220&q=60',
    },

    {
      url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8c3VyZnxlbnwwfHwwfHw%3D&w=1000&q=80',
    },

    {
      url: 'https://media.istockphoto.com/photos/view-of-man-learning-to-surf-in-the-morning-picture-id1296040412?b=1&k=20&m=1296040412&s=170667a&w=0&h=YmMGxH0Y61Sys22SzoWpJEkt98lLQ8pvaylQnNDrbzQ=',
    },

    {
      url: 'https://media.istockphoto.com/photos/professional-surfboarder-finishes-riding-another-epic-tube-wave-picture-id1182230605?k=20&m=1182230605&s=612x612&w=0&h=mz_zOW9Ak6-csVymQstXqwiqMHnclYUTZ5p6SfDz9dY=',
    },

    {
      url: 'https://www.goabroad.com/section_cloudinary/gaplabs/image/upload/c_fill,g_faces:auto,fl_progressive,h_900,w_1200/v1/images2/program_content/best-beginner-surf-spots-asia-featured-image-1611141308.jpg',
    },

    {
      url: 'https://i.pinimg.com/originals/9c/b0/70/9cb070d62dc738a0c3a1a408d68e4af5.jpg',
    },
  ];
  const BackButtonClick = () => {
    navigation.goBack();
  };

  const router = ({route}) => {
    switch (route.key) {
      case 'first':
        return (
          <ScrollView>
            <View style={tab2styles.container}>
              <Text style={tab2styles.UpdatedInformation}>
                Updated 0 minutes ago
              </Text>
              <View style={tab2styles.Directions}>
                <View style={tab2styles.Directions1}>
                  <FastImage
                    style={tab2styles.icon}
                    source={require('../assets/images/icon/wind33.png')}
                  />
                  <Text style={tab2styles.Tempraturemph}>17.94mph,N</Text>
                </View>
                <View style={[tab2styles.Directions1, tab2styles.alignright]}>
                  <Text style={[tab2styles.Tempraturemph]}>Period 10s</Text>
                </View>
              </View>
              <Text style={tab2styles.TempratureNumber}>1.32m</Text>
              <View style={tab2styles.Directions}>
                <View style={tab2styles.Directions1}>
                  <FastImage
                    style={tab2styles.Waveicon}
                    source={require('../assets/images/icon/wave.png')}
                  />
                  <Text style={tab2styles.TempratureCelcious}>9°C</Text>
                </View>
                <View style={tab2styles.Directions1}>
                  <Text style={tab2styles.BorderLeft}></Text>
                  <Text style={tab2styles.TempratureCelcious}>
                    Swell: 0.40m, S
                  </Text>
                </View>
              </View>
              <View style={tab2styles.mapContainer}></View>
              <TouchableOpacity style={tab2styles.dorpdowncontainer}>
                <Text style={tab2styles.dropndowntext}>This Week</Text>
                <FastImage
                  source={require('../assets/images/icon/dropDownIcon.png')}
                  style={tab2styles.dropndownicon}
                />
              </TouchableOpacity>
              <View>
                <Text style={tab2styles.DayTime}>Friday-04/01/2022</Text>
                <Divider style={styles.divider} />
                <Text style={tab2styles.TableHeading}>Tides</Text>
                <View style={tab2styles.Table}>
                  <View style={tab2styles.TableFirstRow}>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>High</Text>
                      <Text style={tab2styles.TableText}>10:55</Text>
                    </View>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>First Light</Text>
                      <Text style={tab2styles.TableText}>10:55</Text>
                    </View>
                  </View>
                  <View style={tab2styles.TableSecondRow}>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Low</Text>
                      <Text style={tab2styles.TableText}>17:13</Text>
                    </View>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Sunrise</Text>
                      <Text style={tab2styles.TableText}>11:28</Text>
                    </View>
                  </View>
                  <View style={tab2styles.TableFirstRow}>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>High</Text>
                      <Text style={tab2styles.TableText}>23:13</Text>
                    </View>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Sunset</Text>
                      <Text style={tab2styles.TableText}>00:22</Text>
                    </View>
                  </View>
                  <View style={tab2styles.TableSecondRow}>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Low</Text>
                      <Text style={tab2styles.TableText}></Text>
                    </View>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Last Light</Text>
                      <Text style={tab2styles.TableText}>00:55</Text>
                    </View>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  style={{paddingTop: 20}}>
                  <View style={tab2styles.Directions}>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="TIME"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn}>
                        <Text style={tab2styles.DateTableHeadingText}>
                          21:00
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          09:00
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          Noon
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          15:00
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          18:00
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          21:00
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="SURF"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn1}>
                        <Text style={tab2styles.DateTableText}>
                          1.33m{'\n'}5.68s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.68m {'\n'}7.55s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.69m {'\n'}8.72s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.86m{'\n'} 5.47s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.81m{'\n'} 6.39s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.84m {'\n'}7.14s
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="WIND"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn2}>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          N {'\n'} 7.89mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          NW {'\n'} 2.45mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 2.51mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 4.26mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          NW {'\n'} 4.57mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 5.76mph
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="SWELL 1"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn1}>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          WSW 0.40M {'\n'} @10.49S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          W 0.30M {'\n'} @4.01S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          WSW 0.20M {'\n'} @7.64S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.07M {'\n'} @14.95S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.17M {'\n'} @13.10S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.35M {'\n'} @9.92S
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="SURF"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn1}>
                        <Text style={tab2styles.DateTableText}>
                          1.33m{'\n'}5.68s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.68m {'\n'}7.55s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.69m {'\n'}8.72s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.86m{'\n'} 5.47s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.81m{'\n'} 6.39s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.84m {'\n'}7.14s
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="WIND"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn2}>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          N {'\n'} 7.89mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          NW {'\n'} 2.45mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 2.51mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 4.26mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          NW {'\n'} 4.57mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 5.76mph
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="SWELL 1"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn1}>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          WSW 0.40M {'\n'} @10.49S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          W 0.30M {'\n'} @4.01S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          WSW 0.20M {'\n'} @7.64S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.07M {'\n'} @14.95S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.17M {'\n'} @13.10S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.35M {'\n'} @9.92S
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
              <View>
                <Text style={tab2styles.DayTime}>Friday-04/01/2022</Text>
                <Divider style={styles.divider} />
                <Text style={tab2styles.TableHeading}>Tides</Text>
                <View style={tab2styles.Table}>
                  <View style={tab2styles.TableFirstRow}>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>High</Text>
                      <Text style={tab2styles.TableText}>10:55</Text>
                    </View>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>First Light</Text>
                      <Text style={tab2styles.TableText}>10:55</Text>
                    </View>
                  </View>
                  <View style={tab2styles.TableSecondRow}>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Low</Text>
                      <Text style={tab2styles.TableText}>17:13</Text>
                    </View>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Sunrise</Text>
                      <Text style={tab2styles.TableText}>11:28</Text>
                    </View>
                  </View>
                  <View style={tab2styles.TableFirstRow}>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>High</Text>
                      <Text style={tab2styles.TableText}>23:13</Text>
                    </View>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Sunset</Text>
                      <Text style={tab2styles.TableText}>00:22</Text>
                    </View>
                  </View>
                  <View style={tab2styles.TableSecondRow}>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Low</Text>
                      <Text style={tab2styles.TableText}></Text>
                    </View>
                    <View style={tab2styles.Directions1}>
                      <Text style={tab2styles.TableText}>Last Light</Text>
                      <Text style={tab2styles.TableText}>00:55</Text>
                    </View>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  style={{paddingTop: 20}}>
                  <View style={tab2styles.Directions}>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="TIME"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn}>
                        <Text style={tab2styles.DateTableHeadingText}>
                          21:00
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          09:00
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          Noon
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          15:00
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          18:00
                        </Text>
                        <Text style={tab2styles.DateTableHeadingText}>
                          21:00
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="SURF"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn1}>
                        <Text style={tab2styles.DateTableText}>
                          1.33m{'\n'}5.68s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.68m {'\n'}7.55s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.69m {'\n'}8.72s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.86m{'\n'} 5.47s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.81m{'\n'} 6.39s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.84m {'\n'}7.14s
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="WIND"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn2}>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          N {'\n'} 7.89mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          NW {'\n'} 2.45mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 2.51mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 4.26mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          NW {'\n'} 4.57mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 5.76mph
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="SWELL 1"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn1}>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          WSW 0.40M {'\n'} @10.49S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          W 0.30M {'\n'} @4.01S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          WSW 0.20M {'\n'} @7.64S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.07M {'\n'} @14.95S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.17M {'\n'} @13.10S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.35M {'\n'} @9.92S
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="SURF"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn1}>
                        <Text style={tab2styles.DateTableText}>
                          1.33m{'\n'}5.68s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.68m {'\n'}7.55s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.69m {'\n'}8.72s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.86m{'\n'} 5.47s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.81m{'\n'} 6.39s
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          0.84m {'\n'}7.14s
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="WIND"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn2}>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          N {'\n'} 7.89mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          NW {'\n'} 2.45mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 2.51mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 4.26mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          NW {'\n'} 4.57mph
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          N {'\n'} 5.76mph
                        </Text>
                      </View>
                    </View>
                    <View style={tab2styles.DateTable}>
                      <TableButton
                        title="SWELL 1"
                        backgroundColor="black"
                        color="white"
                      />
                      <View style={tab2styles.TableColumn1}>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          WSW 0.40M {'\n'} @10.49S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          W 0.30M {'\n'} @4.01S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          {' '}
                          WSW 0.20M {'\n'} @7.64S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.07M {'\n'} @14.95S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.17M {'\n'} @13.10S
                        </Text>
                        <Text style={tab2styles.DateTableText}>
                          WSW 0.35M {'\n'} @9.92S
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </ScrollView>
        );

      case 'second':
        return (
          <ScrollView>
            <View style={DetailsTabstyles.detailcontainer}>
              <View style={DetailsTabstyles.mapContainer}></View>
              <View>
                <View style={DetailsTabstyles.botttomborder}>
                  <Text style={DetailsTabstyles.title}>Spot Guide</Text>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Surf Type :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>Surf</Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Experience :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>All Surfers</Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Frequency :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      Very Consistent (150 Day/year)
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Wave Quality :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      Regional Classic
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Wave Type :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>Beach-break</Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Wave Direction :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      Right and left
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Wave Power :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      Hollow, Fast, Powerfull, Ordinary, Fun, Powerless, Ledgey
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>
                      Wave Normal Length :
                    </Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      Normal (50 to 150m)
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>
                      Wave Good day Length :
                    </Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      Long (50 to 150m)
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Sea Bottom :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>Sandy</Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Swell Size :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      Start working at Less than 1m / 3ft and Holds up{' '}
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>
                      Good Swell Direction :
                    </Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      NortWest, West, SouthWest
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>
                      Good Wind Direction :
                    </Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      {' '}
                      SouthEast, East, NortEast
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>
                      Best Tide Position :
                    </Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>
                      Low and mid tide
                    </Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Weekend Crowd :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>Crowded</Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>Week Crowd :</Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}>Few surfers</Text>
                  </View>
                </View>
                <View style={DetailsTabstyles.row}>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.label}>
                      Additional Info :
                    </Text>
                  </View>
                  <View style={DetailsTabstyles.box50}>
                    <Text style={DetailsTabstyles.labeltaxt}></Text>
                  </View>
                </View>
              </View>
              <View>
                <View style={DetailsTabstyles.botttomborder}>
                  <Text style={DetailsTabstyles.title}>Gallery</Text>
                </View>
                <View>
                  <PhotoGrid PhotosList={Photos} borderRadius={10} />
                </View>
              </View>
              <View>
                <View style={DetailsTabstyles.botttomborder}>
                  <Text style={DetailsTabstyles.title}>Nearby Spots</Text>
                </View>
                <View style={DetailsTabstyles.botttomborder}>
                  <Pressable style={DetailsTabstyles.radiobtn}>
                    <Text style={DetailsTabstyles.label}>Nearby Spots</Text>
                    <View style={DetailsTabstyles.redioborder}>
                      {/* <FastImage
                                                style={DetailsTabstyles.radio}
                                                source={require('../assets/images/icon/CheckBox.png')}
                                            /> */}
                    </View>
                  </Pressable>
                </View>
                <View style={DetailsTabstyles.botttomborder}>
                  <Pressable style={DetailsTabstyles.radiobtn}>
                    <Text style={DetailsTabstyles.label}>Nearby Spots</Text>
                    <View style={DetailsTabstyles.redioborder}>
                      {/* <FastImage
                                                style={DetailsTabstyles.radio}
                                                source={require('../assets/images/icon/CheckBox.png')}
                                            /> */}
                    </View>
                  </Pressable>
                </View>
                <View style={DetailsTabstyles.botttomborder}>
                  <Pressable style={DetailsTabstyles.radiobtn}>
                    <Text style={[DetailsTabstyles.label, {width: '80%'}]}>
                      Nearby Spots
                    </Text>
                    <View style={DetailsTabstyles.redioborder}>
                      {/* <FastImage
                                                style={DetailsTabstyles.radio}
                                                source={require('../assets/images/icon/CheckBox.png')}
                                            /> */}
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        );
    }
  };
  const [routes] = React.useState([
    {key: 'first', title: 'Forecast'},
    {key: 'second', title: 'Details'},
  ]);
  const renderTabBar = props => (
    <TabBar
      {...props}
      bounces
      activeColor={Color.white}
      inactiveColor={Color.lightblue}
      labelStyle={styles.labelStyle}
      indicatorStyle={{
        backgroundColor: Color.lightblue,
        height: '100%',
        borderRadius: 10,
      }}
      style={{
        backgroundColor: Color.lightGray,
        borderRadius: 10,
        marginHorizontal: '2%',
      }}
    />
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={BackButtonClick}
          // notification={'6'}
          // messagenotification={'6'}
          textAlign={'center'}
        />
        <Loader visible={showLoading} />

        <View style={styles.tabcontainer}>
          <TabView
            renderScene={router}
            onIndexChange={setIndex}
            renderTabBar={renderTabBar}
            initialLayout={{width: layout.width}}
            navigationState={{index, routes, navigation}}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  labelStyle: {
    fontFamily: fontFamily.ProximaAB,
    textTransform: 'capitalize',
    fontSize: 14,
    lineHeight: 20,
  },
  paperinput: {
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  textbtnstyle: {
    fontSize: 13,
    color: Color.black,
    fontWeight: '800',
  },
  inputcontainer: {
    paddingHorizontal: 15,
  },
  tabbartab1: {
    flex: 1,
    paddingVertical: 10,
  },
  tabcontainer: {
    // marginHorizontal: '2%',
    marginTop: 10,
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

const DetailsTabstyles = StyleSheet.create({
  radiobtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
  },
  redioborder: {
    height: 22,
    borderRadius: 20,
    borderWidth: 1,
    width: 22,
    borderColor: Color.lightblue,
  },
  mapContainer: {
    backgroundColor: Color.lightblue,
    width: '100%',
    height: 150,
    borderRadius: 20,
    marginVertical: 10,
  },
  labeltaxt: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontFamily.poppinsM,
    color: Color.lightblue,
  },
  detailcontainer: {
    paddingHorizontal: 10,
  },
  box50: {
    width: '50%',
  },
  row: {
    ...Grid.row,
    paddingVertical: 5,
  },
  title: {
    fontSize: 18,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: fontFamily.poppinsM,
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.poppinsM,
    lineHeight: 21,
    flexWrap: 'wrap',
    color: Color.black,
    paddingHorizontal: 3,
  },
  botttomborder: {
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    marginVertical: 5,
    paddingVertical: 8,
    marginHorizontal: 10,
  },
});

const tab2styles = StyleSheet.create({
  // Same css Tab 1 And Tab 2 Start
  dorpdowncontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropndowntext: {
    fontSize: 20,
    fontFamily: fontFamily.poppinsS,
    color: Color.black,
    marginRight: 8,
  },
  dropndownicon: {
    height: 8,
    width: 13,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 1,
  },
  UpdatedInformation: {
    color: Color.gray,
    marginBottom: 10,
  },
  icon: {
    height: 20,
    width: 20,
    marginTop: 3,
    marginRight: 5,
    tintColor: Color.lightblue,
  },
  Waveicon: {
    height: 15,
    width: 15,
    marginTop: 3,
    marginRight: 5,
  },
  Directions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  alignright: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  Directions1: {
    flexDirection: 'row',
    width: '50%',
  },
  TempratureCelcious: {
    color: Color.lightblue,
    fontFamily: fontFamily.poppinsR,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  Tempraturemph: {
    color: Color.lightblue,
    fontSize: 18,
    fontFamily: fontFamily.poppinsR,
  },
  TempratureNumber: {
    color: Color.black0,
    fontSize: 24,
    marginVertical: 10,
    fontFamily: fontFamily.poppinsS,
  },
  SwellText: {
    color: Color.lightblue,
    fontSize: 16,
  },
  BorderLeft: {
    marginRight: 10,
    borderLeftWidth: 1,
    borderLeftColor: Color.cardgray,
  },
  mapContainer: {
    backgroundColor: Color.lightblue,
    width: '100%',
    height: 150,
    borderRadius: 20,
    marginVertical: 10,
  },
  TableHeading: {
    fontSize: 18,
    color: Color.black0,
    fontFamily: fontFamily.poppinsR,
    marginVertical: 10,
  },
  Table: {
    flexDirection: 'column',
  },
  TableFirstRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    // justifyContent: 'space-between'
    // opacity:.9
  },
  TableSecondRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: Color.tablebgblue,
    paddingHorizontal: 5,
    // justifyContent: 'space-between',
    borderRadius: 6,
    // opacity: .7
  },
  TableText: {
    fontSize: 14,
    color: 'black',
    marginHorizontal: 5,
    fontFamily: fontFamily.poppinsR,
    lineHeight: 19,
  },
  // Same css Tab 1 And Tab 2 End
  DayTime: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    marginVertical: 10,
  },
  TableColumn1: {
    backgroundColor: Color.lightpink,
    paddingVertical: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  DateTable: {
    flexDirection: 'column',
    marginHorizontal: 5,
  },
  TableColumn: {
    paddingVertical: 20,
    width: '100%',
    marginVertical: 10,
    borderRadius: 20,
  },
  TableColumn2: {
    backgroundColor: Color.tablebgblue,
    paddingVertical: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  DateTableText: {
    color: 'black',
    fontSize: 13,
    marginVertical: 20,
    flexWrap: 'wrap',
    textAlign: 'center',
    fontFamily: fontFamily.poppinsR,
    lineHeight: 19,
  },
  DateTableHeadingText: {
    width: 60,
    color: 'black',
    fontFamily: fontFamily.poppinsS,
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 27.5,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
});
//make this component available to the app
export default ClubsubForcastTabItem;
