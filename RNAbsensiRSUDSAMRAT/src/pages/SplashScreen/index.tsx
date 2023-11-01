import { StyleSheet, Text, View, SafeAreaView, Image, Platform } from 'react-native';
import React, { useEffect } from 'react';
import { Ilustration, Logo } from '../../assets/images';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({navigation}: any) => {
    const getAccessToken = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            checkToken(token);
            console.log('get token:', token)
        } catch (error) {
            console.log('Gagal mengambil token: ', error)
        }
    }

    const checkToken = async (token) => {
        axios.get('http://rsudsamrat.site:3001/api/ping',
        {headers:{
            'Authorization' : `Bearer ${token}`
        }})
        .then(function (response){
            const responseJSON = {response};
            const responseMSG = responseJSON.response.data;

            if(responseMSG === 'pong'){
                if (Platform.OS === 'android'){
                    navigation.replace('Tabs');
                } else if (Platform.OS === 'ios'){
                    navigation.push('Tabs');
                }
            } else {
                setTimeout(() => {
                    if (Platform.OS === 'android'){
                        navigation.replace('Login');
                    } else if (Platform.OS === 'ios'){
                        navigation.push('Login');
                    }
                }, 3000);
            }
        })
        .catch(function (error){
            console.log("error ",error.status);
            setTimeout(() => {
                if (Platform.OS === 'android'){
                    navigation.replace('Login');
                } else if (Platform.OS === 'ios'){
                    navigation.push('Login');
                }
            }, 3000);
        })
    }
    
    useEffect(() => {
        getAccessToken();
    }, [])

    return (
        <SafeAreaView style={styles.page}>
            <View style={styles.screenContainer}>
                <Image source={Logo} style={styles.logo}/>
                <Text style={styles.text}>ABSENSI TENAGA HARIAN LEPAS RSUD DR SAM RATULANGI TONDANO</Text>
            </View>
            <View style={styles.ilustrationContainer}>
                <Image source={Ilustration}/>
            </View>
        </SafeAreaView>
    )
}

export default SplashScreen;

const styles = StyleSheet.create({
    page:{
        flex: 1,
        backgroundColor: '#4ABEBB',
    },
    screenContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo:{
        height: 127,
        width: 97,
    },
    text:{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffff',
        textAlign: 'center',
        width: 289,
        marginTop: 10,
    },
    ilustrationContainer:{
        flex: 1,
        position: 'absolute',
        height: '100%',
        justifyContent: 'flex-end'
    }
})