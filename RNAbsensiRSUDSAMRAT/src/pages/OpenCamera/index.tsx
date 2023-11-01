import { StyleSheet, View, TouchableOpacity, Linking, Image, ActivityIndicator, Platform } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import AttendanceConfirmation from '../AttendanceConfirmation';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

const OpenCamera = ({navigation}: any) => {

    const route = useRoute();
    const {attendanceType} = route.params;
    const newNavigation = useNavigation();
    const devices = useCameraDevices();
    const device = devices.front;
    const camera = useRef<Camera>(null);
    const [imageData, setImageData] = useState('');
    const [takePhotoClicked, setTakePhotoClicked] = useState(true);
    const [isFrontCamera, setIsFrontCamera] = useState(true);
    const [torch, setTorch] = useState(false);
    const [getAttendanceType, setGetAttendanceType] = useState(attendanceType);

    useEffect(() => {
        checkPermission();
        // console.log("attendance type:", getAttendanceType)
    }, [])

    const checkPermission = async () => {
        async function newCameraPermission() {
            const permission = await Camera.requestCameraPermission();
            if(permission == 'denied' ) await Linking.openSettings();
        }
        newCameraPermission();
    }

    const takePhoto = async () => {
        try {
            if(camera !== null){
                const photo = await camera.current.takePhoto();
                setImageData(photo.path);
                setTakePhotoClicked(false);
            }
        } catch (error) {
            console.log('can not take photo!');
        }
    }

    if (device == null) return <ActivityIndicator />
    return(
        <View style={{flex: 1,}}>
            {takePhotoClicked ? (
                <View style={{flex: 1}}>
                    <Camera
                        ref={camera}
                        style={StyleSheet.absoluteFill}
                        device={isFrontCamera? devices.front : devices.back}
                        isActive={true}
                        photo
                        torch={torch? 'on' : 'off'}
                    />
                    <TouchableOpacity 
                    style={{
                        position: 'absolute',
                        width: 60,
                        height: 60,
                        marginTop: 27,
                        marginLeft: 28,
                        backgroundColor: '#fff',
                        borderRadius: 30,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={()=> {
                        if (Platform.OS === 'android'){
                            newNavigation.goBack();
                        } else if (Platform.OS === 'ios'){
                            navigation.push('Attendance');
                        }
                    }}>
                        <Image
                            source={require('./../../assets/icons/Expand_left.png')}
                            style={{width: 60, height: 60}}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 62,
                        marginLeft: 23
                    }}
                    onPress={()=>{
                        setTorch(!torch);
                    }}
                    >
                        <Image
                            source={require('./../../assets/icons/Flash.png')}
                            style={{
                                width: 64,
                                height: 52
                            }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity 
                    style={{
                        width: 88, 
                        height: 88, 
                        borderRadius: 44, 
                        borderWidth: 5,
                        borderColor: '#01A7A3',
                        position: 'absolute',
                        bottom: 71,
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={()=> {
                        takePhoto();
                    }}>
                        <Image
                            source={require('./../../assets/icons/IconCamera2.png')}
                            style={{width:43, height: 40}}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 71,
                        paddingRight: 32,
                        alignSelf: 'flex-end'
                    }}
                    onPress={()=>{
                        setIsFrontCamera(!isFrontCamera);
                    }}>
                        <Image
                            source={require('./../../assets/icons/IconReverseCamera.png')}
                            style={{
                                width: 56,
                                height: 52
                            }}
                        />
                    </TouchableOpacity>
                </View>
            ):(
                <View style={{flex: 1}}>
                    {imageData !== 'x' && (
                        <AttendanceConfirmation imageData={imageData} navigation={navigation} attdType={getAttendanceType} />
                    )}
                </View>
            )}
            
        </View>
    )
}

export default OpenCamera

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button:{
        backgroundColor: '#000'
    },
    backButton:{
        backgroundColor: '#000',
        position: 'absolute',
        justifyContent: 'center',
        width: '100%',
        top: 0,
        padding: 20
    },
    buttonContainer:{
        ackgroundColor: '#000',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        bottom: 0,
        padding: 20
    },
    buttons:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    camButton:{
        height: 80,
        width: 80,
        borderRadius: 40,
        backgroundColor: '#B2BEB5',
        alignSelf: 'center',
        borderWidth: 4,
        borderColor: '#fff'
    },
    image:{
        width: '100%',
        height: '100%',
        aspectRatio: 9/16
    }
})