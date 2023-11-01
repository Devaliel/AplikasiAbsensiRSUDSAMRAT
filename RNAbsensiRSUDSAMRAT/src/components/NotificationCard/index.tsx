import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { NotificationSmallImage } from '../../assets/images'

const NotificationCard = ({title, desc, date, time, backgroundColor, onPress}: any) => {
  return (
    <TouchableOpacity style={{...styles.container, backgroundColor: backgroundColor}} activeOpacity={0.7} onPress={onPress}>
        <View style={styles.secContainer}>
            <View style={styles.smallImageContainer}>
                <Image
                    source={NotificationSmallImage}
                    style={{width: 35, height: 27}}
                />
            </View>
            <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.desc}>{desc}</Text>
            </View>
        </View>
        <View style={styles.thirdContainer}>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.time}>{time}</Text>
        </View>
    </TouchableOpacity>
  )
}

export default NotificationCard

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        paddingLeft: 12,
        paddingRight: 5,
        paddingVertical: 10,
        justifyContent: 'space-between',
        marginBottom: 5
    },
    secContainer:{
        flexDirection: 'row',
        width: 320
    },
    smallImageContainer:{
        width: 41,
        height: 41,
        marginRight: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000000',
        shadowOffset: {width:0, height:2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    title:{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#090808',
        marginTop: -3
    },
    desc:{
        fontSize: 15,
        color: '#090808'
    },
    date:{
        fontSize: 12,
        color: '#393D3C',
        opacity: 0.6
    },
    time:{
        fontSize: 12,
        color: '#393D3C',
        opacity: 0.6
    },
    thirdContainer:{
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
})