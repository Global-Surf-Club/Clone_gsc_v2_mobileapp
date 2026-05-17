//import liraries
import React from 'react';
import {Pressable, StyleSheet, Text, TextInput} from 'react-native';
import {Color, fontFamily} from '../constants/Constants';
import {dynamicSize, getFontSize} from '../constants/Responsive';
// create a component
const InputText = props => {
  const {
    placeholder,
    onPress,
    value,
    error,
    onChangeText,
    secureTextEntry,
    isEdit,
    numberOfLines,
    keyboardType,
  } = props;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <TextInput
        pointerEvents={isEdit ? 'auto' : 'none'}
        editable={isEdit}
        style={styles.TextInput}
        placeholder={placeholder}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        placeholderTextColor={Color.gray}
        value={value}
        secureTextEntry={secureTextEntry}
        onChangeText={text => onChangeText(text)}
      />
      {error ? <Text style={styles.error}>{error}</Text> : <></>}
    </Pressable>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    // paddingVertical: 2,
  },
  error: {
    color: 'red',
    fontSize: 10,
    fontFamily: fontFamily.ProximaAB,
  },
  TextInput: {
    backgroundColor: Color.white,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightblue,
    height: dynamicSize(50),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
    borderRadius: 5,
    fontSize: getFontSize(15),
    marginVertical: 6,
    paddingBottom: 0,
  },
});

//make this component available to the app
export default InputText;
