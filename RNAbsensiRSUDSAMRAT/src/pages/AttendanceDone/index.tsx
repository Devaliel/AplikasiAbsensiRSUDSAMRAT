import { Image, StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'

const AttendanceDone = ({navigation}: any) => {
    useEffect(() => {
        setTimeout(() => {
            navigation.push('Tabs')
        }, 3000);
    }, [])
  return (
    <View style={styles.page}>
        <Image 
            source={require('./../../assets/gif/4e1bef46b4d7e33b37b87c021d7f7bbe.gif')}
            style={{width: 250, height: 250}}
            resizeMode='cover'
        />
    </View>
  )
}

export default AttendanceDone

const styles = StyleSheet.create({
    page:{
        flex: 1,
        backgroundColor: '#4ABEBB',
        alignItems: 'center',
        justifyContent: 'center'
    },
})