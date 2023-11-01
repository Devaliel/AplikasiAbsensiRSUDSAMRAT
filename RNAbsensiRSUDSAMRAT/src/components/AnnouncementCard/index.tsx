import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

const AnnouncementCard = ({title, desc, date}: any) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.desc}>{desc}</Text>
            <View style={styles.secContainer}>
                <Text style={styles.date}>{date}</Text>
            </View>
        </View>
    )
}

export default AnnouncementCard

const styles = StyleSheet.create({
    container:{
        width: '100%',
        paddingTop: 18,
        paddingBottom: 12,
        paddingHorizontal: 12,
        marginTop: 16,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000000',
        shadowOffset: {width:0, height:2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    secContainer:{
        alignItems: 'flex-end',
    },
    desc:{
        fontSize: 15,
        color: '#393D3C',
        textAlign: 'left',
        width: 'auto'
    },
    date:{
        fontSize: 8,
        color: '#786F6F'
    },
    title:{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#393D3C',
        marginBottom: 6
    }
})