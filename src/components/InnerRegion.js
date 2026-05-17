import React, { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';
import { Color, fontFamily } from '../constants/Constants';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import SpotItem from './SpotItem';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../constants/Loader';
import { getReasonInnerInner, getSpotsByReasonID } from '../store/tripSlice';

const InnerRegion = ({
  item,
  index = 0,
  searchQuery = '',
  borderBottomWidth,
  isSponsor,
}) => {
  const dispatch = useDispatch();
  const ReasonInnerInnerData = useSelector(
    state => state.trip.ReasonInnerInner,
  );
  const SpotByReasonID = useSelector(state => state.trip.SpotByReasonId);
  const [loader, setLoader] = useState(false);
  const [loader1, setLoader1] = useState(false);

  const getReasonInnerInnerData = id => {
    if (!ReasonInnerInnerData[id]?.length > 0) {
      setLoader(true);
      dispatch(
        getReasonInnerInner(id, () => {
          setLoader(false);
        }),
      );
    }
  };

  const getSpotByReasonId = id => {
    if (!SpotByReasonID[id]?.length > 0) {
      setLoader1(true);
      dispatch(
        getSpotsByReasonID(id, () => {
          setLoader1(false);
        }),
      );
    }
  };
  // return (
  //   <List.Accordion
  //     borderless
  //     expanded={searchQuery.length > 0 ? true : undefined}
  //     theme={{ colors: { background: 'transparent' } }}
  //     style={[styles.accordioncontainer2, { marginLeft: index * 15, borderBottomWidth: borderBottomWidth ? borderBottomWidth : 1 }]}
  //     right={() => <></>}
  //     titleStyle={[styles.subaccordiontitle]}
  //     title={item?.name}>
  //     {item?.children?.length != 0 &&
  //       item?.children.map(inner => {
  //         return (
  //           <InnerRegion
  //             item={inner}
  //             index={index + 1}
  //             borderBottomWidth={0}
  //             searchQuery={searchQuery}
  //           />
  //         );
  //       })}
  //     {item?.spotList?.length > 0 &&
  //       item?.spotList?.map(spot => (
  //         <SpotItem
  //           region={item}
  //           index={index}
  //           searchQuery={searchQuery}
  //           spot={spot}
  //         />
  //       ))}
  //   </List.Accordion>
  // );
  return searchQuery.length > 0 ? (
    item?.children?.length > 0 || item?.spotList?.length > 0 ? (
      <List.Accordion
        borderless
        expanded={true}
        theme={{ colors: { background: 'transparent' } }}
        style={[
          styles.accordioncontainer2,
          {
            marginLeft: index * 15,
            borderBottomWidth: borderBottomWidth ? borderBottomWidth : 1,
          },
        ]}
        right={() => <></>}
        titleStyle={[styles.subaccordiontitle]}
        title={item?.name}
      >
        {item?.children?.length != 0 &&
          item?.children.map(inner => {
            return (
              <InnerRegion
                item={inner}
                index={index + 1}
                borderBottomWidth={0}
                searchQuery={searchQuery}
                isSponsor={isSponsor}
              />
            );
          })}
        {item?.spotList?.length > 0 &&
          item?.spotList?.map(spot => (
            <SpotItem
              region={item}
              index={index}
              searchQuery={searchQuery}
              spot={spot}
              isSponsor={isSponsor}
            />
          ))}
      </List.Accordion>
    ) : (
      <List.Accordion
        borderless
        expanded={undefined}
        theme={{ colors: { background: 'transparent' } }}
        style={[
          styles.accordioncontainer2,
          {
            marginLeft: index * 15,
            borderBottomWidth: borderBottomWidth ? borderBottomWidth : 1,
          },
        ]}
        right={() => <></>}
        titleStyle={[styles.subaccordiontitle]}
        title={item?.name}
        onPress={() => {
          item?.depth == 1 ? (
            getReasonInnerInnerData(
              item?.tempMainID ? item?.tempMainID : item?.id,
            )
          ) : item?.depth == 2 ? (
            getSpotByReasonId(item?.tempMainID ? item?.tempMainID : item?.id)
          ) : (
            <></>
          );
        }}
      >
        {loader ? (
          <View style={{ height: dynamicSize(150) }}>
            <Loader visible={loader} />
          </View>
        ) : (
          ReasonInnerInnerData[item?.tempMainID ? item?.tempMainID : item?.id]
            ?.length != 0 &&
          ReasonInnerInnerData[
            item?.tempMainID ? item?.tempMainID : item?.id
          ]?.map(inner => {
            return (
              <InnerRegion
                item={inner}
                index={index + 1}
                borderBottomWidth={0}
                searchQuery={searchQuery}
                isSponsor={isSponsor}
              />
            );
          })
        )}
        {loader1 ? (
          <View style={{ height: dynamicSize(150) }}>
            <Loader visible={loader1} />
          </View>
        ) : (
          SpotByReasonID[item?.tempMainID ? item?.tempMainID : item?.id]
            ?.length > 0 &&
          SpotByReasonID[item?.tempMainID ? item?.tempMainID : item?.id]?.map(
            spot => (
              <SpotItem
                region={item}
                index={index}
                searchQuery={searchQuery}
                spot={spot}
                isSponsor={isSponsor}
              />
            ),
          )
        )}
      </List.Accordion>
    )
  ) : (
    <List.Accordion
      borderless
      expanded={undefined}
      theme={{ colors: { background: 'transparent' } }}
      style={[
        styles.accordioncontainer2,
        {
          marginLeft: index * 15,
          borderBottomWidth: borderBottomWidth ? borderBottomWidth : 1,
        },
      ]}
      right={() => <></>}
      titleStyle={[styles.subaccordiontitle]}
      title={item?.name}
      onPress={() => {
        index == 0 ? (
          getReasonInnerInnerData(item?.id)
        ) : index == 1 ? (
          getSpotByReasonId(item?.id)
        ) : (
          <></>
        );
      }}
    >
      {loader ? (
        <View style={{ height: dynamicSize(150) }}>
          <Loader visible={loader} />
        </View>
      ) : (
        ReasonInnerInnerData[item?.id]?.length != 0 &&
        ReasonInnerInnerData[item?.id]?.map(inner => {
          return (
            <InnerRegion
              item={inner}
              index={index + 1}
              borderBottomWidth={0}
              searchQuery={searchQuery}
            />
          );
        })
      )}
      {loader1 ? (
        <View style={{ height: dynamicSize(150) }}>
          <Loader visible={loader1} />
        </View>
      ) : (
        SpotByReasonID[item?.id]?.length > 0 &&
        SpotByReasonID[item?.id]?.map(spot => (
          <SpotItem
            region={item}
            index={index}
            searchQuery={searchQuery}
            spot={spot}
          />
        ))
      )}
    </List.Accordion>
  );
};

export default memo(InnerRegion);

const styles = StyleSheet.create({
  searchbar: {
    borderRadius: 10,
    height: 40,
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  inputStyle: {
    paddingVertical: 0,
  },
  searchcontainer: {
    paddingHorizontal: 8,
    borderBottomColor: Color.cardbg,
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 5,
  },
  listtextstyle: {
    fontFamily: fontFamily.ProximaR,
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
  },
  listItemstyle: {
    marginHorizontal: 20,
    borderBottomColor: Color.lightGray,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  citycintainer: {},
  accordiontitle: {
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(24),
    fontSize: getFontSize(16),
    paddingHorizontal: '1%',
  },
  subaccordiontitle: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.poppinsM,
    paddingHorizontal: '1%',
    color: Color.black0,
    marginLeft: dynamicSize(10),
  },
  accordioncontainer: {
    backgroundColor: Color.white,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderRadius: 100,
  },
  accordioncontainer2: {
    backgroundColor: Color.white,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderRadius: 100,
  },
  viewContainer: {
    // paddingHorizontal: '5%',
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});
