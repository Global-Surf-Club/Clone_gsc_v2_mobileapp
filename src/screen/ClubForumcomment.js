//import liraries
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import Popover from 'react-native-popover-view';
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import Forum from '../api/Forum';
import { Header } from '../components/Header';
import { Color, fontFamily, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';
import FastImage from 'react-native-fast-image';
import Blockreport from '../api/Blockreport';
import SuccessModal from '../components/SuccessModal';
import { globlestyle } from '../styles/globlestyle';
import Hyperlink from 'react-native-hyperlink';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

let isSendInProgress = false;
const ClubForumcomment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const postId = route.params?.id;

  const [replyId, setReplyId] = useState(null);
  const [replyData, setReplyData] = useState(null);
  const inputRef = useRef(null);
  const [showLoading, SetshowLoading] = useState(false);
  const [timeStart, settimeStart] = useState('');
  // const [comments, setComments] = useState(route.params?.data);
  const [comments, setComments] = useState([]);
  const user = useSelector(state => state.auth.user);
  const [selectusersID, setselectusersID] = useState('');
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const scrollRef = useRef(null);
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  const openPopover = () => {
    setPopoverVisible(true);
  };
  const closePopover = () => {
    setPopoverVisible(false);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current && scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    getComments(true);
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollRef.current && scrollRef.current?.scrollToEnd({ animated: true });
      },
    );
    return () => {
      keyboardDidShowListener && keyboardDidShowListener.remove();
    };
  }, []);

  const getComments = async (disableLoader = false) => {
    try {
      if (!disableLoader) {
        SetshowLoading(true);
      }
      const data = JSON.parse(await Forum.getComments(postId));
      setComments(data?.reverse());
      setTimeout(() => {
        scrollRef.current && scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {}
    SetshowLoading(false);
  };
  const menuButtonClick = () => {
    navigation.goBack();
  };

  const postComment = async (id = 0) => {
    SetshowLoading(true);
    isSendInProgress = true;
    try {
      const param = {
        id: 0,
        postId: postId,
        parentId: id,
        message: timeStart,
      };
      settimeStart('');
      const data = await Forum.postComment(param);
    } catch (error) {}
    SetshowLoading(false);
    isSendInProgress = false;
    getComments();
    setReplyId(null);
    setReplyData(null);
  };

  const blockreport = async (targetId, targetType, recordType, userMessage) => {
    if (user !== null && user !== '') {
      if (targetId !== null && targetId !== '' && targetId !== undefined) {
        const data = {
          SenderUserId: user.id,
          TargetId: targetId,
          TargetType: targetType,
          RecordType: recordType,
        };
        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );
        if (retval !== null) {
          if (retval?.id > 0) {
            setselectusersID('');
            closePopover();
            // Alert.alert(userMessage + ' successfully');
            setSuccessDescription(userMessage + ' successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            // Alert.alert(userMessage + ' not successfully');
            setSuccessDescription(userMessage + ' not successfully');
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
        Alert.alert('Targetid null Postcomment Pag');
      }
    }
  };
  return (
    <>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        >
          <Header
            backbutton={'chevron-left-circle'}
            iconRight={require('../assets/images/icon/chatting.png')}
            iconRight1={require('../assets/images/icon/bell1.png')}
            title={route.params?.ForumName ? route.params?.ForumName : 'N/A'}
            // route.params?.ForumName.charAt(0).toUpperCase()+ word.slice(1)
            iconRight2={require('../assets/images/icon/home.png')}
            onPressLeft={menuButtonClick}
            notification={'6'}
            // messagenotification={'6'}
            textAlign={'center'}
          />

          <Loader visible={showLoading} />
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
          <ScrollView
            bounces={true}
            ref={scrollRef}
            alwaysBounceVertical={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            <View style={styles.viewContainer}>
              <View style={styles.ImageContainer}>
                {comments.map(item => {
                  return (
                    <View>
                      {item?.quoteComment && (
                        <Pressable
                          style={[
                            styles.chatmsg,
                            styles.pr10,
                            {
                              flex: 1,
                              flexDirection: 'row',
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="arrow-left-bottom"
                            size={25}
                            color={Color.themeColor}
                            style={{ marginRight: 15, marginLeft: 8 }}
                          />
                          <View style={{ flex: 1 }}>
                            <View>
                              <Text style={styles.nametext}>
                                {item?.quoteComment?.senderUser?.firstName +
                                  ' ' +
                                  item?.quoteComment?.senderUser?.lastName}
                              </Text>
                              <Text style={styles.status}>
                                {getUserInfoText(item?.quoteComment)}
                                {/* {`${
                                  (item?.quoteComment?.city ??
                                    item?.quoteComment?.state) +
                                  (', ' + item?.quoteComment?.country ?? '')
                                }\n${
                                  userSkillLevel[
                                    item?.quoteComment?.surferSkillLevel ?? 0
                                  ]
                                }, ${
                                  item?.quoteComment?.carOwner
                                    ? 'Driver'
                                    : 'Passenger'
                                }`} */}
                              </Text>
                              <Text style={globlestyle.commentsmalltime}>
                                <MaterialCommunityIcons
                                  name="clock"
                                  size={10}
                                  color={Color.black0}
                                />
                                {' ' +
                                  moment(
                                    item?.quoteComment?.createdAt,
                                  ).fromNow()}
                              </Text>
                            </View>
                            <Text style={globlestyle.allcommenttext}>
                              {item?.quoteComment?.message}
                            </Text>
                          </View>
                        </Pressable>
                      )}
                      <View style={{ marginBottom: 10 }}>
                        {item?.senderUser?.id !== user?.id ? (
                          <Pressable
                            ref={touchableRef}
                            onLongPress={index => {
                              openPopover(item?.id);
                              setselectusersID(item.id);
                            }}
                            style={[styles.chatcontainer]}
                          >
                            <Pressable
                              onPress={() => {
                                navigation.navigate('Profile', {
                                  userId: item?.senderUser?.id,
                                });
                              }}
                            >
                              <FastImage
                                source={{
                                  uri: item?.senderUser?.thumbnailProfileImage,
                                  cache: FastImage.cacheControl.immutable,
                                }}
                                style={[styles.chatprofileimg]}
                              />
                            </Pressable>
                            <View
                              style={[
                                styles.chatmsg,
                                styles.pr10,
                                { flex: 1 },
                                replyId == item?.id && { borderWidth: 1 },
                              ]}
                            >
                              <View>
                                <Text style={styles.nametext}>
                                  {item?.senderUser?.firstName +
                                    ' ' +
                                    item?.senderUser?.lastName}
                                </Text>
                                <Text style={styles.status}>
                                  {getUserInfoText(item?.senderUser)}
                                  {/* {`${
                                userSkillLevel[
                                  item?.senderUser?.surferSkillLevel ?? 0
                                ]
                              }, ${
                                item?.senderUser?.city ??
                                item?.senderUser?.state ??
                                item?.senderUser?.country
                              }, ${
                                item?.senderUser?.carOwner
                                  ? 'Driver'
                                  : 'Passenger'
                              }`} */}
                                </Text>
                                <Text style={globlestyle.commentsmalltime}>
                                  <MaterialCommunityIcons
                                    name="clock"
                                    size={10}
                                    color={Color.black0}
                                  />
                                  {' ' + moment(item?.createdAt).fromNow()}
                                </Text>
                              </View>
                              <Hyperlink
                                onPress={url => Linking.openURL(url)}
                                linkStyle={globlestyle.linkStyle}
                              >
                                <Text style={globlestyle.allcommenttext}>
                                  {item?.message}
                                </Text>
                              </Hyperlink>
                            </View>
                          </Pressable>
                        ) : (
                          <Pressable
                            ref={touchableRef}
                            style={[styles.chatcontainer]}
                          >
                            <Pressable
                              onPress={() => {
                                navigation.navigate('Profile', {
                                  userId: item?.senderUser?.id,
                                });
                              }}
                            >
                              <FastImage
                                source={{
                                  uri: item?.senderUser?.thumbnailProfileImage,
                                  cache: FastImage.cacheControl.immutable,
                                }}
                                style={[styles.chatprofileimg]}
                              />
                            </Pressable>
                            <View
                              style={[
                                styles.chatmsg,
                                styles.pr10,
                                { flex: 1 },
                                replyId == item?.id && { borderWidth: 1 },
                              ]}
                            >
                              <View>
                                <Text style={styles.nametext}>
                                  {item?.senderUser?.firstName +
                                    ' ' +
                                    item?.senderUser?.lastName}
                                </Text>
                                <Text style={styles.status}>
                                  {getUserInfoText(item?.senderUser)}
                                  {/* {`${
                                  userSkillLevel[
                                    item?.senderUser?.surferSkillLevel ?? 0
                                  ]
                                }, ${
                                  item?.senderUser?.city ??
                                  item?.senderUser?.state ??
                                  item?.senderUser?.country
                                }, ${
                                  item?.senderUser?.carOwner
                                    ? 'Driver'
                                    : 'Passenger'
                                }`} */}
                                </Text>
                                <Text style={globlestyle.commentsmalltime}>
                                  <MaterialCommunityIcons
                                    name="clock"
                                    size={10}
                                    color={Color.black0}
                                  />
                                  {' ' + moment(item?.createdAt).fromNow()}
                                </Text>
                              </View>
                              <Hyperlink
                                onPress={url => Linking.openURL(url)}
                                linkStyle={globlestyle.linkStyle}
                              >
                                <Text style={globlestyle.allcommenttext}>
                                  {item?.message}
                                </Text>
                              </Hyperlink>
                            </View>
                          </Pressable>
                        )}

                        <View style={styles.iconbtnrow}>
                          {/* <Pressable style={styles.iconbtn}>
                          <FastImage
                            source={require('../assets/images/NewIcons/like_selected.png')}
                            style={styles.iconimg}
                          />
                          <Text style={styles.status}>| {item?.like} Like</Text>
                        </Pressable> */}
                          <Pressable
                            onPress={() => {
                              setReplyId(item?.id);
                              setReplyData(item);
                              inputRef.current?.focus();
                            }}
                            style={styles.iconbtn}
                          >
                            <FastImage
                              source={require('../assets/images/icon/commentIcon.png')}
                              style={styles.iconimg}
                            />
                            <Text style={styles.status}>Reply</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
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
                        'forumcomment',
                        'report',
                        'Reported',
                      );
                    }}
                  >
                    <Text style={styles.popupitemtext}>Report</Text>
                  </TouchableOpacity>
                </View>
              </Popover>
            </View>
          </ScrollView>
          {replyData && (
            <View
              style={[styles.chatmsg, styles.pr10, { flexDirection: 'row' }]}
            >
              <MaterialCommunityIcons
                name="arrow-left-bottom"
                size={25}
                color={Color.themeColor}
                style={{ marginRight: 15, marginLeft: 8 }}
              />
              <View>
                <View>
                  <Text style={styles.nametext}>
                    {replyData?.senderUser?.firstName +
                      ' ' +
                      replyData?.senderUser?.lastName}
                  </Text>
                  <Text style={globlestyle.commentsmalltime}>
                    <MaterialCommunityIcons
                      name="clock"
                      size={10}
                      color={Color.black0}
                    />
                    {' ' + moment(replyData?.createdAt).fromNow()}
                  </Text>
                </View>
                <Text style={globlestyle.allcommenttext}>
                  {replyData?.message}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setReplyData(null);
                  setReplyId(null);
                }}
                style={{ position: 'absolute', right: 15, top: 15 }}
              >
                <AntDesign name="close" size={25} color={Color.themeColor} />
              </Pressable>
            </View>
          )}
          <View style={styles.commentinputcontainer}>
            <Pressable style={{ width: '15%' }}>
              <FastImage
                source={{
                  uri: user?.thumbnailProfileImage,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.profileimg}
              />
            </Pressable>
            <TextInput
              ref={inputRef}
              multiline
              style={styles.coomentinput}
              onChangeText={settimeStart}
              value={timeStart}
              placeholderTextColor={Color.cardgray}
              placeholder="Add a comment...."
            />
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                postComment(replyId ?? 0);
              }}
              disabled={isSendInProgress}
              style={[styles.sendbtn]}
            >
              {/* <FontAwesome name="send" size={20} color={Color.cardgray} /> */}
              {isSendInProgress ? (
                <ActivityIndicator size="small" color={Color.cardgray} />
              ) : (
                <FontAwesome name="send" size={20} color={Color.cardgray} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
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
  iconbtn: {
    height: dynamicSize(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: dynamicSize(8),
    marginVertical: 2,
  },
  iconimg: {
    height: dynamicSize(15),
    width: dynamicSize(15),
    marginRight: dynamicSize(5),
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '80%',
    alignSelf: 'flex-end',
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
  chatprofileimg: {
    width: dynamicSize(40),
    height: dynamicSize(40),
    marginHorizontal: dynamicSize(10),
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  pr10: {
    paddingRight: 10,
  },
  chattext: {
    fontSize: getFontSize(14),
    lineHeight: getFontSize(19),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    marginTop: dynamicSize(10),
  },
  chattime: {
    fontSize: getFontSize(11),
    fontWeight: '600',
    color: Color.black,
    marginTop: 5,
    fontFamily: fontFamily.ProximaAB,
  },
  chatmsg: {
    backgroundColor: '#B5EAF0',
    paddingHorizontal: dynamicSize(15),
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopStartRadius: 20,
    paddingVertical: dynamicSize(10),
  },
  chatcontainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    borderRadius: 5,
    paddingVertical: 5,
    width: '100%',
  },
  ImageContainer: {
    paddingHorizontal: 10,
  },
  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    marginRight: 5,
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  commentreply: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(16),
  },
  commenttimr: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 16,
  },
  sendbtn: {
    alignItems: 'center',
    paddingVertical: dynamicSize(10),
    paddingHorizontal: dynamicSize(10),
    // marginHorizontal: dynamicSize(50),
  },
  // comment input
  commentinputcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dynamicSize(15),
    borderTopColor: Color.lightGray,
    borderTopWidth: 1,
  },
  coomentinput: {
    // width: '75%',
    flex: 1,
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaAL,
    lineHeight: getFontSize(21),
  },
  justifyCenter: {
    alignSelf: 'auto',
  },
  // comment input
  container: {
    flex: 1,
    backgroundColor: Color.white,
    paddingBottom: dynamicSize(10),
  },
});

//make this component available to the app
export default ClubForumcomment;
