import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [status, setStatus]   = useState('Requesting permissions...');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setupApp();
  }, []);

  const setupApp = async () => {
    // Request location permission
    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    if (locStatus !== 'granted') {
      setStatus('Location permission denied');
      return;
    }

    // Request notification permission
    const { status: notifStatus } = await Notifications.requestPermissionsAsync();
    if (notifStatus !== 'granted') {
      setStatus('Notification permission denied');
      return;
    }

    setStatus('Monitoring geo-fences...');

    // Get current location and fetch nearby projects
    const location = await Location.getCurrentPositionAsync({});
    fetchNearbyProjects(location.coords.latitude, location.coords.longitude);
  };

  const fetchNearbyProjects = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://your-backend.railway.app/api/v1/nearby-projects?lat=${lat}&lng=${lng}&lang=en`
      );
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.log('API error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hyper-Local Targeting Engine</Text>
      <Text style={styles.status}>{status}</Text>
      {projects.map((p, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{p.title}</Text>
          <Text style={styles.cardBody}>{p.body}</Text>
          <Text style={styles.cardDist}>{p.distance_meters}m away</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0a0e1a', padding: 20 },
  title:      { color: '#FFD700', fontSize: 20, fontWeight: 'bold', marginTop: 50 },
  status:     { color: '#8aa3c0', fontSize: 14, marginTop: 10, marginBottom: 20 },
  card:       { backgroundColor: '#1e2d4e', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle:  { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  cardBody:   { color: '#8aa3c0', fontSize: 13, marginTop: 6 },
  cardDist:   { color: '#00d4ff', fontSize: 12, marginTop: 8 }
});
