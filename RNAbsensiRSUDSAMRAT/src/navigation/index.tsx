import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image } from 'react-native';
import { 
    Attendance, 
    History, 
    Home, 
    Notification, 
    Profile 
} from '../pages';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Tab = createBottomTabNavigator();

function Tabs({navigation}) {
    const [countUnreadNotif, setCountUnreadNotif] = useState(0)
    const [accesToken, setAccessToken] = useState('');
    const [nik, setNik] = useState('');

    const countNotif = async () => {
        try {
            const response = await axios.get(
                'http://rsudsamrat.site:3001/api/notification',
            );
            const totalNotif = response.data.data.length;
            setCountUnreadNotif(totalNotif);
            } catch (error) {
            console.log(error);
            }
    };

    const getTokenNik = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const nik = await AsyncStorage.getItem('nik');
            checkToken(token);

            if (token !== null) {
                setAccessToken(token);
                setNik(nik);
            } else {
                console.log('Token tidak ditemukan.');
            }
        } catch (error) {
            console.log('Gagal mengambil token:', error);
        }
    };

    const checkToken = async (token) => {
        axios.get('http://rsudsamrat.site:3001/api/ping',
        {headers:{
            'Authorization' : `Bearer ${token}`
        }})
        .then(function (response){
            const responseJSON = {response};
            const responseMSG = responseJSON.response.data;

            if(responseMSG !== 'pong'){
                navigation.navigate('Login');
            }
        })
        .catch(function (error){
            console.log("error ",error.status);
            navigation.navigate('Login');
        })
    }
    
    useEffect(() => {
        getTokenNik();
        countNotif();
    }, [])
    
    return (
        <Tab.Navigator
            detachInactiveScreens={false}
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle:{
                    position: 'absolute',
                    elevation: 0.1,
                    backgroundColor: '#fff',
                    height: 74,
                },
            }}>
                <Tab.Screen name="Home" component={Home} options={{
                    headerShown: false,
                    tabBarIcon:({focused})=>(
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Image 
                                source={require('./../assets/icons/Home.png')}
                                resizeMode= 'contain'
                                style={{
                                    width: 24,
                                    height: 24,
                                    marginBottom: 5,
                                    tintColor: focused ? '#339993' : '#86869E'
                                }}
                            />
                            <Text
                                style={{
                                    color: focused ? '#339993' : '#86869E',
                                    fontSize: 10,
                                }}
                            >Beranda</Text>
                        </View>
                    )
                }}/>
                <Tab.Screen name="History" component={History} options={{
                    headerShown: false,
                    tabBarIcon:({focused})=>(
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Image 
                                source={require('./../assets/icons/Calendar.png')}
                                resizeMode= 'contain'
                                style={{
                                    width: 24,
                                    height: 24,
                                    marginBottom: 5,
                                    tintColor: focused ? '#339993' : '#86869E'
                                }}
                                />
                            <Text
                                style={{
                                    color: focused ? '#339993' : '#86869E',
                                    fontSize: 10
                                }}
                                >History</Text>
                        </View>
                    )
                }}/>
                    <Tab.Screen name="Profile" component={Profile} options={{
                        headerShown: false,
                        tabBarIcon:({focused})=>(
                            <View style={{
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Image 
                                    source={require('./../assets/icons/Profile.png')}
                                    resizeMode= 'contain'
                                    style={{
                                        width: 24,
                                        height: 24,
                                        marginBottom: 5,
                                        tintColor: focused ? '#339993' : '#86869E'
                                    }}
                                />
                                <Text
                                    style={{
                                        color: focused ? '#339993' : '#86869E',
                                        fontSize: 10
                                    }}
                                >Profile</Text>
                            </View>
                        )
                    }}/>
                <Tab.Screen name="Absensi" component={Attendance} options={{
                    headerShown: false,
                    tabBarIcon:({focused})=>(
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Image 
                                source={require('./../assets/icons/Attendance.png')}
                                resizeMode= 'contain'
                                style={{
                                    width: 24,
                                    height: 24,
                                    marginBottom: 5,
                                    tintColor: focused ? '#339993' : '#86869E'
                                }}
                            />
                            <Text
                                style={{
                                    color: focused ? '#339993' : '#86869E',
                                    fontSize: 10
                                }}
                            >Absen</Text>
                        </View>
                    )
                }}/>
                <Tab.Screen name="Notification" component={Notification} options={{
                    headerShown: false,
                    tabBarIcon:({focused})=>(
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}>
                            <Image 
                                source={require('./../assets/icons/Notification.png')}
                                resizeMode= 'contain'
                                style={{
                                    width: 24,
                                    height: 24,
                                    marginBottom: 5,
                                    tintColor: focused ? '#3BAE7E' : '#86869E',
                                }}
                            />
                            <Text
                                style={{
                                    color: focused ? '#339993' : '#86869E',
                                    fontSize: 10
                                    }}
                            >Notifikasi</Text>
                            <View style={{width: 12, height: 12, backgroundColor: '#01A7A3', borderRadius: 6, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, right: 10}}>
                                <Text style={{fontSize: 8, color: '#fff'}}>{countUnreadNotif}</Text>
                            </View>
                        </View>                    
                    )
                }}/>
        </Tab.Navigator>
    );
}

export default Tabs;