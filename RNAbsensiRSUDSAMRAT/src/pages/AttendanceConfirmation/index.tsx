import { Image, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import SwipeButton from 'rn-swipe-button'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFetchBlob from 'rn-fetch-blob';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const AttendanceConfirmation = ({imageData, navigation, attdType}: any) => {

    const [scheduleId, setScheduledID] = useState();
    const [employeeId, setEmployeeId] = useState('');
    const [attendanceDate, setAttendanceDate] = useState('');
    const [clock, setClock] = useState('');
    const [locationLatIn, setLocationLatIn] = useState(37.7749);
    const [locationLongIn, setLocationLongIn] = useState(-122.4194);
    const [locationLatOut, setLocationLatOut] = useState(37.7749);
    const [locationLongOut, setLocationLongOut] = useState(-122.4194);
    const [imagePath, setImagePath] = useState('');
    const [status, setStatus] = useState('CheckIn');
    const [attendanceType, setAttendanceType] = useState(attdType);
    const [attendanceInOrOut, setAttendanceInOrOut] = useState('');
    const [attendanceId, setAttendanceId] = useState(0);
    const [isLoading, setIsLoading] = useState(false);


    const getUserData = async (currentDate) => {
        try {
            const employeeId = await AsyncStorage.getItem('employeeId');
            setEmployeeId(employeeId);

            const getAttendanceId = async (attendanceDate,employeeId) => {
                await axios.get(`http://rsudsamrat.site:9999/api/v1/dev/attendances/byDateAndEmployee?attendanceDate=${attendanceDate}&employeeId=${employeeId}`)
                .then(function(response){
                    const attendanceId = response.data[0].attendanceId;
                    setAttendanceId(attendanceId);
                    console.log('success to get attendanceId:', attendanceId)
                })
                .catch(function(error){
                    console.log('failed to get attendanceId:', error)
                })
            }

            const getScheduledId = async (attendanceDate, employeeId) => {
                await axios.get(`http://rsudsamrat.site:9999/api/v1/dev/schedule`)
                .then((response) => {
                    const convertEmployeeId = parseInt(employeeId);
                    const filteredScheduleId = response.data.filter(schedule => 
                        schedule.scheduleDate === attendanceDate &&
                        schedule.employees.some(employee => employee.employeeId === convertEmployeeId)
                    )
                    .map(schedule => schedule.scheduleId);
                    console.log('Filtered Schedule ID:', filteredScheduleId[0]);
                    setScheduledID(filteredScheduleId[0]);
                }).catch((err) => {
                    console.log('error when access endpoint:', err)
                });
            } 

            getAttendanceId(currentDate, employeeId);
            getScheduledId(currentDate, employeeId);
        } catch (error) {
            console.log('error: ', error)
        }
    }

    const checkIn = async () => {
        
        await convertFileToBase64(imageData)
        .then(({newPath}) => {
            let data = new FormData();
            const url = 'http://rsudsamrat.site:9999/api/v1/dev/attendances/checkInMasuk';
            data.append('scheduleId', `${scheduleId}`);
            data.append('employeeId', `${employeeId}`);
            data.append('attendanceDate', `${attendanceDate}`);
            data.append('clockIn', `${clock}`);
            data.append('clockOut', '');
            data.append('locationLatIn', `${locationLatIn}`);
            data.append('locationLongIn', `${locationLongIn}`);
            data.append('status', `${status}`);
            data.append('selfieCheckInImage', {
                uri: 'file://' + newPath,
                name: 'selfieCheckIn.jpg',
                type: 'image/jpeg'
            });
            data.append('attendanceType', `${attendanceType}`);
            
            try {
                axios.post(url, data,{
                    headers: {"Content-Type": "multipart/form-data"}
                })
                .then(function(response){
                    console.log('berhasil check in');
                    navigation.replace('AttendanceDone');
                    let shift_id = response.data.shift.shift_id;
                    if(shift_id = 3){
                        AsyncStorage.setItem('shift_id', `${shift_id}`)
                        .then((result) => {
                            console.log('berhasil menyimpan shift_id');
                        }).catch((err) => {
                            console.log('gagal menyimpan shift_id', err);
                        });
                    } else {
                        console.log('belum menyimpan shift_id');
                    }
                })
                .catch((error) => {
                    console.log('Error:', error);
                    setIsLoading(false);
                })
            } catch (error) {
                console.log('error saat check in:', error);
                Alert.alert('Kendala saat Check In', 'Pastikan anda memiliki jadwal. Jika ada kendala, mohon hubungi admin.', 
                [
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                ]);
                navigation.replace('Tabs')
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            setIsLoading(false);
        });
    }

    const checkOut = async (attendanceId) => {
        await convertFileToBase64(imageData)
        .then(({newPath}) => {
            let url = 'http://rsudsamrat.site:9999/api/v1/dev/attendances/updatePulang';
            let data = new FormData();
    
            data.append('attendanceId', `${attendanceId}`);
            data.append('clockOut', `${clock}`);
            data.append('locationLatOut', `${locationLatOut}`);
            data.append('locationLongOut', `${locationLongOut}`);
            data.append('selfieCheckOutImage', {
                uri: 'file://' + newPath,
                name: 'selfieCheckOut.jpg',
                type: 'image/jpeg'
            });
            console.log('test')

            axios.post(url, data, {
                headers: {"Content-Type": "multipart/form-data"}
            })
            .then((result) => {
                navigation.replace('AttendanceDone');
                console.log('berhasil check out')
            }).catch((err) => {
                console.log('error saat check out:',err)
                Alert.alert('Tidak bisa Check Out', 'Pastikan anda Check Out sesuai jadwal. Jika ada kendala, mohon hubungi admin.', 
                [
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                ]);
                navigation.replace('Tabs');
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        AsyncStorage.removeItem('shift_id')
        .then((result) => {
            console.log('berhasil menghapus shift_id');
        }).catch((err) => {
            console.log('gagal menghapus shift_id');
        });
    }

    const setCheckInOrOut = async (attendanceDate) => {
        const employeeIdd = await AsyncStorage.getItem('employeeId');
        const getShift_id = await AsyncStorage.getItem('shift_id');
        let newDate = attendanceDate;

        if(getShift_id === '3'){
            console.log('xx:', getShift_id)
            const date = attendanceDate; 
            
            const tanggalAwal = new Date(date);
            tanggalAwal.setDate(tanggalAwal.getDate() - 1);
            
            const tahun = tanggalAwal.getFullYear();
            const bulan = String(tanggalAwal.getMonth() + 1).padStart(2, '0'); 
            const tanggal = String(tanggalAwal.getDate()).padStart(2, '0');
            
            const tanggalBaru = `${tahun}-${bulan}-${tanggal}`;
            newDate = tanggalBaru;
        }
        console.log(newDate)
        axios.get(`http://rsudsamrat.site:9999/api/v1/dev/attendances/byDateAndEmployee?attendanceDate=${newDate}&employeeId=${employeeIdd}`)
        .then(function(response){
            if(response.data === `Employee hasn't taken any attendance on the given date.`){
                setAttendanceInOrOut('Swipe to Check-In');
                setIsLoading(false);
            } else {
                const attendanceId = response.data[0].attendanceId;
                setAttendanceId(attendanceId);
                setAttendanceInOrOut('Swipe to Check-Out');
                setIsLoading(false);
            }
        })
        .catch((error)=>{
            console.log('error:',error);
            setIsLoading(false);
        })
    }


    const convertFileToBase64 = async (filePath) => {
        try {
        const fileInfo = await RNFetchBlob.fs.stat(filePath);
        const fileSize = fileInfo.size;

        const resize = await ImageResizer.createResizedImage(
            filePath,
            800,
            600,
            'JPEG',
            50
        )

        const oldSizeKB = (fileSize / 1024).toFixed(2);
        const newSizeKB = (resize.size / 1024).toFixed(2);

        setImagePath(resize.uri);
        return { newPath: resize.uri, oldFileSize: oldSizeKB, newFileSize: newSizeKB };
        } catch (error) {
        console.error('Error converting file to base64:', error);
        throw error;
        }
    };

    useEffect(() => {
        setIsLoading(true);
        const date = String(new Date().getDate()).padStart(2, '0'); 
        const month = String(new Date().getMonth() + 1).padStart(2, '0'); 
        const year = String(new Date().getFullYear()).padStart(2, '0');
        const hours = String(new Date().getHours()).padStart(2, '0'); 
        const min = String(new Date().getMinutes()).padStart(2, '0'); 
        const sec = String(new Date().getSeconds()).padStart(2, '0'); 

        const getDate =  year + '-' + month + '-' + date;
        // const getDate = '2023-10-22';
        
        // setClock('2023-10-22T08:03:49');
        setAttendanceDate(getDate);
        setClock(
            year + '-' + month + '-' + date + 'T' + hours + ':' + min + ':' + sec
        );

        setCheckInOrOut(getDate);
        getUserData(getDate);
    }, [imageData])
    
    const afterSwipe = async () => {
        setIsLoading(true)
        if(attendanceInOrOut === 'Swipe to Check-In'){
            checkIn();
        } else if (attendanceInOrOut === 'Swipe to Check-Out') {
            checkOut(attendanceId);
            // checkIn();
        }
    }
    
    const reOpenCamera = () => {
        navigation?.replace('OpenCamera', { attendanceType: attendanceType });
    }

return (
    <SafeAreaView style={styles.page}>
        {isLoading ? (
            <ActivityIndicator
                size={'large'}
                color={'#fff'}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
        ) : (
            <>
        <Text style={styles.title}>Konfirmasi Foto</Text>
        <View style={styles.photoContainer}>
            <Image 
                source={{uri: 'file://' + imageData}}
                style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: 15
                }}
                />
        </View>
        <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.7}
            onPress={()=> {
                reOpenCamera();
            }}>
            <Text style={{fontSize: 23, color: '#262D33', fontWeight: '600'}}>Take Again</Text>
        </TouchableOpacity>
        <View style={{width: '75%', marginTop: 20}}>
            <SwipeButton
                title={attendanceInOrOut}
                thumbIconImageSource={require('./../../assets/icons/Expand_right_double.png')} 
                railBackgroundColor="#03AD00"
                railBorderColor="#03AD00"
                thumbIconBackgroundColor='#fff'
                thumbIconBorderColor='#fff'
                titleStyles={{fontSize:23, color:'#fff', fontWeight:'600'}}
                shouldResetAfterSuccess={true}
                onSwipeSuccess={afterSwipe}
                />
        </View>
        </>
    )}
    </SafeAreaView>
)
}

export default AttendanceConfirmation

const styles = StyleSheet.create({
    page:{
        flex: 1,
        backgroundColor: '#4ABEBB',
        alignItems: 'center'
    },
    title:{
        fontSize: 30,
        fontWeight: '500',
        color: '#fff',
        marginTop: 93,
        marginBottom: 20
    },
    photoContainer:{
        height: '50%',
        width: '70%',
        marginBottom: 36
    },
    button:{
        width: '70%',
        backgroundColor: '#61F8F5',
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100
    }
})