//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSelector, useDispatch } from 'react-redux';
import Forum from '../api/Forum';
import { BorderButton } from '../components/Buttons';
import { Header } from '../components/Header';
import MultipleImagePickerModal from '../components/MultipleImagePickerModal';
import PreviewModal from '../components/PreviewModal';
import { Color, fontFamily, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserInfoText } from '../constants/Utility';
import ClubsAPi from '../api/ClubApi';
import SuccessModal from '../components/SuccessModal';
import FastImage from 'react-native-fast-image';
import NetInfo from '@react-native-community/netinfo';
import {
  createClubForumPost,
  updateClubForumPostThunk,
} from '../store/clubSlice';
import ConnectionBanner from '../components/ConnectionBanner';

const CreateClubForumPost = props => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { clubid, ForumDetails } = props?.route?.params;

  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [showLoading, SetshowLoading] = useState(false);
  const [Title, setTitle] = useState(ForumDetails ? ForumDetails?.title : '');
  const [imageList, setImageList] = useState([]);
  const [ImageUrlList, setImageUrlList] = useState(
    ForumDetails ? ForumDetails?.postImages : [],
  );

  const [description, setdescription] = useState(
    ForumDetails ? ForumDetails?.description : '',
  );
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [removedPicID, setRemovedPicID] = useState([]);

  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [isbtnLoader, setIsbtnLoader] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const menuButtonClick = () => {
    setRemovedPicID([]);
    navigation.goBack();
  };

  const createPost = async () => {
    if (Title.length > 0 && description.length > 0) {
      SetshowLoading(true);
      setIsbtnLoader(true);

      dispatch(
        createClubForumPost(
          clubid,
          { title: Title, description: description },
          imageList,
          (success, post, message) => {
            SetshowLoading(false);
            setIsbtnLoader(false);
            if (success) {
              setSuccess(true);
              setSuccessDescription(
                message || "You've successfully posted to the forum",
              );
            } else {
              setIserror(true);
              setSuccess(true);
              setSuccessDescription(message || 'Failed to create post');
            }
          },
        ),
      );
    } else {
      alert('Please fill all fields');
    }
  };

  const RemoveForumPic = async () => {
    if (removedPicID?.length > 0) {
      try {
        const param = {
          idList: removedPicID,
        };

        const data = await ClubsAPi.removeImage(param);
        setRemovedPicID([]);
        UpdatePost();
      } catch (error) {
        UpdatePost();
      }
    } else {
      UpdatePost();
    }
  };

  const UpdatePost = async () => {
    if (Title.length > 0 && description.length > 0) {
      SetshowLoading(true);
      setIsbtnLoader(true);

      dispatch(
        updateClubForumPostThunk(
          clubid,
          ForumDetails?.id,
          { title: Title, description: description },
          removedPicID,
          imageList,
          (success, message) => {
            SetshowLoading(false);
            setIsbtnLoader(false);
            if (success) {
              setSuccess(true);
              setSuccessDescription(
                message || 'your club forum update has been successful',
              );
            } else {
              setIserror(true);
              setSuccess(true);
              setSuccessDescription(message || 'Failed to update post');
            }
          },
        ),
      );
    } else {
      alert('Please fill all fields');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        iconRight2={require('../assets/images/icon/home.png')}
        onPressLeft={menuButtonClick}
        notification={'6'}
        title={ForumDetails ? 'Update Club Forum' : 'Create Club Forum'}
        textAlign={'center'}
      />
      <Loader visible={showLoading} />
      {!currentNetworkStatus && (
        <View>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}
      <ScrollView style={styles.tabbartab1}>
        <View style={[styles.passengerimgcontainer, { width: '100%' }]}>
          <Pressable>
            <FastImage
              source={{
                uri: user?.thumbnailProfileImage ?? '',
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.profileimg}
            />
          </Pressable>
          <View style={styles.profiletextcontainer}>
            <Text style={styles.sendRequest}>
              {user?.firstName + ' ' + user?.lastName}
            </Text>
            <Text style={styles.sendRequestDate}>{getUserInfoText(user)}</Text>
          </View>
        </View>
        <View style={styles.inputcontainer}>
          <Text style={styles.posttitle}>Title</Text>
          <TextInput
            style={styles.TextInput}
            placeholder="Enter Title"
            placeholderTextColor={Color.gray}
            value={Title}
            onChangeText={Title => setTitle(Title)}
          />
        </View>
        <View style={styles.inputcontainer}>
          <Text style={styles.posttitle}>Description</Text>
          <TextInput
            style={[
              styles.TextInput,
              { textAlignVertical: 'top', height: 150 },
            ]}
            placeholder="Enter Description"
            placeholderTextColor={Color.gray}
            value={description}
            multiline={true}
            numberOfLines={4}
            onChangeText={description => setdescription(description)}
          />
        </View>
        <View style={[styles.inputcontainer]}>
          <Text style={styles.posttitle}>Add Photos</Text>
          <View style={styles.imgcontainer}>
            <ScrollView
              horizontal
              bounces={true}
              // alwaysBounceVertical={true}
              contentContainerStyle={{ alignItems: 'center' }}
              showsHorizontalScrollIndicator={false}
            >
              <Pressable
                onPress={() => {
                  setImagePickerModal(true);
                }}
                style={styles.imgaddbtn}
              >
                <FastImage
                  source={require('../assets/images/icon/AddImage.png')}
                  style={styles.addicon}
                  tintColor={Color.lightblue}
                />
              </Pressable>
              <FlatList
                scrollEnabled={false}
                data={ImageUrlList}
                horizontal
                renderItem={({ item, index }) => {
                  return (
                    <View style={styles.gallerybox}>
                      <Pressable
                        onPress={() => {
                          setImagePreviewModal(true);
                          setImageUrl(item?.imageUrl);
                        }}
                      >
                        <FastImage
                          source={{
                            uri: item?.thumbnailImageUrl,
                            cache: FastImage.cacheControl.immutable,
                          }}
                          style={styles.gallery}
                        />
                      </Pressable>
                      <Entypo
                        onPress={() => {
                          const tempList = [...imageList];
                          tempList.splice(index, 1);
                          setImageList(tempList);
                          const tempList1 = [...ImageUrlList];
                          const tempList2 = [...ImageUrlList];
                          tempList1.splice(index, 1);
                          setImageUrlList(tempList1);
                          const deletedId = [...removedPicID];
                          let temp = tempList2.splice(index, 1)[0].id;
                          if (
                            temp !== null &&
                            temp !== undefined &&
                            temp !== ''
                          ) {
                            deletedId?.push(temp);
                          }
                          setRemovedPicID(deletedId);
                        }}
                        name="circle-with-cross"
                        style={{
                          fontSize: getFontSize(18),
                          color: Color.lightblue,
                          marginLeft: dynamicSize(10),
                          position: 'absolute',
                          top: dynamicSize(10),
                          right: dynamicSize(10),
                        }}
                      />
                    </View>
                  );
                }}
              />
            </ScrollView>
          </View>
        </View>
        {ForumDetails ? (
          <View style={styles.buttoncontainer}>
            <BorderButton
              color={Color.white}
              onPress={RemoveForumPic}
              backgroundColor={Color.lightblue}
              title={'Update Club Forum'}
              isProcessing={isbtnLoader}
            />
          </View>
        ) : (
          <View style={styles.buttoncontainer}>
            <BorderButton
              color={Color.white}
              onPress={createPost}
              backgroundColor={Color.lightblue}
              title={'Create Club Forum'}
              isProcessing={isbtnLoader}
            />
          </View>
        )}
      </ScrollView>
      <MultipleImagePickerModal
        visible={imagePickerModal}
        onCancel={() => {
          setImagePickerModal(false);
        }}
        onSelect={list => {
          setImagePickerModal(false);
          setImageList([...imageList, ...list]);
        }}
        onSelectURI={list1 => {
          setImagePickerModal(false);
          setImageUrlList([...ImageUrlList, ...list1]);
        }}
      />

      <PreviewModal
        visible={imagePreviewModal}
        onClose={() => {
          setImagePreviewModal(false);
        }}
        photoUrl={imageUrl}
      />
      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          // navigation.navigate('ClubProfile', { clubid });
          navigation.goBack();
        }}
        description={successdescription}
        iserror={iserror}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttoncontainer: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  profiletextcontainer: {
    width: '80%',
    paddingLeft: 8,
    marginTop: 3,
  },
  profileimgcontainer: {
    width: '20%',
    height: dynamicSize(50),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sendRequest: {
    ...text.usernameboldtitle,
    // flex: 1,
    color: Color.black,
  },
  sendRequestDate: {
    ...text.usernamestatus,
    color: Color.black0,
  },
  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    // height: '100%',
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  addicon: {
    height: dynamicSize(30),
    width: dynamicSize(30),
  },
  imgaddbtn: {
    borderWidth: 1,
    borderColor: Color.lightblue,
    borderStyle: 'dashed',
    height: dynamicSize(120),
    width: dynamicSize(100),
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    marginTop: dynamicSize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailicon: {
    height: 20,
    width: 20,
    marginRight: 5,
  },

  imgcontainer: {
    marginBottom: 10,
  },
  gallerybox: {
    height: dynamicSize(140),
    width: dynamicSize(120),
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
  },
  gallery: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
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
  TextInput: {
    backgroundColor: Color.reportcardbg,
    borderWidth: 1,
    borderColor: Color.lightblue,
    height: dynamicSize(50),
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
    borderRadius: 5,
    fontSize: getFontSize(15),
    marginVertical: dynamicSize(6),
    paddingHorizontal: 10,
  },
  inputcontainer: {
    marginTop: 10,
  },
  nametext: {
    ...text.usernametitle,
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
  passengerimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabbartab1: {
    flex: 1,
    paddingHorizontal: 20,

    paddingVertical: 15,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});
export default CreateClubForumPost;
