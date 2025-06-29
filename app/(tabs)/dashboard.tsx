import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.testCard}>
          <Text style={styles.testText}>hello test ajol</Text>
          <Text style={styles.statusText}>Testing basic layout first</Text>
        </View>
        
        <Text style={styles.debugText}>If you can see this, the component is working!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff', // light blue
  },
  header: {
    backgroundColor: '#2563eb', // blue
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#dbeafe', // light blue
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    padding: 24,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  debugText: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
    fontWeight: '600',
  },
}); 