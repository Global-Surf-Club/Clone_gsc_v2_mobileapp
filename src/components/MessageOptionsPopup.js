import React, {useState, useEffect} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import {fontFamily, Color} from '../constants/Constants';
import {BlurView} from '@react-native-community/blur';
import Trip from '../api/Trip';
import FastImage from 'react-native-fast-image';

const {height: screenHeight, width: screenWidth} = Dimensions.get('window');

export const MessageOptionsPopup = ({
  visible,
  position,
  messageContent,
  onClose,
  onReply,
  onLike,
  isCurrentUser,
  chatId,
  user,
  tripId,
}) => {
  if (!visible) return null;

  const [likes, setLikes] = useState([]);
  const [likeData, setLikeData] = useState({});
  const [isLiked, setIsLiked] = useState(false);

  const {y = 400, height = 200, width = screenWidth} = position || {};

  useEffect(() => {
    getLikes();
  }, [chatId]);

  const getLikes = async () => {
    try {
      const like = JSON.parse(await Trip.getChatLikes(chatId));
      setLikes(like);
    } catch (err) {
    }
  };

  useEffect(() => {
    const found = likes.find(item => item?.userLikeId == user?.id);
    if (found) {
      setLikeData(found);
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [likes]);

  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 9999,
      }}
      activeOpacity={1}
      onPress={onClose}>
      {/* Background Blur */}
      <BlurView
        intensity={25}
        tint="light"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />

      {/* Message + Popup Container */}
      <View
        style={{
          position: 'absolute',
          left: !isCurrentUser ? 20 : undefined,
          right: isCurrentUser ? 20 : undefined,
          top: y-60,
          width: width - 40,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: {width: 0, height: 2},
          shadowRadius: 4,
          maxHeight: screenHeight * 0.7, // 📌 limit height to 70% screen
          backgroundColor: 'transparent',
        }}>
        {/* Scrollable message content */}
        <ScrollView
          style={{
            maxHeight: screenHeight * 0.5,
          }}
          contentContainerStyle={{
            paddingBottom: 10,
          }}
          showsVerticalScrollIndicator={true}>
          {messageContent}
        </ScrollView>

        {/* Options popup */}
        <View
          style={{
            width: 160,
            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 10,
            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: {width: 0, height: 2},
            shadowRadius: 8,
            marginTop: 10,
          }}>
          {/* Reply */}
          <Pressable
            onPress={onReply}
            style={{
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <FastImage
              source={require('../assets/images/icon/commentIcon.png')}
              style={{height: 20, width: 20}}
            />
            <Text
              style={{
                fontFamily: fontFamily.ProximaAB,
                marginLeft: 10,
                color: Color.black0,
              }}>
              Reply
            </Text>
          </Pressable>

          {/* Like / Unlike */}
          <Pressable
            onPress={async () => {
              setIsLiked(data => !data);
              try {
                if (isLiked) {
                  await Trip.deleteChatLike(likeData?.id);
                } else {
                  await Trip.likeChat(tripId, chatId);
                }
                getLikes();
              } catch (error) {}
              onLike();
            }}
            style={{
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {likes.length > 0 && (
              <Text
                style={{
                  marginRight: 5,
                  fontFamily: fontFamily.ProximaAL,
                  color: Color.black0,
                }}>
                {likes.length}
              </Text>
            )}
            <FastImage
              source={
                isLiked
                  ? require('../assets/images/NewIcons/like_selected.png')
                  : require('../assets/images/NewIcons/like.png')
              }
              style={{height: 20, width: 20}}
            />
            <Text
              style={{
                fontFamily: fontFamily.ProximaAB,
                marginLeft: 10,
                color: Color.black0,
              }}>
              {isLiked ? 'Unlike' : 'Like'}
            </Text>
          </Pressable>
        </View>
      </View>
    </TouchableOpacity>
  );
};
