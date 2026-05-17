import React from 'react';
import {StyleSheet} from 'react-native';
import {Color, fontFamily, fontSize} from '../constants/Constants';
import {dynamicSize} from '../constants/Responsive';

// define your styles
export const globlestyle = StyleSheet.create({
  allcommenttext: {
    fontSize: fontSize.font16,
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    marginTop: dynamicSize(6),
  },
  commentsmalltime: {
    fontSize: fontSize.font12,
    color: Color.black,
    fontFamily: fontFamily.ProximaBold,
    lineHeight: fontSize.font16,
  },
  linkStyle: {
    color: Color.primary,
    textDecorationLine: 'underline',
    fontFamily: fontFamily.ProximaR,
  },
});
