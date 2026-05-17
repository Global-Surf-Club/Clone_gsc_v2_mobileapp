//import liraries
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import Popover from 'react-native-popover-view';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import ListModal from '../components/ListModal';
import {
  Color,
  fontFamily,
  resizeMode,
  Shadow,
  text,
  userSkillLevel,
} from '../constants/Constants';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import Carousel, { Pagination } from 'react-native-snap-carousel';

export const SLIDER_WIDTH = Dimensions.get('window').width - 60;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH);
import Blockreport from '../api/Blockreport';
import SuccessModal from '../components/SuccessModal';
import ClubsAPi from '../api/ClubApi';
import { useSelector, useDispatch } from 'react-redux';
import { ClubmultiplePopover } from './ClubmultiplePopover';
import { globlestyle } from '../styles/globlestyle';
import FastImage from 'react-native-fast-image';
import { toggleClubForumLike } from '../store/clubSlice';
import { getUserInfoText } from '../constants/Utility';
// create a component
export const ClubPostCardItem = props => {
  const {
    item,
    onCardClick,
    onclickcomment,
    onPressImage,
    onPressUpdateForm,
    onclickLike,
    onclickDisLike,
    ref,
    onPressDeleteForm,
    ForumID,
    onLayout,
  } = props;

  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const flatListRef = useRef();
  const [showMessage, setshowMessage] = useState(false);
  const [selectusersID, setselectusersID] = useState('');
  const [index, setIndex] = useState(0);
  const isCarousel = useRef(null);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [textShown, setTextShown] = useState(false); //To show ur remaining Text
  const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"
  const [reportModal, setreportModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const { width } = Dimensions.get('screen');
  const images = item?.postImages?.map(image => image?.thumbnailImageUrl) ?? [];
  const imageW = width * 0.88;
  const [isLiked, setIsLiked] = useState(item?.isLike ?? false);
  const [likesCount, setLikesCount] = useState(item?.likeCount ?? 0);
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [heightlightColor, setheightlightColor] = useState(Color.lightblue);
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(id => String(id) === String(item?.createdBy));
  const toggletext = () => {
    setshowMessage(!showMessage);
  };

  const toggleNumberOfLines = () => {
    setTextShown(!textShown);
  };

  const onTextLayout = useCallback(e => {
    setLengthMore(e.nativeEvent.lines.length >= 2);
  }, []);

  const openPopover = () => {
    setPopoverVisible(true);
  };

  const closePopover = () => {
    setPopoverVisible(false);
  };

  const blockreport = async (targetId, targetType, recordType, userMessage) => {
    if (user !== null && user !== '') {
      if (targetId !== null && targetId !== '' && targetId !== undefined) {
        const data = {
          SenderUserId: user.id,
          TargetId: targetId,
          TargetType: targetType,
          RecordType: recordType,
          ClubId: item?.clubId,
        };
        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );
        if (retval !== null) {
          if (retval?.id > 0) {
            setselectusersID('');
            closePopover();
            setSuccessDescription(userMessage + ' successfully');
            setreportModal(false);
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            setSuccessDescription(userMessage + ' not successfully');
            setreportModal(false);
            setTimeout(
              () => {
                setSuccess(true);
                setIserror(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          }
        }
      } else {
        Alert.alert('Targetid null Post Card Item Pag');
      }
    }
  };

  useEffect(() => {
    setIsLiked(item?.isLike ?? false);
    setLikesCount(item?.likeCount ?? 0);
  }, [item?.isLike, item?.likeCount]);

  useEffect(() => {
    setheightlightColor(Color.lightblue);
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 15000);
  }, [ForumID]);

  return (
    <Pressable
      style={[
        styles.cardView,
        {
          borderColor: ForumID === item?.id ? heightlightColor : Color.white,
          borderWidth: 2,
        },
      ]}
      onPress={() => onCardClick(item)}
    >
      {user?.id === item?.createdBy ? (
        <ClubmultiplePopover
          onPressEdit={() => onPressUpdateForm(item)}
          onPressDelete={() => onPressDeleteForm(item?.id)}
        />
      ) : (
        <></>
      )}

      <View>
        <SuccessModal
          visible={success}
          onClose={() => {
            setSuccess(false);
            setIserror(false);
            setSuccessDescription('');
            setselectusersID('');
            closePopover();
          }}
          description={successdescription}
          iserror={iserror}
        />
        <View style={[styles.passengerimgcontainer, { width: '100%' }]}>
          <Pressable
            onPress={() => {
              navigation.navigate('Profile', { userId: item?.postUser?.id });
            }}
          >
            <FastImage
              source={
                isUserDeleted
                  ? require('../assets/images/logo.png')
                  : {
                      uri: item?.postUser?.thumbnailProfileImage,
                      cache: FastImage.cacheControl.immutable,
                    }
              }
              style={[styles.profileimg]}
            />
          </Pressable>
          <View>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}
            >
              <Text style={styles.nametext}>
                {isUserDeleted
                  ? 'Deletion Requested'
                  : item?.postUser?.firstName + ' ' + item?.postUser?.lastName}
              </Text>
            </View>
            {!isUserDeleted && (
              <Text style={styles.status}>
                {getUserInfoText(item?.postUser)}
              </Text>
            )}
            <Text style={globlestyle.commentsmalltime}>
              {item?.createdAt ? moment(item?.createdAt).fromNow() : ''}
            </Text>
          </View>
        </View>
      </View>
      {/* {isUserDeleted ? (
        <Text>Member requested to delete</Text>
      ) : ( */}
      <>
        <View style={styles.mt2}>
          <Text style={styles.posttitle}>{item?.title}</Text>
          <Text
            style={styles.tescriptiontext}
            onTextLayout={onTextLayout}
            numberOfLines={textShown ? undefined : 2}
          >
            {item?.description}
          </Text>
          {lengthMore ? (
            <Text
              onPress={() => {
                onCardClick(item);
              }}
              style={styles.showmore}
            >
              {textShown ? 'Read less..' : 'Read more..'}
            </Text>
          ) : null}
        </View>
        {item?.postImages?.length > 0 && (
          <View
            style={{
              marginVertical: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item?.postUser?.id !== user.id ? (
              // <Carousel
              //   ref={isCarousel}
              //   data={[item?.postImages[0]]}
              //   renderItem={({ item }) => (
              //     <Pressable
              //       ref={touchableRef}
              //       onPress={index => {
              //         // onPressImage(
              //         //   item?.imageUrl,
              //         //   item?.id,
              //         //   item?.postUser?.id,
              //         // );
              //         onCardClick(item);
              //       }}
              //       onLongPress={e => {
              //         openPopover(item.id);
              //         setselectusersID(item.id);
              //       }}
              //       style={{
              //         alignItems: 'center',
              //         justifyContent: 'flex-end',
              //         paddingHorizontal: 10,
              //         marginVertical: 15,
              //       }}
              //     >
              //       <TouchableOpacity
              //         style={styles.dotCont}
              //         onPress={() => {
              //           setreportModal(true);
              //           setselectusersID(item.id);
              //         }}
              //       >
              //         <Entypo
              //           name="dots-three-vertical"
              //           color={Color.black}
              //           size={getFontSize(16)}
              //         />
              //       </TouchableOpacity>
              //       <FastImage
              //         source={{
              //           uri: item?.thumbnailImageUrl,
              //           cache: FastImage.cacheControl.immutable,
              //         }}
              //         resizeMode={resizeMode.center}
              //         style={{
              //           width: '100%',
              //           height: 200,
              //           borderRadius: 15,
              //           backgroundColor: resizeMode.background,
              //         }}
              //       />
              //     </Pressable>
              //   )}
              //   sliderWidth={SLIDER_WIDTH}
              //   itemWidth={ITEM_WIDTH}
              //   onSnapToItem={index => setIndex(index)}
              // />
              <Pressable
                ref={touchableRef}
                onPress={index => {
                  onCardClick(item);
                }}
                onLongPress={e => {
                  openPopover(item?.postImages[0].id);
                  setselectusersID(item?.postImages[0].id);
                }}
                style={{
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  width: ITEM_WIDTH,
                }}
              >
                <TouchableOpacity
                  style={styles.dotCont}
                  onPress={() => {
                    setreportModal(true);
                    setselectusersID(item?.postImages[0].id);
                  }}
                >
                  <Entypo
                    name="dots-three-vertical"
                    color={Color.black}
                    size={getFontSize(16)}
                  />
                </TouchableOpacity>
                <FastImage
                  source={{
                    uri: item?.postImages[0]?.thumbnailImageUrl,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={resizeMode.center}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 15,
                    backgroundColor: resizeMode.background,
                  }}
                />
              </Pressable>
            ) : (
              <Pressable
                ref={touchableRef}
                onPress={index => {
                  onCardClick(item);
                }}
                style={{
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  width: ITEM_WIDTH,
                }}
              >
                <FastImage
                  source={{
                    uri: item?.postImages[0]?.thumbnailImageUrl,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={resizeMode.center}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 15,
                    backgroundColor: resizeMode.background,
                  }}
                />
              </Pressable>
              // <Carousel
              //   ref={isCarousel}
              //   data={[item?.postImages[0]]}
              //   renderItem={({ item }) => (
              //     <Pressable
              //       ref={touchableRef}
              //       onPress={index => {
              //         // onPressImage(item?.imageUrl, item?.id, user.id);
              //         onCardClick(item);
              //       }}
              //       style={{
              //         alignItems: 'center',
              //         justifyContent: 'flex-end',
              //         paddingHorizontal: 10,
              //         marginVertical: 15,
              //       }}
              //     >
              //       <FastImage
              //         source={{
              //           uri: item?.thumbnailImageUrl,
              //           cache: FastImage.cacheControl.immutable,
              //         }}
              //         resizeMode={resizeMode.center}
              //         style={{
              //           width: '100%',
              //           height: 200,
              //           borderRadius: 15,
              //           backgroundColor: resizeMode.background,
              //         }}
              //       />
              //     </Pressable>
              //   )}
              //   sliderWidth={SLIDER_WIDTH}
              //   itemWidth={ITEM_WIDTH}
              //   onSnapToItem={index => setIndex(index)}
              // />
            )}

            <ListModal
              onCancel={() => {
                setreportModal(false);
              }}
              outheruser
              visible={reportModal}
              onPressReport={() => {
                blockreport(
                  selectusersID,
                  'clubforumimage',
                  'report',
                  'Reported',
                );
              }}
            />
            <Pagination
              dotsLength={item?.postImages?.length}
              activeDotIndex={index}
              carouselRef={isCarousel}
              dotStyle={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#F4BB41',
              }}
              containerStyle={{
                position: 'absolute',
                bottom: 0,
                alignSelf: 'center',
              }}
              dotContainerStyle={{ marginHorizontal: 3 }}
              tappableDots={true}
              inactiveDotStyle={{
                backgroundColor: 'black',
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />
          </View>
        )}
        <View style={styles.row}>
          <View style={styles.box50}>
            <View style={styles.iconbtnrow}>
              <Pressable
                style={[styles.iconbtn]}
                onPress={async () => {
                  const prevLiked = isLiked;
                  const newLiked = !prevLiked;
                  setIsLiked(newLiked);
                  setLikesCount(c => Math.max(0, c + (newLiked ? 1 : -1)));
                  dispatch(
                    toggleClubForumLike(
                      item?.clubId,
                      item?.id,
                      prevLiked,
                      success => {
                        if (!success) {
                          setIsLiked(prevLiked);
                          setLikesCount(c =>
                            Math.max(0, c + (prevLiked ? 1 : -1) * -1),
                          );
                        }
                      },
                    ),
                  );
                }}
              >
                <Text style={styles.nametext}>{likesCount}</Text>
                <FastImage
                  source={
                    isLiked
                      ? require('../assets/images/NewIcons/like_selected.png')
                      : require('../assets/images/NewIcons/like.png')
                  }
                  style={styles.iconimg}
                />
              </Pressable>
              <Pressable
                style={styles.iconbtn}
                //  onPress={onclickcomment}
                onPress={() => {
                  onCardClick(item);
                }}
              >
                <Text style={styles.nametext}>
                  {/* {item?.postComments?.length} */}
                  {item?.commentCount ?? 0}
                </Text>
                <FastImage
                  source={require('../assets/images/icon/commentIcon.png')}
                  style={styles.iconimg}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </>
      {/* )} */}
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
              blockreport(
                selectusersID,
                'clubforumimage',
                'report',
                'Reported',
              );
            }}
          >
            <Text style={styles.popupitemtext}>Report</Text>
          </TouchableOpacity>
        </View>
      </Popover>
    </Pressable>
  );
};

// define your styles
const styles = StyleSheet.create({
  dotCont: {
    position: 'absolute',
    top: dynamicSize(15),
    right: dynamicSize(20),
    zIndex: 5,
    shadowColor: 'black',
    elevation: 5,
    shadowOpacity: 1,
    shadowRadius: 5,
    backgroundColor: 'transparent',
  },
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
  posttitle: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaBold,
    color: Color.black,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    textTransform: 'capitalize',
  },
  mt2: {
    marginTop: 10,
  },
  showmore: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaBold,
    color: Color.black,

    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  nametext: {
    ...text.usernameboldtitle,
    color: Color.black,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  status: {
    ...text.usernamestatus,
    color: Color.black0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  tescriptiontext: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    color: Color.black0,

    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    marginRight: 10,
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  passengerimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconbtn: {
    height: 30,
    // width: 60,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconimg: {
    height: dynamicSize(20),
    width: dynamicSize(20),
    marginLeft: 10,
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  box50: {
    width: '100%',
  },
  cardView: {
    backgroundColor: Color.white,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
});
