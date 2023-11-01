import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ProfilePicture, Ilustration7 } from '../../assets/images'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { IconLOgOut } from '../../assets'
import PieChart from 'react-native-pie-chart'

const Profile = ({navigation}: any) => {
    const [picture, setPicture] = useState(ProfilePicture);
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [division, setDivision] = useState('');
    const [agency, setAgency] = useState('Pemerintah Provinsi Sulawesi Utara');
    const [office, setOffice] = useState('RSUD DR Sam Ratulangi Tondano');
    const [appVersion, setAppVersion] = useState('v.1.0.0');
    const [late, setLate] = useState(1);
    const [onTime, setOnTime] = useState(1);
    const [totalCheckOut, setTotalCheckOut] = useState(0);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [qualityRate, setQualityRate] = useState(0);
    const [qualityRateCondition, setQualityRateCondition] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const widthAndHeight = 150;
    const series = [late, onTime];
    const sliceColor = ['#FFEB3B','#4CAF50'];

    const getQualityRate = async () => {
        const employeeId = await AsyncStorage.getItem('employeeId');
        const getmonth = String(new Date().getMonth() + 1); 
        const getyear = String(new Date().getFullYear());

        setMonth(getmonth);
        setYear(getyear);

        axios.get(`http://rsudsamrat.site:9999/api/v1/dev/attendances/attendance/quality?employeeId=${employeeId}&month=${getmonth}`)
        .then((result) => {
            const qRate = result.data[0].qualityRate;
            setQualityRate(qRate.toFixed(2));
            setLate(result.data[0].attendanceStateCount.LATE);
            setOnTime(result.data[0].attendanceStateCount.ON_TIME);
            setTotalCheckOut(result.data[0].attendanceStatusCount.CheckOut);
            setIsLoading(false);

            if(qRate < 60){
                setQualityRateCondition(true);
                Alert.alert('Quality Rate anda dibawah 60%', 'Silahkan hubungi admin!', 
                [
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                ]);
            } else {
                setQualityRateCondition(false);
            }
        }).catch((err) => {
            console.log('error while getting quality rate:', err)
        });
    }

    const getUserData = async () => {
        const nik = await AsyncStorage.getItem('nik');
        axios.get(`http://rsudsamrat.site:9999/api/v1/dev/employees/nik/${nik}`)
                .then(function (response){
                    setName(response.data.name)
                    setId(response.data.nik)
                    setDivision(response.data.role)
                    setIsLoading(false);
                }).catch(function(error){
                    console.log('error:', error)
                })
    }

    useEffect(() => {
        AsyncStorage.getItem('access_token')
        .then((result) => {
            if(result){
                getUserData();
                getQualityRate();
            } else {
                handleLogOut();
            }
        }).catch((err) => {
            console.log('error', err)
        });

    }, [])

    const handleLogOut = async () => {
        await AsyncStorage.multiRemove(['nik', 'access_token', 'employeeId'], err => {
            if(err === null){
                if (Platform.OS === 'android'){
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'Login'}]
                    })
                } else if (Platform.OS === 'ios'){
                    navigation.push('Login')
                }
                console.log('Logout from the app!')
            } else {
                console.log(err)
            }
        })
    }
    
    return (
        <SafeAreaView style={styles.container}>
            {isLoading ? (
                <ActivityIndicator
                        size={'large'}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
            ) : (
            <ScrollView>
                <View style={styles.headerBg}>
                    <Image source={Ilustration7} style={{height: '100%', width: '100%'}}/>
                    <Text style={styles.pageTitle}>Profile</Text>
                </View>
                <View style={styles.contentContainer}>
                    <Text style={{fontSize: 20, color: '#86869E', fontWeight: '500', alignSelf: 'flex-start'}}>Data Pegawai</Text>
                    <View style={[styles.secContainer, {marginBottom: 42}]}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                            <Image source={ProfilePicture} style={styles.profilePicture} />
                            <View>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#424247'}}>{name}</Text>
                                <Text style={{fontSize: 14, color: '#424247'}}>{id}</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.text}>Instansi</Text>
                            <Text style={styles.text2}>{agency}</Text>
                        </View>
                        <View style={{marginTop: 20}}>
                            <Text style={styles.text}>Kantor</Text>
                            <Text style={styles.text2}>{office}</Text>
                        </View>
                        <View style={{marginTop: 20}}>
                            <Text style={styles.text}>Bidang</Text>
                            <Text style={styles.text2}>{division}</Text>
                        </View>
                    </View>
                    <Text style={{fontSize: 20, color: '#86869E', fontWeight: '500', alignSelf: 'flex-start'}}>Quality Rate {month}/{year}</Text>
                    <View style={[styles.secContainer, {flexDirection: 'row', backgroundColor: qualityRateCondition ? '#ff0e00' : '#fff'}]}>
                        <PieChart
                            widthAndHeight={widthAndHeight}
                            series={series}
                            sliceColor={sliceColor}
                            doughnut={true}
                            coverRadius={0.45}
                            coverFill={'#FFF'}
                        />
                        <View style={{flex: 1, justifyContent: 'center', marginLeft: 12}}>
                            <Text style={[styles.text, {color: '#4CAF50'}]}>● On Time : {onTime}</Text>
                            <Text style={[styles.text, {color: '#FFEB3B'}]}>● Late : {late}</Text>
                            <Text style={[styles.text, {color: setQualityRateCondition ?'#030003' : '#ffffff' }]}>● Total Check Out : {totalCheckOut}</Text>
                            <Text style={[styles.text, {color: setQualityRateCondition ?'#030003' : '#ffffff' }]}>● Quality Rate : {qualityRate} %</Text>
                        </View>
                    </View>
                    <Text style={{fontSize: 20, color: '#86869E', fontWeight: '500', alignSelf: 'flex-start'}}>Pengaturan</Text>
                    <View style={styles.secContainer}>
                        <Text style={styles.text}>App Version</Text>
                        <Text style={styles.text2}>{appVersion}</Text>
                    </View>
                    <TouchableOpacity style={styles.buttonLogout} onPress={handleLogOut}>
                        <Image source={IconLOgOut} style={{width: 24, height: 24}}/>
                        <Text style={{fontSize: 16, fontWeight: '600', marginLeft: 5, color: '#014041'}}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            )}
        </SafeAreaView>
    )
}

export default Profile

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#ffffff'
    },
    headerBg:{
        height: 120,
        flexDirection: 'row'
    },
    pageTitle:{
        fontSize: 25,
        fontWeight: 'bold',
        color: '#fff',
        position: 'absolute',
        alignSelf: 'center',
        left: 27
    },
    contentContainer:{
        paddingTop: 46,
        paddingHorizontal: 25,
        alignItems: 'center',
    },
    profilePicture:{
        height: 66,
        width: 66,
        borderRadius: 33,
        borderWidth: 2,
        borderColor: '#01A7A3',
        marginRight: 13
    },
    secContainer:{
        width: '100%',
        height: 'auto',
        padding: 14,
        backgroundColor: '#ffffff',
        shadowColor: '#000000',
        shadowOffset: {width:0, height:2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 12,
        marginBottom: 20,
        marginTop: 12
    },
    text:{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9A9A9A',
        marginBottom: 6
    },
    text2:{
        fontSize: 16,
        color: '#424247'
    },
    buttonLogout:{
        marginBottom: 142,
        width: '100%',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 14,
        backgroundColor: '#ffffff',
        shadowColor: '#000000',
        shadowOffset: {width:0, height:2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderRadius: 12,
    },
})