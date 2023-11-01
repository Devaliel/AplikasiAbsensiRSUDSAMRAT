import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView } from 'react-native';
import React, {useEffect, useState} from 'react';
import {Ilustration1, Ilustration6} from '../../assets/images';
import NotificationCard from '../../components/NotificationCard';
import socketService from '../../config/socket/socket';
import axios from 'axios';

const Notification = () => {
  const [getNotification, setGetNotification] = useState([]);
  const [clickedNotifications, setClickedNotifications] = useState([]);

  const getNotif = async () => {
    try {
      const response = await axios.get(
        'http://rsudsamrat.site:3001/api/notification',
      );
      console.log(response.data.data);
      setGetNotification(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleNotificationClick = index => {
    if (clickedNotifications.includes(index)) {
      // setClickedNotifications(clickedNotifications.filter(i => i !== index));
    } else {
      setClickedNotifications([...clickedNotifications, index]);
    }
  };

  useEffect(() => {
    getNotif();
  }, []);

  useEffect(() => {
    socketService.initializeSocket();
  }, []);

  // useEffect(() => {
  //     setGetNotification(notification);
  // }, [])

  useEffect(() => {
    socketService.on('recieve_message', data => {
      setGetNotification(prevMessage => [...prevMessage, data]);
    });

    return () => {
      socketService.removeListener('recieve_message');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={Ilustration1} style={{position: 'absolute'}} />
        <View style={styles.header}>
          <Text style={styles.notification}>Notifications</Text>
          <Image
            source={Ilustration6}
            style={{width: 115, height: 117, marginTop: 75}}
          />
        </View>
        <View style={styles.notificationCard}>
          {getNotification.map((notif, index) => (
            <NotificationCard
              key={index}
              backgroundColor={
                clickedNotifications.includes(index) ? '#fff' : '#99DCDA'
              }
              title={notif.title}
              desc={notif.desc}
              date={notif.date}
              time={notif.time}
              onPress={() => handleNotificationClick(index)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 200,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 25,
  },
  notification: {
    fontSize: 25,
    color: '#4F2A2A',
    fontWeight: 'bold',
    marginTop: 100,
  },
  notificationCard: {
    flex: 1,
    paddingBottom: 90,
  },
});
