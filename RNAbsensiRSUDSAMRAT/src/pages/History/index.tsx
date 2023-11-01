import { StyleSheet, Text, View, SafeAreaView, Image, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Calendar } from 'react-native-calendars'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const History = ({navigation}: any) => {
    const screenWidht = Dimensions.get('window').width;

    const [status, setStatus] = useState('');
    const [location, setLocation] = useState('');
    const [timeIn, setTimeIn] = useState('');
    const [timeOut, setTimeOut] = useState('');
    const [date, setDate] = useState('')
    const [data, setData] = useState([]);
    const [getMarkedDates, setGetMarkedDates] = useState();
    const [selectedDateData, setSelectedDateData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckOut, setIsCheckOut] = useState(false);
    const [isEnableDesc, setIsEnableDesc] = useState(false);
    const getdate = String(new Date().getDate()).padStart(2, '0'); 
    const getmonth = String(new Date().getMonth() + 1).padStart(2, '0'); 
    const getyear = String(new Date().getFullYear()).padStart(2, '0');
    const currentDate = getyear + '-' + getmonth + '-' + getdate;
    
    const getEmployeeId = async () => {
        const employeeId = await AsyncStorage.getItem('employeeId');
        getData(employeeId);
        console.log(employeeId);
    }
    
    const getData = (employeeId) => {
        setIsLoading(true);
        const url = `http://rsudsamrat.site:9999/api/v1/dev/attendances/filter?employeeId=${employeeId}`;
        axios.get(url)
        .then(function (response) {
            setData(response.data);
            console.log('data',response.data)
            setIsLoading(false)
        })
        .catch(function (error) {
            console.log('error:',error);
            setIsLoading(false);
        });
    }

    useEffect(() => {
        getEmployeeId();
    }, [])

    useEffect(() => {
        const markedDates = data.reduce((result, schedule) => {
            schedule.attendances.forEach(attendance => {
                const { scheduleDate, attendanceState } = attendance;
                if (scheduleDate) {
                    result[scheduleDate] = { selected: true, selectedColor:  getColorForAttendanceState(attendanceState)};
                }
            });
            return result;
        }, {});

        setGetMarkedDates(markedDates);
    }, [data]);

    const getColorForAttendanceState = (attendanceState) => {
        switch (attendanceState) {
            case "ONTIME":
                return "#14F42B";
            case "ALPHA":
                return "#F41414";
            case "LATE":
                return "#F0F414";
            default:
                return "#14F42B";
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {isLoading? (
                <ActivityIndicator
                    size={'large'}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
            ) : (
            <>
            <Image 
                source={require('./../../assets/images/Ilustration4.png')}
                style={{width: screenWidht, height: 50}}
                resizeMode='cover'
                />
            <Calendar
            style={{
                height: 350,
            }}
            current={currentDate}
            onDayPress={day => {
                const selectedData = data.find(schedule => schedule.attendances?.some(attendance => attendance.scheduleDate === day.dateString));
                if (selectedData) {
                    setSelectedDateData(selectedData);
                    setIsEnableDesc(true);
                    const clockInTimeString = selectedData.attendances[0].clockIn;
                    const clockOutTimeString = selectedData.attendances[0].clockOut;
                    const formattedClockInTime = clockInTimeString.slice(11, 19);
                    
                    if(clockOutTimeString !== null){
                        const formattedClockOutTime = clockOutTimeString.slice(11, 19);
                        setTimeOut('Check-Out -> '+ formattedClockOutTime);
                        setIsCheckOut(true);
                    } else {
                        setIsCheckOut(false);
                    }

                    setTimeIn('Check-In    -> '+ formattedClockInTime);
                    setDate(selectedData.attendances[0].scheduleDate);
                    setStatus('Check-In ('+selectedData.attendances[0].attendanceType+')');
                    if(selectedData.attendances[0].location === null){
                        setLocation('RSUD DR SAM RATULANGI TONDANO, Kembuan, Tondano Utara, Minahasa, Sulawesi Utara');
                    } else {
                        setLocation(selectedData.attendances[0].location);
                    }
                } else {
                    setTimeIn('');
                    setTimeOut('');
                    setDate('-');
                    setStatus('Tidak ada riwayat pekerjaan pada '+day.dateString);
                    setIsEnableDesc(false);
                    setLocation('-');
                }
            }}
            markedDates={getMarkedDates}
            />
        <View>
            <Image 
                source={require('./../../assets/images/Ilustration5.png')}
                style={{width: screenWidht, height: 110, position: 'absolute'}}
                resizeMode='cover'
                />
            <Text style={styles.status}>{status}</Text>
            { isEnableDesc ? (
                <View style={styles.desc}>
                    <View style={styles.locationContainer}>
                        <Image 
                            source={require('./../../assets/icons/IconLocation.png')}
                            style={{width: 38, height: 38}}
                            />
                        <Text style={styles.text}>{location}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                        <Image 
                            source={require('./../../assets/icons/IconTime.png')}
                            style={{width: 33, height: 33, marginRight: 2}}
                            />
                        <Text style={styles.text}> {timeIn} {date}</Text>
                    </View>
                    { isCheckOut ? (
                        <View style={styles.timeContainer}>
                            <Image 
                                source={require('./../../assets/icons/IconTime.png')}
                                style={{width: 33, height: 33, marginRight: 2}}
                                />
                            <Text style={styles.text}> {timeOut} {date}</Text>
                        </View>
                    ) : (
                        <></>
                    )}
                </View>
            ) : (<></>)}
        </View>
        </>
        )}
        </SafeAreaView>
    )
}

export default History

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#ffffff',
    },
    status: {
        fontSize: 25,
        color: '#292F2F',
        paddingHorizontal: 27
    },
    desc:{
        marginLeft: 15,
        marginTop: 20
    },
    text:{
        fontSize: 17,
        color: '#666666',
        width: '80%',
        marginLeft: 7
    },
    locationContainer:{
        flexDirection: 'row',
    },
    timeContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 3,
        marginTop: 15
    },
})